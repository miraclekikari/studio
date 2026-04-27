
import { createClient } from '@supabase/supabase-js';

// Utilisation d'une URL de secours valide pour éviter le crash au démarrage si les variables sont absentes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (typeof window !== 'undefined') {
    console.warn(
      "Configuration Supabase manquante : Veuillez configurer NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre environnement."
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
