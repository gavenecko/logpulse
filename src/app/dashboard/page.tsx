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
  ExternalLink,
  Layers,
  ListTodo,
  Settings,
  ThumbsUp,
  Tag,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { ChangelogItem, RoadmapItem, Project } from '@/lib/types';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'changelog' | 'roadmap' | 'settings'>('changelog');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const [project, setProject] = useState<Project | null>(null);
  const [changelogs, setChangelogs] = useState<ChangelogItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState<'feature' | 'improvement' | 'fix' | 'announcement'>('feature');

  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [roadmapDesc, setRoadmapDesc] = useState('');
  const [roadmapStatus, setRoadmapStatus] = useState<'planned' | 'in_progress' | 'completed'>('planned');

  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Load project data
  const loadData = async () => {
    try {
      const res = await fetch('/api/widget?projectId=demo');
      const data = await res.json();
      setProject(data.project);
      setChangelogs(data.changelogs || []);
      setRoadmap(data.roadmap || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddChangelog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch('/api/changelogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'demo',
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
      }
    } catch {
      alert('Failed to publish');
    }
  };

  const handleDeleteChangelog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release note?')) return;
    try {
      const res = await fetch(`/api/changelogs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setChangelogs(changelogs.filter((c) => c.id !== id));
      }
    } catch {
      alert('Failed to delete');
    }
  };

  const handleAddRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapTitle.trim() || !roadmapDesc.trim()) return;

    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'demo',
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
    setUpgrading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: 'demo', plan }),
      });
      const data = await res.json();
      if (data.url) {
        if (data.demoActivated) {
          await loadData();
          setMessage('🎉 Plan successfully upgraded to Pro Lifetime!');
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

  const embedScript = `<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/widget.js" data-project-id="${project?.id || 'demo'}" async></script>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">LogPulse</span>
          </Link>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-300">
              {project?.name || 'My Project'}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                project?.plan === 'free'
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {project?.plan === 'free' ? 'FREE PLAN' : 'PRO LIFETIME'}
            </span>
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

          {/* Quick Embed Guide */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Quick Embed
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Paste this tag into any website. It loads instantly and displays your updates.
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
                  Publish New Release
                </h3>
                <form onSubmit={handleAddChangelog} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Added Webhook Support & CSV Exports"
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
                      What changed? (Markdown or plain text)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what is new, why users will love it, and any actions needed..."
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
                {changelogs.map((item) => (
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
                ))}
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
                  Add Roadmap Item
                </h3>
                <form onSubmit={handleAddRoadmap} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Feature Idea
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Export data to Google Sheets & Zapier"
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
                {roadmap.map((item) => (
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
                ))}
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
                      Current Plan
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      {project?.plan === 'free' ? 'Free Starter Plan' : 'Pro Lifetime Pass 🎉'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-md">
                      {project?.plan === 'free'
                        ? 'Upgrade to remove the "Powered by LogPulse" watermark and unlock custom themes.'
                        : 'You have full unlimited lifetime access with zero monthly fees.'}
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

              {/* Branding and Color Customization */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white">Widget Customization</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Show "Powered by LogPulse" Badge
                    </label>
                    <div className="text-xs text-slate-400">
                      {project?.plan === 'free'
                        ? 'Active (Included on Free tier)'
                        : 'Hidden (Disabled on Pro)'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-600 border border-slate-700"></div>
                      <span className="text-xs font-mono text-slate-300">#6366f1</span>
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
