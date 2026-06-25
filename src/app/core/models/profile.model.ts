export interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  iconType: 'preset' | 'emoji' | 'url';
  active: boolean;
  order: number;
  clicks: number;
  scheduledFrom?: string | null;
  scheduledTo?: string | null;
  thumbnail?: string | null;
  highlighted?: boolean;
}

export interface ProfileTheme {
  bgType: 'color' | 'gradient' | 'image';
  bg: string;
  bg2?: string;
  gradientDir?: string;
  bgImageUrl?: string;
  fontColor: string;
  btnColor: string;
  btnTextColor: string;
  btnStyle: 'rounded' | 'pill' | 'square' | 'shadow';
  fontFamily: string;
}

export interface ProfileInfo {
  name: string;
  bio: string;
  avatarUrl: string;
  owner: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStats {
  totalViews: number;
  totalClicks: number;
  lastViewed?: string;
}

export interface Profile {
  info: ProfileInfo;
  theme: ProfileTheme;
  stats: ProfileStats;
  links: LinkItem[];
}

export const DEFAULT_THEME: ProfileTheme = {
  bgType: 'gradient',
  bg: '#667eea',
  bg2: '#764ba2',
  gradientDir: '135deg',
  fontColor: '#ffffff',
  btnColor: '#ffffff',
  btnTextColor: '#333333',
  btnStyle: 'pill',
  fontFamily: 'Inter, sans-serif',
};

export const PRESET_ICONS: Record<string, string> = {
  whatsapp: '📱',
  instagram: '📸',
  facebook: '👤',
  tiktok: '🎵',
  youtube: '▶️',
  twitter: '🐦',
  linkedin: '💼',
  website: '🌐',
  email: '✉️',
  phone: '📞',
  telegram: '✈️',
  custom: '🔗',
};
