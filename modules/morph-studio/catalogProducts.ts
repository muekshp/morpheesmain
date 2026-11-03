import { SareeItem } from './types';
import { USER_CATEGORY_IMAGES } from './userCategoryImages';

const categoryFolders: Record<string, string> = {
  Saree: 'saree',
  Kurti: 'kurti',
  Lehenga: 'lahenga',
  'Western Wear': 'westrn wear',
  'Mens Wear': 'mens wear',
  Footwear: 'footwear',
  Jewellery: 'jewellery',
  Accessories: 'accessories',
};

const categorySettings: Record<string, { price: number; accent: string }> = {
  Saree: { price: 1799, accent: '#7c3aed' },
  Kurti: { price: 1299, accent: '#be123c' },
  Lehenga: { price: 3999, accent: '#9f1239' },
  'Western Wear': { price: 1999, accent: '#2563eb' },
  'Mens Wear': { price: 2499, accent: '#1e3a8a' },
  Footwear: { price: 1499, accent: '#374151' },
  Jewellery: { price: 999, accent: '#b7791f' },
  Accessories: { price: 899, accent: '#111827' },
};

const encodedImagePath = (category: string, file: string) =>
  `/images/${categoryFolders[category].split('/').map(encodeURIComponent).join('/')}/${encodeURIComponent(file)}`;

const categoryImageFallbacks: Record<string, string> = {
  Jewellery: '/images/catalog/jewellery-01.avif',
};

export const CATEGORY_IMAGES: Record<string, string> = Object.fromEntries(
  Object.keys(categoryFolders).map((category) => [
    category,
    USER_CATEGORY_IMAGES[category]?.find((file) => !file.includes('.thumbnail.') && !file.includes(' (1).'))
      ? encodedImagePath(category, USER_CATEGORY_IMAGES[category].find((file) => !file.includes('.thumbnail.') && !file.includes(' (1).'))!)
      : categoryImageFallbacks[category] ?? '/images/catalog/saree-01.avif',
  ]),
);

const localProducts: SareeItem[] = Object.entries(USER_CATEGORY_IMAGES).flatMap(([category, files]) =>
  files
    // Skip the low-resolution preview and exact duplicate downloads when originals are present.
    .filter((file) => !file.includes('.thumbnail.') && !file.includes(' (1).'))
    .map((file, index) => {
      const settings = categorySettings[category];
      return {
        id: `${category.toLowerCase().replaceAll(' ', '-')}-local-${index + 1}`,
        name: `${category} Style ${String(index + 1).padStart(2, '0')}`,
        category,
        imageUrl: encodedImagePath(category, file),
        accentColor: settings.accent,
        tags: ['Local catalog image', file],
        price: settings.price + (index % 5) * 200,
      };
    }),
);

// Jewellery has no files in public/images/jewellery yet, so keep its existing demo products
// visible until images are added to that folder.
const jewelleryFallbackProducts: SareeItem[] = USER_CATEGORY_IMAGES.Jewellery.length
  ? []
  : Array.from({ length: 10 }, (_, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        id: `jewellery-demo-${number}`,
        name: `Jewellery Style ${number}`,
        category: 'Jewellery',
        imageUrl: `/images/catalog/jewellery-${number}.avif`,
        accentColor: categorySettings.Jewellery.accent,
        tags: ['Demo style'],
        price: categorySettings.Jewellery.price + (index % 5) * 200,
      };
    });

export const CATALOG_PRODUCTS: SareeItem[] = [...localProducts, ...jewelleryFallbackProducts];
