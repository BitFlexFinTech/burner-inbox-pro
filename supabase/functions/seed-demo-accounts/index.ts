import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEMO_ACCOUNTS = [
  { email: 'demo.user@demoinbox.app', password: 'DemoUser123!', displayName: 'Demo User', plan: 'free', isAdmin: false },
  { email: 'demo.premium@demoinbox.app', password: 'DemoPremium123!', displayName: 'Demo Premium', plan: 'premium', isAdmin: false },
  { email: 'demo.admin@demoinbox.app', password: 'DemoAdmin123!', displayName: 'Demo Admin', plan: 'free', isAdmin: true },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];

    for (const account of DEMO_ACCOUNTS) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === account.email);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        results.push({ email: account.email, status: 'already exists', userId });
      } else {
        // Create user via Admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: { display_name: account.displayName }
        });

        if (createError) {
          results.push({ email: account.email, status: 'error', error: createError.message });
          continue;
        }
        userId = newUser.user.id;
        results.push({ email: account.email, status: 'created', userId });
      }

      // Update profile with correct plan
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ plan: account.plan, display_name: account.displayName })
        .eq('id', userId);

      if (profileError) {
        console.error(`Profile update error for ${account.email}:`, profileError);
      }

      // Assign admin role if needed
      if (account.isAdmin) {
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' });

        if (roleError) {
          console.error(`Role assignment error for ${account.email}:`, roleError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Seed demo accounts error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
