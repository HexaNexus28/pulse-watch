import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, FileText, Bookmark, Activity, Clock, RefreshCw, Plus } from 'lucide-react';
import { 
  useDashboardStats, 
  useCategories, 
  useFeeds, 
  useNotes, 
  useTrends, 
  useSummaries,
  useCreateCategory,
  useCreateFeed,
  useCreateNote,
  useGenerateTrend
} from '../hooks';

const Dashboard: React.FC = () => {
  const { data: stats, loading: statsLoading, error: statsError, execute: refreshStats } = useDashboardStats();
  const { data: categories, loading: categoriesLoading, execute: refreshCategories } = useCategories();
  const { data: feeds, loading: feedsLoading, execute: refreshFeeds } = useFeeds();
  const { data: notes, loading: notesLoading, execute: refreshNotes } = useNotes();
  const { data: trends, loading: trendsLoading, execute: refreshTrends } = useTrends();
  const { data: summaries, loading: summariesLoading, execute: refreshSummaries } = useSummaries();

  const { createCategory, loading: createCategoryLoading } = useCreateCategory();
  const { createFeed, loading: createFeedLoading } = useCreateFeed();
  const { createNote, loading: createNoteLoading } = useCreateNote();
  const { generateTrend, loading: generateTrendLoading } = useGenerateTrend();

  const loading = statsLoading || categoriesLoading || feedsLoading || notesLoading || trendsLoading || summariesLoading;
  const error = statsError;

  const refreshAll = () => {
    refreshStats();
    refreshCategories();
    refreshFeeds();
    refreshNotes();
    refreshTrends();
    refreshSummaries();
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Loading your tech intelligence dashboard...
          </p>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's an overview of your tech intelligence dashboard.
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          <button 
            onClick={refreshAll}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Transform stats data for display
  const statsData = [
    {
      title: 'Total Categories',
      value: (stats as any)?.totalCategories?.toString() || '0',
      change: (stats as any)?.categoriesChange?.toString() || '0%',
      changeType: ((stats as any)?.categoriesChange || 0) > 0 ? 'positive' as const : 'negative' as const,
      icon: Bookmark,
      color: 'blue',
    },
    {
      title: 'Active Feeds',
      value: (stats as any)?.activeFeeds?.toString() || '0',
      change: (stats as any)?.feedsChange?.toString() || '0%',
      changeType: ((stats as any)?.feedsChange || 0) > 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Total Notes',
      value: (stats as any)?.totalNotes?.toString() || '0',
      change: (stats as any)?.notesChange?.toString() || '0%',
      changeType: ((stats as any)?.notesChange || 0) > 0 ? 'positive' as const : 'negative' as const,
      icon: FileText,
      color: 'purple',
    },
    {
      title: 'Trend Score',
      value: (stats as any)?.trendScore?.toFixed(1) || '0',
      change: (stats as any)?.trendScoreChange?.toString() || '0%',
      changeType: ((stats as any)?.trendScoreChange || 0) > 0 ? 'positive' as const : 'negative' as const,
      icon: Activity,
      color: 'orange',
    },
  ];

  // Recent activity simulation
  const recentActivity = [
    ...(notes?.slice(0, 3).map(note => ({ ...note, type: 'note', title: note.title, category: 'General', timestamp: new Date(note.createdAt).toLocaleDateString() })) || []),
    ...(feeds?.slice(0, 2).map(feed => ({ ...feed, type: 'feed', title: feed.name, category: 'RSS', timestamp: new Date(feed.createdAt).toLocaleDateString() })) || []),
    ...(trends?.slice(0, 2).map(trend => ({ ...trend, type: 'trend', title: `Trend Score: ${trend.score}`, category: 'Analysis', timestamp: new Date(trend.generatedAt).toLocaleDateString() })) || []),
    ...(summaries?.slice(0, 1).map(summary => ({ ...summary, type: 'summary', title: summary.title, category: 'Summary', timestamp: new Date(summary.createdAt).toLocaleDateString() })) || []),
  ].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's an overview of your tech intelligence dashboard.
          </p>
        </div>
        <button
          onClick={refreshAll}
          className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          title="Refresh dashboard"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-2 ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <Link 
              to="/notes" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <Link
                  key={`${activity.type}-${index}`}
                  to={`/${activity.type}s`}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    {activity.type === 'note' && <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    {activity.type === 'feed' && <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    {activity.type === 'trend' && <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    {activity.type === 'summary' && <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.category} • {activity.timestamp}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="mb-2">No recent activity</p>
                <Link 
                  to="/notes" 
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create your first note
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Categories ({categories?.length || 0})
            </h2>
            <Link 
              to="/categories" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Manage
            </Link>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {categories && categories.length > 0 ? (
              categories.slice(0, 5).map((category, _index) => (
                <Link
                  key={category.id}
                  to="/categories"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    →
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="mb-2">No categories yet</p>
                <Link 
                  to="/categories" 
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create category
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trends Section */}
      {trends && trends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Latest Trends
            </h2>
            <Link 
              to="/trends" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.slice(0, 6).map((trend, _index) => (
              <Link
                key={trend.id}
                to="/trends"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Score: {trend.score || 'N/A'}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Trend #{trend.id}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(trend.generatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button 
            onClick={() => {
              const name = prompt('Category name:');
              if (name) createCategory({ name });
            }}
            disabled={createCategoryLoading}
            className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50"
          >
            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Add Category</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Create a new category</p>
          </button>
          
          <button 
            onClick={() => {
              const name = prompt('Feed name:');
              const url = prompt('Feed URL:');
              const categoryId = prompt('Category ID:');
              if (name && url && categoryId) createFeed({ name, url, categoryId: parseInt(categoryId) });
            }}
            disabled={createFeedLoading}
            className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50"
          >
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Add Feed</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Add RSS feed URL</p>
          </button>
          
          <button 
            onClick={() => {
              const title = prompt('Note title:');
              const content = prompt('Note content:');
              const categoryId = prompt('Category ID:');
              if (title && content && categoryId) createNote({ title, content, categoryId: parseInt(categoryId) });
            }}
            disabled={createNoteLoading}
            className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50"
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Create Note</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Write a new note</p>
          </button>
          
          <button 
            onClick={() => {
              const categoryId = prompt('Category ID for trend:');
              if (categoryId) generateTrend(parseInt(categoryId));
            }}
            disabled={generateTrendLoading}
            className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50"
          >
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Generate Trend</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Analyze trends</p>
          </button>
        </div>
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Data Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Categories:</span>
              <span className="font-medium">{categories?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Feeds:</span>
              <span className="font-medium">{feeds?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Notes:</span>
              <span className="font-medium">{notes?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Trends:</span>
              <span className="font-medium">{trends?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Summaries:</span>
              <span className="font-medium">{summaries?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            API Status
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Backend:</span>
              <span className="font-medium text-green-600">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Authentication:</span>
              <span className="font-medium text-yellow-600">Disabled (Dev)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Refresh:</span>
              <span className="font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
