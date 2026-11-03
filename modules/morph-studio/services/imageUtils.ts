/**
 * Optimizes an uploaded user image (resizes large camera/phone photos to max dimension)
 * to ensure fast uploads, snappy performance, and compliance with API payload limits.
 */
export function optimizeImageForUpload(file: File, maxDim = 800): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    const fallbackTimeout = setTimeout(() => {
      resolve('');
    }, 2500);

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        clearTimeout(fallbackTimeout);
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        clearTimeout(fallbackTimeout);
        try {
          let width = img.width || 600;
          let height = img.height || 800;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch {
          resolve(rawDataUrl);
        }
      };

      img.onerror = () => {
        clearTimeout(fallbackTimeout);
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      clearTimeout(fallbackTimeout);
      resolve('');
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes an existing base64 data URL (e.g. from webcam)
 */
export function optimizeBase64Image(dataUrl: string, maxDim = 800): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        let width = img.width || 600;
        let height = img.height || 800;

        if (width <= maxDim && height <= maxDim) {
          resolve(dataUrl);
          return;
        }

        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
