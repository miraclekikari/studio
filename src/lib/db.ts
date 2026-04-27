
import { supabase, isSupabaseConfigured } from './supabase';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  interests?: string[];
  email?: string;
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
  created_at: string;
  profiles?: Profile;
}

/**
 * Résout un email à partir d'un pseudo.
 */
export async function resolveEmailFromIdentifier(identifier: string): Promise<string | null> {
  if (!isSupabaseConfigured || !identifier) return null;
  if (identifier.includes('@')) return identifier;

  try {
    const { data } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', identifier.toLowerCase())
      .maybeSingle();

    return data?.email || null;
  } catch (e) {
    return null;
  }
}

/**
 * Récupère ou initialise un profil utilisateur.
 */
export async function getOrCreateProfile(uid: string, defaultData: Partial<Profile>): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (profile) return profile;

    const newProfile = {
      id: uid,
      username: defaultData.username || `user_${uid.substring(0, 5)}`,
      full_name: defaultData.full_name || 'Membre Studio',
      avatar_url: defaultData.avatar_url || `https://picsum.photos/seed/${uid}/200/200`,
      bio: 'Membre actif de la communauté de savoir.',
      interests: defaultData.interests || ["Savoir", "Analyse"],
      email: defaultData.email
    };

    const { data, error } = await supabase.from('profiles').upsert([newProfile]).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Profile creation error:", err);
    return null;
  }
}

/**
 * Sauvegarde un document sans la colonne 'tags' qui cause l'erreur.
 */
export async function saveDocument(doc: Omit<Document, 'id' | 'created_at' | 'likes' | 'views'>) {
  if (!isSupabaseConfigured) throw new Error("Base de données non configurée");
  const { data, error } = await supabase.from('documents').insert([{ 
    title: doc.title,
    description: doc.description,
    file_url: doc.file_url,
    thumbnail_url: doc.thumbnail_url,
    category: doc.category,
    user_id: doc.user_id,
    format: doc.format,
    likes: 0, 
    views: 0 
  }]).select().single();
  if (error) throw error;
  return data;
}

/**
 * Récupère les derniers documents avec jointure profil simplifiée.
 */
export async function getLatestDocuments(limitCount: number = 20, category?: string): Promise<Document[]> {
  if (!isSupabaseConfigured) return [];
  try {
    let query = supabase
      .from('documents')
      .select('*, profiles:user_id(*)')
      .order('created_at', { ascending: false })
      .limit(limitCount);
      
    if (category && category !== 'Tous') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as any[]) || [];
  } catch (err) {
    console.error("Fetch docs error:", err);
    return [];
  }
}

/**
 * Statistiques utilisateur.
 */
export async function getUserStats(userId: string) {
  if (!isSupabaseConfigured) return { likes: 0, posts: 0 };
  try {
    const { data: docs } = await supabase.from('documents').select('likes').eq('user_id', userId);
    const totalLikes = docs?.reduce((acc, d) => acc + (d.likes || 0), 0) || 0;
    return { likes: totalLikes, posts: docs?.length || 0 };
  } catch (e) {
    return { likes: 0, posts: 0 };
  }
}

export async function getDocumentById(id: string): Promise<Document | null> {
  if (!isSupabaseConfigured || !id) return null;
  const { data, error } = await supabase.from('documents').select('*, profiles:user_id(*)').eq('id', id).maybeSingle();
  return error ? null : (data as any);
}

/**
 * Incrémentation sécurisée RPC.
 */
export async function incrementDocumentViews(id: string) {
  if (!isSupabaseConfigured) return;
  await supabase.rpc('increment_views', { doc_id: id });
}

/**
 * Like sécurisé RPC.
 */
export async function toggleLikeDocument(docId: string, userId: string) {
  if (!isSupabaseConfigured) return;
  await supabase.rpc('increment_likes', { doc_id: docId });
}

/**
 * Documents personnels.
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
