import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Clock } from 'lucide-react';
import { postService } from '../services/postService';
import type { Post } from '../lib/supabase';

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await postService.getPosts('blog');
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert('Failed to load blog posts. Please check your internet connection.');
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

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-16 w-16 text-purple-400 pulse-glow" />
          </div>
          <h1 className="text-5xl font-bold gradient-text heading-font mb-4 pb-2">
            Blog
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Thoughts and discussions about the Raiden Shogun
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className={`glass-morphism border-2 border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 hover-lift slide-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-purple-400 text-sm mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white heading-font mb-3">
                    {post.title}
                  </h2>
                  <p className="text-gray-300 leading-relaxed line-clamp-3 text-container">
                    {truncateContent(post.content, 150)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1 text-purple-400 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>5 min read</span>
                  </span>
                  <Link 
                    to={`/post/${post.id}`}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No blog posts yet</h3>
            <p className="text-gray-500 mb-8">
              The blog is empty. Visit the dashboard to write your first post.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover-lift"
            >
              <span>Go to Dashboard</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;