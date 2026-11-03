import { SareeItem } from '../types';

export const SAREE_COLLECTION: SareeItem[] = [
  {
    id: 'saree-purple-sequin',
    name: 'Royal Violet Purple Sequinned Georgette Saree',
    category: 'Sequinned & Designer',
    imageUrl: '/images/saree_purple_1792138741837.jpg',
    accentColor: '#7c3aed',
    tags: ['Sequinned', 'Party Wear', 'Georgette'],
  },
  {
    id: 'saree-teal-satin',
    name: 'Peacock Teal Blue Satin Silk Saree',
    category: 'Silk & Satin',
    imageUrl: '/images/saree_teal_1792138756076.jpg',
    accentColor: '#0d9488',
    tags: ['Zari Embroidered', 'Traditional', 'Festive'],
  },
  {
    id: 'saree-lilac-organza',
    name: 'Lilac Lavender Floral Embroidered Organza Saree',
    category: 'Organza & Sheer',
    imageUrl: '/images/saree_lilac_1792138776918.jpg',
    accentColor: '#c084fc',
    tags: ['Floral Embroidery', 'Pastel', 'Occasion'],
  },
  {
    id: 'saree-burgundy-paisley',
    name: 'Burgundy Wine Solid Satin Paisley Saree',
    category: 'Silk & Satin',
    imageUrl: '/images/saree_burgundy_1792138797422.jpg',
    accentColor: '#881337',
    tags: ['Paisley Border', 'Cocktail', 'Royal'],
  },
  {
    id: 'saree-navy-sheer',
    name: 'Midnight Navy Blue Buta Organza Saree',
    category: 'Organza & Sheer',
    imageUrl: '/images/saree_navy_1792138816867.jpg',
    accentColor: '#1e3a8a',
    tags: ['Gold Motifs', 'Banarasi', 'Evening'],
  },
  {
    id: 'saree-blush-cutdana',
    name: 'Blush Pink Hand Embroidered Cut-Dana Saree',
    category: 'Designer & Net',
    imageUrl: '/images/saree_blush_1792138834183.jpg',
    accentColor: '#f43f5e',
    tags: ['Cut-Dana', 'Boutique', 'Wedding'],
  },
  {
    id: 'saree-emerald-banarasi',
    name: 'Emerald Green Banarasi Golden Zari Saree',
    category: 'Banarasi & Silk',
    imageUrl: '/images/saree_emerald_1792138886691.jpg',
    accentColor: '#059669',
    tags: ['Heritage Zari', 'Bridal', 'Banarasi'],
  },
  {
    id: 'saree-plum-scallop',
    name: 'Plum Purple Silver Scalloped Border Saree',
    category: 'Georgette & Sheer',
    imageUrl: '/images/saree_plum_1792138916794.jpg',
    accentColor: '#581c87',
    tags: ['Scallop Lace', 'Minimalist', 'Party'],
  },
];

export const BASE_MODEL_IMAGE = '/images/base_model_1792138725237.jpg';

export async function processVirtualTryOn(
  _sareeId: string,
  onProgress?: (step: string, percentage: number) => void
): Promise<string> {
  const steps = [
    { text: 'Connecting to Vertex AI Imagen 3...', percent: 25 },
    { text: 'Synthesizing fabric texture & drape dynamics...', percent: 60 },
    { text: 'Aligning pallu pleats & realistic lighting...', percent: 85 },
    { text: 'Finalizing neural photorealistic blend...', percent: 100 },
  ];

  for (const step of steps) {
    onProgress?.(step.text, step.percent);
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  return 'complete';
}
