# 🇳🇬 RealNaijaGist — Next.js 16 Serverless Edition

A modern, high-performance, serverless digital news and magazine platform built for **RealNaijaGist.com**. Re-architected from legacy monolithic Django to Next.js 16 + React 19 + Tailwind CSS + Prisma Serverless Postgres.

---

## 🚀 Key Highlights & Architectural Advantages

- **Zero-Hosting Cost on Vercel:** Fully serverless architecture designed to eliminate recurring monthly VPS/cPanel hosting bills on Namecheap.
- **Ultra-Fast Edge Performance:** Next.js Incremental Static Regeneration (ISR) and Turbopack for instant page loads across desktop and mobile.
- **Google AdSense Policy Compliant:**
  - Dedicated, policy-compliant transparency pages: **About Us & Editorial Standards**, **Contact Editorial Desk**, **Privacy & Cookie Disclosure (GDPR)**, and **Terms of Service**.
  - Proper ad labeling (`ADVERTISEMENT`) with clean responsive slots that never overlap content or cause layout shifts.
  - Automated XML Sitemap (`/sitemap.xml`) and dynamic `robots.txt` for rapid Googlebot indexing.
  - Semantic HTML5 and schema.org `NewsArticle` JSON-LD structured data on all article pages.
- **Automated News Scraping & AI Rewriter:** Serverless cron jobs via Vercel Cron that ingest Nigerian news feeds and generate fresh, original content using Groq AI (`llama-3.3-70b-versatile`).
- **Modern Dark & Emerald Aesthetic:** Mobile-first, responsive design featuring trending tickers, hero spotlight carousels, category archives, search filters, and newsletter capture.

---

## 📁 Project Structure

```
realnaijagist-nextjs/
├── app/
│   ├── about/page.tsx               # About Us & Editorial Standards
│   ├── category/[slug]/page.tsx     # Dynamic Category archives
│   ├── contact/page.tsx             # Contact Editorial Desk
│   ├── post/[slug]/page.tsx         # Full story page + JSON-LD + Ad units
│   ├── privacy/page.tsx             # Privacy & Cookie policy (AdSense required)
│   ├── search/page.tsx              # Live article search
│   ├── tag/[slug]/page.tsx          # Tag-filtered archives
│   ├── terms/page.tsx               # Terms of Service
│   ├── api/
│   │   ├── contact/route.ts         # Contact form handler
│   │   ├── newsletter/route.ts      # Newsletter subscription handler
│   │   └── cron/fetch-news/route.ts # Automated RSS ingestion & AI rewrite cron
│   ├── globals.css                  # Tailwind CSS v4 styling
│   ├── layout.tsx                   # Global layout with AdSense script & Nav/Footer
│   ├── page.tsx                     # Dynamic homepage with Hero Carousel & Feed
│   ├── robots.ts                    # SEO robots.txt
│   └── sitemap.ts                   # Dynamic XML sitemap
├── components/
│   ├── AdUnit.tsx                   # AdSense policy-compliant ad unit
│   ├── Footer.tsx                   # Global footer with legal links
│   ├── HeroCarousel.tsx             # Interactive spotlight carousel
│   ├── Navbar.tsx                   # Sticky responsive navigation with search
│   ├── NewsletterForm.tsx           # Reader subscription widget
│   ├── Pagination.tsx               # Feed pagination
│   ├── PostCard.tsx                 # Responsive article card
│   └── SidebarWidgets.tsx           # Trending & Popular stories sidebar
├── lib/
│   ├── db.ts                        # Global Prisma client singleton
│   └── posts.ts                     # Resilient query helpers & database access
├── prisma/
│   └── schema.prisma                # Full database schema (Postgres)
└── package.json
```

---

## 🛠️ Getting Started Locally

### 1. Prerequisites
- Node.js 20+
- PostgreSQL or Neon Serverless Postgres account

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env.local` and add your database and API credentials:
```bash
cp .env.example .env.local
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Run Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚢 Production Deployment to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Set your environment variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `OPENAI_API_KEY` (Groq API Key)
   - `OPENAI_API_BASE` (`https://api.groq.com/openai/v1`)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Deploy! Vercel automatically deploys edge functions, serverless API routes, and optimizes all assets.
