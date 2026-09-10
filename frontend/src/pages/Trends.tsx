import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, BarChart3, Download, Calendar, RefreshCw, Eye, Activity, Trash2, Bot, Zap } from 'lucide-react';
import { useTrends, useGenerateTrend, useCategories, useExportData } from '../hooks';
import { useAutoSummary } from '../hooks/useAutoSummary';
import { Trend } from '../services/trendService';

const Trends: React.FC = () => {
  const { data: trends, loading, error, execute: refreshTrends } = useTrends();
  const { data: categories } = useCategories();
  const { generateTrend, loading: generateLoading } = useGenerateTrend();
  const { exportToCSV, exportToJSON } = useExportData();
  const { 
    autoGenerateSummaries, 
    generating: autoGenerating, 
    lastAutoGeneration, 
    autoGenerateEnabled, 
    setAutoGenerateEnabled,
    pendingTrendsCount,
    trendsWithSummaries
  } = useAutoSummary();
  
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [trendType, setTrendType] = useState<'volume' | 'growth' | 'sentiment'>('volume');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingCategory, setGeneratingCategory] = useState<number>(0);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTrend, setViewingTrend] = useState<Trend | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTrends = trends?.filter(trend => 
    selectedCategory === 0 || trend.categoryId === selectedCategory
  ) || [];

  const getTrendScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Weak';
    return 'Very Weak';
  };

  const handleGenerateTrend = async () => {
    if (!generatingCategory) return;
    
    try {
      await generateTrend(generatingCategory);
      setShowGenerateModal(false);
      setGeneratingCategory(0);
      refreshTrends();
    } catch (error) {
      console.error('Failed to generate trend:', error);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = filteredTrends.map(trend => ({
      id: trend.id,
      categoryId: trend.categoryId,
      categoryName: categories?.find(c => c.id === trend.categoryId)?.name,
      score: trend.score,
      generatedAt: trend.generatedAt,
      data: trend.data
    }));

    if (format === 'csv') {
      exportToCSV(dataToExport, 'trends');
    } else {
      exportToJSON(dataToExport, 'trends');
    }
  };

  const openViewModal = (trend: Trend) => {
    setViewingTrend(trend);
    setShowViewModal(true);
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

  interface TrendKeywords {
    keywords: string[];
    keywordScores: Record<string, number>;
    analysisDate: string;
  }

  // `data` est la carte mot-clé -> score normalisé produite par TrendService.
  // Rien d'autre n'est persisté : ni volume, ni croissance, ni sentiment. Une valeur
  // affichée ici sans venir de la base serait une invention indiscernable d'une mesure.
  const getTrendData = (trend: Trend): TrendKeywords => {
    const empty: TrendKeywords = {
      keywords: [],
      keywordScores: {},
      analysisDate: trend.generatedAt,
    };

    try {
      const raw = typeof trend.data === 'string' ? JSON.parse(trend.data) : trend.data;
      if (!raw || typeof raw !== 'object') return empty;

      const keywordScores = Object.fromEntries(
        Object.entries(raw as Record<string, unknown>)
          .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
      );

      return {
        keywords: Object.keys(keywordScores).sort(
          (a, b) => keywordScores[b] - keywordScores[a]
        ),
        keywordScores,
        analysisDate: trend.generatedAt,
      };
    } catch {
      return empty;
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
      {/* Auto-Summary Status Card */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Auto-Summary Generation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically generate summaries from new trends
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {pendingTrendsCount}
              </p>
            </div>
            <button
              onClick={() => setAutoGenerateEnabled(!autoGenerateEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoGenerateEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoGenerateEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {autoGenerating && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>Generating summaries automatically...</span>
          </div>
        )}
        
        {lastAutoGeneration && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Last auto-generation: {new Date(lastAutoGeneration).toLocaleString()}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trends</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyze trends and patterns in your data
          </p>
        </div>
        {/* flex-wrap : a 375px, « Generate Summaries » et « Export » cote a cote
            poussaient la page a 404px de large et provoquaient un defilement
            horizontal. */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Trend
          </button>
          <button
            onClick={autoGenerateSummaries}
            disabled={autoGenerating || pendingTrendsCount === 0}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {autoGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Summaries ({pendingTrendsCount})
              </>
            )}
          </button>
          <div className="relative" ref={exportMenuRef}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    handleExport('csv');
                    setShowExportMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => {
                    handleExport('json');
                    setShowExportMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Export as JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={0}>All Categories</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
        <select
          value={trendType}
          onChange={(e) => setTrendType(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="volume">Volume</option>
          <option value="growth">Growth</option>
          <option value="sentiment">Sentiment</option>
        </select>
        <button
          onClick={refreshTrends}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trends</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredTrends.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredTrends.length > 0 
                  ? (filteredTrends.reduce((sum, trend) => sum + trend.score, 0) / filteredTrends.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trends</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredTrends.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Trends Grid */}
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error loading trends: {error}</p>
        </div>
      ) : filteredTrends.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No trends found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Generate your first trend to start analyzing patterns
          </p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Trend
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrends.map((trend) => {
            const data = getTrendData(trend);
            const scoreColor = getTrendScoreColor(trend.score);
            const scoreLabel = getTrendScoreLabel(trend.score);
            const hasSummary = trendsWithSummaries.has(trend.id);
            
            return (
              <div
                key={trend.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border ${
                  'border-gray-200 dark:border-gray-700'
                } shadow-sm hover:shadow-md transition-shadow p-6 relative`}
              >
                {/* Summary Status Indicator */}
                {hasSummary && (
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center border-2 border-green-300 dark:border-green-700">
                      <Bot className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Trend #{trend.id}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {categories?.find(c => c.id === trend.categoryId)?.name || 'Unknown Category'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${scoreColor}`}>
                      {scoreLabel}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Score</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {trend.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trend.score}%` }}
                    />
                  </div>
                </div>

                {data.keywords && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Top Keywords</p>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {data.keywords.length} total
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.keywords.slice(0, 8).map((keyword: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-700"
                        >
                          {keyword}
                        </span>
                      ))}
                      {data.keywords.length > 8 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm border border-gray-300 dark:border-gray-600">
                          +{data.keywords.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Analysis Info */}
                {data.analysisDate && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-800 dark:text-blue-200">
                          Analyzed: {new Date(data.analysisDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                        {categories?.find(c => c.id === trend.categoryId)?.name || 'Unknown Category'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Generated: {formatDate(trend.generatedAt)}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => openViewModal(trend)}
                    className="flex-1 items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Generate New Trend
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Category
                </label>
                <select
                  value={generatingCategory}
                  onChange={(e) => setGeneratingCategory(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Select a category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Analysis Period
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                This will analyze the data from the selected category over the specified period and generate trend insights.
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGeneratingCategory(0);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateTrend}
                disabled={!generatingCategory || generateLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {generateLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingTrend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Trend #{viewingTrend.id} Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Score</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {viewingTrend.score}/100
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {categories?.find(c => c.id === viewingTrend.categoryId)?.name || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Generated</span>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(viewingTrend.generatedAt)}
                  </p>
                </div>
              </div>

              {getTrendData(viewingTrend) && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trend Data</h3>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(getTrendData(viewingTrend), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trends;
