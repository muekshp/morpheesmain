'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Clock3, ImagePlus, Trash2, Upload, X } from 'lucide-react';

type SavedImage = { id: string; name: string; dataUrl: string; createdAt: string };
type TryOnHistoryItem = { id: string; name: string; imageUrl: string; createdAt: string };

const readAndCompressImage = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Unable to read this image.'));
  reader.onload = () => {
    const image = new window.Image();
    image.onerror = () => reject(new Error('This file is not a supported image.'));
    image.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    image.src = String(reader.result);
  };
  reader.readAsDataURL(file);
});

export async function saveUploadPhoto(file: File): Promise<SavedImage> {
  return { id: `${Date.now()}-${Math.random()}`, name: file.name, dataUrl: await readAndCompressImage(file), createdAt: new Date().toISOString() };
}

export function MyUploadsView() {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('morph_my_uploads') || '[]') as SavedImage[];
      if (Array.isArray(saved)) setImages(saved);
    } catch { setImages([]); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem('morph_my_uploads', JSON.stringify(images));
  }, [images, ready]);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const added: SavedImage[] = [];
    for (const file of Array.from(files).slice(0, 10)) {
      if (!file.type.startsWith('image/')) continue;
      try { added.push(await saveUploadPhoto(file)); }
      catch { setMessage(`Could not add ${file.name}.`); }
    }
    if (added.length) {
      setImages(current => [...added, ...current]);
      setMessage(`${added.length} photo${added.length > 1 ? 's' : ''} added to My Uploads.`);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return <section className="workspace-page">
    <div className="workspace-page-header"><div><h1>My Uploads</h1><p>Your saved photos for virtual try-on.</p></div><button className="primary-button" onClick={() => inputRef.current?.click()}><Upload size={15}/> Upload Photos</button></div>
    <input ref={inputRef} className="hidden" type="file" accept="image/*" multiple onChange={event => void addFiles(event.target.files)}/>
    {message && <div className="workspace-message"><span>{message}</span><button aria-label="Dismiss" onClick={() => setMessage('')}><X size={14}/></button></div>}
    {images.length ? <div className="upload-grid">{images.map(image => <article key={image.id} className="upload-card"><img src={image.dataUrl} alt={image.name}/><div><strong title={image.name}>{image.name}</strong><button aria-label={`Delete ${image.name}`} onClick={() => setImages(current => current.filter(item => item.id !== image.id))}><Trash2 size={15}/></button></div></article>)}</div> : <div className="workspace-empty"><ImagePlus size={28}/><strong>No photos uploaded yet</strong><span>Add a photo to use it for virtual try-on.</span><button className="primary-button" onClick={() => inputRef.current?.click()}><Upload size={14}/> Choose a photo</button></div>}
  </section>;
}

export function TryOnHistoryView() {
  const [history, setHistory] = useState<TryOnHistoryItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('morph_tryon_history') || '[]') as TryOnHistoryItem[];
      if (Array.isArray(saved)) setHistory(saved);
    } catch { setHistory([]); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem('morph_tryon_history', JSON.stringify(history));
  }, [history, ready]);

  return <section className="workspace-page">
    <div className="workspace-page-header"><div><h1>Try-On History</h1><p>Your recently generated virtual looks.</p></div>{history.length > 0 && <button className="secondary-button" onClick={() => setHistory([])}><Trash2 size={14}/> Clear history</button>}</div>
    {history.length ? <div className="upload-grid">{history.map(item => <article key={item.id} className="upload-card history-card"><Image src={item.imageUrl} alt={item.name} width={360} height={360}/><div><strong title={item.name}>{item.name}</strong><span>{new Date(item.createdAt).toLocaleDateString()}</span></div></article>)}</div> : <div className="workspace-empty"><Clock3 size={28}/><strong>No try-ons yet</strong><span>Choose a product and select “Try it on” to start.</span></div>}
  </section>;
}

export function ApiIntegrationView({ onConfigure }: { onConfigure: () => void }) {
  return <section className="workspace-page">
    <div className="workspace-page-header"><div><h1>API Integration</h1><p>Connect Morph AI to your product catalog and virtual try-on workflow.</p></div><button className="primary-button" onClick={onConfigure}>Configure API</button></div>
    <div className="api-integration-card"><h2>Get started</h2><p>Set up your service account credentials in Settings to connect the virtual try-on API.</p><ol><li>Open API settings and add your service account JSON.</li><li>Save the credentials to verify the connection.</li><li>Use the integration guide in Documentation to add the try-on flow to your storefront.</li></ol><button className="secondary-button" onClick={onConfigure}>Open API Settings</button></div>
  </section>;
}
