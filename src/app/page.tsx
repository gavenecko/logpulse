'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LogoMark from '@/components/LogoMark';
import {
  Sparkles,
  Rocket,
  CheckCircle2,
  Code2,

  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="https://logpulse.app/widget.js" data-project-id="YOUR_ID" async></script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white text-xs sm:text-sm font-medium py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
        <span>
          <strong>Early Bird Special:</strong> First 50 customers get Lifetime Access for $29 (Regular $9/mo).
        </span>
        <Link href="/dashboard" className="underline font-bold hover:text-slate-200 ml-1">
          Claim Now &rarr;
        </Link>
      </div>

      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="w-9 h-9 shrink-0" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            LogPulse
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Live Demo
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Rocket className="w-3.5 h-3.5" />
          Ship Fast. Retain Users. Grow Automatically.
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          The 2-Minute In-App Changelog &{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Public Roadmap
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stop user churn by showing you are constantly shipping. Collect feature upvotes directly inside your app with a lightweight 2-line embed script.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#embed-snippet"
            className="w-full sm:w-auto px-6 py-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold text-base transition flex items-center justify-center gap-2"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            See Embed Code
          </a>
        </div>

        {/* Product Hunt launch badge */}
        <div className="mt-8 flex justify-center">
          <a
            href="https://www.producthunt.com/products/logpulse-2?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-logpulse-2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
          >
            <img
              alt="LogPulse - The 2-Minute Product Changelog &amp; Feature Roadmap Widget | Product Hunt"
              width={250}
              height={54}
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1296657&amp;theme=dark&amp;t=1793249727719"
              className="h-auto max-w-full"
            />
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 60-second setup
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero dependencies
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Works on any web app
          </span>
        </div>
      </section>

      {/* Code Snippet Preview */}
      <section id="embed-snippet" className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="ml-2 font-mono text-slate-400">Add to your &lt;head&gt; or &lt;body&gt;</span>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Script'}
            </button>
          </div>
          <pre className="mt-4 text-sm font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap">
            {snippet}
          </pre>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white">Why Every Modern SaaS Needs This</h2>
          <p className="mt-3 text-slate-400">
            Customers cancel subscriptions when products look abandoned. LogPulse proves you are constantly building.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Slash Churn Instantly</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              When users see rapid iterations, bug fixes, and continuous value delivered each week, they stick around.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Prioritize What Users Want</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Never build in the dark again. Let paying users upvote feature requests and suggest roadmap priorities directly inside your app.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">10x Cheaper than Canny</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Stop paying $79–$99/month for bloated customer portals. Get everything you need in a fast, beautiful embed for $9/mo or $29 once.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-slate-800/80">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white">Transparent, Founder-Friendly Pricing</h2>
          <p className="mt-2 text-slate-400">No hidden fees, no per-user surcharges.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Free Starter</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-400 text-sm">/ forever</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">Perfect for side projects and launching your MVP.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1 Website / Project</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Changelog entries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Public feature voting</li>
                <li className="flex items-center gap-2 text-slate-500"><CheckCircle2 className="w-4 h-4 text-slate-600" /> "Powered by LogPulse" badge</li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 block text-center py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-white font-semibold transition"
            >
              Start Free
            </Link>
          </div>

          {/* Early Bird LTD */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border-2 border-indigo-500 relative flex flex-col justify-between shadow-2xl shadow-indigo-500/10">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs uppercase tracking-wide">
              Early Bird Lifetime Deal
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Founder Pass</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">$29</span>
                <span className="text-slate-400 text-sm">one-time payment</span>
              </div>
              <p className="mt-3 text-sm text-slate-300">Limited to first 50 makers. Pay once, use forever.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Projects & Domains</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Remove LogPulse Branding</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom Accent Colors & CSS</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority Support & Future Pro Features</li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 block text-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition shadow-lg shadow-indigo-600/30"
            >
              Get Lifetime Access ($29)
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 text-center text-xs text-slate-500">
        <p>© 2026 LogPulse. Built for indie builders and software teams.</p>
      </footer>
    </div>
  );
}
