-- Add wallet_address column to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE;

-- Create index for fast wallet lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);

-- Create wallet_nonces table for secure authentication
CREATE TABLE IF NOT EXISTS public.wallet_nonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '5 minutes'),
  used BOOLEAN DEFAULT false
);

-- Index for wallet lookups
CREATE INDEX IF NOT EXISTS idx_wallet_nonces_address ON public.wallet_nonces(wallet_address);

-- Enable RLS
ALTER TABLE public.wallet_nonces ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage nonces (anonymous insert allowed for nonce requests)
CREATE POLICY "Anyone can insert nonces" ON public.wallet_nonces
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read nonces" ON public.wallet_nonces
  FOR SELECT USING (true);

CREATE POLICY "Service role can update nonces" ON public.wallet_nonces
  FOR UPDATE USING (true);

-- Create wallet_sessions table for session tracking
CREATE TABLE IF NOT EXISTS public.wallet_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  is_active BOOLEAN DEFAULT true
);

-- Index for user session lookups
CREATE INDEX IF NOT EXISTS idx_wallet_sessions_user ON public.wallet_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_sessions_wallet ON public.wallet_sessions(wallet_address);

-- Enable RLS
ALTER TABLE public.wallet_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own sessions
CREATE POLICY "Users can read own wallet sessions" ON public.wallet_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can delete their own sessions (logout)
CREATE POLICY "Users can delete own wallet sessions" ON public.wallet_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Service role can insert sessions
CREATE POLICY "Service role can insert wallet sessions" ON public.wallet_sessions
  FOR INSERT WITH CHECK (true);

-- Policy: Service role can update sessions
CREATE POLICY "Service role can update wallet sessions" ON public.wallet_sessions
  FOR UPDATE USING (true);