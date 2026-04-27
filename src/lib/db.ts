
import { supabase } from './supabase';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  interests: string[];
  followers: number;
  following: number;
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
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (profile) return profile;

  if (error && error.code === 'PGRST116') {
    const newProfile = {
      id: uid,
      username: defaultData.username || `user_${uid.substring(0, 5)}`,
      full_name: defaultData.full_name || 'Utilisateur',
      avatar_url: defaultData.avatar_url || `https://picsum.photos/seed/${uid}/200/200`,
      bio: defaultData.bio || 'Membre de la communauté LibreShare.',
      interests: defaultData.interests || ["Technologie", "Éducation"],
      followers: 0,
      following: 0
    };

    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      return null;
    }
    return data;
  }

  return null;
}

/**
 * Enregistre un document
 */
export async function saveDocument(doc: Omit<Document, 'id' | 'created_at' | 'likes' | 'views'>) {
  const { data, error } = await supabase
    .from('documents')
    .insert([{ ...doc, likes: 0, views: 0 }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Récupère les derniers documents avec les profils
 */
export async function getLatestDocuments(limitCount: number = 20): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false })
    .limit(limitCount);

  if (error) {
    console.error("Error fetching latest docs:", error);
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
    .select('*, profiles(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Document;
}

/**
 * Incrémente les vues
 */
export async function incrementDocumentViews(id: string) {
  const { error } = await supabase.rpc('increment_views', { row_id: id });
  if (error) console.error("Error incrementing views:", error);
}

/**
 * Gère les likes
 */
export async function toggleLikeDocument(docId: string, userId: string) {
  // Cette logique nécessite une table 'likes' pour être robuste.
  // Pour rester simple, on va juste incrémenter la colonne 'likes' sur 'documents'.
  const { data, error } = await supabase.rpc('toggle_like', { doc_id: docId, user_id: userId });
  if (error) console.error("Error toggling like:", error);
  return data;
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
