// Export hooks
export { useExportData } from './useExportData';

// Dashboard hooks
export { useDashboard, useDashboardStats } from './useDashboard';

// Category hooks
export {
    useCategories,
    useCategory,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory
} from './useCategories';

// Feed hooks
export {
    useFeeds,
    useFeed,
    useFeedsByCategory,
    useCreateFeed,
    useUpdateFeed,
    useDeleteFeed
} from './useFeeds';

// Note hooks
export {
    useNotes,
    useNote,
    useNotesByCategory,
    useCreateNote,
    useUpdateNote,
    useDeleteNote
} from './useNotes';

// Trend hooks
export {
    useTrends,
    useTrend,
    useTrendsByCategory,
    useLatestTrend,
    useGenerateTrend,
    useDetectTrends
} from './useTrends';

// Summary hooks
export {
    useSummaries,
    useSummary,
    useSummariesByUser,
    useDailySummaries,
    useSummariesByCategory,
    useGenerateSummary,
    useDeleteSummary
} from './useSummaries';

// User hooks
export {
    useUsers,
    useUser,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useAuth,
    useAuthCheck
} from './useUsers';

// Legacy hooks (pour compatibilité)
export { useApi, useGet, usePost, usePut, useDelete, usePagination, useSearch, useLocalStorage, useDebounce } from './useApi';
