'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LogoMark from '@/components/LogoMark';
import {
  ShieldCheck,
  KeyRound,
  Download,
  Users,
  DollarSign,
  Briefcase,
  Search,
  ExternalLink,

  ArrowRight,
} from 'lucide-react';

interface AdminStats {
  totalProjects: number;
  totalLeads: number;
  proProjects: number;
}

interface AdminProject {
  id: string;
  name: string;
  ownerEmail: string | null;
  plan: string;
  accentColor: string;
  createdAt: string;
}

export default function AdminPage() {
  const [key, setKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [search, setSearch] = useState('');

  // Auto-login from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('logpulse_admin_key');
    if (savedKey) {
      setKey(savedKey);
      verifyAndLoad(savedKey);
    }
  }, []);

  const verifyAndLoad = async (passKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const authRes = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: passKey }),
      });

      if (!authRes.ok) {
        setError('Invalid admin key');
        setLoading(false);
        return;
      }

      localStorage.setItem('logpulse_admin_key', passKey);
      setIsAuthenticated(true);

      const dataRes = await fetch('/api/admin', {
        headers: { 'x-admin-key': passKey },
      });
      const data = await dataRes.json();
      setStats(data.stats);
      setProjects(data.projects || []);
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    verifyAndLoad(key.trim());
  };

  const handleDownloadCsv = () => {
    const exportUrl = `/api/admin?key=${encodeURIComponent(key)}&format=csv`;
    window.open(exportUrl, '_blank');
  };

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.ownerEmail && p.ownerEmail.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="w-8 h-8 shrink-0" />
            <span className="font-bold text-white text-lg tracking-tight">LogPulse</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Founder Admin
          </span>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
        >
          Open App Dashboard &rarr;
        </Link>
      </header>

      {/* Main Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col justify-center">
        {!isAuthenticated ? (
          /* Password Screen */
          <div className="max-w-md w-full mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white">Founder Access</h2>
            <p className="text-xs text-slate-400 mt-2">
              Enter your master key to view project analytics and export leads.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Master Admin Key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-xs text-rose-400 font-medium">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20"
              >
                {loading ? 'Verifying...' : 'Unlock Admin Dashboard'}
              </button>
            </form>
          </div>
        ) : (
          /* Admin Dashboard */
          <div className="space-y-8 my-4">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Workspaces</span>
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black text-white">{stats?.totalProjects || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Live customer projects</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Captured Leads</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-emerald-400">{stats?.totalLeads || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Users with linked emails</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Paid Lifetime Sales</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-400">
                  {stats?.proProjects || 0} <span className="text-xs text-slate-500 font-normal">(${(stats?.proProjects || 0) * 29})</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Pro Founder pass holders</p>
              </div>
            </div>

            {/* Actions & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by project name, ID, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleDownloadCsv}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Leads to CSV
              </button>
            </div>

            {/* Leads & Workspaces Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Project Name</th>
                      <th className="py-3.5 px-4">Owner Email (Lead)</th>
                      <th className="py-3.5 px-4">Plan</th>
                      <th className="py-3.5 px-4">Project ID</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No matching workspaces found.
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: proj.accentColor || '#6366f1' }}
                            />
                            {proj.name}
                          </td>
                          <td className="py-3.5 px-4">
                            {proj.ownerEmail ? (
                              <span className="font-mono text-emerald-300 font-semibold">
                                {proj.ownerEmail}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">No email linked</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                proj.plan === 'free'
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {proj.plan.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">
                            {proj.id}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(proj.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/dashboard?p=${proj.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                            >
                              Open Board
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
