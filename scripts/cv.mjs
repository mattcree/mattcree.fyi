// Renders cv/cv.json into the developer-story design (ported from the old
// Next.js app: same markup and compiled CSS, no React). Icons are pre-rendered
// SVG strings in cv/icons.json.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const icons = JSON.parse(await readFile(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'cv', 'icons.json'), 'utf8'));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const icon = (name, cls) => {
  const svg = icons[name];
  if (!svg) throw new Error(`no icon ${name}`);
  return cls ? svg.replace('<svg ', `<svg class="${cls}" `) : svg;
};

const card = (type, item, side) => `
        <div class="timeline-item timeline-item-${side}">
          <div class="enhanced-card-container">
            <div class="timeline-date timeline-date-${side} enhanced-date ${type}-date">${esc(item.period)}</div>
            <div class="timeline-content timeline-bubble timeline-bubble-${side} enhanced-card ${type}-card">
              <div class="card-header enhanced-header ${type}-header">
                <div class="enhanced-header-content">
                  <div class="enhanced-icon ${type}-icon">${icon(item.icon)}</div>
                  <div class="enhanced-title-container">
                    <h3 class="timeline-title enhanced-title ${type}-title">${esc(item.title)}</h3>
                    ${item.subtitle ? `<div class="card-subtitle enhanced-subtitle ${type}-subtitle">${esc(item.subtitle)}</div>` : ''}
                  </div>
                </div>
              </div>
              <div class="card-body enhanced-body ${type}-body">
                ${(item.body || []).map((p) => `<p class="enhanced-paragraph ${type}-paragraph">${esc(p)}</p>`).join('\n                ')}
              </div>
              ${item.tags && item.tags.length ? `<div class="card-footer enhanced-card-footer ${type}-card-footer">
                <div class="enhanced-tags">${item.tags.map((t) => `<span class="enhanced-tag ${type}-tag">${esc(t)}</span>`).join('')}</div>
              </div>` : ''}
            </div>
          </div>
          <div class="timeline-dot">${icon(item.icon)}</div>
        </div>`;

const timeline = (type, title, iconName, blurb, items) => `
    <section class="card" id="${type}">
      <h2 class="section-title">${icon(iconName, 'section-title-icon')}${esc(title)}</h2>
      <div class="section-description"><p>${esc(blurb)}</p></div>
      <div class="timeline-container">
        <div class="timeline-line"></div>
        <div class="timeline-line-mobile"></div>${items.map((it, i) => card(type, it, i % 2 ? 'right' : 'left')).join('')}
      </div>
    </section>`;

const techCard = (t) => `
        <div class="techstack-card techstack-card-visible" style="--card-gradient:${t.gradient}">
          <div class="techstack-card-accent" style="background:${t.gradient}"></div>
          <div class="techstack-card-header">
            <div class="techstack-icon-wrapper" style="background:${t.gradient}">${icon(t.icon)}</div>
            <div class="techstack-card-title-area"><h3 class="techstack-card-title">${esc(t.title)}</h3></div>
          </div>
          <div class="techstack-skills-section">
            <div class="techstack-tags">${t.skills.map((s) => `<span class="techstack-tag techstack-tag-primary">${esc(s)}</span>`).join('')}</div>
          </div>
          <div class="techstack-card-glow"></div>
        </div>`;

export function renderCv(cv) {
  const c = cv.contact;
  const social = [
    ['LinkedIn', `https://www.linkedin.com/in/${c.linkedin}`, 'FaLinkedin'],
    ['GitHub', `https://github.com/${c.github}`, 'FaGithub'],
    ['Site', `https://${c.site}`, 'FaGlobe'],
  ];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(cv.name)}, CV</title>
  <meta name="description" content="${esc(cv.headline)}. ${esc(cv.location)}. Experience, projects, skills, education.">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script>(function(){try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/cv/cv.css">
</head>
<body>
  <main class="max-w-6xl mx-auto px-4 py-6 sm:py-10">
    <div class="space-y-4">
      <div class="header-container">
        <div class="header-bg-decoration">
          <div class="header-bg-circle header-bg-circle-1"></div>
          <div class="header-bg-circle header-bg-circle-2"></div>
          <div class="header-bg-circle header-bg-circle-3"></div>
        </div>
        <div class="fixed top-4 right-4 z-50">
          <button id="theme-toggle" class="rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors" aria-label="Toggle dark mode">
            ${icon('FaMoon', 'text-text-light icon-sm only-light')}${icon('FaSun', 'text-text-light icon-sm only-dark')}
          </button>
        </div>
        <div class="header-hero header-visible">
          <h1 class="header-name"><span class="header-name-gradient">${esc(cv.name)}</span></h1>
          <h2 class="header-role">${esc(cv.headline)}</h2>
          <div class="header-location-badge">${icon('FaMapMarkerAlt', 'text-primary dark:text-primary-light')}<span>${esc(cv.location)}</span></div>
        </div>
        <div class="header-contact-row header-visible">
          <a href="mailto:${esc(c.email)}" class="contact-chip contact-chip-primary">${icon('FaEnvelope')}<span>${esc(c.email)}</span></a>
        </div>
        <div class="header-social-row header-visible">
          ${social.map(([label, href, ic]) => `<a href="${href}" class="social-link-modern" aria-label="${label}"><span class="social-link-icon">${icon(ic)}</span><span class="social-link-text">${label}</span></a>`).join('\n          ')}
        </div>
        <div class="header-stats-grid header-visible">
          ${cv.stats.map((s) => `<div class="stat-card"><div class="stat-card-inner"><span class="stat-number">${esc(s.value)}</span><span class="stat-description">${esc(s.label)}</span></div><div class="stat-card-glow"></div></div>`).join('\n          ')}
        </div>
        <div class="header-bio-section header-visible">
          <div class="bio-card"><p class="bio-content">${esc(cv.summary)}</p></div>
        </div>
      </div>
${timeline('experience', 'Work Experience', 'FaBriefcase', 'Roles, newest first.', cv.experience)}
${timeline('project', 'Key Projects', 'FaLightbulb', 'Things I built or led.', cv.projects)}
      <section class="techstack-section" id="skills">
        <h2 class="section-title">${icon('FaTools', 'section-title-icon')}Technical Skills</h2>
        <div class="section-description"><p>What I use.</p></div>
        <div class="techstack-grid">${cv.techStack.map(techCard).join('')}
        </div>
      </section>
${timeline('education', 'Education', 'FaGraduationCap', 'Newest first.', cv.education)}
      <footer class="footer">
        <div class="footer-bg-decoration">
          <div class="footer-bg-circle footer-bg-circle-1"></div>
          <div class="footer-bg-circle footer-bg-circle-2"></div>
        </div>
        <div class="footer-content">
          <div class="footer-main">
            <div class="footer-brand">
              <h3 class="footer-name">${esc(cv.name)}</h3>
              <p class="footer-tagline">${esc(cv.headline)}</p>
            </div>
            <div class="footer-social">
              ${social.map(([label, href, ic]) => `<a href="${href}" class="footer-social-link" aria-label="${label}">${icon(ic)}</a>`).join('\n              ')}
            </div>
          </div>
          <div class="footer-divider"></div>
          <div class="footer-bottom">
            <p class="footer-copyright">${new Date().getFullYear()} ${esc(cv.name)}</p>
            <p class="footer-inspired"><a href="https://${c.site}">${c.site}</a></p>
          </div>
        </div>
      </footer>
    </div>
  </main>
  <script>
    document.getElementById('theme-toggle').addEventListener('click', function () {
      var dark = document.documentElement.classList.toggle('dark');
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    });
  </script>
</body>
</html>
`;
}
