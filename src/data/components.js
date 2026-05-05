export const COMPONENTS = [

  {
    id: 'navbar',
    label: 'Navigation Bar',
    description: 'Site-wide top navigation',
    category: 'Layout',
    keywords: ['professional', 'corporate', 'navigation', 'formal'],
    content: `
<nav style="padding: 16px 40px; background: #1a202c; color: white; display: flex; justify-content: space-between; align-items: center;">
  <span style="font-size: 20px; font-weight: 700; color: white;">Your Brand</span>
  <div style="display: flex; gap: 24px;">
    <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 14px;">Home</a>
    <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 14px;">About</a>
    <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 14px;">Services</a>
    <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 14px;">Contact</a>
  </div>
</nav>`
  },
  {
    id: 'header',
    label: 'Header',
    description: 'Bold page title with background',
    category: 'Layout',
    keywords: ['professional', 'corporate', 'formal', 'title'],
    content: `
<header style="padding: 40px; background: #2c3e50; color: white; text-align: center;">
  <h1 style="margin: 0 0 8px; font-size: 40px; font-weight: 700;">Your Website Header</h1>
  <p style="margin: 0; opacity: 0.8; font-size: 16px;">A short tagline that describes what you do</p>
</header>`
  },
  {
    id: 'footer',
    label: 'Footer',
    description: 'Bottom page footer with copyright',
    category: 'Layout',
    keywords: ['professional', 'corporate', 'formal', 'closing'],
    content: `
<footer style="padding: 28px 40px; background: #34495e; color: white; text-align: center;">
  <p style="margin: 0; opacity: 0.8; font-size: 14px;">© 2026 Your Company. All rights reserved.</p>
</footer>`
  },
  {
    id: 'two-column',
    label: 'Two Columns',
    description: 'Side-by-side content layout',
    category: 'Layout',
    keywords: ['professional', 'structured', 'organized', 'layout'],
    content: `
<div style="display: flex; gap: 24px; padding: 30px;">
  <div style="flex: 1; padding: 24px; background: #f1f5f9; border-radius: 8px;">
    <h3 style="margin: 0 0 12px; color: #1a202c;">Column One</h3>
    <p style="margin: 0; color: #555; line-height: 1.7;">Your content here. Double-click to edit.</p>
  </div>
  <div style="flex: 1; padding: 24px; background: #f1f5f9; border-radius: 8px;">
    <h3 style="margin: 0 0 12px; color: #1a202c;">Column Two</h3>
    <p style="margin: 0; color: #555; line-height: 1.7;">Your content here. Double-click to edit.</p>
  </div>
</div>`
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Visual separator between sections',
    category: 'Layout',
    keywords: ['structure', 'separator', 'spacing', 'organized'],
    content: `
<div style="padding: 20px 40px;">
  <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 0;"/>
</div>`
  },

  {
    id: 'hero',
    label: 'Hero Section',
    description: 'Big attention-grabbing intro block',
    category: 'Content',
    keywords: ['visual', 'creative', 'call-to-action', 'feature', 'landing'],
    content: `
<section style="padding: 90px 40px; text-align: center; background: linear-gradient(135deg, #475569 0%, #334155 100%); color: white;">
  <h2 style="font-size: 52px; margin: 0 0 16px; font-weight: 800; line-height: 1.1;">Your Headline Goes Here</h2>
  <p style="font-size: 20px; margin: 0 auto 36px; opacity: 0.9; max-width: 560px; line-height: 1.6;">A short, compelling description of what you offer. Keep it clear and benefits-focused.</p>
  <a href="#" style="display: inline-block; padding: 16px 52px; background: white; color: #334155; border-radius: 50px; font-size: 17px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 20px rgba(0,0,0,0.25);">Get Started</a>
</section>`
  },
  {
    id: 'text-block',
    label: 'Text Block',
    description: 'Heading and paragraph content',
    category: 'Content',
    keywords: ['informational', 'content', 'reading', 'text'],
    content: `
<div style="padding: 40px;">
  <h2 style="color: #1a202c; margin: 0 0 16px; font-size: 28px; font-weight: 700;">Section Heading</h2>
  <p style="line-height: 1.8; color: #555; margin: 0; font-size: 16px; max-width: 680px;">
    Your text content goes here. Double-click to edit this text and make it your own.
    You can write as much as you need to communicate your message clearly.
  </p>
</div>`
  },
  {
    id: 'features',
    label: 'Feature Cards',
    description: '3 feature highlights in a row',
    category: 'Content',
    keywords: ['professional', 'structured', 'features', 'services', 'organized'],
    content: `
<section style="padding: 60px 40px; background: #f7f8fc;">
  <h3 style="text-align: center; font-size: 32px; color: #1a202c; margin: 0 0 44px; font-weight: 700;">What We Offer</h3>
  <div style="display: flex; gap: 24px; max-width: 880px; margin: 0 auto;">
    <div style="flex: 1; text-align: center; padding: 32px 20px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">
      <div style="font-size: 40px; margin-bottom: 16px;">⚡</div>
      <h4 style="color: #1a202c; margin: 0 0 10px; font-size: 17px; font-weight: 700;">Fast</h4>
      <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0;">Lightning-fast performance optimized for the best experience.</p>
    </div>
    <div style="flex: 1; text-align: center; padding: 32px 20px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">
      <div style="font-size: 40px; margin-bottom: 16px;">🛡️</div>
      <h4 style="color: #1a202c; margin: 0 0 10px; font-size: 17px; font-weight: 700;">Secure</h4>
      <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0;">Built with security so you can focus on what matters most.</p>
    </div>
    <div style="flex: 1; text-align: center; padding: 32px 20px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">
      <div style="font-size: 40px; margin-bottom: 16px;">❤️</div>
      <h4 style="color: #1a202c; margin: 0 0 10px; font-size: 17px; font-weight: 700;">Loved</h4>
      <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0;">Trusted by thousands of satisfied customers worldwide.</p>
    </div>
  </div>
</section>`
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Full-width placeholder image',
    category: 'Content',
    keywords: ['visual', 'creative', 'media', 'photo'],
    content: `
<div style="padding: 24px;">
  <img
    src="https://via.placeholder.com/800x400/3498db/ffffff?text=Your+Image+Here"
    style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); display: block;"
    alt="Your image"
  />
</div>`
  },
  {
    id: 'gallery',
    label: 'Image Gallery',
    description: '3 photos in a grid',
    category: 'Content',
    keywords: ['visual', 'creative', 'media', 'portfolio', 'photo'],
    content: `
<div style="padding: 30px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
  <img src="https://via.placeholder.com/400x300/667eea/ffffff?text=Photo+1" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; display: block;" alt="Photo 1"/>
  <img src="https://via.placeholder.com/400x300/e74c3c/ffffff?text=Photo+2" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; display: block;" alt="Photo 2"/>
  <img src="https://via.placeholder.com/400x300/27ae60/ffffff?text=Photo+3" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; display: block;" alt="Photo 3"/>
</div>`
  },
  {
    id: 'image-text',
    label: 'Image + Text',
    description: 'Side-by-side image and text',
    category: 'Content',
    keywords: ['informational', 'visual', 'feature', 'content'],
    content: `
<div style="display: flex; gap: 40px; padding: 40px; align-items: center;">
  <img
    src="https://via.placeholder.com/360x280/e74c3c/ffffff?text=Image"
    style="width: 360px; height: 280px; object-fit: cover; border-radius: 12px; flex-shrink: 0;"
    alt="Feature image"
  />
  <div style="flex: 1;">
    <h3 style="color: #1a202c; margin: 0 0 14px; font-size: 26px; font-weight: 700;">Feature Title</h3>
    <p style="line-height: 1.8; color: #555; font-size: 16px; margin: 0 0 20px;">
      Describe your feature here. This layout combines visuals with text to create an engaging presentation.
    </p>
    <a href="#" style="display: inline-block; padding: 12px 28px; background: #2C5F8D; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Learn More</a>
  </div>
</div>`
  },
  {
    id: 'testimonial',
    label: 'Testimonial',
    description: 'Customer quote and attribution',
    category: 'Content',
    keywords: ['professional', 'trust', 'social-proof', 'review'],
    content: `
<div style="padding: 40px; background: #f7f8fc;">
  <div style="max-width: 620px; margin: 0 auto; padding: 40px; background: white; border-radius: 16px; border-left: 5px solid #2C5F8D; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
    <p style="font-style: italic; font-size: 20px; color: #444; margin: 0 0 20px; line-height: 1.7;">
      "This is an amazing product! It completely transformed how we work and exceeded all our expectations."
    </p>
    <div style="display: flex; align-items: center; gap: 14px;">
      <div style="width: 44px; height: 44px; border-radius: 50%; background: #2C5F8D; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; flex-shrink: 0;">S</div>
      <div>
        <p style="font-weight: 700; color: #1a202c; margin: 0; font-size: 15px;">Sarah Johnson</p>
        <p style="color: #999; margin: 0; font-size: 13px;">CEO, Acme Corp</p>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: 'callout',
    label: 'Callout / Quote',
    description: 'Highlighted info or pull quote',
    category: 'Content',
    keywords: ['informational', 'highlight', 'content', 'attention'],
    content: `
<div style="margin: 24px 40px; padding: 28px 32px; background: #fffbeb; border-left: 5px solid #f59e0b; border-radius: 8px;">
  <p style="font-size: 18px; color: #78350f; line-height: 1.7; margin: 0; font-weight: 500;">
    💡 This is an important note or highlight. Use it to draw attention to key information your visitors should know.
  </p>
</div>`
  },

  {
    id: 'button-primary',
    label: 'Primary Button',
    description: 'Main call-to-action button',
    category: 'Interactive',
    keywords: ['call-to-action', 'conversion', 'interactive', 'cta'],
    content: `
<div style="text-align: center; padding: 24px;">
  <a href="#" style="display: inline-block; padding: 16px 48px; background: #2C5F8D; color: white; border-radius: 6px; font-size: 17px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 12px rgba(52,152,219,0.35);">
    Get Started
  </a>
</div>`
  },
  {
    id: 'button-secondary',
    label: 'Secondary Button',
    description: 'Subtle secondary action',
    category: 'Interactive',
    keywords: ['call-to-action', 'secondary', 'interactive'],
    content: `
<div style="text-align: center; padding: 24px;">
  <a href="#" style="display: inline-block; padding: 15px 44px; background: transparent; color: #2C5F8D; border: 2px solid #2C5F8D; border-radius: 6px; font-size: 16px; font-weight: 600; text-decoration: none;">
    Learn More
  </a>
</div>`
  },
  {
    id: 'cta-section',
    label: 'CTA Section',
    description: 'Full-width call-to-action banner',
    category: 'Interactive',
    keywords: ['call-to-action', 'conversion', 'interactive', 'cta', 'landing'],
    content: `
<section style="padding: 80px 40px; text-align: center; background: #2C5F8D; color: white;">
  <h3 style="font-size: 38px; margin: 0 0 16px; font-weight: 700;">Ready to get started?</h3>
  <p style="font-size: 18px; margin: 0 0 36px; opacity: 0.9; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.6;">Join thousands of people already using our platform. No credit card required.</p>
  <a href="#" style="display: inline-block; padding: 16px 52px; background: white; color: #2C5F8D; border-radius: 50px; font-size: 18px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">Start Free Today</a>
</section>`
  },
  {
    id: 'contact-form',
    label: 'Contact Form',
    description: 'Name, email, message form',
    category: 'Interactive',
    keywords: ['conversion', 'contact', 'interactive', 'form'],
    content: `
<div style="padding: 40px; background: #f7f8fc;">
  <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">
    <h3 style="margin: 0 0 24px; color: #1a202c; font-size: 24px; font-weight: 700;">Contact Us</h3>
    <input type="text" placeholder="Your Name" style="width: 100%; padding: 13px 16px; margin: 0 0 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;"/>
    <input type="email" placeholder="Your Email" style="width: 100%; padding: 13px 16px; margin: 0 0 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;"/>
    <textarea placeholder="Your Message" style="width: 100%; padding: 13px 16px; margin: 0 0 16px; border: 1px solid #e2e8f0; border-radius: 8px; height: 120px; font-size: 14px; font-family: inherit; box-sizing: border-box; resize: vertical;"></textarea>
    <button style="width: 100%; padding: 14px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 700;">Send Message</button>
  </div>
</div>`
  },
  {
    id: 'newsletter',
    label: 'Newsletter Signup',
    description: 'Email opt-in with button',
    category: 'Interactive',
    keywords: ['conversion', 'contact', 'interactive', 'email', 'subscribe'],
    content: `
<section style="padding: 60px 40px; background: #f1f5f9; text-align: center;">
  <h3 style="font-size: 28px; color: #1a202c; margin: 0 0 10px; font-weight: 700;">Stay in the Loop</h3>
  <p style="color: #666; margin: 0 0 28px; font-size: 16px;">Get the latest updates delivered straight to your inbox.</p>
  <div style="display: flex; max-width: 460px; margin: 0 auto; gap: 10px;">
    <input type="email" placeholder="your@email.com" style="flex: 1; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; outline: none;"/>
    <button style="padding: 14px 24px; background: #2C5F8D; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; white-space: nowrap;">Subscribe</button>
  </div>
</section>`
  },

  {
    id: 'video',
    label: 'Video Embed',
    description: 'Video placeholder with play button',
    category: 'Media',
    keywords: ['visual', 'media', 'creative', 'video'],
    content: `
<div style="padding: 24px;">
  <div style="position: relative; padding-bottom: 56.25%; background: #1a202c; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center;">
      <div style="width: 72px; height: 72px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; backdrop-filter: blur(4px);">
        <span style="color: white; font-size: 28px; margin-left: 4px;">▶</span>
      </div>
      <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">Video Placeholder</p>
    </div>
  </div>
</div>`
  },
  {
    id: 'price-card',
    label: 'Pricing Card',
    description: 'Single pricing option card',
    category: 'Media',
    keywords: ['professional', 'conversion', 'pricing', 'structured'],
    content: `
<div style="padding: 30px; display: flex; justify-content: center;">
  <div style="width: 300px; background: white; border-radius: 20px; padding: 36px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.1); border: 2px solid #2C5F8D;">
    <p style="font-size: 13px; font-weight: 700; color: #2C5F8D; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px;">PRO PLAN</p>
    <div style="font-size: 52px; font-weight: 800; color: #1a202c; margin: 0 0 4px;">$29</div>
    <p style="color: #999; margin: 0 0 28px; font-size: 14px;">per month</p>
    <ul style="list-style: none; padding: 0; margin: 0 0 28px; text-align: left;">
      <li style="padding: 8px 0; color: #555; font-size: 14px; border-bottom: 1px solid #f1f5f9;">✓ Unlimited projects</li>
      <li style="padding: 8px 0; color: #555; font-size: 14px; border-bottom: 1px solid #f1f5f9;">✓ Priority support</li>
      <li style="padding: 8px 0; color: #555; font-size: 14px; border-bottom: 1px solid #f1f5f9;">✓ Advanced analytics</li>
      <li style="padding: 8px 0; color: #555; font-size: 14px;">✓ Custom domain</li>
    </ul>
    <a href="#" style="display: block; padding: 14px; background: #2C5F8D; color: white; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">Get Started</a>
  </div>
</div>`
  }
];
