import React from 'react';
import { TrendingUp, FileText, Bookmark, Activity, Clock, Trash2, Edit } from 'lucide-react';
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
import { Card, Button, Badge, ResponsiveGrid } from '../components';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl">
            Welcome back! Here's an overview of your tech intelligence dashboard.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <ResponsiveGrid cols={{ sm: 2, lg: 4 }} gap={{ sm: 4, lg: 6 }}>
            {[...Array(4)].map((_, i) => (
              <Card key={i} padding="lg" className="animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card padding="lg" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="text-center">
            <p className="text-red-800 dark:text-red-200 mb-4">Error: {error}</p>
            <Button onClick={refreshAll} variant="primary">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      {!loading && !error && (
        <ResponsiveGrid cols={{ sm: 2, lg: 4 }} gap={{ sm: 4, lg: 6 }} className="mb-8">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} padding="lg" hover border>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'success' : 'error'}
                      size="sm"
                      className="mt-2"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </ResponsiveGrid>
      )}

      {/* Main Content Grid */}
      <ResponsiveGrid cols={{ lg: 3 }} gap={{ sm: 6 }} className="mb-8">
        {/* Recent Activity */}
        <Card padding="lg" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={`${activity.type}-${index}`} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent activity
              </div>
            )}
          </div>
        </Card>

        {/* Top Categories */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Categories <Badge variant="secondary" size="sm">{categories?.length || 0}</Badge>
          </h2>
          
          <div className="space-y-4">
            {categories && categories.length > 0 ? (
              categories.slice(0, 5).map((category, index) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {index + 1}
                      </span>
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
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="xs">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="xs">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No categories available
              </div>
            )}
          </div>
        </Card>
      </ResponsiveGrid>

      {/* Quick Actions */}
      <Card padding="lg" className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        
        <ResponsiveGrid cols={{ sm: 2, lg: 4 }} gap={{ sm: 3, lg: 4 }}>
          <Button 
            onClick={() => {
              const name = prompt('Category name:');
              if (name) createCategory({ name });
            }}
            loading={createCategoryLoading}
            variant="outline"
            className="text-left justify-start"
            icon={<Bookmark className="w-5 h-5" />}
          >
            <div>
              <p className="font-medium">Add Category</p>
              <p className="text-xs text-gray-500">Create a new category</p>
            </div>
          </Button>
          
          <Button 
            onClick={() => {
              const name = prompt('Feed name:');
              const url = prompt('Feed URL:');
              const categoryId = prompt('Category ID:');
              if (name && url && categoryId) createFeed({ name, url, categoryId: parseInt(categoryId) });
            }}
            loading={createFeedLoading}
            variant="outline"
            className="text-left justify-start"
            icon={<TrendingUp className="w-5 h-5" />}
          >
            <div>
              <p className="font-medium">Add Feed</p>
              <p className="text-xs text-gray-500">Add RSS feed URL</p>
            </div>
          </Button>
          
          <Button 
            onClick={() => {
              const title = prompt('Note title:');
              const content = prompt('Note content:');
              const categoryId = prompt('Category ID:');
              if (title && content && categoryId) createNote({ title, content, categoryId: parseInt(categoryId) });
            }}
            loading={createNoteLoading}
            variant="outline"
            className="text-left justify-start"
            icon={<FileText className="w-5 h-5" />}
          >
            <div>
              <p className="font-medium">Create Note</p>
              <p className="text-xs text-gray-500">Write a new note</p>
            </div>
          </Button>
          
          <Button 
            onClick={() => {
              const categoryId = prompt('Category ID for trend:');
              if (categoryId) generateTrend(parseInt(categoryId));
            }}
            loading={generateTrendLoading}
            variant="outline"
            className="text-left justify-start"
            icon={<Activity className="w-5 h-5" />}
          >
            <div>
              <p className="font-medium">Generate Trend</p>
              <p className="text-xs text-gray-500">Analyze trends</p>
            </div>
          </Button>
        </ResponsiveGrid>
      </Card>

      {/* Data Summary */}
      <ResponsiveGrid cols={{ lg: 2 }} gap={{ sm: 6 }}>
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Data Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Categories:</span>
              <Badge variant="secondary">{categories?.length || 0}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Feeds:</span>
              <Badge variant="secondary">{feeds?.length || 0}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Notes:</span>
              <Badge variant="secondary">{notes?.length || 0}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Trends:</span>
              <Badge variant="secondary">{trends?.length || 0}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Summaries:</span>
              <Badge variant="secondary">{summaries?.length || 0}</Badge>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            API Status
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Backend:</span>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Authentication:</span>
              <Badge variant="warning">Disabled (Dev)</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Refresh:</span>
              <span className="font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </Card>
      </ResponsiveGrid>
      </div>
    </div>
  );
};

export default Dashboard;
