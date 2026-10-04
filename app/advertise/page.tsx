import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Advertise With Us | RealNaijaGist Media Network',
  description: 'Reach millions of engaged Nigerian readers with targeted advertising on RealNaijaGist. View our media kit, ad formats, and pricing options.',
}

const adPackages = [
  {
    name: 'Standard Banner',
    price: 'N25,000',
    period: '/month',
    placements: ['Homepage leaderboard', 'Category page sidebar', 'Search results'],
    formats: ['728x90 Leaderboard', '300x250 Rectangle', '320x50 Mobile banner'],
    reach: '~50,000 impressions',
    color: 'from-slate-800 to-slate-900',
    border: 'border-slate-700',
    badge: null,
  },
  {
    name: 'Premium Spotlight',
    price: 'N75,000',
    period: '/month',
    placements: ['Homepage hero section', 'Article body (mid-content)', 'Newsletter mention'],
    formats: ['300x600 Half Page', '970x250 Billboard', 'Inline article ad'],
    reach: '~200,000 impressions',
    color: 'from-emerald-950 to-slate-900',
    border: 'border-emerald-500/50',
    badge: 'Most Popular',
  },
  {
    name: 'Brand Partnership',
    price: 'Custom',
    period: 'package',
    placements: ['Sponsored editorial articles', 'Social media amplification', 'Newsletter dedicated send', 'Homepage takeover'],
    formats: ['Branded content', 'Sponsored posts', 'Video pre-roll', 'Push notifications'],
    reach: '500,000+ total reach',
    color: 'from-purple-950 to-slate-900',
    border: 'border-purple-500/50',
    badge: 'Enterprise',
  },
]

const audienceStats = [
  { label: 'Monthly Readers', value: '300K+', icon: '👥' },
  { label: 'Page Views / Month', value: '1.2M+', icon: '📊' },
  { label: 'Newsletter Subscribers', value: '18K+', icon: '📧' },
  { label: 'Avg. Session Duration', value: '4.2 min', icon: '⏱️' },
  { label: 'Mobile Traffic', value: '78%', icon: '📱' },
  { label: 'Nigeria-Based Readers', value: '85%', icon: '🇳🇬' },
]

const audienceDemo = [
  { label: 'Age 18-34', percent: 52 },
  { label: 'Age 35-54', percent: 33 },
  { label: '55 and above', percent: 15 },
]

export default function AdvertisePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-16">
      {/* Hero Header */}
      <header className="text-center space-y-4">
        <span className="text-xs uppercase font-bold text-emerald-400 tracking-widest">Media Kit & Advertising</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
          Reach <span className="text-emerald-400">Nigeria&apos;s</span> Most Engaged Digital Audience
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          RealNaijaGist connects brands with over 300,000 monthly readers across Nigeria and the African diaspora — passionate, young, digitally-native Nigerians who consume news, entertainment, and culture daily.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a href="mailto:ads@realnaijagist.com" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20">
            Request Media Kit
          </a>
          <a href="#packages" className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition border border-slate-700">
            View Ad Packages
          </a>
        </div>
      </header>

      {/* Audience Stats */}
      <section>
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-emerald-500 rounded-full inline-block" />
          Our Audience by the Numbers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {audienceStats.map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1.5">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-lg sm:text-xl font-black text-emerald-400">{stat.value}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audience Demographics */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-black text-white mb-6">Audience Demographics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age Breakdown</p>
            {audienceDemo.map((demo) => (
              <div key={demo.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{demo.label}</span>
                  <span className="text-emerald-400 font-bold">{demo.percent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full" style={{ width: `${demo.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Top Reader Interests</p>
            {['Breaking News & Politics', 'Nollywood & Entertainment', 'Nigerian Football & Sports', 'Economy & Fintech', 'Lifestyle & Fashion', 'African Diaspora Stories'].map((interest) => (
              <div key={interest} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 text-slate-300 text-xs font-medium">
                {interest}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Packages */}
      <section id="packages">
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-amber-400 rounded-full inline-block" />
          Advertising Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {adPackages.map((pkg) => (
            <div key={pkg.name} className={`relative bg-gradient-to-b ${pkg.color} border ${pkg.border} rounded-2xl p-5 sm:p-6 flex flex-col space-y-5`}>
              {pkg.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                  {pkg.badge}
                </span>
              )}
              <div>
                <h3 className="text-base font-black text-white">{pkg.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-emerald-400">{pkg.price}</span>
                  <span className="text-xs text-slate-400">{pkg.period}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{pkg.reach}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Placements</p>
                <ul className="space-y-1.5">
                  {pkg.placements.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-emerald-400 mt-0.5">✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Ad Formats</p>
                <ul className="space-y-1.5">
                  {pkg.formats.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-slate-500 mt-0.5">→</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <a href="mailto:ads@realnaijagist.com" className="mt-auto w-full text-center py-2.5 rounded-xl text-xs font-bold transition bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md">
                Get Started
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Why Advertise */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-black text-white mb-5">Why Advertise on RealNaijaGist?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
          {[
            { icon: '🎯', title: 'Hyper-Targeted Nigerian Audience', desc: 'Reach verified Nigerian readers who are actively engaged with local news, culture, and commerce.' },
            { icon: '📱', title: 'Mobile-First Platform', desc: '78% of our traffic is mobile, perfectly suited for modern performance and awareness campaigns.' },
            { icon: '📰', title: 'Brand-Safe Editorial Environment', desc: 'All ads appear alongside fact-checked, verified editorial content — protecting your brand reputation.' },
            { icon: '📊', title: 'Transparent Reporting', desc: 'Receive detailed weekly campaign reports including impressions, CTR, and audience engagement metrics.' },
            { icon: '🚀', title: 'Fast Campaign Setup', desc: 'Go live within 24 hours of campaign approval. No long lead times or complex tech requirements.' },
            { icon: '💬', title: 'Dedicated Account Manager', desc: 'Every advertiser gets a dedicated contact for campaign optimization and real-time support.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="font-bold text-white text-xs mb-1">{item.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-10 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Ready to Grow Your Brand in Nigeria?</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Our advertising team is available Monday to Friday, 9am to 6pm WAT. We typically respond within 4 business hours.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="mailto:ads@realnaijagist.com" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition shadow-xl shadow-emerald-500/20">
            Email: ads@realnaijagist.com
          </a>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition border border-slate-700">
            Use Contact Form
          </Link>
        </div>
        <p className="text-[11px] text-slate-500 pt-2">
          All advertising is subject to our{' '}
          <Link href="/terms" className="text-slate-400 hover:text-emerald-400 underline">advertising terms and editorial guidelines</Link>.
          We do not accept ads for adult content, gambling, or misleading financial products.
        </p>
      </section>
    </div>
  )
}
