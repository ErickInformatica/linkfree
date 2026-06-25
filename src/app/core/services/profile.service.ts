import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  increment,
  serverTimestamp,
  addDoc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Profile, ProfileInfo, ProfileTheme, LinkItem, DEFAULT_THEME } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async getProfile(slug: string): Promise<Profile | null> {
    const ref = doc(this.firestore, 'profiles', slug);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as Profile;
  }

  async getMyProfiles(): Promise<Profile[]> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return [];
    const q = query(collection(this.firestore, 'profiles'), where('info.owner', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Profile);
  }

  async createProfile(slug: string, name: string): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    const now = new Date().toISOString();
    const profile: Profile = {
      info: { name, bio: '', avatarUrl: '', owner: uid, slug, createdAt: now, updatedAt: now },
      theme: { ...DEFAULT_THEME },
      stats: { totalViews: 0, totalClicks: 0 },
      links: [],
    };
    await setDoc(doc(this.firestore, 'profiles', slug), profile);
  }

  async updateInfo(slug: string, info: Partial<ProfileInfo>): Promise<void> {
    await updateDoc(doc(this.firestore, 'profiles', slug), {
      'info.name': info.name,
      'info.bio': info.bio,
      'info.avatarUrl': info.avatarUrl,
      'info.updatedAt': new Date().toISOString(),
    });
  }

  async updateTheme(slug: string, theme: ProfileTheme): Promise<void> {
    await updateDoc(doc(this.firestore, 'profiles', slug), { theme });
  }

  async updateLinks(slug: string, links: LinkItem[]): Promise<void> {
    await updateDoc(doc(this.firestore, 'profiles', slug), { links });
  }

  async incrementView(slug: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'profiles', slug), {
      'stats.totalViews': increment(1),
      'stats.lastViewed': new Date().toISOString(),
    });
  }

  async trackClick(slug: string, linkId: string): Promise<void> {
    const profile = await this.getProfile(slug);
    if (!profile) return;

    const links = profile.links.map(l =>
      l.id === linkId ? { ...l, clicks: l.clicks + 1 } : l
    );
    await updateDoc(doc(this.firestore, 'profiles', slug), {
      links,
      'stats.totalClicks': increment(1),
    });

    await addDoc(collection(this.firestore, 'clicks'), {
      slug,
      linkId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }

  async getClicksHistory(slug: string): Promise<any[]> {
    const q = query(collection(this.firestore, 'clicks'), where('slug', '==', slug));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }
}
