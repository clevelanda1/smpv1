import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface DebugInfo {
  authenticated: boolean;
  user: User | null;
  sessionValid: boolean;
  data: Record<string, any>;
}

export async function debugSupabaseOperation(operation: string, data: Record<string, any>): Promise<DebugInfo> {
  const { data: { session } } = await supabase.auth.getSession();
  const debugInfo: DebugInfo = {
    authenticated: !!session?.user,
    user: session?.user || null,
    sessionValid: !!session?.access_token && new Date(session.expires_at || 0) > new Date(),
    data
  };

  console.group(`🔍 Supabase Debug: ${operation}`);
  console.log('Authentication Status:', debugInfo.authenticated ? '✅ Authenticated' : '❌ Not authenticated');
  if (debugInfo.user) {
    console.log('User Details:', {
      id: debugInfo.user.id,
      email: debugInfo.user.email,
      role: debugInfo.user.role,
    });
  }
  console.log('Session Valid:', debugInfo.sessionValid ? '✅ Valid' : '❌ Invalid');
  console.log('Operation Data:', data);
  console.groupEnd();

  return debugInfo;
}

export async function validateUUID(uuid: string): Promise<boolean> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function formatUUID(uuid: string): string {
  // Remove any non-alphanumeric characters and format as UUID
  const cleaned = uuid.replace(/[^a-f0-9]/gi, '');
  if (cleaned.length !== 32) return uuid;
  return `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`;
}