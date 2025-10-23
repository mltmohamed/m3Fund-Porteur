export interface DashboardStats {
  totalProjects: number;
  totalCampaigns: number;
  totalFunds: number;
  totalUsers: number;
  activeProjects: number;
  activeCampaigns: number;
  completedProjects: number;
  completedCampaigns: number;
}

export interface DashboardSummary {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
}

export interface RecentActivity {
  id: number;
  type: 'project' | 'campaign' | 'user' | 'fund';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  icon: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  topProjects: any[];
  topCampaigns: any[];
}

export interface DashboardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  status: string;
  type: string;
}
