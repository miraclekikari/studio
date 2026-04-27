
import { supabase, isSupabaseConfigured } from './supabase';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  interests?: string[];
}

export interface Document {
  id: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url: string;
  category: string;
  user_id: string;
  likes: number;
  views: number;
  format: string;
  tags: string[];
  created_at: string;
  profiles?: Profile;
}

/**
 * Récupère ou crée un profil utilisateur Supabase
 */
export async function getOrCreateProfile(uid: string, defaultData: Partial<Profile>): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (profile) return profile;

    const newProfile = {
      id: uid,
      username: defaultData.username || `user_${uid.substring(0, 5)}`,
      full_name: defaultData.full_name || 'Utilisateur',
      avatar_url: defaultData.avatar_url || `https://picsum.photos/seed/${uid}/200/200`,
      bio: 'Membre de la communauté LibreShare.',
      interests: ["Technologie", "Éducation"]
    };

    const { data, error: insertError } = await supabase
      .from('profiles')
      .upsert([newProfile])
      .select()
      .single();

    if (insertError) throw insertError;
    return data;
  } catch (err) {
    console.error("Erreur Profil Supabase:", err);
    return null;
  }
}

/**
 * Enregistre un document dans Supabase
 */
export async function saveDocument(doc: Omit<Document, 'id' | 'created_at' | 'likes' | 'views'>) {
  if (!isSupabaseConfigured) throw new Error("Supabase non configuré");

  const { data, error } = await supabase
    .from('documents')
    .insert([{ 
      ...doc, 
      likes: 0, 
      views: 0 
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Récupère les derniers documents avec jointure sur profiles
 */
export async function getLatestDocuments(limitCount: number = 20): Promise<Document[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*, profiles!user_id(*)')
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (error) {
      console.error("Erreur fetch docs Supabase:", error);
      return [];
    }
    return (data as any[]) || [];
  } catch (err) {
    // Évite de polluer la console avec TypeError: Failed to fetch si l'URL est placeholder
    if (err instanceof TypeError && err.message === 'Failed to fetch') return [];
    console.error("Erreur réseau fetch docs:", err);
    return [];
  }
}

/**
 * Récupère un document par son ID
 */
export async function getDocumentById(id: string): Promise<Document | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('documents')
    .select('*, profiles!user_id(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) return null;
  return data as any;
}

/**
 * Incrémente le compteur de vues
 */
export async function incrementDocumentViews(id: string) {
  if (!isSupabaseConfigured) return;
  try {
    const { data } = await supabase.from('documents').select('views').eq('id', id).single();
    if (data) {
      await supabase.from('documents').update({ views: (data.views || 0) + 1 }).eq('id', id);
    }
  } catch (e) {}
}

/**
 * Gère les likes
 */
export async function toggleLikeDocument(docId: string, userId: string) {
  if (!isSupabaseConfigured) return;
  try {
    const { data } = await supabase.from('documents').select('likes').eq('id', docId).single();
    if (data) {
      const { error } = await supabase.from('documents').update({ likes: (data.likes || 0) + 1 }).eq('id', docId);
      if (error) throw error;
    }
  } catch (e) {
    console.error("Erreur Like:", e);
  }
}

/**
 * Récupère les documents d'un utilisateur spécifique
 */
export async function getUserDocuments(userId: string): Promise<Document[]> {
  if (!isSupabaseConfigured) return [];
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data as any[]) || [];
}
