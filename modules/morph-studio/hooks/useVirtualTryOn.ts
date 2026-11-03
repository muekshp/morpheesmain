import { useState } from 'react';
import { SareeItem, TryOnState } from '../types';
import { SAREE_COLLECTION, processVirtualTryOn } from '../services/tryOnService';

export function useVirtualTryOn() {
  const [collection, setCollection] = useState<SareeItem[]>(SAREE_COLLECTION);
  const [selectedSaree, setSelectedSaree] = useState<SareeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tryOnState, setTryOnState] = useState<TryOnState>('idle');
  const [progressText, setProgressText] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  const addOutfit = (newOutfit: SareeItem) => {
    setCollection((prev) => [newOutfit, ...prev]);
  };

  const openTryOnModal = (saree: SareeItem) => {
    setSelectedSaree(saree);
    setIsModalOpen(true);
    setTryOnState('idle');
    setProgressText('');
    setProgressPercent(0);
    setShowComparison(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTryOnState('idle');
    setProgressText('');
    setProgressPercent(0);
  };

  const handleStartTryOn = async () => {
    if (!selectedSaree) return;
    setTryOnState('scanning');
    setProgressPercent(15);
    setProgressText('Initializing neural mesh...');

    try {
      await processVirtualTryOn(selectedSaree.id, (step, percent) => {
        setProgressText(step);
        setProgressPercent(percent);
      });
      setTryOnState('completed');
    } catch {
      setTryOnState('completed');
    }
  };

  const handleUploadUserPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setUserPhoto(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetTryOn = () => {
    setTryOnState('idle');
    setProgressText('');
    setProgressPercent(0);
  };

  return {
    collection,
    selectedSaree,
    isModalOpen,
    tryOnState,
    progressText,
    progressPercent,
    userPhoto,
    showComparison,
    setShowComparison,
    openTryOnModal,
    closeModal,
    handleStartTryOn,
    handleUploadUserPhoto,
    resetTryOn,
    setUserPhoto,
    addOutfit,
  };
}
