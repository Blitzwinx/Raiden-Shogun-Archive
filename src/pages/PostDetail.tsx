import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { postService } from '../services/postService';
import type { Post } from '../lib/supabase';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      if (!id) return;
      const data = await postService.getPost(parseInt(id));
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('Failed to fetch post. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lore': return 'bg-purple-600/20 text-purple-300';
      case 'ingame': return 'bg-blue-600/20 text-blue-300';
      case 'powerscaling': return 'bg-red-600/20 text-red-300';
      case 'blog': return 'bg-green-600/20 text-green-300';
      default: return 'bg-gray-600/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading post from cloud...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-400 mb-4">Post Not Found</h1>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          to={`/${post.category}`}
          className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-6 sm:mb-8 transition-colors text-sm sm:text-base text-container"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to {post.category}</span>
        </Link>

        {/* Article */}
        <article className="glass-morphism border-2 border-purple-500/30 rounded-2xl p-4 sm:p-6 lg:p-8 fade-in">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                {post.category}
              </span>
              <div className="flex items-center space-x-2 text-purple-400 text-xs sm:text-sm text-container">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-400 text-xs sm:text-sm text-container">
                <Clock className="h-4 w-4" />
                <span>5 min read</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white heading-font mb-4 text-container">
              {post.title}
            </h1>
          </div>

          {/* Section Divider */}
          <div className="section-divider-simple"></div>

          {/* Content */}
          <MarkdownRenderer 
            content={post.content} 
            className="prose-sm sm:prose-base lg:prose-lg"
          />

          {/* Footer */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-purple-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-400 text-container">
                {post.updated_at !== post.created_at && (
                  <span>Last updated: {formatDate(post.updated_at)}</span>
                )}
              </div>
              <Link
                to={`/${post.category}`}
                className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors text-sm sm:text-base text-container"
              >
                <span>More {post.category} posts</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default PostDetail;