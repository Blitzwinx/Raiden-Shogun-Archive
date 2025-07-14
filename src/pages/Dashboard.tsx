import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, Search, Eye, BarChart3, Bookmark} from 'lucide-react';
import { X, Shield, Sword, BookOpen, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import PasswordModal from '../components/PasswordModal';
import { postService } from '../services/postService';
import type { Post } from '../lib/supabase';

interface DashboardStats {
  total: number;
  lore: number;
  ingame: number;
  powerscaling: number;
  blog: number;
}

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    lore: 0,
    ingame: 0,
    powerscaling: 0,
    blog: 0
  });
  type CategoryType = 'lore' | 'ingame' | 'powerscaling' | 'blog';

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: CategoryType;
  }>({
    title: '',
    content: '',
    category: 'lore'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, searchTerm, selectedCategory, sortOrder]);

  const checkAuthentication = () => {
    const authStatus = sessionStorage.getItem('dashboard_auth');
    const authTime = sessionStorage.getItem('dashboard_auth_time');
    
    if (authStatus === 'true' && authTime) {
      // Check if authentication is still valid (24 hours)
      const authTimestamp = parseInt(authTime);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - authTimestamp < twentyFourHours) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      } else {
        // Authentication expired
        sessionStorage.removeItem('dashboard_auth');
        sessionStorage.removeItem('dashboard_auth_time');
      }
    }
    
    // Not authenticated or expired
    setIsAuthenticated(false);
    setShowPasswordModal(true);
    setLoading(false);
  };

  const handleAuthSuccess = () => {
    setShowPasswordModal(false);
    setIsAuthenticated(true);
  };

  const handleAuthCancel = () => {
    setShowPasswordModal(false);
    // Redirect to home page
    window.location.href = '/';
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getPosts();
      setPosts(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.warn('Could not fetch posts - working offline');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (postsData: Post[]) => {
    const newStats = {
      total: postsData.length,
      lore: postsData.filter(p => p.category === 'lore').length,
      ingame: postsData.filter(p => p.category === 'ingame').length,
      powerscaling: postsData.filter(p => p.category === 'powerscaling').length,
      blog: postsData.filter(p => p.category === 'blog').length
    };
    setStats(newStats);
  };

  const filterAndSortPosts = () => {
    let filtered = [...posts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredPosts(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (editingPost) {
        await postService.updatePost(editingPost.id, formData);
      } else {
        await postService.createPost(formData);
      }
      
      await fetchPosts();
      setShowForm(false);
      setEditingPost(null);
      setFormData({ title: '', content: '', category: 'lore' });
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Could not save post - check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post? This will also delete all associated images.')) {
      try {
        await postService.deletePost(id);
        await fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Could not delete post - check connection.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lore': return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      case 'ingame': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'powerscaling': return 'bg-red-600/20 text-red-300 border-red-500/30';
      case 'blog': return 'bg-green-600/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lore': return <Bookmark className="h-6 w-6 text-purple-400 mx-auto mb-2" />;
      case 'ingame': return <Sword className="h-6 w-6 text-blue-400 mx-auto mb-2" />;
      case 'powerscaling': return <Shield className="h-6 w-6 text-red-400 mx-auto mb-2" />;
      case 'blog': return <BookOpen className="h-6 w-6 text-green-400 mx-auto mb-2" />;
      default: return '📄';
    }
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Show password modal if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Checking authentication...</p>
          </div>
        </div>
        <PasswordModal
          isOpen={showPasswordModal}
          onSuccess={handleAuthSuccess}
          onCancel={handleAuthCancel}
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="flex items-center space-x-2">
              <Settings className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text heading-font">
                Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Manage your Raiden Shogun content</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover-lift"
          >
            <Plus className="h-5 w-5" />
            <span>New Post</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-morphism border-2 border-white-500/30 rounded-xl p-4 text-center">
            <BarChart3 className="h-6 w-6 text-white-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Posts</div>
          </div>
          <div className="glass-morphism border-2 border-purple-500/30 rounded-xl p-4 text-center">
            <Bookmark className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-300">{stats.lore}</div>
            <div className="text-sm text-gray-400">Lore</div>
          </div>
          <div className="glass-morphism border-2 border-blue-500/30 rounded-xl p-4 text-center">
            <Sword className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-300">{stats.ingame}</div>
            <div className="text-sm text-gray-400">In-Game</div>
          </div>
          <div className="glass-morphism border-2 border-red-500/30 rounded-xl p-4 text-center">
            <Shield className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-300">{stats.powerscaling}</div>
            <div className="text-sm text-gray-400">Power</div>
          </div>
          <div className="glass-morphism border-2 border-green-500/30 rounded-xl p-4 text-center">
            <BookOpen className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-300">{stats.blog}</div>
            <div className="text-sm text-gray-400">Blog</div>
          </div>
        </div>

        {/* Controls */}
        <div className="glass-morphism border-2 border-purple-500/30 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="lore">Lore</option>
                <option value="ingame">In-Game</option>
                <option value="powerscaling">Power Scaling</option>
                <option value="blog">Blog</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="lg:w-48">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-purple-500/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Grid
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <span>
              Showing {filteredPosts.length} of {posts.length} posts
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border-2 border-purple-500/30 rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white heading-font">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPost(null);
                    setFormData({ title: '', content: '', category: 'lore' });
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="Enter post title..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      disabled={isSubmitting}
                    >
                      <option value="lore">Lore</option>
                      <option value="ingame">In-Game</option>
                      <option value="powerscaling">Power Scaling</option>
                      <option value="blog">Blog</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    postId={editingPost?.id}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPost(null);
                      setFormData({ title: '', content: '', category: 'lore' });
                    }}
                    className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-5 w-5" />
                    <span>{isSubmitting ? 'Saving...' : (editingPost ? 'Update' : 'Create')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts List/Grid */}
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`glass-morphism border-2 border-purple-500/30 rounded-xl hover:border-purple-400/50 transition-all duration-300 hover-lift ${
                  viewMode === 'grid' ? 'p-6' : 'p-6'
                }`}
              >
                <div className={viewMode === 'grid' ? 'space-y-4' : 'flex items-start justify-between'}>
                  <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-xl">{getCategoryIcon(post.category)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      <div className="text-sm text-gray-400">
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white heading-font mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4 line-clamp-3 text-container leading-relaxed">
                      {truncateContent(post.content, viewMode === 'grid' ? 100 : 150)}
                    </p>

                    {post.updated_at !== post.created_at && (
                      <div className="text-xs text-purple-400 mb-3">
                        Updated: {formatDate(post.updated_at)}
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <Link
                        to={`/post/${post.id}`}
                        className="inline-flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                      <span className="text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {Math.ceil(post.content.length / 200)} min read
                      </span>
                    </div>
                  </div>
                  
                  <div className={`flex space-x-2 ${viewMode === 'grid' ? 'justify-end' : 'ml-4'}`}>
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors"
                      title="Edit post"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 col-span-full">
              <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'No posts found' : 'No posts yet'}
              </h3>
              <p className="text-gray-500 mb-8">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first post to get started.'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover-lift"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create First Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;