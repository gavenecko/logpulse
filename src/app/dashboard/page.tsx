'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Layers,
  ListTodo,
  Settings,
  ThumbsUp,
  FolderPlus,
  Mail,
  KeyRound,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ChangelogItem, RoadmapItem, Project } from '@/lib/types';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'changelog' | 'roadmap' | 'settings'>('changelog');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active Project State
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [project, setProject] = useState<Project | null>(null);
  const [changelogs, setChangelogs] = useState<ChangelogItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);

  // Onboarding / Project Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'restore'>('create');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectEmail, setNewProjectEmail] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#6366f1');
  const [restoreQuery, setRestoreQuery] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState<'feature' | 'improvement' | 'fix' | 'announcement'>('feature');

  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [roadmapDesc, setRoadmapDesc] = useState('');
  const [roadmapStatus, setRoadmapStatus] = useState<'planned' | 'in_progress' | 'completed'>('planned');

  // Email attach state in settings
  const [attachEmail, setAttachEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Initialize project from URL or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('p');
    const storedId = localStorage.getItem('logpulse_project_id');

    const idToLoad = paramId || storedId;
    if (idToLoad) {
      setCurrentProjectId(idToLoad);
      loadProjectData(idToLoad);
    } else {
      setShowCreateModal(true);
      setLoading(false);
    }
  }, []);

  const loadProjectData = async (projId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/widget?projectId=${encodeURIComponent(projId)}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setChangelogs(data.changelogs || []);
        setRoadmap(data.roadmap || []);
      } else {
        setShowCreateModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreatingProject(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          ownerEmail: newProjectEmail.trim(),
          accentColor: newProjectColor,
        }),
      });

      const data = await res.json();
      if (data.success && data.project) {
        localStorage.setItem('logpulse_project_id', data.project.id);
        setCurrentProjectId(data.project.id);
        setProject(data.project);
        setShowCreateModal(false);
        setNewProjectName('');
        setNewProjectEmail('');
        window.history.replaceState(null, '', `?p=${data.project.id}`);
        await loadProjectData(data.project.id);
        setMessage(`🎉 Created workspace for ${data.project.name}!`);
        setTimeout(() => setMessage(null), 4000);
      } else {
        alert(data.error || 'Failed to create project');
      }
    } catch {
      alert('Error creating workspace');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleRestoreProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreQuery.trim()) return;

    setCreatingProject(true);
    try {
      const res = await fetch(`/api/projects?query=${encodeURIComponent(restoreQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.project) {
        localStorage.setItem('logpulse_project_id', data.project.id);
        setCurrentProjectId(data.project.id);
        setProject(data.project);
        setShowCreateModal(false);
        setRestoreQuery('');
        window.history.replaceState(null, '', `?p=${data.project.id}`);
        await loadProjectData(data.project.id);
        setMessage(`✨ Restored workspace: ${data.project.name}`);
        setTimeout(() => setMessage(null), 4000);
      } else {
        alert(data.error || 'No workspace found with that ID or email.');
      }
    } catch {
      alert('Failed to restore workspace');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachEmail.trim() || !project) return;

    setSavingEmail(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          email: attachEmail.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProject({ ...project, ownerEmail: attachEmail.trim() });
        setAttachEmail('');
        setMessage('✅ Email linked! You can now restore this workspace anytime with your email.');
        setTimeout(() => setMessage(null), 5000);
      } else {
        alert(data.error || 'Failed to save email');
      }
    } catch {
      alert('Error saving email');
    } finally {
      setSavingEmail(false);
    }
  };

  const switchToDemo = async () => {
    localStorage.setItem('logpulse_project_id', 'demo');
    setCurrentProjectId('demo');
    window.history.replaceState(null, '', `?p=demo`);
    await loadProjectData('demo');
    setShowCreateModal(false);
  };

  const handleAddChangelog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !project) return;

    try {
      const res = await fetch('/api/changelogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          title: newTitle,
          content: newContent,
          tag: newTag,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChangelogs([data.item, ...changelogs]);
        setNewTitle('');
        setNewContent('');
        setMessage('Changelog published successfully!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(data.error || 'Failed to publish');
      }
    } catch {
      alert('Failed to publish');
    }
  };

  const handleDeleteChangelog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release note?')) return;
    try {
      const res = await fetch(`/api/changelogs?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setChangelogs(changelogs.filter((c) => c.id !== id));
      } else {
        alert(data.error || 'Cannot delete item');
      }
    } catch {
      alert('Failed to delete');
    }
  };

  const handleAddRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapTitle.trim() || !roadmapDesc.trim() || !project) return;

    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          title: roadmapTitle,
          description: roadmapDesc,
          status: roadmapStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRoadmap([...roadmap, data.item]);
        setRoadmapTitle('');
        setRoadmapDesc('');
        setMessage('Roadmap item created!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(data.error || 'Failed to add roadmap item');
      }
    } catch {
      alert('Failed to add roadmap item');
    }
  };

  const handleUpvote = async (itemId: string) => {
    try {
      const res = await fetch('/api/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (data.success) {
        setRoadmap(
          roadmap.map((r) => (r.id === itemId ? { ...r, upvotes: data.upvotes } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgrade = async (plan: 'pro_lifetime' | 'pro_monthly') => {
    if (!project) return;
    setUpgrading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, plan }),
      });
      const data = await res.json();
      if (data.url) {
        if (data.demoActivated) {
          await loadProjectData(project.id);
          setMessage('🎉 Plan upgraded to Pro Lifetime!');
          setTimeout(() => setMessage(null), 4000);
        } else {
          window.location.href = data.url;
        }
      }
    } catch {
      alert('Upgrade request failed');
    } finally {
      setUpgrading(false);
    }
  };

  const hostUrl = typeof window !== 'undefined' ? window.location.origin : 'https://logpulse-flame.vercel.app';
  const embedScript = `<script src="${hostUrl}/widget.js" data-project-id="${project?.id || 'demo'}" async></script>`;
  const secretDashboardUrl = `${hostUrl}/dashboard?p=${project?.id || 'demo'}`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySecretLink = () => {
    navigator.clipboard.writeText(secretDashboardUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Onboarding / Restore Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setModalMode('create')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    modalMode === 'create' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  New Project
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('restore')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    modalMode === 'restore' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In / Restore
                </button>
              </div>
            </div>

            {modalMode === 'create' ? (
              <>
                <h2 className="text-2xl font-black text-white">Create Your Project</h2>
                <p className="text-sm text-slate-400 mt-2">
                  Launch your in-app changelog in seconds. You will get your own private board and embed snippet.
                </p>

                <form onSubmit={handleCreateProject} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Project or Website Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. My Next.js SaaS, Portfolio, Acme App"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Your Email</span>
                      <span className="text-[10px] text-slate-500 font-normal">Optional (to save link)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={newProjectEmail}
                      onChange={(e) => setNewProjectEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      {['#6366f1', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewProjectColor(color)}
                          style={{ backgroundColor: color }}
                          className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 ${
                            newProjectColor === color ? 'border-white scale-110' : 'border-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={creatingProject}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition"
                    >
                      {creatingProject ? 'Creating Workspace...' : 'Launch My Workspace →'}
                    </button>

                    <button
                      type="button"
                      onClick={switchToDemo}
                      className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition"
                    >
                      Or explore the demo sandbox
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black text-white">Restore Workspace</h2>
                <p className="text-sm text-slate-400 mt-2">
                  Enter your Project ID (e.g. `proj_xyz`) or the email you linked to open your dashboard.
                </p>

                <form onSubmit={handleRestoreProject} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Project ID or Linked Email
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. proj_k82m9a or you@company.com"
                      value={restoreQuery}
                      onChange={(e) => setRestoreQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={creatingProject}
                      className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition"
                    >
                      {creatingProject ? 'Restoring...' : 'Open My Workspace →'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalMode('create')}
                      className="w-full py-2 text-xs text-slate-400 hover:text-white transition"
                    >
                      ← Back to Create Project
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">LogPulse</span>
          </Link>
          <span className="text-slate-600">/</span>

          {/* Project Switcher Pill */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-sm font-semibold text-slate-200">
              {project?.name || 'Loading...'}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                project?.plan === 'free'
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {project?.plan === 'free' ? 'FREE' : 'PRO LIFETIME'}
            </span>
            <button
              onClick={() => {
                setModalMode('create');
                setShowCreateModal(true);
              }}
              className="ml-1 text-slate-400 hover:text-indigo-400 transition"
              title="New or Switch Project"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyEmbed}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Snippet!' : 'Get Embed Code'}
          </button>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 transition"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Notification Banner */}
      {message && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-6 py-2.5 text-center text-sm font-medium text-emerald-300">
          {message}
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('changelog')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'changelog'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Changelog Feed ({changelogs.length})
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'roadmap'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              Roadmap & Votes ({roadmap.length})
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings & Billing
            </button>
          </div>

          {/* Quick Access / Save Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                Access Link
              </span>
              <span className="text-[10px] font-mono text-slate-500">{project?.id}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bookmark or copy your secret link to open this dashboard on any computer:
            </p>
            <button
              onClick={copySecretLink}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied Dashboard URL!' : 'Copy Secret Login URL'}
            </button>
          </div>

          {/* Quick Embed Tag Box */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Your Embed Tag
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Drop into your site's HTML to load your private widget:
            </p>
            <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap select-all">
              {embedScript}
            </pre>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: CHANGELOG */}
          {activeTab === 'changelog' && (
            <div className="space-y-6">
              {/* Add New Changelog Form */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  Publish New Release for {project?.name}
                </h3>
                <form onSubmit={handleAddChangelog} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Release Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Added Stripe Billing & Export to CSV"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Category Tag
                      </label>
                      <select
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="feature">New Feature</option>
                        <option value="improvement">Improvement</option>
                        <option value="fix">Bug Fix</option>
                        <option value="announcement">Announcement</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Release Notes (Markdown or plain text)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what changed and why your users will love it..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-md shadow-indigo-600/30 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Publish Update
                  </button>
                </form>
              </div>

              {/* Existing Changelogs */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-300">Published Updates ({changelogs.length})</h4>
                {changelogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm border border-slate-800 rounded-2xl bg-slate-950/30">
                    No updates published yet. Use the form above to post your first release!
                  </div>
                ) : (
                  changelogs.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-start justify-between gap-4 hover:border-slate-700 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              item.tag === 'feature'
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : item.tag === 'improvement'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {item.tag}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-base">{item.title}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{item.content}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteChangelog(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              {/* Add Roadmap Form */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  Add Feature to Roadmap
                </h3>
                <form onSubmit={handleAddRoadmap} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Feature Idea
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google Calendar Sync"
                      value={roadmapTitle}
                      onChange={(e) => setRoadmapTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Status
                      </label>
                      <select
                        value={roadmapStatus}
                        onChange={(e) => setRoadmapStatus(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief details about what this entails..."
                      value={roadmapDesc}
                      onChange={(e) => setRoadmapDesc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-md shadow-indigo-600/30 flex items-center gap-2"
                  >
                    Add to Roadmap
                  </button>
                </form>
              </div>

              {/* Roadmap List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300">Feature Requests & Votes ({roadmap.length})</h4>
                {roadmap.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm border border-slate-800 rounded-2xl bg-slate-950/30">
                    No roadmap items yet. Add one above!
                  </div>
                ) : (
                  roadmap.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-start gap-4 hover:border-slate-700 transition"
                    >
                      <button
                        onClick={() => handleUpvote(item.id)}
                        className="flex flex-col items-center justify-center min-w-[50px] py-2 px-1 rounded-xl border border-slate-800 bg-slate-900 hover:border-indigo-500 hover:bg-indigo-950/40 transition group"
                      >
                        <ThumbsUp className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
                        <span className="text-sm font-bold text-white mt-1">{item.upvotes}</span>
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'in_progress'
                                ? 'bg-amber-500/20 text-amber-300'
                                : item.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-base">{item.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & BILLING */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Billing Upgrade Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 to-purple-950/50 border border-indigo-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Workspace: {project?.name}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      {project?.plan === 'free' ? 'Free Starter Plan' : 'Pro Lifetime Pass 🎉'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-md">
                      {project?.plan === 'free'
                        ? 'Upgrade this project to remove the "Powered by LogPulse" watermark and unlock custom themes.'
                        : 'This project has full unlimited lifetime access with zero monthly fees.'}
                    </p>
                  </div>

                  {project?.plan === 'free' && (
                    <button
                      onClick={() => handleUpgrade('pro_lifetime')}
                      disabled={upgrading}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4" />
                      {upgrading ? 'Processing...' : 'Get Lifetime Pass ($29)'}
                    </button>
                  )}
                </div>
              </div>

              {/* Link Email Card (Lead Capture & Recovery) */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <h3>Link Email to Workspace</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  Attach your email so you can restore your dashboard anytime from any device by entering your email address.
                </p>

                {project?.ownerEmail ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Linked to: <strong>{project.ownerEmail}</strong></span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveEmail} className="flex gap-3 max-w-md">
                    <input
                      type="email"
                      placeholder="founder@company.com"
                      value={attachEmail}
                      onChange={(e) => setAttachEmail(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={savingEmail}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                    >
                      {savingEmail ? 'Saving...' : 'Link Email'}
                    </button>
                  </form>
                )}
              </div>

              {/* Branding and Project Details */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white">Project Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Project ID
                    </label>
                    <div className="text-xs font-mono text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                      {project?.id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Watermark Status
                    </label>
                    <div className="text-xs text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                      {project?.plan === 'free'
                        ? 'Active ("Powered by LogPulse")'
                        : 'Hidden (Disabled on Pro)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
