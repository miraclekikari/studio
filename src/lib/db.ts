import { db } from '@/firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  limit,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

export interface DocumentData {
  id?: string;
  title: string;
  description: string;
  fileUrl: string;
  thumbnailUrl: string;
  category: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: Timestamp | any;
  likes: number;
  likedBy?: string[];
  views: number;
  format: string;
  tags?: string[];
}

export interface UserProfile {
  uid: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  updatedAt: Timestamp | any;
  followers?: number;
  following?: number;
  interests?: string[];
}

/**
 * Enregistre un nouveau document dans Firestore.
 */
export const saveDocument = async (data: Omit<DocumentData, 'id' | 'createdAt' | 'likes' | 'views'>) => {
  return await addDoc(collection(db, 'documents'), {
    ...data,
    createdAt: serverTimestamp(),
    likes: 0,
    likedBy: [],
    views: 0
  });
};

/**
 * Récupère un document spécifique par son ID.
 */
export const getDocumentById = async (id: string) => {
  try {
    const docRef = doc(db, 'documents', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DocumentData;
    }
    return null;
  } catch (error) {
    console.error("Erreur Firestore (getDocumentById):", error);
    return null;
  }
};

/**
 * Incrémente le compteur de vues d'un document.
 */
export const incrementDocumentViews = async (id: string) => {
  const docRef = doc(db, 'documents', id);
  await updateDoc(docRef, {
    views: increment(1)
  });
};

/**
 * Ajoute ou retire un Like sur un document pour un utilisateur donné.
 */
export const toggleLikeDocument = async (docId: string, userId: string) => {
  const docRef = doc(db, 'documents', docId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return;
  
  const data = docSnap.data() as DocumentData;
  const likedBy = data.likedBy || [];
  const isLiked = likedBy.includes(userId);

  if (isLiked) {
    await updateDoc(docRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });
  } else {
    await updateDoc(docRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });
  }
};

/**
 * Récupère les derniers documents publics.
 */
export const getLatestDocuments = async (count: number = 20) => {
  try {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentData));
  } catch (error) {
    console.error("Erreur Firestore (getLatestDocuments):", error);
    return [];
  }
};

/**
 * Récupère tous les documents d'un utilisateur spécifique.
 */
export const getUserDocuments = async (userId: string) => {
  try {
    const q = query(collection(db, 'documents'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentData));
  } catch (error) {
    console.error("Erreur Firestore (getUserDocuments):", error);
    return [];
  }
};

/**
 * Récupère le profil d'un utilisateur ou le crée s'il n'existe pas.
 */
export const getOrCreateProfile = async (uid: string, defaultData: Partial<UserProfile>) => {
  const docRef = doc(db, 'profiles', uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    const newProfile: UserProfile = {
      uid,
      username: defaultData.username || `user_${uid.substring(0, 5)}`,
      fullName: defaultData.fullName || 'Utilisateur LibreShare',
      avatarUrl: defaultData.avatarUrl || `https://picsum.photos/seed/${uid}/200/200`,
      bio: defaultData.bio || 'Passionné de savoir.',
      interests: defaultData.interests || ["Technologie", "Éducation", "Design"],
      updatedAt: serverTimestamp(),
      followers: 0,
      following: 0
    };
    await setDoc(docRef, newProfile);
    return newProfile;
  }
};

/**
 * Met à jour le profil d'un utilisateur.
 */
export const updateProfile = async (uid: string, data: Partial<UserProfile>) => {
  const docRef = doc(db, 'profiles', uid);
  return await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};
