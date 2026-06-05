// Widget definitions
import StatsWidget from './StatsWidget';
import TrendWidget from './TrendWidget';
import FeedWidget from './FeedWidget';
import QuickStatsWidget from './QuickStatsWidget';
import { WidgetTemplate } from '../components/WidgetManager';

export const availableWidgets: WidgetTemplate[] = [
  {
    id: 'stats',
    type: 'stats' as const,
    title: 'Statistics',
    component: StatsWidget,
    props: {},
    defaultSize: 'medium' as const
  },
  {
    id: 'trend',
    type: 'trends' as const,
    title: 'Trend Analysis',
    component: TrendWidget,
    props: {},
    defaultSize: 'medium' as const
  },
  {
    id: 'feed',
    type: 'feed' as const,
    title: 'Recent Feeds',
    component: FeedWidget,
    props: {},
    defaultSize: 'medium' as const
  },
  {
    id: 'quick-stats',
    type: 'stats' as const,
    title: 'Quick Stats',
    component: QuickStatsWidget,
    props: {},
    defaultSize: 'large' as const
  }
];
