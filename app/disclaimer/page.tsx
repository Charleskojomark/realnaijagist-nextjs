import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer & Corrections Policy | RealNaijaGist',
  description: 'Read our editorial disclaimer, corrections policy, and fact-checking standards at RealNaijaGist.',
}

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-10">
      <header className="space-y-3 border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Editorial Transparency</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Disclaimer & Corrections Policy
        </h1>
        <p className="text-slate-400 text-sm">Last updated: September 2026</p>
      </header>

      <div className="prose prose-invert prose-emerald max-w-none text-slate-300 space-y-8 text-sm sm:text-base leading-relaxed">

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Content Disclaimer</h2>
          <p>
            RealNaijaGist publishes both original reporting and curated news summaries from reputable Nigerian and international news sources.
            Where content is sourced or adapted from third-party publishers, it is clearly attributed to the original source.
          </p>
          <p>
            While we strive for accuracy, RealNaijaGist does not guarantee the completeness or timeliness of information published.
            Readers are encouraged to consult primary sources for critical decisions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Corrections Policy</h2>
          <p>
            We are committed to correcting factual errors promptly and transparently. If we publish information that is incorrect:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400">
            <li>Corrections are made to the original article with a visible Editor's Note at the top of the piece.</li>
            <li>The correction note states what was changed and when.</li>
            <li>We do not silently delete or alter content to conceal errors.</li>
            <li>Substantive corrections are logged on our corrections archive.</li>
          </ul>
          <p>
            To report an error, email us at{' '}
            <a href="mailto:realnaijagist123@gmail.com" className="text-emerald-400 hover:underline">
              realnaijagist123@gmail.com
            </a>{' '}
            with subject line "Correction Request".
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Advertising Disclaimer</h2>
          <p>
            RealNaijaGist participates in the Google AdSense program and may display third-party advertisements.
            Advertisements are clearly labelled as "Advertisement" and are separate from editorial content.
            Our editorial decisions are never influenced by advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Affiliate & Sponsored Content</h2>
          <p>
            Any sponsored content or affiliate relationships are clearly disclosed within the article.
            We only partner with brands that align with our editorial values.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">External Links</h2>
          <p>
            Links to external websites are provided for reader convenience and do not constitute an endorsement.
            RealNaijaGist is not responsible for the content or privacy practices of linked websites.
          </p>
        </section>

      </div>
    </div>
  )
}
