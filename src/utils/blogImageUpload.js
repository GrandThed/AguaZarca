import { storage } from '../firebase';
import { compressImage } from './imageOptim';

// Upload blog images to Firebase Storage
export const uploadBlogImage = async (file, blogId = 'temp') => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Compress image for blog use
    const compressedFile = await compressImage(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1200, // Good for blog images
      useWebWorker: true,
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `blog_${blogId}_${timestamp}_${randomString}.${fileExtension}`;

    // Create storage reference
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`blog-images/${fileName}`);

    // Upload file
    const uploadTask = imageRef.put(compressedFile);

    // Return promise that resolves with download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking (optional)
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress}%`);
        },
        (error) => {
          // Handle upload errors
          console.error('Upload error:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            resolve({
              url: downloadURL,
              fileName: fileName,
              originalName: file.name,
              size: compressedFile.size,
              type: compressedFile.type
            });
          } catch (error) {
            reject(new Error(`Failed to get download URL: ${error.message}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Blog image upload error:', error);
    throw error;
  }
};

// Delete blog image from Firebase Storage
export const deleteBlogImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // Extract file path from URL
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    if (!imageUrl.startsWith(baseUrl)) {
      console.warn('Invalid Firebase Storage URL');
      return;
    }

    // Create reference from URL
    const imageRef = storage.refFromURL(imageUrl);
    
    // Delete the file
    await imageRef.delete();
    console.log('Blog image deleted successfully');
  } catch (error) {
    console.error('Error deleting blog image:', error);
    // Don't throw error - deletion failures shouldn't break the app
  }
};

// Upload multiple images (for bulk upload)
export const uploadMultipleBlogImages = async (files, blogId = 'temp') => {
  try {
    const uploadPromises = files.map(file => uploadBlogImage(file, blogId));
    const results = await Promise.allSettled(uploadPromises);
    
    const successful = [];
    const failed = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push({
          file: files[index].name,
          error: result.reason.message
        });
      }
    });
    
    return { successful, failed };
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw error;
  }
};

// Generate optimized image URL for different sizes
export const getOptimizedImageUrl = (originalUrl, width = 800) => {
  // For Firebase Storage, we can't dynamically resize
  // But we can return the original URL or implement client-side optimization
  return originalUrl;
};

// Extract images from blog content (for cleanup purposes)
export const extractImagesFromContent = (htmlContent) => {
  if (!htmlContent) return [];
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const images = doc.querySelectorAll('img');
  
  return Array.from(images).map(img => img.src).filter(src => 
    src.includes('firebasestorage.googleapis.com')
  );
};