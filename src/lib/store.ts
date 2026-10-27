import fs from 'fs';
import path from 'path';
import { Project, ChangelogItem, RoadmapItem } from './types';

interface DatabaseSchema {
  projects: Project[];
  changelogs: ChangelogItem[];
  roadmap: RoadmapItem[];
}

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

// Global in-memory cache to survive across serverless function invocations
const globalStore = global as unknown as { __logpulse_data?: DatabaseSchema };

function getFilePath(): string {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'storage.json');
  }
  const localDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch {}
  }
  return path.join(localDir, 'storage.json');
}

// Check if Vercel KV / Upstash Redis is configured
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function loadData(): Promise<DatabaseSchema> {
  // 1. Try Vercel KV / Upstash if configured
  if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(`${KV_URL}/get/logpulse_db`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (data && data.result) {
        const parsed = JSON.parse(data.result);
        globalStore.__logpulse_data = parsed;
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to fetch from KV store:', err);
    }
  }

  // 2. Return global memory if already loaded
  if (globalStore.__logpulse_data) {
    return globalStore.__logpulse_data;
  }

  // 3. Try reading from writable disk (/tmp or local)
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      globalStore.__logpulse_data = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('Failed reading from disk:', err);
  }

  // 4. Default to initial seed
  const defaultData: DatabaseSchema = JSON.parse(JSON.stringify(INITIAL_DATA));
  globalStore.__logpulse_data = defaultData;
  await saveData(defaultData);
  return defaultData;
}

async function saveData(data: DatabaseSchema): Promise<void> {
  globalStore.__logpulse_data = data;

  // 1. Try Vercel KV / Upstash if configured
  if (KV_URL && KV_TOKEN) {
    try {
      await fetch(`${KV_URL}/set/logpulse_db`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(data)),
      });
    } catch (err) {
      console.warn('Failed to persist to KV store:', err);
    }
  }

  // 2. Try writing to writable disk (/tmp or local data)
  try {
    const filePath = getFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Disk write skipped or failed (using memory store):', err);
  }
}

export const db = {
  getProjects: async (): Promise<Project[]> => {
    const data = await loadData();
    return data.projects;
  },

  getProject: async (id: string): Promise<Project | null> => {
    const data = await loadData();
    return data.projects.find((p) => p.id === id) || null;
  },

  findProjectByQuery: async (query: string): Promise<Project | null> => {
    const data = await loadData();
    const cleanQuery = query.trim().toLowerCase();
    return (
      data.projects.find(
        (p) =>
          p.id.toLowerCase() === cleanQuery ||
          (p.ownerEmail && p.ownerEmail.toLowerCase() === cleanQuery)
      ) || null
    );
  },

  updateProjectEmail: async (projectId: string, email: string): Promise<boolean> => {
    const data = await loadData();
    const proj = data.projects.find((p) => p.id === projectId);
    if (!proj) return false;
    proj.ownerEmail = email.trim();
    await saveData(data);
    return true;
  },

  createProject: async (p: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const data = await loadData();
    const newProject: Project = {
      ...p,
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    data.projects.push(newProject);
    await saveData(data);
    return newProject;
  },

  updateProjectPlan: async (projectId: string, plan: 'pro_lifetime' | 'pro_monthly'): Promise<boolean> => {
    const data = await loadData();
    const proj = data.projects.find((p) => p.id === projectId);
    if (!proj) return false;
    proj.plan = plan;
    proj.showBranding = false;
    await saveData(data);
    return true;
  },

  getChangelogs: async (projectId: string): Promise<ChangelogItem[]> => {
    const data = await loadData();
    return data.changelogs
      .filter((c) => c.projectId === projectId)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },

  addChangelog: async (
    item: Omit<ChangelogItem, 'id' | 'publishedAt'>
  ): Promise<ChangelogItem> => {
    const data = await loadData();
    const newItem: ChangelogItem = {
      ...item,
      id: 'ch_' + Math.random().toString(36).substring(2, 9),
      publishedAt: new Date().toISOString(),
    };
    data.changelogs.unshift(newItem);
    await saveData(data);
    return newItem;
  },

  deleteChangelog: async (id: string): Promise<boolean> => {
    const data = await loadData();
    data.changelogs = data.changelogs.filter((c) => c.id !== id);
    await saveData(data);
    return true;
  },

  getRoadmap: async (projectId: string): Promise<RoadmapItem[]> => {
    const data = await loadData();
    return data.roadmap
      .filter((r) => r.projectId === projectId)
      .sort((a, b) => b.upvotes - a.upvotes);
  },

  addRoadmapItem: async (
    item: Omit<RoadmapItem, 'id' | 'upvotes' | 'createdAt'>
  ): Promise<RoadmapItem> => {
    const data = await loadData();
    const newItem: RoadmapItem = {
      ...item,
      id: 'rd_' + Math.random().toString(36).substring(2, 9),
      upvotes: 1,
      createdAt: new Date().toISOString(),
    };
    data.roadmap.push(newItem);
    await saveData(data);
    return newItem;
  },

  upvoteRoadmapItem: async (id: string): Promise<number | null> => {
    const data = await loadData();
    const item = data.roadmap.find((r) => r.id === id);
    if (!item) return null;
    item.upvotes += 1;
    await saveData(data);
    return item.upvotes;
  },
};
