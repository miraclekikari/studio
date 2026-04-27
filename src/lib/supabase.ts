
import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validation pour éviter le crash "Invalid supabaseUrl"
// On utilise une URL de secours valide syntaxiquement si la vraie est manquante
const finalUrl = supabaseUrl && supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://placeholder-project.supabase.co';

const finalKey = supabaseAnonKey || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn(
      "Configuration Supabase manquante : Le site utilise des identifiants temporaires. Veuillez configurer NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env ou sur Vercel."
    );
  }
}

export const supabase = createClient(finalUrl, finalKey);
