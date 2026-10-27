export type PlanType = 'free' | 'pro_lifetime' | 'pro_monthly';

export type ChangelogTag = 'feature' | 'improvement' | 'fix' | 'announcement';

export type RoadmapStatus = 'planned' | 'in_progress' | 'completed';

export interface Project {
  id: string;
  name: string;
  domain: string;
  ownerEmail: string;
  plan: PlanType;
  accentColor: string;
  showBranding: boolean;
  createdAt: string;
}

export interface ChangelogItem {
  id: string;
  projectId: string;
  title: string;
  content: string;
  tag: ChangelogTag;
  publishedAt: string;
}

export interface RoadmapItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  upvotes: number;
  createdAt: string;
}
