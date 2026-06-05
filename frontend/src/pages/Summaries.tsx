import React, { useState, useEffect, useRef } from 'react';
import { FileText, Search, Filter, Download, Eye, Calendar, Brain, Share2, Trash2, Clock, User, X, Bookmark, Settings, TrendingUp } from 'lucide-react';
import { useSummaries, useGenerateSummary, useTrends, useCategories } from '../hooks';
import { useExportData } from '../hooks/useExportData';
import { Summary } from '../types';

const Summaries: React.FC = () => {
  const { data: summaries, loading, error, execute: refreshSummaries } = useSummaries();
  const { data: trends } = useTrends();
  const { data: categories } = useCategories();
  const { generateSummary, loading: generateLoading } = useGenerateSummary();
  const { exportToPDF, exportToMarkdown, exportToJSON } = useExportData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrend, setSelectedTrend] = useState<number>(0);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingTrend, setGeneratingTrend] = useState<number>(0);
  const [generatingCategory, setGeneratingCategory] = useState<number>(0);
  const [generateMode, setGenerateMode] = useState<'trend' | 'category'>('trend');
  const [viewingSummary, setViewingSummary] = useState<Summary | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [summaryStyle, setSummaryStyle] = useState<'technical' | 'business' | 'casual'>('technical');
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

  // Auto-refresh summaries when component mounts or when dependencies change
  useEffect(() => {
    refreshSummaries();
  }, [refreshSummaries]);

  const filteredSummaries = summaries?.filter(summary => 
    summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (selectedTrend === 0 || (summary as any).trendId === selectedTrend)
  ) || [];

  const handleGenerateSummary = async () => {
    if (generateMode === 'trend' && !generatingTrend) return;
    if (generateMode === 'category' && !generatingCategory) return;
    
    try {
      if (generateMode === 'trend') {
        await generateSummary(generatingTrend);
      } else {
        // Generate from category (will use latest trend)
        await generateSummary(generatingCategory);
      }
      
      setShowGenerateModal(false);
      setGeneratingTrend(0);
      setGeneratingCategory(0);
      refreshSummaries();
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
  };

  const handleExport = (format: 'pdf' | 'markdown' | 'json') => {
    const dataToExport = filteredSummaries.map(summary => ({
      id: summary.id,
      title: summary.title,
      content: summary.content,
      userId: summary.userId,
      trendId: (summary as any).trendId,
      createdAt: summary.createdAt
    }));

    if (format === 'pdf') {
      exportToPDF(dataToExport, 'summaries');
    } else if (format === 'markdown') {
      exportToMarkdown(dataToExport, 'summaries');
    } else {
      exportToJSON(dataToExport, 'summaries');
    }
  };

  const openViewModal = (summary: Summary) => {
    setViewingSummary(summary);
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

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const getReadTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = getWordCount(text);
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Summaries</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered summaries of your trends and analysis
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-medium"
          >
            <Brain className="w-5 h-5 mr-2" />
            Generate AI Summary
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
                    handleExport('pdf');
                    setShowExportMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => {
                    handleExport('markdown');
                    setShowExportMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Export as Markdown
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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search summaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedTrend}
          onChange={(e) => setSelectedTrend(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={0}>All Trends</option>
          {trends?.map((trend) => (
            <option key={trend.id} value={trend.id}>
              Trend #{trend.id}
            </option>
          ))}
        </select>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Summaries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredSummaries.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Words</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredSummaries.reduce((sum, summary) => sum + getWordCount(summary.content), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Read Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredSummaries.length > 0 
                  ? getReadTime(
                      filteredSummaries.reduce((total, summary) => total + summary.content, '')
                    )
                  : '0 min'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Summaries Grid */}
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error loading summaries: {error}</p>
        </div>
      ) : filteredSummaries.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No summaries found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Generate your first summary to get AI-powered insights
          </p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-medium"
          >
            <Brain className="w-5 h-5 mr-2" />
            Generate Your First Summary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSummaries.map((summary) => (
            <div
              key={summary.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {summary.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {summary.content}
                  </p>
                </div>
                <div className="flex space-x-1 ml-4">
                  <button
                    onClick={() => openViewModal(summary)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {getWordCount(summary.content)} words
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {getReadTime(summary.content)}
                  </div>
                </div>
                {(summary as any).trendId && (
                  <div className="flex items-center">
                    <Brain className="w-4 h-4 mr-1" />
                    Trend #{(summary as any).trendId}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(summary.createdAt)}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  User #{summary.userId}
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => openViewModal(summary)}
                  className="flex-1 items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Read Summary
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Generate AI Summary</h2>
                    <p className="text-blue-100 text-sm">Create intelligent summaries from your feeds</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowGenerateModal(false);
                    setGeneratingCategory(0);
                  }}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Generation Mode Selection */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <label className="text-lg font-semibold text-gray-900 dark:text-white">
                    Generation Mode
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGenerateMode('trend')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      generateMode === 'trend'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        From Trend
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Select specific trend
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => setGenerateMode('category')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      generateMode === 'category'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📁</div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        From Category
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Use latest trend
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Trend Selection (only visible in trend mode) */}
              {generateMode === 'trend' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <label className="text-lg font-semibold text-gray-900 dark:text-white">
                      Select Trend
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {trends?.map((trend) => (
                      <button
                        key={trend.id}
                        onClick={() => setGeneratingTrend(trend.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          generatingTrend === trend.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Trend #{trend.id}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Score: {trend.score}/100
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(trend.generatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`w-3 h-3 rounded-full ${
                              trend.score >= 80 ? 'bg-green-500' :
                              trend.score >= 60 ? 'bg-yellow-500' :
                              trend.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Selection (only visible in category mode) */}
              {generateMode === 'category' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Bookmark className="w-5 h-5 text-blue-600" />
                    <label className="text-lg font-semibold text-gray-900 dark:text-white">
                      Select Category
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setGeneratingCategory(category.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          generatingCategory === category.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color || '#3B82F6' }}
                          />
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {category.description || 'AI-powered analysis'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Length Selection */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <label className="text-lg font-semibold text-gray-900 dark:text-white">
                    Summary Length
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'short', label: 'Short', desc: '100-200 words', icon: '⚡' },
                    { value: 'medium', label: 'Medium', desc: '300-500 words', icon: '📝' },
                    { value: 'long', label: 'Long', desc: '600-1000 words', icon: '📚' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSummaryLength(option.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        summaryLength === option.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {option.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <label className="text-lg font-semibold text-gray-900 dark:text-white">
                    Writing Style
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'technical', label: 'Technical', desc: 'Detailed analysis', icon: '🔬' },
                    { value: 'business', label: 'Business', desc: 'Executive summary', icon: '💼' },
                    { value: 'casual', label: 'Casual', desc: 'Easy to read', icon: '☕' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSummaryStyle(option.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        summaryStyle === option.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {option.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Preview
                  </p>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  🤖 AI will analyze all feeds in the selected category and generate a 
                  <span className="font-semibold"> {summaryLength}</span> summary in 
                  <span className="font-semibold"> {summaryStyle}</span> style with key insights and actionable recommendations.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ⏱️ Estimated time: 30-60 seconds
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGeneratingTrend(0);
                      setGeneratingCategory(0);
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={(generateMode === 'trend' && !generatingTrend) || (generateMode === 'category' && !generatingCategory) || generateLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all transform hover:scale-105 disabled:transform-none flex items-center space-x-2"
                  >
                    {generateLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        <span>Generate Summary</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {viewingSummary.title}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created: {formatDate(viewingSummary.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {getWordCount(viewingSummary.content)} words
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {getReadTime(viewingSummary.content)}
                  </div>
                </div>
                {(viewingSummary as any).trendId && (
                  <div className="flex items-center">
                    <Brain className="w-4 h-4 mr-1" />
                    Based on Trend #{(viewingSummary as any).trendId}
                  </div>
                )}
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <div className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                  {viewingSummary.content}
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                <button className="flex-1 items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summaries;
