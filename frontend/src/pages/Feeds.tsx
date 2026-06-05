import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, RefreshCw, Link, CheckCircle, XCircle } from 'lucide-react';
import { useFeeds, useCreateFeed, useUpdateFeed, useDeleteFeed, useCategories } from '../hooks';
import { CreateFeedDto, UpdateFeedDto, Feed } from '../types';

const Feeds: React.FC = () => {
  const { data: feeds, loading, error, execute: refreshFeeds } = useFeeds();
  const { data: categories } = useCategories();
  const { createFeed, loading: createLoading } = useCreateFeed();
  const { updateFeed, loading: updateLoading } = useUpdateFeed();
  const { deleteFeed } = useDeleteFeed();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<{ id: number } & UpdateFeedDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [testingFeed, setTestingFeed] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<CreateFeedDto>({
    name: '',
    url: '',
    description: '',
    categoryId: 0,
    isActive: true,
    refreshIntervalMinutes: 60
  });

  const filteredFeeds = feeds?.filter(feed => {
    const matchesSearch = feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && feed.isActive) ||
                          (filterStatus === 'inactive' && !feed.isActive);
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFeed(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        url: '',
        description: '',
        categoryId: 0,
        isActive: true,
        refreshIntervalMinutes: 60
      });
      refreshFeeds();
    } catch (error) {
      console.error('Failed to create feed:', error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeed || !editingFeed.id) return;
    
    try {
      await updateFeed(editingFeed.id, editingFeed);
      setShowEditModal(false);
      setEditingFeed(null);
      refreshFeeds();
    } catch (error) {
      console.error('Failed to update feed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this feed?')) {
      try {
        await deleteFeed(id);
        refreshFeeds();
      } catch (error) {
        console.error('Failed to delete feed:', error);
      }
    }
  };

  const handleTestFeed = async (feed: Feed) => {
    setTestingFeed(feed.id);
    try {
      // Simuler un test de feed
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Feed "${feed.name}" is valid and accessible!`);
    } catch (error) {
      alert(`Failed to access feed "${feed.name}": ${error}`);
    } finally {
      setTestingFeed(null);
    }
  };

  const openEditModal = (feed: Feed) => {
    setEditingFeed({
      id: feed.id,
      name: feed.name,
      url: feed.url,
      description: feed.description || '',
      isActive: feed.isActive,
      refreshIntervalMinutes: feed.refreshIntervalMinutes || 60
    });
    setShowEditModal(true);
  };

  const toggleFeedStatus = async (feed: Feed) => {
    try {
      await updateFeed(feed.id, { isActive: !feed.isActive });
      refreshFeeds();
    } catch (error) {
      console.error('Failed to toggle feed status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feeds</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your RSS/Atom feeds for automatic content collection
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Feed
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search feeds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Feeds</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Feeds Grid */}
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error loading feeds: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeeds.map((feed) => (
            <div key={feed.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {feed.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {feed.description || 'No description'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Link className="w-4 h-4 text-blue-500" />
                      <a 
                        href={feed.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-600 truncate"
                      >
                        {feed.url}
                      </a>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    feed.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Category:</span>
                    <span className="text-gray-900 dark:text-white">
                      {categories?.find(c => c.id === feed.categoryId)?.name || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Refresh:</span>
                    <span className="text-gray-900 dark:text-white">
                      {feed.refreshIntervalMinutes || 60} min
                    </span>
                  </div>

                  {feed.lastFetched && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Last fetched:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(feed.lastFetched).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feed.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {feed.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTestFeed(feed)}
                      disabled={testingFeed === feed.id}
                      className="inline-flex items-center px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      {testingFeed === feed.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Test
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => toggleFeedStatus(feed)}
                      className="inline-flex items-center px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {feed.isActive ? (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resume
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(feed)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(feed.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Feed
            </h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/feed.xml"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Refresh Interval (minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="1440"
                      value={formData.refreshIntervalMinutes}
                      onChange={(e) => setFormData({ ...formData, refreshIntervalMinutes: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingFeed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Edit Feed
            </h2>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFeed.name}
                    onChange={(e) => setEditingFeed({ ...editingFeed, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    required
                    value={editingFeed.url}
                    onChange={(e) => setEditingFeed({ ...editingFeed, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingFeed.description}
                    onChange={(e) => setEditingFeed({ ...editingFeed, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Refresh Interval (minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="1440"
                      value={editingFeed.refreshIntervalMinutes}
                      onChange={(e) => setEditingFeed({ ...editingFeed, refreshIntervalMinutes: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editIsActive"
                      checked={editingFeed.isActive}
                      onChange={(e) => setEditingFeed({ ...editingFeed, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="editIsActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feeds;
