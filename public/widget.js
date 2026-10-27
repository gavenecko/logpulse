(function () {
  'use strict';

  // Find the current script tag and extract configuration
  const currentScript =
    document.currentScript ||
    document.querySelector('script[data-project-id]');

  const projectId = currentScript
    ? currentScript.getAttribute('data-project-id') || 'demo'
    : 'demo';

  const scriptSrc = currentScript ? currentScript.src : window.location.origin;
  const baseUrl = new URL(scriptSrc).origin;

  let isOpen = false;
  let activeTab = 'changelog';
  let widgetData = null;
  let hasUnread = true;

  // Check localStorage for read state
  const lastReadTime = localStorage.getItem(`logpulse_read_${projectId}`);

  // Fetch widget data from API
  async function fetchData() {
    try {
      const res = await fetch(`${baseUrl}/api/widget?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) return;
      widgetData = await res.json();
      
      // Update unread badge based on published date
      if (widgetData.changelogs && widgetData.changelogs.length > 0) {
        const latestTime = new Date(widgetData.changelogs[0].publishedAt).getTime();
        if (lastReadTime && Number(lastReadTime) >= latestTime) {
          hasUnread = false;
          hideBadge();
        }
      }
      renderDrawerContent();
    } catch (e) {
      console.warn('[LogPulse] Failed to load updates:', e);
    }
  }

  // Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    .logpulse-trigger-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999990;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #4f46e5;
      color: white;
      border: none;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .logpulse-trigger-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
    }
    .logpulse-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: #ef4444;
      border: 2px solid #ffffff;
      border-radius: 50%;
    }
    .logpulse-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(2px);
      z-index: 999998;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.25s ease, visibility 0.25s ease;
    }
    .logpulse-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .logpulse-drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: 100%;
      max-width: 420px;
      height: 100vh;
      background: #ffffff;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
    }
    .logpulse-drawer.active {
      transform: translateX(0);
    }
    .logpulse-header {
      padding: 18px 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logpulse-title {
      font-size: 17px;
      font-weight: 700;
      margin: 0;
      color: #0f172a;
    }
    .logpulse-close-btn {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 20px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }
    .logpulse-close-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .logpulse-tabs {
      display: flex;
      padding: 6px 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      gap: 8px;
    }
    .logpulse-tab {
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      background: transparent;
      color: #64748b;
      transition: all 0.15s ease;
    }
    .logpulse-tab.active {
      background: #ffffff;
      color: #4f46e5;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .logpulse-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .logpulse-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      transition: border-color 0.2s ease;
    }
    .logpulse-card:hover {
      border-color: #cbd5e1;
    }
    .logpulse-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 9999px;
      margin-bottom: 8px;
    }
    .logpulse-tag-feature { background: #e0e7ff; color: #4338ca; }
    .logpulse-tag-improvement { background: #ecfdf5; color: #065f46; }
    .logpulse-tag-fix { background: #fef2f2; color: #991b1b; }
    .logpulse-tag-announcement { background: #fef3c7; color: #92400e; }
    .logpulse-item-title {
      font-size: 15px;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: #1e293b;
    }
    .logpulse-item-date {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .logpulse-item-desc {
      font-size: 13px;
      line-height: 1.5;
      color: #475569;
      margin: 0;
    }
    .logpulse-roadmap-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .logpulse-upvote-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      padding: 6px 4px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .logpulse-upvote-btn:hover {
      border-color: #4f46e5;
      background: #eef2ff;
      color: #4f46e5;
    }
    .logpulse-upvote-count {
      font-size: 13px;
      font-weight: 700;
      margin-top: 2px;
    }
    .logpulse-footer {
      padding: 12px;
      text-align: center;
      font-size: 12px;
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
    }
    .logpulse-footer a {
      color: #6366f1;
      text-decoration: none;
      font-weight: 600;
    }
    .logpulse-footer a:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  // Create Trigger Button
  const triggerBtn = document.createElement('button');
  triggerBtn.className = 'logpulse-trigger-btn';
  triggerBtn.setAttribute('aria-label', "What's new");
  triggerBtn.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
    <span class="logpulse-badge" id="logpulse-unread-dot"></span>
  `;
  document.body.appendChild(triggerBtn);

  // Create Overlay & Drawer
  const overlay = document.createElement('div');
  overlay.className = 'logpulse-overlay';
  document.body.appendChild(overlay);

  const drawer = document.createElement('div');
  drawer.className = 'logpulse-drawer';
  drawer.innerHTML = `
    <div class="logpulse-header">
      <h2 class="logpulse-title" id="logpulse-drawer-title">What's New</h2>
      <button class="logpulse-close-btn" id="logpulse-close-btn" aria-label="Close">✕</button>
    </div>
    <div class="logpulse-tabs">
      <button class="logpulse-tab active" data-tab="changelog">Changelog</button>
      <button class="logpulse-tab" data-tab="roadmap">Roadmap & Ideas</button>
    </div>
    <div class="logpulse-body" id="logpulse-drawer-body">
      <div style="text-align:center; padding: 40px; color: #94a3b8;">Loading updates...</div>
    </div>
    <div class="logpulse-footer" id="logpulse-branding">
      <a href="${baseUrl}" target="_blank" rel="noopener">⚡ Powered by LogPulse</a>
    </div>
  `;
  document.body.appendChild(drawer);

  function hideBadge() {
    const badge = document.getElementById('logpulse-unread-dot');
    if (badge) badge.style.display = 'none';
  }

  function toggleDrawer() {
    isOpen = !isOpen;
    if (isOpen) {
      overlay.classList.add('active');
      drawer.classList.add('active');
      // Mark as read
      localStorage.setItem(`logpulse_read_${projectId}`, Date.now().toString());
      hideBadge();
    } else {
      overlay.classList.remove('active');
      drawer.classList.remove('active');
    }
  }

  triggerBtn.addEventListener('click', toggleDrawer);
  overlay.addEventListener('click', toggleDrawer);
  document.getElementById('logpulse-close-btn').addEventListener('click', toggleDrawer);

  // Connect any custom trigger elements on the host page
  document.querySelectorAll('[data-logpulse-trigger]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDrawer();
    });
  });

  // Tab switching
  drawer.querySelectorAll('.logpulse-tab').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      drawer.querySelectorAll('.logpulse-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.getAttribute('data-tab');
      renderDrawerContent();
    });
  });

  function renderDrawerContent() {
    const body = document.getElementById('logpulse-drawer-body');
    const branding = document.getElementById('logpulse-branding');

    if (!widgetData) {
      body.innerHTML = '<div style="text-align:center; padding: 40px; color: #94a3b8;">Loading...</div>';
      return;
    }

    if (!widgetData.project.showBranding) {
      branding.style.display = 'none';
    }

    if (activeTab === 'changelog') {
      const items = widgetData.changelogs || [];
      if (items.length === 0) {
        body.innerHTML = '<div style="text-align:center; padding: 40px; color: #94a3b8;">No releases published yet.</div>';
        return;
      }
      body.innerHTML = items
        .map((item) => {
          const dateStr = new Date(item.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          return `
            <div class="logpulse-card">
              <span class="logpulse-tag logpulse-tag-${item.tag}">${item.tag}</span>
              <h3 class="logpulse-item-title">${item.title}</h3>
              <div class="logpulse-item-date">${dateStr}</div>
              <p class="logpulse-item-desc">${item.content}</p>
            </div>
          `;
        })
        .join('');
    } else {
      const items = widgetData.roadmap || [];
      if (items.length === 0) {
        body.innerHTML = '<div style="text-align:center; padding: 40px; color: #94a3b8;">No roadmap items yet.</div>';
        return;
      }
      body.innerHTML = items
        .map((item) => {
          return `
            <div class="logpulse-card logpulse-roadmap-item" id="item-${item.id}">
              <button class="logpulse-upvote-btn" data-upvote-id="${item.id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <span class="logpulse-upvote-count">${item.upvotes}</span>
              </button>
              <div style="flex: 1;">
                <h3 class="logpulse-item-title">${item.title}</h3>
                <p class="logpulse-item-desc">${item.description}</p>
              </div>
            </div>
          `;
        })
        .join('');

      // Add upvote listeners
      body.querySelectorAll('[data-upvote-id]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const itemId = btn.getAttribute('data-upvote-id');
          btn.disabled = true;
          try {
            const res = await fetch(`${baseUrl}/api/upvote`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId }),
            });
            const data = await res.json();
            if (data.success) {
              const countEl = btn.querySelector('.logpulse-upvote-count');
              if (countEl) countEl.textContent = data.upvotes;
              btn.style.color = '#4f46e5';
              btn.style.borderColor = '#4f46e5';
            }
          } catch (err) {
            console.error('Failed to upvote', err);
          }
        });
      });
    }
  }

  // Initial load
  fetchData();
})();
