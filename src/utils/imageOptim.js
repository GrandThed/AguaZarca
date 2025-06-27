import imageCompression from 'browser-image-compression';

export async function compressImage(file, options = {}) {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(file, { ...defaultOptions, ...options });
    return compressedFile;
  } catch (error) {
    console.error(error);
    return file;
  }
}
