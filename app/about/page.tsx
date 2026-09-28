import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us & Editorial Standards | RealNaijaGist',
  description: 'Learn about RealNaijaGist, our mission, verified journalism standards, and editorial leadership.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-10">
      <header className="space-y-3 border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">About Us</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          RealNaijaGist — Credible, Fast &amp; Distinctly Nigerian
        </h1>
        <p className="text-slate-400 text-sm">
          Empowering Nigerian readers with timely, accurate, and deeply engaging journalism.
        </p>
      </header>

      <div className="prose prose-invert prose-emerald max-w-none text-slate-300 space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Who We Are</h2>
          <p>
            RealNaijaGist (founded in Nigeria) is an independent digital news and culture publication dedicated to spotlighting what truly matters across Nigeria and the African diaspora. From politics, economy, and national affairs to Nollywood, Afrobeat culture, technology, and sports, our editorial team works tirelessly to deliver objective reporting and vibrant commentary.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Our Editorial Policy &amp; Ethics</h2>
          <p>
            At RealNaijaGist, credibility is our foundation. We adhere strictly to verified sourcing, fact-checking, and journalistic balance. We do not publish unverified gossip as fact; when covering developing stories or trending social debates, we clearly delineate confirmed reports from ongoing discussions.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400">
            <li><strong>Accuracy:</strong> Every factual claim is cross-referenced with primary sources, official statements, or eyewitness records.</li>
            <li><strong>Fairness &amp; Impartiality:</strong> We provide fair opportunity for all subjects of critical reporting to respond.</li>
            <li><strong>Corrections Transparency:</strong> When errors occur, we correct them swiftly and transparently with an editor&apos;s note.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Publishing Team &amp; Contact</h2>
          <p>
            Our newsroom operates 24/7 across Lagos, Abuja, and Port Harcourt. For news tips, press releases, or inquiries, reach out directly to our editorial desk at <a href="mailto:realnaijagist123@gmail.com" className="text-emerald-400 hover:underline">realnaijagist123@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}