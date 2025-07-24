import { firestore } from '../firebase';
import { slugify } from './slugify';
import { extractImagesFromContent, deleteBlogImage } from './blogImageUpload';

// Blog service for Firebase operations
export class BlogService {
  static COLLECTION_NAME = 'blogs';

  // Create a new blog post
  static async createBlog(blogData, authorId) {
    try {
      const blog = {
        ...blogData,
        slug: blogData.slug || slugify(blogData.title),
        authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: blogData.isPublished ? new Date() : null,
        views: 0,
        likes: 0,
        comments: [],
        status: blogData.isPublished ? 'published' : 'draft',
        seoTitle: blogData.title,
        seoDescription: blogData.excerpt || this.generateExcerpt(blogData.content),
        readingTime: this.calculateReadingTime(blogData.content)
      };

      const docRef = await firestore.collection(this.COLLECTION_NAME).add(blog);
      
      return {
        id: docRef.id,
        ...blog
      };
    } catch (error) {
      console.error('Error creating blog:', error);
      throw new Error(`Failed to create blog: ${error.message}`);
    }
  }

  // Update an existing blog post
  static async updateBlog(blogId, blogData, authorId) {
    try {
      const updates = {
        ...blogData,
        slug: blogData.slug || slugify(blogData.title),
        updatedAt: new Date(),
        seoTitle: blogData.title,
        seoDescription: blogData.excerpt || this.generateExcerpt(blogData.content),
        readingTime: this.calculateReadingTime(blogData.content)
      };

      // If publishing for the first time, set publishedAt
      if (blogData.isPublished && !blogData.publishedAt) {
        updates.publishedAt = new Date();
        updates.status = 'published';
      } else if (blogData.isPublished) {
        updates.status = 'published';
      } else {
        updates.status = 'draft';
      }

      await firestore.collection(this.COLLECTION_NAME).doc(blogId).update(updates);
      
      return {
        id: blogId,
        ...updates
      };
    } catch (error) {
      console.error('Error updating blog:', error);
      throw new Error(`Failed to update blog: ${error.message}`);
    }
  }

  // Get a single blog post by ID
  static async getBlogById(blogId) {
    try {
      const doc = await firestore.collection(this.COLLECTION_NAME).doc(blogId).get();
      
      if (!doc.exists) {
        throw new Error('Blog post not found');
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  }

  // Get a blog post by slug (for public viewing)
  static async getBlogBySlug(slug) {
    try {
      const querySnapshot = await firestore
        .collection(this.COLLECTION_NAME)
        .where('slug', '==', slug)
        .where('status', '==', 'published')
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        throw new Error('Blog post not found');
      }

      const doc = querySnapshot.docs[0];
      const blog = {
        id: doc.id,
        ...doc.data()
      };

      // Increment view count
      await this.incrementViews(doc.id);

      return blog;
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      throw error;
    }
  }

  // Get all published blogs (for public listing)
  static async getPublishedBlogs(limit = 10, lastDoc = null) {
    try {
      let query = firestore
        .collection(this.COLLECTION_NAME)
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(limit);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const querySnapshot = await query.get();
      
      const blogs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        blogs,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === limit
      };
    } catch (error) {
      console.error('Error fetching published blogs:', error);
      throw error;
    }
  }

  // Get all blogs for admin (including drafts)
  static async getAllBlogs(authorId = null, limit = 20, lastDoc = null) {
    try {
      let query = firestore.collection(this.COLLECTION_NAME);

      if (authorId) {
        query = query.where('authorId', '==', authorId);
      }

      query = query.orderBy('updatedAt', 'desc').limit(limit);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const querySnapshot = await query.get();
      
      const blogs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        blogs,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === limit
      };
    } catch (error) {
      console.error('Error fetching all blogs:', error);
      throw error;
    }
  }

  // Search blogs
  static async searchBlogs(searchTerm, limit = 10) {
    try {
      // Note: This is a simple search. For production, consider using Algolia or similar
      const querySnapshot = await firestore
        .collection(this.COLLECTION_NAME)
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(50) // Get more to filter
        .get();

      const blogs = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(blog => 
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, limit);

      return blogs;
    } catch (error) {
      console.error('Error searching blogs:', error);
      throw error;
    }
  }

  // Get blogs by tag
  static async getBlogsByTag(tag, limit = 10) {
    try {
      const querySnapshot = await firestore
        .collection(this.COLLECTION_NAME)
        .where('tags', 'array-contains', tag)
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(limit)
        .get();

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching blogs by tag:', error);
      throw error;
    }
  }

  // Delete a blog post
  static async deleteBlog(blogId) {
    try {
      // First, get the blog to extract image URLs
      const blog = await this.getBlogById(blogId);
      
      // Extract and delete images from content
      const imageUrls = extractImagesFromContent(blog.content);
      const deleteImagePromises = imageUrls.map(url => deleteBlogImage(url));
      
      // Delete featured image if exists
      if (blog.featuredImage?.url) {
        deleteImagePromises.push(deleteBlogImage(blog.featuredImage.url));
      }

      // Execute all image deletions
      await Promise.allSettled(deleteImagePromises);

      // Delete the blog document
      await firestore.collection(this.COLLECTION_NAME).doc(blogId).delete();
      
      return true;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw new Error(`Failed to delete blog: ${error.message}`);
    }
  }

  // Increment view count
  static async incrementViews(blogId) {
    try {
      await firestore.collection(this.COLLECTION_NAME).doc(blogId).update({
        views: firestore.FieldValue.increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Don't throw error - view counting is not critical
    }
  }

  // Like/Unlike a blog post
  static async toggleLike(blogId, userId) {
    try {
      const blogRef = firestore.collection(this.COLLECTION_NAME).doc(blogId);
      const likesRef = firestore.collection('blogLikes').doc(`${blogId}_${userId}`);
      
      return await firestore.runTransaction(async (transaction) => {
        const blogDoc = await transaction.get(blogRef);
        const likeDoc = await transaction.get(likesRef);
        
        if (!blogDoc.exists) {
          throw new Error('Blog post not found');
        }

        const currentLikes = blogDoc.data().likes || 0;
        
        if (likeDoc.exists) {
          // Unlike
          transaction.delete(likesRef);
          transaction.update(blogRef, { likes: Math.max(0, currentLikes - 1) });
          return { liked: false, likes: Math.max(0, currentLikes - 1) };
        } else {
          // Like
          transaction.set(likesRef, { userId, blogId, createdAt: new Date() });
          transaction.update(blogRef, { likes: currentLikes + 1 });
          return { liked: true, likes: currentLikes + 1 };
        }
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Check if user has liked a blog
  static async hasUserLiked(blogId, userId) {
    try {
      const likeDoc = await firestore
        .collection('blogLikes')
        .doc(`${blogId}_${userId}`)
        .get();
      
      return likeDoc.exists;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }

  // Get blog statistics for admin
  static async getBlogStats(authorId = null) {
    try {
      let query = firestore.collection(this.COLLECTION_NAME);
      
      if (authorId) {
        query = query.where('authorId', '==', authorId);
      }

      const allBlogs = await query.get();
      const publishedBlogs = await query.where('status', '==', 'published').get();
      const draftBlogs = await query.where('status', '==', 'draft').get();
      
      const totalViews = allBlogs.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0);
      const totalLikes = allBlogs.docs.reduce((sum, doc) => sum + (doc.data().likes || 0), 0);

      return {
        totalBlogs: allBlogs.size,
        publishedBlogs: publishedBlogs.size,
        draftBlogs: draftBlogs.size,
        totalViews,
        totalLikes
      };
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      throw error;
    }
  }

  // Helper methods
  static generateExcerpt(htmlContent, maxLength = 160) {
    if (!htmlContent) return '';
    
    // Strip HTML tags
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    
    if (textContent.length <= maxLength) {
      return textContent;
    }
    
    return textContent.substring(0, maxLength).trim() + '...';
  }

  static calculateReadingTime(htmlContent) {
    if (!htmlContent) return 1;
    
    // Strip HTML and count words
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    const wordCount = textContent.trim().split(/\s+/).length;
    
    // Average reading speed is 200 words per minute
    const readingTime = Math.ceil(wordCount / 200);
    
    return Math.max(1, readingTime); // Minimum 1 minute
  }

  // Validate slug uniqueness
  static async isSlugUnique(slug, excludeBlogId = null) {
    try {
      let query = firestore
        .collection(this.COLLECTION_NAME)
        .where('slug', '==', slug);

      const querySnapshot = await query.get();
      
      if (querySnapshot.empty) {
        return true;
      }

      // Check if the only match is the blog being edited
      if (excludeBlogId && querySnapshot.size === 1) {
        const doc = querySnapshot.docs[0];
        return doc.id === excludeBlogId;
      }

      return false;
    } catch (error) {
      console.error('Error checking slug uniqueness:', error);
      return false;
    }
  }

  // Generate unique slug
  static async generateUniqueSlug(title, excludeBlogId = null) {
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;

    while (!(await this.isSlugUnique(slug, excludeBlogId))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

export default BlogService;