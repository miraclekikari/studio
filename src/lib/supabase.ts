
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Vérifie si une chaîne est une URL HTTP/HTTPS valide
 */
const isValidSupabaseUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// On vérifie si la configuration est réellement présente et valide
export const isSupabaseConfigured = isValidSupabaseUrl(supabaseUrl) && Boolean(supabaseAnonKey);

/**
 * Pour éviter le crash au démarrage si les clés manquent ou sont invalides (ex: placeholders),
 * on utilise des valeurs de secours qui respectent STRICTEMENT le format attendu par le SDK.
 * Le bandeau d'alerte dans l'UI guidera l'utilisateur.
 */
const safeUrl = isSupabaseConfigured ? supabaseUrl! : 'https://placeholder-project.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey! : 'placeholder-key';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
