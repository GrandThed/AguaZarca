'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaImage, FaTimes, FaCheck } from 'react-icons/fa';
import { uploadMultipleImages } from '@/lib/api-client';
import { ImageUploadResponse } from '@/types/api';
import { toast } from 'react-toastify';
import imageCompression from 'browser-image-compression';

interface ImageUploaderProps {
  onImagesUploaded: (images: ImageUploadResponse[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  existingImagesCount?: number;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function ImageUploader({
  onImagesUploaded,
  maxFiles = 10,
  maxSize = 5,
  existingImagesCount = 0,
}: ImageUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const remainingSlots = maxFiles - existingImagesCount;

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name, {
        type: compressedFile.type,
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      return file;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > remainingSlots) {
        toast.error(`Solo puedes subir ${remainingSlots} imágenes más`);
        return;
      }

      // Create preview files
      const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'pending' as const,
      }));

      setUploadingFiles(newFiles);
      setIsUploading(true);

      try {
        // Compress images
        const compressedFiles = await Promise.all(
          acceptedFiles.map((file) => compressImage(file))
        );

        // Update status to uploading
        setUploadingFiles((prev) =>
          prev.map((f, i) => ({
            ...f,
            status: 'uploading',
            file: compressedFiles[i],
          }))
        );

        // Upload all images
        const uploadedImages = await uploadMultipleImages(compressedFiles);

        // Update status to success
        setUploadingFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: 'success',
            progress: 100,
          }))
        );

        onImagesUploaded(uploadedImages);
        toast.success(`${uploadedImages.length} imágenes subidas exitosamente`);

        // Clear after 2 seconds
        setTimeout(() => {
          setUploadingFiles([]);
        }, 2000);
      } catch (error: any) {
        setUploadingFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: 'error',
            error: error.message || 'Error al subir la imagen',
          }))
        );
        toast.error(error.message || 'Error al subir las imágenes');
      } finally {
        setIsUploading(false);
      }
    },
    [remainingSlots, onImagesUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: remainingSlots,
    maxSize: maxSize * 1024 * 1024,
    disabled: isUploading || remainingSlots === 0,
  });

  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (remainingSlots === 0) {
    return (
      <div className="p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-center text-gray-500">
          Has alcanzado el límite máximo de {maxFiles} imágenes
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative p-8 bg-white rounded-lg border-2 border-dashed transition-colors cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg text-blue-600">Suelta las imágenes aquí...</p>
          ) : (
            <>
              <p className="text-lg text-gray-700">
                Arrastra y suelta imágenes aquí, o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Puedes subir hasta {remainingSlots} imágenes más (máximo {maxSize}MB cada una)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Formatos: JPG, PNG, GIF, WEBP
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
            >
              <img
                src={file.preview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file.name}
                </p>
                <div className="mt-1">
                  {file.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                  {file.status === 'success' && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <FaCheck /> Subida exitosa
                    </p>
                  )}
                  {file.status === 'error' && (
                    <p className="text-sm text-red-600">{file.error}</p>
                  )}
                </div>
              </div>
              {file.status === 'pending' && (
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-500 hover:text-red-500"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}