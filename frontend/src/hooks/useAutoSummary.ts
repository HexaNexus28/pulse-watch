import { useState, useEffect, useCallback } from 'react';
import { useTrends } from './useTrends';
import { useSummaries } from './useSummaries';
import { useGenerateSummary } from './useSummaries';

interface UseAutoSummaryReturn {
    autoGenerateSummaries: () => Promise<void>;
    generating: boolean;
    lastAutoGeneration: string | null;
    autoGenerateEnabled: boolean;
    setAutoGenerateEnabled: (enabled: boolean) => void;
    pendingTrendsCount: number;
    trendsWithSummaries: Set<number>;
}

export const useAutoSummary = (): UseAutoSummaryReturn => {
    const { data: trends } = useTrends();
    const { data: summaries, execute: refreshSummaries } = useSummaries();
    const { generateSummary, loading: generateLoading } = useGenerateSummary();
    const [generating, setGenerating] = useState(false);
    const [lastAutoGeneration, setLastAutoGeneration] = useState<string | null>(null);
    const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(true);
    const [processedTrends, setProcessedTrends] = useState<Set<number>>(new Set());

    // Get trends that already have summaries
    const trendsWithSummaries = new Set(
        summaries?.map(summary => (summary as any).trendId).filter(id => id) || []
    );

    // Calculate trends that need summaries
    const pendingTrendsCount = trends?.filter(trend =>
        !trendsWithSummaries.has(trend.id) &&
        !processedTrends.has(trend.id) &&
        new Date(trend.expiresAt) > new Date() &&
        trend.score >= 50 // Only generate for trends with decent scores
    ).length || 0;

    const autoGenerateSummaries = useCallback(async () => {
        if (!autoGenerateEnabled || !trends || generateLoading) return;

        setGenerating(true);

        try {
            // Find trends that don't have summaries yet
            const trendsNeedingSummaries = trends.filter(trend =>
                !trendsWithSummaries.has(trend.id) &&
                !processedTrends.has(trend.id) &&
                new Date(trend.expiresAt) > new Date() &&
                trend.score >= 50
            );

            console.log(`Found ${trendsNeedingSummaries.length} trends needing summaries`);

            for (const trend of trendsNeedingSummaries) {
                try {
                    await generateSummary(trend.id);
                    setProcessedTrends(prev => new Set(prev).add(trend.id));
                    console.log(`Generated summary for trend ${trend.id}`);

                    // Refresh summaries list after each generation
                    await refreshSummaries();

                    // Small delay between generations to avoid overwhelming the API
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error(`Failed to generate summary for trend ${trend.id}:`, error);
                }
            }

            setLastAutoGeneration(new Date().toISOString());
        } catch (error) {
            console.error('Auto-generation failed:', error);
        } finally {
            setGenerating(false);
        }
    }, [trends, autoGenerateEnabled, generateLoading, generateSummary, processedTrends, trendsWithSummaries, refreshSummaries]);

    // Auto-generate summaries when new trends are detected
    useEffect(() => {
        if (autoGenerateEnabled && trends && pendingTrendsCount > 0 && !generateLoading) {
            const timer = setTimeout(() => {
                console.log('Auto-generating summaries for new trends...');
                autoGenerateSummaries();
            }, 2000); // Wait 2 seconds after trends load

            return () => clearTimeout(timer);
        }
    }, [trends, pendingTrendsCount, autoGenerateEnabled, generateLoading, autoGenerateSummaries]);

    // Periodic auto-generation (every 5 minutes)
    useEffect(() => {
        if (!autoGenerateEnabled) return;

        const interval = setInterval(() => {
            console.log('Periodic auto-generation check...');
            autoGenerateSummaries();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [autoGenerateEnabled, autoGenerateSummaries]);

    return {
        autoGenerateSummaries,
        generating,
        lastAutoGeneration,
        autoGenerateEnabled,
        setAutoGenerateEnabled,
        pendingTrendsCount,
        trendsWithSummaries
    };
};
