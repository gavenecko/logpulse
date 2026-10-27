# LogPulse ⚡

> The 2-Minute In-App Changelog & Public Feature Roadmap Widget.

LogPulse helps SaaS founders and engineering teams reduce customer churn and collect feature upvotes with a lightweight, embeddable in-app drawer.

---

## 🚀 Quick Start (Local Development)

```bash
cd logpulse
npm install
npm run dev
```

Visit:
* **Landing Page:** [http://localhost:3000](http://localhost:3000)
* **Founder Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
* **Embed Widget Script:** [http://localhost:3000/widget.js](http://localhost:3000/widget.js)

---

## 🛠️ How to Embed on Any Website

Add this single tag to your website's `<head>` or before the closing `</body>` tag:

```html
<script src="https://YOUR_DOMAIN.com/widget.js" data-project-id="demo" async></script>
```

---

## 💳 Stripe Billing Setup

To activate live Stripe payments for the **$29 Early Bird Lifetime Deal** and **$9/month subscription**:

1. Copy `.env.example` to `.env.local`
2. Set your Stripe keys:
```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```
*(If no Stripe key is configured, the app runs in demo mode and upgrades accounts instantly for testing).*

---

## 🚢 1-Click Free Deployment to Vercel

1. Push this directory to your GitHub account.
2. Go to [Vercel](https://vercel.com) & click **Add New Project**.
3. Select your repository and click **Deploy**.
4. (Optional) Connect your custom domain in Vercel project settings.
