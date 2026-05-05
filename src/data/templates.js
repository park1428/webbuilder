export const TEMPLATES = [
  // Landing Pages
  {
    id: 'landing-saas',
    label: 'SaaS Landing',
    description: 'Modern SaaS product landing page',
    icon: '🚀',
    category: 'landing',
    content: `
<header style="padding: 20px 40px; background: #1a202c; color: white; display: flex; justify-content: space-between; align-items: center;">
  <h1 style="margin: 0; font-size: 22px; font-weight: 700;">YourBrand</h1>
  <nav style="display: flex; gap: 24px; align-items: center;">
    <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 14px;">Features</a>
    <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 14px;">Pricing</a>
    <a href="#" style="padding: 10px 20px; background: #475569; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Get Started</a>
  </nav>
</header>
<section style="padding: 100px 40px; text-align: center; background: linear-gradient(135deg, #475569 0%, #334155 100%); color: white;">
  <h2 style="font-size: 56px; margin: 0 0 20px; font-weight: 800; line-height: 1.1;">Your Big Idea, Here</h2>
  <p style="font-size: 20px; margin: 0 auto 40px; opacity: 0.9; max-width: 580px; line-height: 1.6;">Tell visitors what you do and why it matters. Keep it short and compelling.</p>
  <a href="#" style="display: inline-block; padding: 18px 48px; background: white; color: #334155; border-radius: 50px; font-size: 17px; font-weight: 700; text-decoration: none;">Get Started Free</a>
</section>
<section style="padding: 80px 40px; background: #f7f8fc;">
  <h3 style="text-align: center; font-size: 36px; color: #1a202c; margin: 0 0 50px; font-weight: 700;">Why Choose Us?</h3>
  <div style="display: flex; gap: 24px; max-width: 900px; margin: 0 auto;">
    <div style="flex: 1; text-align: center; padding: 40px 24px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">
      <div style="font-size: 42px; margin-bottom: 16px;">⚡</div>
      <h4 style="color: #1a202c; margin: 0 0 10px; font-size: 18px;">Lightning Fast</h4>
      <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0;">Optimized for the best experience.</p>
    </div>
    <div style="flex: 1; text-align: center; padding: 40px 24px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">
      <div style="font-size: 42px; margin-bottom: 16px;">🛡️</div>
      <h4 style="color: #1a202c; margin: 0 0 10px; font-size: 18px;">Secure</h4>
      <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0;">Built with security first.</p>
    </div>
    <div style="flex: 1; text-align: center; padding: 40px 24px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">
      <div style="font-size: 42px; margin-bottom: 16px;">❤️</div>
      <h4 style="color: #1a202c; margin: 0 0 10px; font-size: 18px;">Loved</h4>
      <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0;">Trusted by thousands.</p>
    </div>
  </div>
</section>
<footer style="padding: 28px 40px; background: #1a202c; color: white; text-align: center;">
  <p style="margin: 0; opacity: 0.6; font-size: 14px;">© 2026 YourBrand. All rights reserved.</p>
</footer>`
  },
  {
    id: 'landing-minimal',
    label: 'Minimal Landing',
    description: 'Clean, minimal single-page design',
    icon: '✨',
    category: 'landing',
    content: `
<section style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px; background: #fafafa;">
  <div style="text-align: center; max-width: 600px;">
    <h1 style="font-size: 56px; margin: 0 0 24px; font-weight: 800; color: #111; letter-spacing: -2px;">Simple. Clean. Effective.</h1>
    <p style="font-size: 18px; color: #666; line-height: 1.8; margin: 0 0 40px;">We help businesses achieve more with less. No fluff, just results.</p>
    <a href="#" style="display: inline-block; padding: 16px 40px; background: #111; color: white; text-decoration: none; font-weight: 600; border-radius: 4px;">Learn More</a>
  </div>
</section>`
  },
  {
    id: 'landing-app',
    label: 'App Landing',
    description: 'Mobile app showcase page',
    icon: '📱',
    category: 'landing',
    content: `
<header style="padding: 20px 40px; background: transparent; position: absolute; width: 100%; box-sizing: border-box; z-index: 10;">
  <nav style="display: flex; justify-content: space-between; align-items: center;">
    <span style="font-weight: 700; font-size: 20px; color: white;">AppName</span>
    <a href="#" style="padding: 10px 24px; background: white; color: #6366f1; text-decoration: none; border-radius: 8px; font-weight: 600;">Download</a>
  </nav>
</header>
<section style="padding: 140px 40px 100px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-align: center;">
  <h1 style="font-size: 48px; margin: 0 0 20px; font-weight: 800;">The App That Changes Everything</h1>
  <p style="font-size: 20px; opacity: 0.9; max-width: 500px; margin: 0 auto 40px; line-height: 1.6;">Simplify your life with our award-winning mobile application.</p>
  <div style="display: flex; gap: 16px; justify-content: center;">
    <a href="#" style="padding: 14px 32px; background: white; color: #6366f1; text-decoration: none; border-radius: 10px; font-weight: 700;">🍎 App Store</a>
    <a href="#" style="padding: 14px 32px; background: rgba(255,255,255,0.15); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; border: 1px solid rgba(255,255,255,0.3);">▶ Play Store</a>
  </div>
</section>`
  },
  // Portfolio
  {
    id: 'portfolio-creative',
    label: 'Creative Portfolio',
    description: 'Showcase your creative work',
    icon: '🎨',
    category: 'portfolio',
    content: `
<header style="padding: 22px 40px; background: #0f0f23; color: white; display: flex; justify-content: space-between; align-items: center;">
  <h1 style="margin: 0; font-size: 20px; letter-spacing: 3px; font-weight: 700; color: #e2b96f;">PORTFOLIO</h1>
  <nav style="display: flex; gap: 28px;">
    <a href="#" style="color: #e2b96f; text-decoration: none; font-size: 13px; font-weight: 600;">WORK</a>
    <a href="#" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 13px;">ABOUT</a>
    <a href="#" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 13px;">CONTACT</a>
  </nav>
</header>
<section style="padding: 100px 40px; background: #0f0f23; color: white; text-align: center;">
  <p style="color: #e2b96f; font-size: 12px; letter-spacing: 4px; margin: 0 0 20px; font-weight: 600;">CREATIVE PROFESSIONAL</p>
  <h2 style="font-size: 56px; margin: 0 0 20px; font-weight: 800;">Hi, I'm <span style="color: #e2b96f;">Your Name</span></h2>
  <p style="font-size: 20px; color: rgba(255,255,255,0.75); max-width: 500px; margin: 0 auto 40px;">Designer & Developer crafting digital experiences.</p>
  <a href="#" style="display: inline-block; padding: 14px 44px; border: 2px solid #e2b96f; color: #e2b96f; border-radius: 4px; text-decoration: none; font-weight: 700;">VIEW MY WORK</a>
</section>
<section style="padding: 70px 40px; background: #f8f8f8;">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 900px; margin: 0 auto;">
    <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); background: white;">
      <div style="height: 200px; background: linear-gradient(135deg, #475569 0%, #334155 100%);"></div>
      <div style="padding: 20px;"><h4 style="margin: 0 0 6px; font-size: 16px;">Project One</h4><p style="margin: 0; color: #999; font-size: 12px;">Web Design</p></div>
    </div>
    <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); background: white;">
      <div style="height: 200px; background: linear-gradient(135deg, #e2b96f 0%, #d4a84b 100%);"></div>
      <div style="padding: 20px;"><h4 style="margin: 0 0 6px; font-size: 16px;">Project Two</h4><p style="margin: 0; color: #999; font-size: 12px;">Branding</p></div>
    </div>
    <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); background: white;">
      <div style="height: 200px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);"></div>
      <div style="padding: 20px;"><h4 style="margin: 0 0 6px; font-size: 16px;">Project Three</h4><p style="margin: 0; color: #999; font-size: 12px;">Photography</p></div>
    </div>
  </div>
</section>`
  },
  {
    id: 'portfolio-dev',
    label: 'Developer Portfolio',
    description: 'Showcase coding projects',
    icon: '💻',
    category: 'portfolio',
    content: `
<section style="min-height: 100vh; background: #0d1117; color: white; padding: 40px;">
  <nav style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 100px;">
    <span style="font-size: 20px; font-weight: 700;">{"<dev/>"}</span>
    <div style="display: flex; gap: 32px;">
      <a href="#" style="color: #8b949e; text-decoration: none;">Projects</a>
      <a href="#" style="color: #8b949e; text-decoration: none;">About</a>
      <a href="#" style="color: #8b949e; text-decoration: none;">Contact</a>
    </div>
  </nav>
  <div style="max-width: 800px;">
    <p style="color: #58a6ff; font-size: 16px; margin: 0 0 16px;">Hi, my name is</p>
    <h1 style="font-size: 64px; margin: 0 0 16px; font-weight: 700;">Your Name.</h1>
    <h2 style="font-size: 48px; margin: 0 0 24px; color: #8b949e;">I build things for the web.</h2>
    <p style="font-size: 18px; color: #8b949e; max-width: 540px; line-height: 1.7; margin: 0 0 40px;">Full-stack developer specializing in building exceptional digital experiences.</p>
    <a href="#" style="display: inline-block; padding: 16px 32px; border: 1px solid #58a6ff; color: #58a6ff; text-decoration: none; border-radius: 4px;">Check out my work</a>
  </div>
</section>`
  },
  // Business
  {
    id: 'business-corporate',
    label: 'Corporate',
    description: 'Professional business website',
    icon: '🏢',
    category: 'business',
    content: `
<header style="padding: 16px 40px; background: white; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
  <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #1a365d;">COMPANY</h1>
  <nav style="display: flex; gap: 32px; align-items: center;">
    <a href="#" style="color: #4a5568; text-decoration: none; font-size: 14px;">Services</a>
    <a href="#" style="color: #4a5568; text-decoration: none; font-size: 14px;">About</a>
    <a href="#" style="padding: 10px 24px; background: #2b6cb0; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Contact Us</a>
  </nav>
</header>
<section style="padding: 100px 40px; background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%); color: white;">
  <div style="max-width: 800px;">
    <h2 style="font-size: 48px; margin: 0 0 20px; font-weight: 700;">Enterprise Solutions for Modern Business</h2>
    <p style="font-size: 18px; opacity: 0.9; line-height: 1.7; margin: 0 0 32px; max-width: 600px;">Transform your operations with cutting-edge technology and proven strategies.</p>
    <a href="#" style="display: inline-block; padding: 16px 40px; background: white; color: #1a365d; text-decoration: none; border-radius: 6px; font-weight: 700;">Get Started</a>
  </div>
</section>
<section style="padding: 80px 40px; background: white;">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 1000px; margin: 0 auto;">
    <div style="padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px;"><h4 style="font-size: 20px; color: #1a365d; margin: 0 0 12px;">Consulting</h4><p style="color: #718096; font-size: 15px; margin: 0;">Strategic guidance for growth.</p></div>
    <div style="padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px;"><h4 style="font-size: 20px; color: #1a365d; margin: 0 0 12px;">Development</h4><p style="color: #718096; font-size: 15px; margin: 0;">Custom software solutions.</p></div>
    <div style="padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px;"><h4 style="font-size: 20px; color: #1a365d; margin: 0 0 12px;">Support</h4><p style="color: #718096; font-size: 15px; margin: 0;">24/7 dedicated support.</p></div>
  </div>
</section>`
  },
  {
    id: 'business-agency',
    label: 'Digital Agency',
    description: 'Creative agency website',
    icon: '🎯',
    category: 'agency',
    content: `
<section style="min-height: 100vh; background: radial-gradient(ellipse at 95% 5%, rgba(124,58,237,0.22) 0%, transparent 40%), radial-gradient(ellipse at 5% 95%, rgba(244,63,94,0.12) 0%, transparent 35%), #080808; color: white; padding: 0 60px; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <nav style="display: flex; justify-content: space-between; align-items: center; padding: 32px 0; position: relative; z-index: 1;">
    <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: white;">NŌVUS<span style="color: #7c3aed;">.</span></span>
    <div style="display: flex; align-items: center; gap: 40px;">
      <a href="#" style="color: rgba(255,255,255,0.55); text-decoration: none; font-size: 14px; font-weight: 500;">Work</a>
      <a href="#" style="color: rgba(255,255,255,0.55); text-decoration: none; font-size: 14px; font-weight: 500;">Services</a>
      <a href="#" style="color: rgba(255,255,255,0.55); text-decoration: none; font-size: 14px; font-weight: 500;">About</a>
      <a href="#" style="padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px;">Let's Talk →</a>
    </div>
  </nav>
  <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 60px 0 80px; position: relative; z-index: 1; max-width: 1000px;">
    <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); padding: 8px 16px; border-radius: 20px; width: fit-content; margin-bottom: 32px;">
      <span style="width: 6px; height: 6px; border-radius: 50%; background: #7c3aed; display: inline-block; font-size: 0; line-height: 0;">&#8203;</span>
      <span style="font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 500;">Now accepting projects — 2025</span>
    </div>
    <h1 style="font-size: 88px; font-weight: 900; line-height: 0.93; letter-spacing: -4px; margin: 0 0 32px; color: white;">We Build<br/><span style="background: linear-gradient(135deg, #a78bfa 0%, #f43f5e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Remarkable</span><br/>Digital Brands</h1>
    <p style="font-size: 20px; color: rgba(255,255,255,0.5); line-height: 1.7; margin: 0 0 48px; max-width: 480px;">Strategy, design, and code that makes your brand impossible to ignore.</p>
    <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
      <a href="#" style="display: inline-flex; align-items: center; gap: 10px; padding: 18px 36px; background: white; color: #080808; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 8px;">See Our Work →</a>
      <a href="#" style="display: inline-flex; align-items: center; gap: 10px; padding: 18px 36px; border: 1px solid rgba(255,255,255,0.18); color: white; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">Start a Project</a>
    </div>
    <div style="margin-top: 80px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.07);">
      <p style="font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 2.5px; text-transform: uppercase; margin: 0 0 20px; font-weight: 600;">Trusted by leading brands</p>
      <div style="display: flex; gap: 48px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 17px; font-weight: 800; color: rgba(255,255,255,0.18); letter-spacing: -0.5px;">ACME CO</span>
        <span style="font-size: 17px; font-weight: 800; color: rgba(255,255,255,0.18); letter-spacing: -0.5px;">VERTEX</span>
        <span style="font-size: 17px; font-weight: 800; color: rgba(255,255,255,0.18); letter-spacing: -0.5px;">LUMEN</span>
        <span style="font-size: 17px; font-weight: 800; color: rgba(255,255,255,0.18); letter-spacing: -0.5px;">PRISM</span>
        <span style="font-size: 17px; font-weight: 800; color: rgba(255,255,255,0.18); letter-spacing: -0.5px;">APEX</span>
      </div>
    </div>
  </div>
</section>

<section style="background: #080808; padding: 120px 60px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 56px;">
    <div>
      <p style="font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 3px; text-transform: uppercase; margin: 0 0 16px; font-weight: 600;">Our Work</p>
      <h2 style="font-size: 56px; font-weight: 800; line-height: 1; letter-spacing: -2px; margin: 0; color: white;">Selected<br/>Projects</h2>
    </div>
    <a href="#" style="color: rgba(255,255,255,0.5); text-decoration: none; font-weight: 600; font-size: 15px; white-space: nowrap; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.2);">View all →</a>
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
    <div style="background: radial-gradient(ellipse at 90% 10%, rgba(124,58,237,0.38) 0%, transparent 50%), linear-gradient(145deg, #1a0533 0%, #0d0015 100%); border-radius: 20px; cursor: pointer; position: relative; min-height: 380px; display: flex; flex-direction: column; justify-content: flex-end; padding: 36px; border: 1px solid rgba(124,58,237,0.2);">
      <div style="position: absolute; top: 36px; right: 36px; width: 64px; height: 64px; background: rgba(124,58,237,0.2); border-radius: 16px; border: 1px solid rgba(124,58,237,0.4); display: flex; align-items: center; justify-content: center; font-size: 28px;">◈</div>
      <div style="position: relative; z-index: 1;">
        <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
          <span style="padding: 5px 12px; background: rgba(124,58,237,0.25); border: 1px solid rgba(124,58,237,0.45); border-radius: 20px; font-size: 12px; color: #a78bfa; font-weight: 600;">Brand Identity</span>
          <span style="padding: 5px 12px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; font-size: 12px; color: rgba(255,255,255,0.45); font-weight: 500;">2024</span>
        </div>
        <h3 style="font-size: 30px; font-weight: 800; margin: 0 0 8px; letter-spacing: -1px; color: white;">Vertex Finance</h3>
        <p style="font-size: 14px; color: rgba(255,255,255,0.45); margin: 0; line-height: 1.6;">Complete brand overhaul for a Series B fintech startup</p>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="background: radial-gradient(circle at 15% 15%, rgba(16,185,129,0.28) 0%, transparent 55%), linear-gradient(145deg, #00150a 0%, #001520 100%); border-radius: 20px; cursor: pointer; flex: 1; display: flex; flex-direction: column; justify-content: flex-end; padding: 32px; border: 1px solid rgba(16,185,129,0.15); min-height: 175px;">
        <div>
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <span style="padding: 4px 11px; background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.4); border-radius: 20px; font-size: 11px; color: #34d399; font-weight: 600;">Web Design</span>
          </div>
          <h3 style="font-size: 22px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.5px; color: white;">Lumen Health</h3>
          <p style="font-size: 13px; color: rgba(255,255,255,0.45); margin: 0;">Mental wellness platform</p>
        </div>
      </div>
      <div style="background: radial-gradient(circle at 85% 15%, rgba(249,115,22,0.25) 0%, transparent 55%), linear-gradient(145deg, #150800 0%, #0a0300 100%); border-radius: 20px; cursor: pointer; flex: 1; display: flex; flex-direction: column; justify-content: flex-end; padding: 32px; border: 1px solid rgba(249,115,22,0.15); min-height: 175px;">
        <div>
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <span style="padding: 4px 11px; background: rgba(249,115,22,0.2); border: 1px solid rgba(249,115,22,0.4); border-radius: 20px; font-size: 11px; color: #fb923c; font-weight: 600;">E-Commerce</span>
          </div>
          <h3 style="font-size: 22px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.5px; color: white;">Prism Studio</h3>
          <p style="font-size: 13px; color: rgba(255,255,255,0.45); margin: 0;">Luxury goods online experience</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section style="background: #0c0c0c; padding: 120px 60px; border-top: 1px solid rgba(255,255,255,0.05); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <p style="font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 3px; text-transform: uppercase; margin: 0 0 16px; font-weight: 600;">What We Do</p>
  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 64px; gap: 40px;">
    <h2 style="font-size: 56px; font-weight: 800; line-height: 1; letter-spacing: -2px; margin: 0; color: white; flex-shrink: 0;">Services Built<br/>for Impact</h2>
    <p style="max-width: 320px; color: rgba(255,255,255,0.45); font-size: 16px; line-height: 1.7; margin: 0;">Every project starts with understanding your goals — and ends with measurable results.</p>
  </div>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07);">
    <div style="background: #0c0c0c; padding: 44px 40px; display: flex; flex-direction: column; gap: 24px;">
      <div style="font-size: 40px; font-weight: 900; color: rgba(255,255,255,0.08); line-height: 1; font-variant-numeric: tabular-nums;">01</div>
      <div>
        <h3 style="font-size: 21px; font-weight: 700; margin: 0 0 12px; color: white; letter-spacing: -0.3px;">Brand Strategy</h3>
        <p style="font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.75; margin: 0;">Positioning, messaging, and visual identity systems that make your brand unforgettable.</p>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">Identity</span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">Messaging</span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">Systems</span>
      </div>
    </div>
    <div style="background: #0c0c0c; padding: 44px 40px; display: flex; flex-direction: column; gap: 24px;">
      <div style="font-size: 40px; font-weight: 900; color: rgba(255,255,255,0.08); line-height: 1;">02</div>
      <div>
        <h3 style="font-size: 21px; font-weight: 700; margin: 0 0 12px; color: white; letter-spacing: -0.3px;">Digital Design</h3>
        <p style="font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.75; margin: 0;">Websites, apps, and interfaces as functional as they are visually stunning.</p>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">UI/UX</span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">Prototyping</span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">Motion</span>
      </div>
    </div>
    <div style="background: #0c0c0c; padding: 44px 40px; display: flex; flex-direction: column; gap: 24px;">
      <div style="font-size: 40px; font-weight: 900; color: rgba(255,255,255,0.08); line-height: 1;">03</div>
      <div>
        <h3 style="font-size: 21px; font-weight: 700; margin: 0 0 12px; color: white; letter-spacing: -0.3px;">Development</h3>
        <p style="font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.75; margin: 0;">Pixel-perfect, high-performance builds with modern tech that scales with your ambition.</p>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">React</span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">Next.js</span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">CMS</span>
      </div>
    </div>
  </div>
</section>

<section style="background: #080808; padding: 100px 60px; border-top: 1px solid rgba(255,255,255,0.05); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center;">
    <div>
      <div style="font-size: 72px; font-weight: 900; background: linear-gradient(135deg, #a78bfa, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; margin-bottom: 12px; letter-spacing: -3px;">120+</div>
      <p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; font-weight: 500; letter-spacing: 0.3px;">Projects delivered</p>
    </div>
    <div>
      <div style="font-size: 72px; font-weight: 900; background: linear-gradient(135deg, #f43f5e, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; margin-bottom: 12px; letter-spacing: -3px;">8yrs</div>
      <p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; font-weight: 500; letter-spacing: 0.3px;">In the industry</p>
    </div>
    <div>
      <div style="font-size: 72px; font-weight: 900; background: linear-gradient(135deg, #10b981, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; margin-bottom: 12px; letter-spacing: -3px;">98%</div>
      <p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; font-weight: 500; letter-spacing: 0.3px;">Client satisfaction</p>
    </div>
    <div>
      <div style="font-size: 72px; font-weight: 900; background: linear-gradient(135deg, #f59e0b, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; margin-bottom: 12px; letter-spacing: -3px;">24</div>
      <p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; font-weight: 500; letter-spacing: 0.3px;">Industry awards</p>
    </div>
  </div>
</section>

<section style="background: #0c0c0c; padding: 120px 60px; border-top: 1px solid rgba(255,255,255,0.05); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 760px; margin: 0 auto; text-align: center;">
    <div style="font-size: 72px; line-height: 0.7; color: #7c3aed; font-family: Georgia, 'Times New Roman', serif; margin-bottom: 36px; opacity: 0.9;">"</div>
    <p style="font-size: 28px; font-weight: 600; line-height: 1.45; color: white; letter-spacing: -0.5px; margin: 0 0 48px;">Working with this team completely transformed how we show up online. The result was 3× more qualified leads in the very first month.</p>
    <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
      <div style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #4f46e5); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; color: white; flex-shrink: 0;">S</div>
      <div style="text-align: left;">
        <p style="font-weight: 700; color: white; margin: 0; font-size: 15px;">Sarah Chen</p>
        <p style="color: rgba(255,255,255,0.4); margin: 3px 0 0; font-size: 13px;">CEO, Vertex Finance</p>
      </div>
    </div>
  </div>
</section>

<section style="background: radial-gradient(circle at 50% 50%, rgba(124,58,237,0.2) 0%, transparent 50%), linear-gradient(145deg, #2e0a6b 0%, #1e1b4b 40%, #080808 100%); padding: 140px 60px; text-align: center; border-top: 1px solid rgba(124,58,237,0.25); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div>
    <p style="font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 3px; text-transform: uppercase; margin: 0 0 28px; font-weight: 600;">Let's create something great</p>
    <h2 style="font-size: 80px; font-weight: 900; line-height: 0.93; letter-spacing: -3.5px; margin: 0 0 36px; color: white;">Ready to<br/>get started?</h2>
    <p style="font-size: 18px; color: rgba(255,255,255,0.45); margin: 0 auto 52px; max-width: 380px; line-height: 1.7;">We'd love to hear about your project. Schedule a free discovery call — no strings attached.</p>
    <a href="#" style="display: inline-flex; align-items: center; gap: 12px; padding: 20px 52px; background: white; color: #080808; text-decoration: none; font-weight: 800; font-size: 16px; border-radius: 8px; letter-spacing: -0.3px;">Start Your Project →</a>
    <div style="margin-top: 28px;">
      <a href="mailto:hello@novus.studio" style="color: rgba(255,255,255,0.35); text-decoration: none; font-size: 14px; font-weight: 500;">hello@novus.studio</a>
    </div>
  </div>
</section>

<footer style="background: #050505; padding: 44px 60px; border-top: 1px solid rgba(255,255,255,0.05); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;">
    <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: white;">NŌVUS<span style="color: #7c3aed;">.</span></span>
    <div style="display: flex; gap: 32px;">
      <a href="#" style="color: rgba(255,255,255,0.35); text-decoration: none; font-size: 13px; font-weight: 500;">Twitter</a>
      <a href="#" style="color: rgba(255,255,255,0.35); text-decoration: none; font-size: 13px; font-weight: 500;">LinkedIn</a>
      <a href="#" style="color: rgba(255,255,255,0.35); text-decoration: none; font-size: 13px; font-weight: 500;">Dribbble</a>
      <a href="#" style="color: rgba(255,255,255,0.35); text-decoration: none; font-size: 13px; font-weight: 500;">Instagram</a>
    </div>
    <p style="color: rgba(255,255,255,0.2); font-size: 12px; margin: 0;">© 2025 NŌVUS. All rights reserved.</p>
  </div>
</footer>`
  },
  // E-Commerce
  {
    id: 'ecommerce-store',
    label: 'Online Store',
    description: 'E-commerce product showcase',
    icon: '🛒',
    category: 'ecommerce',
    content: `
<header style="padding: 16px 40px; background: white; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
  <h1 style="margin: 0; font-size: 22px; font-weight: 700;">STORE</h1>
  <nav style="display: flex; gap: 28px;">
    <a href="#" style="color: #333; text-decoration: none;">Shop</a>
    <a href="#" style="color: #333; text-decoration: none;">New In</a>
    <a href="#" style="color: #333; text-decoration: none;">🛒 Cart (0)</a>
  </nav>
</header>
<section style="padding: 60px 40px; background: #fafafa;">
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 1200px; margin: 0 auto;">
    <div style="background: white; border-radius: 12px; overflow: hidden;">
      <div style="height: 280px; background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);"></div>
      <div style="padding: 20px;"><h4 style="margin: 0 0 8px; font-size: 15px;">Product Name</h4><p style="margin: 0; font-size: 18px; font-weight: 700;">$99.00</p></div>
    </div>
    <div style="background: white; border-radius: 12px; overflow: hidden;">
      <div style="height: 280px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);"></div>
      <div style="padding: 20px;"><h4 style="margin: 0 0 8px; font-size: 15px;">Product Name</h4><p style="margin: 0; font-size: 18px; font-weight: 700;">$149.00</p></div>
    </div>
    <div style="background: white; border-radius: 12px; overflow: hidden;">
      <div style="height: 280px; background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);"></div>
      <div style="padding: 20px;"><h4 style="margin: 0 0 8px; font-size: 15px;">Product Name</h4><p style="margin: 0; font-size: 18px; font-weight: 700;">$79.00</p></div>
    </div>
    <div style="background: white; border-radius: 12px; overflow: hidden;">
      <div style="height: 280px; background: linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%);"></div>
      <div style="padding: 20px;"><h4 style="margin: 0 0 8px; font-size: 15px;">Product Name</h4><p style="margin: 0; font-size: 18px; font-weight: 700;">$199.00</p></div>
    </div>
  </div>
</section>`
  },
  // Blog
  {
    id: 'blog-minimal',
    label: 'Minimal Blog',
    description: 'Clean personal blog',
    icon: '📝',
    category: 'blog',
    content: `
<header style="padding: 32px 40px; max-width: 720px; margin: 0 auto;">
  <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 700;">The Blog</h1>
  <p style="margin: 0; color: #666; font-size: 16px;">Thoughts on design, code, and life.</p>
</header>
<main style="max-width: 720px; margin: 0 auto; padding: 0 40px 60px;">
  <article style="margin-bottom: 48px; padding-bottom: 48px; border-bottom: 1px solid #eee;">
    <time style="color: #999; font-size: 13px; display: block; margin-bottom: 8px;">March 15, 2026</time>
    <h2 style="margin: 0 0 12px; font-size: 28px;"><a href="#" style="color: #111; text-decoration: none;">The Art of Simple Design</a></h2>
    <p style="color: #555; font-size: 17px; line-height: 1.7; margin: 0 0 16px;">Simplicity is the ultimate sophistication. In this post, I explore how removing the unnecessary leads to more powerful design...</p>
    <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read more →</a>
  </article>
  <article style="margin-bottom: 48px; padding-bottom: 48px; border-bottom: 1px solid #eee;">
    <time style="color: #999; font-size: 13px; display: block; margin-bottom: 8px;">March 10, 2026</time>
    <h2 style="margin: 0 0 12px; font-size: 28px;"><a href="#" style="color: #111; text-decoration: none;">Building Better Products</a></h2>
    <p style="color: #555; font-size: 17px; line-height: 1.7; margin: 0 0 16px;">What makes a product truly great? After years of building software, here are the principles I've learned...</p>
    <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read more →</a>
  </article>
</main>`
  },
  // Personal
  {
    id: 'personal-bio',
    label: 'Personal Bio',
    description: 'Link in bio style page',
    icon: '👤',
    category: 'personal',
    content: `
<section style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%); padding: 40px;">
  <div style="text-align: center; max-width: 400px;">
    <div style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #f472b6 0%, #7c3aed 100%); margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 48px;">👋</div>
    <h1 style="color: white; font-size: 28px; margin: 0 0 8px; font-weight: 700;">Your Name</h1>
    <p style="color: rgba(255,255,255,0.7); font-size: 16px; margin: 0 0 32px;">Designer • Developer • Creator</p>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <a href="#" style="display: block; padding: 16px 24px; background: rgba(255,255,255,0.1); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1);">🌐 My Website</a>
      <a href="#" style="display: block; padding: 16px 24px; background: rgba(255,255,255,0.1); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1);">🐦 Twitter</a>
      <a href="#" style="display: block; padding: 16px 24px; background: rgba(255,255,255,0.1); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1);">📸 Instagram</a>
      <a href="#" style="display: block; padding: 16px 24px; background: rgba(255,255,255,0.1); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1);">💼 LinkedIn</a>
    </div>
  </div>
</section>`
  },
  // Restaurant
  {
    id: 'restaurant-menu',
    label: 'Restaurant',
    description: 'Restaurant with menu',
    icon: '🍽️',
    category: 'restaurant',
    content: `
<header style="padding: 20px 40px; background: #1a1a2e; color: white; display: flex; justify-content: space-between; align-items: center;">
  <h1 style="margin: 0; font-size: 24px; font-weight: 700; font-family: serif;">RISTORANTE</h1>
  <nav style="display: flex; gap: 28px; align-items: center;">
    <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none;">Menu</a>
    <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none;">About</a>
    <a href="#" style="padding: 10px 24px; background: #c9a227; color: #1a1a2e; text-decoration: none; border-radius: 4px; font-weight: 600;">Reserve</a>
  </nav>
</header>
<section style="padding: 120px 40px; background: linear-gradient(rgba(26,26,46,0.85), rgba(26,26,46,0.85)), #1a1a2e; color: white; text-align: center;">
  <p style="color: #c9a227; font-size: 14px; letter-spacing: 4px; margin: 0 0 16px;">WELCOME TO</p>
  <h2 style="font-size: 56px; margin: 0 0 20px; font-family: serif; font-weight: 400;">Fine Dining Experience</h2>
  <p style="font-size: 18px; opacity: 0.9; max-width: 500px; margin: 0 auto 40px;">Authentic cuisine crafted with passion and the finest ingredients.</p>
  <a href="#" style="display: inline-block; padding: 16px 48px; background: #c9a227; color: #1a1a2e; text-decoration: none; font-weight: 700; border-radius: 4px;">View Menu</a>
</section>`
  },
  // Coming Soon
  {
    id: 'coming-soon-launch',
    label: 'Launch Soon',
    description: 'Coming soon page with email capture',
    icon: '🚀',
    category: 'coming-soon',
    content: `
<section style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%); padding: 40px;">
  <div style="text-align: center; max-width: 600px;">
    <div style="font-size: 64px; margin-bottom: 24px;">🚀</div>
    <h1 style="color: white; font-size: 48px; margin: 0 0 16px; font-weight: 800;">Something Big is Coming</h1>
    <p style="color: rgba(255,255,255,0.7); font-size: 18px; line-height: 1.6; margin: 0 0 40px;">We're working hard to bring you something amazing. Be the first to know when we launch.</p>
    <div style="display: flex; gap: 12px; justify-content: center; max-width: 420px; margin: 0 auto;">
      <input type="email" placeholder="Enter your email" style="flex: 1; padding: 16px 20px; border: none; border-radius: 8px; font-size: 16px;"/>
      <button style="padding: 16px 32px; background: linear-gradient(135deg, #f472b6 0%, #7c3aed 100%); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">Notify Me</button>
    </div>
    <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin-top: 24px;">No spam. We'll only email you once when we launch.</p>
  </div>
</section>`
  },
  // Event
  {
    id: 'event-conference',
    label: 'Conference',
    description: 'Event or conference landing',
    icon: '🎤',
    category: 'event',
    content: `
<header style="padding: 20px 40px; background: transparent; position: absolute; width: 100%; box-sizing: border-box; z-index: 10;">
  <nav style="display: flex; justify-content: space-between; align-items: center;">
    <span style="font-weight: 700; font-size: 20px; color: white;">CONF 2026</span>
    <a href="#" style="padding: 10px 24px; background: #f59e0b; color: #111; text-decoration: none; border-radius: 6px; font-weight: 700;">Get Tickets</a>
  </nav>
</header>
<section style="padding: 160px 40px 100px; background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); color: white; text-align: center;">
  <p style="color: #fbbf24; font-size: 14px; letter-spacing: 3px; margin: 0 0 16px; font-weight: 600;">MARCH 15-17, 2026 • SAN FRANCISCO</p>
  <h1 style="font-size: 56px; margin: 0 0 20px; font-weight: 800;">The Future of Technology</h1>
  <p style="font-size: 20px; opacity: 0.9; max-width: 600px; margin: 0 auto 40px; line-height: 1.6;">Join 5,000+ innovators for three days of inspiration and connection.</p>
  <div style="display: flex; gap: 16px; justify-content: center;">
    <a href="#" style="padding: 16px 40px; background: #f59e0b; color: #111; text-decoration: none; border-radius: 8px; font-weight: 700;">Buy Tickets</a>
    <a href="#" style="padding: 16px 40px; background: rgba(255,255,255,0.15); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; border: 1px solid rgba(255,255,255,0.3);">View Speakers</a>
  </div>
</section>`
  },
  // Startup
  {
    id: 'startup-pitch',
    label: 'Startup Pitch',
    description: 'Startup landing with waitlist',
    icon: '💡',
    category: 'startup',
    content: `
<section style="min-height: 100vh; background: #000; color: white; padding: 40px;">
  <nav style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 80px;">
    <span style="font-size: 20px; font-weight: 700;">startup_</span>
    <a href="#" style="padding: 10px 24px; background: white; color: black; text-decoration: none; border-radius: 4px; font-weight: 600;">Join Waitlist</a>
  </nav>
  <div style="max-width: 800px; margin: 0 auto; text-align: center;">
    <div style="display: inline-block; padding: 8px 16px; background: rgba(34,197,94,0.2); color: #22c55e; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 24px;">🎉 Backed by Y Combinator</div>
    <h1 style="font-size: 64px; margin: 0 0 24px; font-weight: 800; line-height: 1.1;">The Future of [Industry] is Here</h1>
    <p style="font-size: 20px; color: #888; line-height: 1.6; margin: 0 0 48px; max-width: 600px; margin-left: auto; margin-right: auto;">We're building the next generation platform. Join 10,000+ others on the waitlist.</p>
    <div style="display: flex; gap: 12px; justify-content: center; max-width: 400px; margin: 0 auto;">
      <input type="email" placeholder="Enter your email" style="flex: 1; padding: 16px 20px; background: #111; border: 1px solid #333; border-radius: 8px; color: white; font-size: 16px;"/>
      <button style="padding: 16px 32px; background: white; color: black; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">Join</button>
    </div>
  </div>
</section>`
  },
  // Simple
  {
    id: 'simple-basic',
    label: 'Simple Site',
    description: 'Clean minimal basics',
    icon: '📄',
    category: 'landing',
    content: `
<header style="padding: 32px 40px; background: #2c3e50; color: white; text-align: center;">
  <h1 style="margin: 0 0 8px; font-size: 38px; font-weight: 700;">Your Website</h1>
  <p style="margin: 0; opacity: 0.75; font-size: 16px;">A clean, simple site for your ideas</p>
</header>
<section style="padding: 70px 40px; max-width: 780px; margin: 0 auto; text-align: center;">
  <h2 style="font-size: 38px; color: #2c3e50; margin: 0 0 20px; font-weight: 700;">Welcome</h2>
  <p style="font-size: 18px; color: #555; line-height: 1.8; margin: 0 0 36px;">This is your website. Double-click on any text to edit it.</p>
  <a href="#" style="display: inline-block; padding: 16px 50px; background: #2C5F8D; color: white; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: 700;">Get Started</a>
</section>
<footer style="padding: 26px; background: #34495e; color: white; text-align: center;">
  <p style="margin: 0; opacity: 0.75; font-size: 14px;">© 2026 Your Website. All rights reserved.</p>
</footer>`
  }
];
