import fs from 'fs';
import path from 'path';
import { Project, ChangelogItem, RoadmapItem } from './types';

interface DatabaseSchema {
  projects: Project[];
  changelogs: ChangelogItem[];
  roadmap: RoadmapItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'storage.json');

const INITIAL_DATA: DatabaseSchema = {
  projects: [
    {
      id: 'demo',
      name: 'Acme AI App',
      domain: 'acme.ai',
      ownerEmail: 'founder@acme.ai',
      plan: 'free',
      accentColor: '#6366f1',
      showBranding: true,
      createdAt: new Date().toISOString(),
    },
  ],
  changelogs: [
    {
      id: 'ch-1',
      projectId: 'demo',
      title: 'Dark Mode & Performance 2.0',
      content: 'We revamped the entire theme system to support automatic OS dark mode and reduced bundle size by 42%.',
      tag: 'feature',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'ch-2',
      projectId: 'demo',
      title: 'Instant Webhook Notifications',
      content: 'Receive real-time alerts directly in your Slack or Discord channels when critical events occur.',
      tag: 'improvement',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
    {
      id: 'ch-3',
      projectId: 'demo',
      title: 'Fixed CSV Export Encoding Bug',
      content: 'Resolved an issue where accented UTF-8 characters were garbled in Excel spreadsheet exports.',
      tag: 'fix',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    },
  ],
  roadmap: [
    {
      id: 'rd-1',
      projectId: 'demo',
      title: 'Multi-workspace & Team Roles',
      description: 'Invite team members with Admin, Editor, and Viewer permissions.',
      status: 'in_progress',
      upvotes: 48,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rd-2',
      projectId: 'demo',
      title: 'Zapier & Make.com Native Integration',
      description: 'Trigger workflows automatically without writing custom API webhooks.',
      status: 'planned',
      upvotes: 32,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rd-3',
      projectId: 'demo',
      title: 'SOC2 & HIPAA Compliance Reports',
      description: 'Export audit logs and compliance certifications directly from settings.',
      status: 'planned',
      upvotes: 19,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rd-4',
      projectId: 'demo',
      title: 'Custom Subdomains & SSL',
      description: 'Host your status and release notes at updates.yourcompany.com.',
      status: 'completed',
      upvotes: 64,
      createdAt: new Date().toISOString(),
    },
  ],
};

function ensureDataFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    return INITIAL_DATA;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_DATA;
  }
}

function saveData(data: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  getProjects: async (): Promise<Project[]> => {
    return ensureDataFile().projects;
  },

  getProject: async (id: string): Promise<Project | null> => {
    const data = ensureDataFile();
    return data.projects.find((p) => p.id === id) || null;
  },

  createProject: async (p: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const data = ensureDataFile();
    const newProject: Project = {
      ...p,
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    data.projects.push(newProject);
    saveData(data);
    return newProject;
  },

  updateProjectPlan: async (projectId: string, plan: 'pro_lifetime' | 'pro_monthly'): Promise<boolean> => {
    const data = ensureDataFile();
    const proj = data.projects.find((p) => p.id === projectId);
    if (!proj) return false;
    proj.plan = plan;
    proj.showBranding = false;
    saveData(data);
    return true;
  },

  getChangelogs: async (projectId: string): Promise<ChangelogItem[]> => {
    const data = ensureDataFile();
    return data.changelogs
      .filter((c) => c.projectId === projectId)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },

  addChangelog: async (
    item: Omit<ChangelogItem, 'id' | 'publishedAt'>
  ): Promise<ChangelogItem> => {
    const data = ensureDataFile();
    const newItem: ChangelogItem = {
      ...item,
      id: 'ch_' + Math.random().toString(36).substring(2, 9),
      publishedAt: new Date().toISOString(),
    };
    data.changelogs.unshift(newItem);
    saveData(data);
    return newItem;
  },

  deleteChangelog: async (id: string): Promise<boolean> => {
    const data = ensureDataFile();
    data.changelogs = data.changelogs.filter((c) => c.id !== id);
    saveData(data);
    return true;
  },

  getRoadmap: async (projectId: string): Promise<RoadmapItem[]> => {
    const data = ensureDataFile();
    return data.roadmap
      .filter((r) => r.projectId === projectId)
      .sort((a, b) => b.upvotes - a.upvotes);
  },

  addRoadmapItem: async (
    item: Omit<RoadmapItem, 'id' | 'upvotes' | 'createdAt'>
  ): Promise<RoadmapItem> => {
    const data = ensureDataFile();
    const newItem: RoadmapItem = {
      ...item,
      id: 'rd_' + Math.random().toString(36).substring(2, 9),
      upvotes: 1,
      createdAt: new Date().toISOString(),
    };
    data.roadmap.push(newItem);
    saveData(data);
    return newItem;
  },

  upvoteRoadmapItem: async (id: string): Promise<number | null> => {
    const data = ensureDataFile();
    const item = data.roadmap.find((r) => r.id === id);
    if (!item) return null;
    item.upvotes += 1;
    saveData(data);
    return item.upvotes;
  },
};
