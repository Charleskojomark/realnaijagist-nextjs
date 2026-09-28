import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy & Cookie Disclosure | RealNaijaGist',
  description: 'RealNaijaGist Privacy Policy, Cookie Policy, Google AdSense disclosures, and data protection guidelines.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-8 text-slate-300 text-sm leading-relaxed">
      <header className="border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Compliance</span>
        <h1 className="text-3xl font-black text-white mt-1">Privacy &amp; Cookie Policy</h1>
        <p className="text-xs text-slate-400 mt-2">Last Updated: September 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">1. Introduction</h2>
        <p>
          RealNaijaGist (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects the privacy of our visitors and users. This Privacy Policy details the types of personal data we collect, how it is used, and how you can manage your preferences.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">2. Google AdSense &amp; Advertising Partners</h2>
        <p>
          We use Google AdSense and third-party advertising vendors to serve advertisements when you visit our website. These companies may use cookies, web beacons, and similar tracking technologies to collect information (such as your browser type, time and date of visit, and content viewed) to deliver personalized ads based on your prior visits to this and other websites.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
          <li>Google&apos;s use of the DoubleClick cookie enables it and its partners to serve ads to users based on their visit to our site and/or other sites on the Internet.</li>
          <li>You may opt out of personalized advertising by visiting Google Ads Settings (<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">google.com/settings/ads</a>).</li>
          <li>Alternatively, you can opt out of third-party vendor cookies by visiting the Network Advertising Initiative opt-out page.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">3. Log Files &amp; Analytics</h2>
        <p>
          Like most modern websites, RealNaijaGist utilizes standard log files. Information inside the log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and number of clicks. This information is analyzed in aggregate to administer the site and track user movement across the site to enhance reader experience.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">4. Contact Information</h2>
        <p>
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact our Data Protection Officer at <a href="mailto:realnaijagist123@gmail.com" className="text-emerald-400 hover:underline">realnaijagist123@gmail.com</a>.
        </p>
      </section>
    </div>
  )
}