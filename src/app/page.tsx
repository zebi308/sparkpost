import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'DM Sans', sans-serif", minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: '1px solid #1f1f1f', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>⚡</span>
          <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: '20px', color: '#fff' }}>SparkPost</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/login" style={{ color: '#999', fontSize: '14px', textDecoration: 'none' }}>Log in</Link>
          <Link href="/login" style={{ background: '#fff', color: '#0a0a0a', padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>Get started free →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ textAlign: 'center', padding: '100px 48px 80px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '99px', padding: '6px 16px', fontSize: '12px', color: '#888', marginBottom: '32px', letterSpacing: '0.5px' }}>
          <span style={{ color: '#f59e0b' }}>⚡</span> AI-powered Instagram automation for fashion brands
        </div>
        <h1 style={{ fontSize: '64px', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '24px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: '#fff' }}>
          Your store posts itself.<br />
          <span style={{ color: '#f59e0b' }}>Every day. Automatically.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#888', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 40px' }}>
          Connect your Shopify store, and SparkPost uses AI to pick a product, write the caption, generate a cinematic fashion ad, and post it to Instagram — on autopilot.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ background: '#f59e0b', color: '#0a0a0a', padding: '14px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>Start for free →</Link>
          <a href="#how-it-works" style={{ color: '#888', fontSize: '14px', textDecoration: 'none', padding: '14px 20px' }}>See how it works ↓</a>
        </div>
        <p style={{ marginTop: '20px', fontSize: '12px', color: '#555' }}>No credit card required · Free plan includes 20 posts/month</p>
      </section>

      {/* ── PIPELINE VISUAL ── */}
      <section style={{ padding: '0 48px 100px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { icon: '🛍️', label: 'Shopify', sub: 'Fetch products' },
            { icon: '→', label: '', sub: '', arrow: true },
            { icon: '🤖', label: 'Gemini AI', sub: 'Write caption' },
            { icon: '→', label: '', sub: '', arrow: true },
            { icon: '🎨', label: 'AI Image', sub: 'Fashion ad' },
            { icon: '→', label: '', sub: '', arrow: true },
            { icon: '📸', label: 'Instagram', sub: 'Auto publish' },
          ].map((s, i) => s.arrow ? (
            <div key={i} style={{ color: '#333', fontSize: '20px' }}>→</div>
          ) : (
            <div key={i} style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#e0e0e0' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '80px 48px', borderTop: '1px solid #1a1a1a', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>How it works</p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: '44px', color: '#fff', letterSpacing: '-1px' }}>Set it up once.<br />Post forever.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[
            { num: '01', title: 'Connect your store', desc: 'Link your Shopify store with one click using OAuth. No tokens to copy, no dev work needed.' },
            { num: '02', title: 'Configure your brand', desc: 'Add your logo, hashtags, posting schedule, and AI prompt preferences. Takes 3 minutes.' },
            { num: '03', title: 'Watch posts go live', desc: 'SparkPost picks a product, writes the caption, generates a fashion ad image, and posts it automatically.' },
          ].map((s) => (
            <div key={s.num} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '14px', padding: '32px' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '48px', fontWeight: 300, color: '#2a2a2a', lineHeight: 1, marginBottom: '20px' }}>{s.num}</div>
              <h3 style={{ fontSize: '17px', fontWeight: 500, color: '#fff', marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 48px', borderTop: '1px solid #1a1a1a', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Features</p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: '44px', color: '#fff', letterSpacing: '-1px' }}>Everything your brand needs<br />to stay consistent.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {[
            { icon: '⚡', title: 'AI caption writing', desc: 'Gemini writes bold, on-brand Instagram captions with emojis, CTAs, and hashtags — every time.' },
            { icon: '🎨', title: 'Cinematic ad generation', desc: 'Your product image is transformed into a premium 1:1 fashion advertisement with your logo and a scene.' },
            { icon: '🛍️', title: 'Shopify integration', desc: 'Connects directly to your store. Picks products intelligently, skips excluded types, always picks something fresh.' },
            { icon: '📅', title: 'Auto scheduling', desc: 'Set your posting days and time. SparkPost fires the pipeline automatically — no crons to manage.' },
            { icon: '🏪', title: 'Multi-brand support', desc: 'Run multiple stores from one account. Each brand has its own credentials, schedule, and content style.' },
            { icon: '📊', title: 'Run logs & history', desc: 'Every pipeline run is logged. See exactly what was posted, when, and why something failed if it does.' },
          ].map((f) => (
            <div key={f.title} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '14px', padding: '28px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '24px', flexShrink: 0 }}>{f.icon}</div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#e0e0e0', marginBottom: '6px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section style={{ padding: '80px 48px', borderTop: '1px solid #1a1a1a', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Who it&apos;s for</p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: '44px', color: '#fff', letterSpacing: '-1px' }}>Built for fashion brands<br />who move fast.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { emoji: '👗', title: 'Solo brand owners', desc: 'You run the whole store yourself. SparkPost handles Instagram so you can focus on products and customers.' },
            { emoji: '📦', title: 'Shopify store owners', desc: 'Already on Shopify? Connect in one click. SparkPost pulls your products and starts posting automatically.' },
            { emoji: '🏢', title: 'Agencies', desc: 'Manage Instagram content for multiple fashion brand clients from one dashboard. Each brand runs independently.' },
          ].map((w) => (
            <div key={w.title} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '14px', padding: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{w.emoji}</div>
              <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#e0e0e0', marginBottom: '8px' }}>{w.title}</h3>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.7 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '80px 48px', borderTop: '1px solid #1a1a1a', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Pricing</p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: '44px', color: '#fff', letterSpacing: '-1px' }}>Simple pricing.<br />No surprises.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            {
              name: 'Free', price: '$0', period: 'forever', desc: 'Perfect for testing',
              features: ['20 posts / month', '1 brand', 'Shopify + Gemini + Zernio', 'Run logs', 'Email support'],
              cta: 'Get started free', highlight: false,
            },
            {
              name: 'Growth', price: '$19', period: '/month', desc: 'For active brands',
              features: ['200 posts / month', '3 brands', 'Everything in Free', 'Priority support', 'Custom AI prompts'],
              cta: 'Start Growth', highlight: true,
            },
            {
              name: 'Agency', price: '$49', period: '/month', desc: 'For agencies & teams',
              features: ['Unlimited posts', 'Unlimited brands', 'Everything in Growth', 'Dedicated support', 'Early access to features'],
              cta: 'Start Agency', highlight: false,
            },
          ].map((p) => (
            <div key={p.name} style={{
              background: p.highlight ? '#f59e0b' : '#111',
              border: `1px solid ${p.highlight ? '#f59e0b' : '#1f1f1f'}`,
              borderRadius: '14px', padding: '32px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: p.highlight ? '#7a4f00' : '#888', marginBottom: '8px' }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '40px', fontWeight: 300, color: p.highlight ? '#0a0a0a' : '#fff' }}>{p.price}</span>
                <span style={{ fontSize: '13px', color: p.highlight ? '#7a4f00' : '#555' }}>{p.period}</span>
              </div>
              <div style={{ fontSize: '12px', color: p.highlight ? '#7a4f00' : '#555', marginBottom: '24px' }}>{p.desc}</div>
              <div style={{ borderTop: `1px solid ${p.highlight ? '#d97706' : '#1f1f1f'}`, paddingTop: '20px', marginBottom: '24px' }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '13px', color: p.highlight ? '#0a0a0a' : '#888' }}>
                    <span style={{ color: p.highlight ? '#7a4f00' : '#f59e0b', fontSize: '11px' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <Link href="/login" style={{
                display: 'block', textAlign: 'center', padding: '12px',
                background: p.highlight ? '#0a0a0a' : '#1f1f1f',
                color: p.highlight ? '#f59e0b' : '#e0e0e0',
                borderRadius: '8px', fontSize: '14px', fontWeight: 500, textDecoration: 'none',
              }}>{p.cta} →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 48px', textAlign: 'center', borderTop: '1px solid #1a1a1a' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: '52px', color: '#fff', letterSpacing: '-1.5px', marginBottom: '20px' }}>
          Ready to spark your<br /><span style={{ color: '#f59e0b' }}>Instagram growth?</span>
        </h2>
        <p style={{ color: '#666', fontSize: '17px', marginBottom: '36px' }}>Connect your store in 5 minutes. Start posting on autopilot today.</p>
        <Link href="/login" style={{ background: '#f59e0b', color: '#0a0a0a', padding: '16px 36px', borderRadius: '10px', fontSize: '16px', fontWeight: 600, textDecoration: 'none' }}>
          Get started free →
        </Link>
        <p style={{ marginTop: '16px', fontSize: '12px', color: '#444' }}>No credit card required · Cancel anytime</p>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: '16px', color: '#fff' }}>SparkPost</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy Policy', 'Terms of Service', 'Contact'].map((l) => (
            <a key={l} href="#" style={{ color: '#555', fontSize: '13px', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <p style={{ color: '#444', fontSize: '12px' }}>© 2026 SparkPost. All rights reserved.</p>
      </footer>

    </div>
  )
}