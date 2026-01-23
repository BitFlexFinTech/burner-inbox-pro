import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from 'https://esm.sh/ethers@6.9.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate secure random nonce
function generateNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body = await req.json();
    const { action, wallet_address, signature, device_info } = body;

    // Normalize wallet address to lowercase
    const normalizedAddress = wallet_address?.toLowerCase();

    // ============== ACTION: REQUEST NONCE ==============
    if (action === 'request_nonce') {
      if (!normalizedAddress || !ethers.isAddress(normalizedAddress)) {
        return new Response(
          JSON.stringify({ error: 'Invalid wallet address' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate and store nonce
      const nonce = generateNonce();
      const timestamp = new Date().toISOString();
      const message = `Sign this message to authenticate with BurnerMAIL.\n\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

      await supabaseAdmin.from('wallet_nonces').insert({
        wallet_address: normalizedAddress,
        nonce: nonce,
      });

      return new Response(
        JSON.stringify({ nonce, message, timestamp }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============== ACTION: VERIFY SIGNATURE ==============
    if (action === 'verify') {
      if (!normalizedAddress || !signature) {
        return new Response(
          JSON.stringify({ error: 'Missing wallet_address or signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the latest unused nonce for this wallet
      const { data: nonceRecord, error: nonceError } = await supabaseAdmin
        .from('wallet_nonces')
        .select('*')
        .eq('wallet_address', normalizedAddress)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (nonceError || !nonceRecord) {
        return new Response(
          JSON.stringify({ error: 'Nonce expired or not found. Please request a new one.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Reconstruct the message that was signed
      const message = `Sign this message to authenticate with BurnerMAIL.\n\nNonce: ${nonceRecord.nonce}\nTimestamp: ${new Date(nonceRecord.created_at).toISOString()}`;

      // Verify the signature using ethers.js
      let recoveredAddress: string;
      try {
        recoveredAddress = ethers.verifyMessage(message, signature).toLowerCase();
      } catch (e) {
        console.error('Signature verification error:', e);
        return new Response(
          JSON.stringify({ error: 'Invalid signature format' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (recoveredAddress !== normalizedAddress) {
        return new Response(
          JSON.stringify({ error: 'Signature verification failed - address mismatch' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark nonce as used
      await supabaseAdmin
        .from('wallet_nonces')
        .update({ used: true })
        .eq('id', nonceRecord.id);

      // Check if user exists with this wallet
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('wallet_address', normalizedAddress)
        .single();

      let userId: string;
      let isNewUser = false;
      let userEmail: string;

      if (existingProfile) {
        // Existing user - update last login
        userId = existingProfile.id;
        userEmail = existingProfile.email;
      } else {
        // New user - create auth user and profile
        isNewUser = true;
        const tempEmail = `${normalizedAddress.slice(0, 10)}@wallet.burnermail.app`;
        const displayName = `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`;
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: tempEmail,
          email_confirm: true,
          user_metadata: { 
            wallet_address: normalizedAddress,
            display_name: displayName,
          }
        });

        if (createError) {
          console.error('User creation error:', createError);
          throw createError;
        }
        
        userId = newUser.user.id;
        userEmail = tempEmail;

        // Update profile with wallet address (profile is auto-created by trigger)
        await supabaseAdmin
          .from('profiles')
          .update({ 
            wallet_address: normalizedAddress,
            display_name: displayName,
          })
          .eq('id', userId);
      }

      // Create session in wallet_sessions table
      await supabaseAdmin.from('wallet_sessions').insert({
        user_id: userId,
        wallet_address: normalizedAddress,
        device_info: device_info || {},
      });

      // Generate a magic link for the user to complete sign-in
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: userEmail,
      });

      if (linkError) {
        console.error('Magic link generation error:', linkError);
        throw linkError;
      }

      // Extract the token from the magic link
      const token = linkData.properties?.hashed_token;

      return new Response(
        JSON.stringify({
          success: true,
          user_id: userId,
          wallet_address: normalizedAddress,
          is_new_user: isNewUser,
          email: userEmail,
          token: token,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============== ACTION: UNLINK WALLET ==============
    if (action === 'unlink') {
      const { user_id } = body;

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'Missing user_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get current profile to find wallet address
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('wallet_address')
        .eq('id', user_id)
        .single();

      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ error: 'Profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const walletAddress = (profile as { wallet_address?: string }).wallet_address;

      if (!walletAddress) {
        return new Response(
          JSON.stringify({ error: 'No wallet linked to this account' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Clear wallet_address from profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ wallet_address: null })
        .eq('id', user_id);

      if (updateError) {
        console.error('Error unlinking wallet:', updateError);
        throw updateError;
      }

      // Invalidate all wallet sessions for this user
      await supabaseAdmin
        .from('wallet_sessions')
        .update({ is_active: false })
        .eq('user_id', user_id);

      console.log(`Wallet ${walletAddress} unlinked from user ${user_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Wallet unlinked successfully',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "request_nonce", "verify", or "unlink".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Wallet auth error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
