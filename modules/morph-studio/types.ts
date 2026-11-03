export interface SareeItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  tryOnResultUrl?: string;
  accentColor: string;
  tags: string[];
  price?: number;
}

export type TryOnState = 'idle' | 'scanning' | 'draping' | 'completed';

export interface UserUploadedPhoto {
  url: string;
  name: string;
}
