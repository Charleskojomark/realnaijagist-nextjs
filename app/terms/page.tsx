import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | RealNaijaGist',
  description: 'Terms and conditions governing the use of RealNaijaGist digital media platforms.',
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-8 text-slate-300 text-sm leading-relaxed">
      <header className="border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Legal</span>
        <h1 className="text-3xl font-black text-white mt-1">Terms of Service</h1>
        <p className="text-xs text-slate-400 mt-2">Effective Date: September 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
        <p>
          By accessing or reading RealNaijaGist (realnaijagist.com), you agree to comply with and be bound by these Terms of Service and all applicable Nigerian and international laws.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">2. Intellectual Property</h2>
        <p>
          All original articles, editorial commentary, logos, graphics, and design elements published on RealNaijaGist are the copyrighted property of RealNaijaGist Media Network unless otherwise cited. Syndication or republication without explicit attribution and backlink is strictly prohibited.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">3. User Conduct &amp; Comments</h2>
        <p>
          Readers participating in public comments must refrain from hate speech, defamatory comments, incitement to violence, and spam. RealNaijaGist reserves the right to moderate or delete comments violating community standards.
        </p>
      </section>
    </div>
  )
}