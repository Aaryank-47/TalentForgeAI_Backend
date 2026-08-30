export interface KpiMetric {
  value: string;
  trend: string;
  positive: boolean;
}

export interface FunnelStageData {
  stage: string;
  count: number;
  color: string;
}

export interface TimeToHireTrendData {
  name: string;
  days: number;
}

export interface SourceEffectivenessData {
  name: string;
  value: number; // percentage
  count: number;
  color: string;
}

export interface InterviewSuccessData {
  name: string;
  success: number;
  rejected: number;
}

export interface JobsFilledData {
  month: string;
  open: number;
  filled: number;
}

export interface AssessmentPerfData {
  name: string;
  attempts: number;
  avg: number;
}

export interface AnalyticsOverviewResponse {
  period: string;
  kpis: {
    timeToHire: KpiMetric;
    openJobs: KpiMetric;
    totalHires: KpiMetric;
    offerAcceptance: KpiMetric;
    interviewSuccess: KpiMetric;
  };
  funnelData: FunnelStageData[];
  timeToHireData: TimeToHireTrendData[];
  timeToHireSummary: {
    comparisonText: string;
    isFaster: boolean;
  };
  sourceData: SourceEffectivenessData[];
  interviewSuccessData: InterviewSuccessData[];
  jobsFilledData: JobsFilledData[];
  assessmentPerfData: AssessmentPerfData[];
}

export interface DashboardKpi {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'warn';
}

export interface ApplicationVolumePoint {
  name: string;
  applicants: number;
  interviews: number;
}

export interface PipelineStageDashboard {
  stage: string;
  count: number;
  color: string;
  pct: number;
}

export interface UpcomingInterviewDashboard {
  id: string;
  name: string;
  role: string;
  time: string;
  type: string;
  avatar: string;
  color: string;
}

export interface RecentActivityDashboard {
  id: string;
  type: 'applied' | 'assessment' | 'interview' | 'offer' | 'hired';
  text: string;
  time: string;
  color: string;
}

export interface ActiveJobPipelineDashboard {
  id: string;
  role: string;
  dept: string;
  stats: [number, number, number, number]; // [Applied, Screening, Interview, Offer]
  status: string;
}

export interface InterviewSummaryDashboard {
  totalInterviews: number;
  completedCount: number;
  scheduledCount: number;
  inProgressCount: number;
  cancelledCount: number;
  completionRate: number;
  avgDurationMinutes: number | null;
  avgScore: number | null;
  hasAnyData: boolean;
}

export interface RecruiterDashboardResponse {
  kpis: {
    openJobs: DashboardKpi;
    applicantsThisWeek: DashboardKpi;
    pendingReviews: DashboardKpi;
    todaysInterviews: DashboardKpi;
  };
  applicationVolume: ApplicationVolumePoint[];
  pipelineStages: PipelineStageDashboard[];
  upcomingInterviews: UpcomingInterviewDashboard[];
  interviewSummary: InterviewSummaryDashboard;
  recentActivity: RecentActivityDashboard[];
  activeJobPipelines: ActiveJobPipelineDashboard[];
  statsFooter: {
    offerAcceptRate: string;
    avgTimeToHire: string;
  };
}
