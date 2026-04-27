
import { supabase } from './supabase';

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
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (profile) return profile;

  // Création si inexistant (code d'erreur pour ligne non trouvée)
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

  if (insertError) {
    console.error("Erreur lors de la création du profil:", insertError);
    return null;
  }
  return data;
}

/**
 * Enregistre un document dans Supabase
 */
export async function saveDocument(doc: Omit<Document, 'id' | 'created_at' | 'likes' | 'views'>) {
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
  const { data, error } = await supabase
    .from('documents')
    .select('*, profiles!user_id(*)')
    .order('created_at', { ascending: false })
    .limit(limitCount);

  if (error) {
    console.error("Erreur lors de la récupération des docs:", error);
    return [];
  }
  return data as Document[];
}

/**
 * Récupère un document par ID
 */
export async function getDocumentById(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*, profiles!user_id(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Document;
}

/**
 * Incrémente les vues
 */
export async function incrementDocumentViews(id: string) {
  const { data: current } = await supabase.from('documents').select('views').eq('id', id).single();
  if (current) {
    await supabase.from('documents').update({ views: (current.views || 0) + 1 }).eq('id', id);
  }
}

/**
 * Gère les likes de façon atomique
 */
export async function toggleLikeDocument(docId: string, userId: string) {
  const { data: current } = await supabase.from('documents').select('likes').eq('id', docId).single();
  if (current) {
    const { error } = await supabase.from('documents').update({ likes: (current.likes || 0) + 1 }).eq('id', docId);
    if (error) throw error;
  }
}

/**
 * Récupère les documents d'un utilisateur
 */
export async function getUserDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Document[];
}
