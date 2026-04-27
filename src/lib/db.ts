
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
 * Récupère ou crée un profil utilisateur
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
      bio: 'Membre de la communauté Studio.',
      interests: defaultData.interests || ["Technologie", "Savoir"]
    };

    const { data, error: insertError } = await supabase
      .from('profiles')
      .upsert([newProfile])
      .select()
      .single();

    if (insertError) throw insertError;
    return data;
  } catch (err) {
    console.error("Erreur Profil:", err);
    return null;
  }
}

/**
 * Enregistre un document
 */
export async function saveDocument(doc: Omit<Document, 'id' | 'created_at' | 'likes' | 'views'>) {
  if (!isSupabaseConfigured) throw new Error("Base de données non configurée");

  try {
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
  } catch (err) {
    console.error("Save doc error:", err);
    throw err;
  }
}

/**
 * Récupère les derniers documents
 */
export async function getLatestDocuments(limitCount: number = 20): Promise<Document[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*, profiles!user_id(*)')
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (error) throw error;
    return (data as any[]) || [];
  } catch (err) {
    console.error("Fetch docs error:", err);
    return [];
  }
}

/**
 * Récupère un document par son ID
 */
export async function getDocumentById(id: string): Promise<Document | null> {
  if (!isSupabaseConfigured || !id) return null;

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*, profiles!user_id(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as any;
  } catch (err) {
    console.error("Get doc by ID error:", err);
    return null;
  }
}

/**
 * Incrémente le compteur de vues
 */
export async function incrementDocumentViews(id: string) {
  if (!isSupabaseConfigured || !id) return;
  try {
    const { data, error: fetchError } = await supabase.from('documents').select('views').eq('id', id).maybeSingle();
    if (data) {
      await supabase.from('documents').update({ views: (data.views || 0) + 1 }).eq('id', id);
    }
  } catch (e) {
    console.error("View increment error:", e);
  }
}

/**
 * Gère les likes
 */
export async function toggleLikeDocument(docId: string, userId: string) {
  if (!isSupabaseConfigured || !docId) return;
  try {
    const { data } = await supabase.from('documents').select('likes').eq('id', docId).maybeSingle();
    if (data) {
      const { error } = await supabase.from('documents').update({ likes: (data.likes || 0) + 1 }).eq('id', docId);
      if (error) throw error;
    }
  } catch (e) {
    console.error("Like error:", e);
  }
}

/**
 * Récupère les documents d'un utilisateur spécifique
 */
export async function getUserDocuments(userId: string): Promise<Document[]> {
  if (!isSupabaseConfigured || !userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as any[]) || [];
  } catch (err) {
    console.error("User docs fetch error:", err);
    return [];
  }
}
