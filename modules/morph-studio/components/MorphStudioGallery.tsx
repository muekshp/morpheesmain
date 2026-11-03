'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useVirtualTryOn } from '../hooks/useVirtualTryOn';
import TryOnModal from './TryOnModal';
import { SareeItem } from '../types';
import { Search, Sparkles, Upload, Heart, Shirt, Gem, Footprints, ShoppingBag, CheckCircle } from 'lucide-react';
import { saveUploadPhoto } from '@/components/WorkspaceViews';
import { CATALOG_PRODUCTS, CATEGORY_IMAGES } from '../catalogProducts';

const categoryTiles = [
  { label: 'Try On Saree', category: 'Saree', image: CATEGORY_IMAGES.Saree, icon: Shirt },
  { label: 'Try On Kurti', category: 'Kurti', image: CATEGORY_IMAGES.Kurti, icon: Shirt },
  { label: 'Try On Lehenga', category: 'Lehenga', image: CATEGORY_IMAGES.Lehenga, icon: Gem },
  { label: 'Try On Western Wear', category: 'Western Wear', image: CATEGORY_IMAGES['Western Wear'], icon: Shirt },
  { label: 'Try On Mens Wear', category: 'Mens Wear', image: CATEGORY_IMAGES['Mens Wear'], icon: Shirt },
  { label: 'Try On Footwear', category: 'Footwear', image: CATEGORY_IMAGES.Footwear, icon: Footprints },
  { label: 'Try On Jewellery', category: 'Jewellery', image: CATEGORY_IMAGES.Jewellery, icon: Gem },
  { label: 'Try On Accessories', category: 'Accessories', image: CATEGORY_IMAGES.Accessories, icon: ShoppingBag },
];

interface MorphStudioGalleryProps { initialCategory?: string; }

export default function MorphStudioGallery({ initialCategory = 'All' }: MorphStudioGalleryProps) {
  const studio = useVirtualTryOn();
  const { selectedSaree, isModalOpen, tryOnState, progressText, progressPercent,
    openTryOnModal, closeModal, handleStartTryOn, resetTryOn, handleUploadUserPhoto } = studio;
  const [category, setCategory] = useState(initialCategory === 'All' ? 'Saree' : initialCategory);
  const [query, setQuery] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [uploadName, setUploadName] = useState('');
  const photoInput = useRef<HTMLInputElement>(null);
  useEffect(() => { setCategory(initialCategory === 'All' ? 'Saree' : initialCategory); }, [initialCategory]);
  const filtered = useMemo(() => {
    return CATALOG_PRODUCTS.filter((item) =>
      item.category === category &&
      `${item.name} ${item.category} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  }, [category, query]);
  const selectPhoto = (file?: File) => {
    if (!file) return;
    handleUploadUserPhoto(file);
    setUploadName(file.name);
    setUploadSuccess(true);
    void saveUploadPhoto(file).then(photo => {
      try {
        const existing = JSON.parse(localStorage.getItem('morph_my_uploads') || '[]');
        const uploads = Array.isArray(existing) ? existing : [];
        localStorage.setItem('morph_my_uploads', JSON.stringify([photo, ...uploads].slice(0, 20)));
      } catch { setUploadSuccess(false); }
    }).catch(() => setUploadSuccess(false));
    window.setTimeout(() => setUploadSuccess(false), 3500);
  };
  const pick = (item: SareeItem) => openTryOnModal(item);
  const products = filtered;

  return <div className="studio-shell">
    <div className="studio-workspace">
      <main className="studio-main">
        <div className="studio-heading">
          <div className="studio-heading-icon"><Sparkles size={19} fill="currentColor" /></div>
          <div className="studio-heading-copy">
            <div className="studio-title-line"><h1>Virtual Try-On Studio</h1><span className="powered-pill"><Sparkles size={11}/> Powered by AI</span></div>
            <p>Upload a photo, choose any product and see how it looks on you instantly.</p>
          </div>
          <div className="studio-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products, styles, brands..." /></div>
          <button className="primary-button heading-upload" onClick={() => photoInput.current?.click()}><Upload size={14}/> Upload Your Photo</button>
        </div>
        <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={e => selectPhoto(e.target.files?.[0])}/>
        {uploadSuccess && <div className="upload-toast"><CheckCircle size={15}/> {uploadName} uploaded. You’re ready to try it on.</div>}

        <div className="category-strip" aria-label="Try-on categories">
          {categoryTiles.map(({label, category: tileCategory, image, icon: Icon}) => {
            return <button className={`category-tile ${category === tileCategory ? 'selected' : ''}`} key={label} onClick={() => setCategory(tileCategory)}>
              <span className="category-label"><Icon size={14}/>{label}</span>
              <Image src={image} alt="" width={110} height={120} />
            </button>;
          })}
        </div>

        <div className="collection-heading">
          <div><h2>{category} Collection</h2><p>Choose a style to virtually try on. Browse {CATALOG_PRODUCTS.filter(item => item.category === category).length} looks in this category.</p></div>
          <div className="collection-filters">
            <label className="compact-search"><Search size={13}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={category === 'Saree' ? 'Search sarees...' : `Search ${category.toLowerCase()}...`}/></label>
            <select aria-label="Brand"><option>All Brands</option><option>Morph Studio</option></select>
            <select aria-label="Color"><option>All Colors</option><option>Blue</option><option>Pink</option><option>Green</option></select>
            <select aria-label="Occasion"><option>All Occasions</option><option>Wedding</option><option>Festive</option></select>
            <select aria-label="Sort"><option>Latest</option><option>Popular</option></select>
          </div>
        </div>
        {filtered.length === 0 ? <div className="catalog-empty"><strong>No matching styles</strong><span>Try a different search or choose another category.</span><button onClick={() => { setCategory('Saree'); setQuery(''); }}>Browse Saree Collection</button></div> : <div className="product-grid">
          {products.map((item, index) => <article className="product-card" key={`${item.id}-${index}`}>
            <div className={`product-image ${item.category === 'Footwear' ? 'product-image-wide' : ''}`} onClick={() => pick(item)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && pick(item)}>
              <Image src={item.imageUrl} alt={item.name} fill sizes="(max-width: 680px) 50vw, (max-width: 1100px) 33vw, 20vw" />
              <button aria-label="Toggle favorite" className={`favorite-button ${favoriteIds.includes(item.id) ? 'is-favorite' : ''}`} onClick={e => {e.stopPropagation(); setFavoriteIds(ids => ids.includes(item.id) ? ids.filter(id => id !== item.id) : [...ids, item.id]);}}><Heart size={15} fill={favoriteIds.includes(item.id) ? 'currentColor' : 'none'}/></button>
            </div>
            <div className="product-info"><strong>{item.name}</strong><span>₹{(item.price ?? 0).toLocaleString('en-IN')}</span><div className="swatches"><i style={{background:item.accentColor}}/><i style={{background:'#65113d'}}/><i style={{background:'#d5b17b'}}/></div>
              <button className="try-button" onClick={() => pick(item)}><Sparkles size={13} fill="currentColor"/> Try it on</button>
            </div>
          </article>)}
        </div>}
      </main>

    </div>
    <TryOnModal isOpen={isModalOpen} saree={selectedSaree} tryOnState={tryOnState} progressText={progressText} progressPercent={progressPercent} onClose={closeModal} onStartTryOn={handleStartTryOn} onReset={resetTryOn}/>
  </div>;
}
