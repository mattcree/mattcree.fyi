// Renders cv/cv.json to a page that shares the site stylesheet and prints cleanly.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const project = (p) => `
          <div class="project">
            <h4>${esc(p.title)}</h4>
            ${p.note ? `<p class="note">${esc(p.note)}</p>` : ''}
            <p>${esc(p.body)}</p>
            ${p.stack ? `<p class="stack">${esc(p.stack)}</p>` : ''}
          </div>`;

const role = (r) => `
      <article class="entry">
        <div class="when">${esc(r.period)}</div>
        <div class="what">
          <h3>${esc(r.role)}<span class="at">${esc(r.company)}, ${esc(r.location)}</span></h3>
          ${r.summary ? `<p>${esc(r.summary)}</p>` : ''}
          ${r.points ? `<ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
          ${r.projects ? r.projects.map(project).join('') : ''}
          ${r.stack ? `<p class="stack">${esc(r.stack)}</p>` : ''}
        </div>
      </article>`;

const school = (e) => `
      <article class="entry">
        <div class="when">${esc(e.period)}</div>
        <div class="what">
          <h3>${esc(e.title)}<span class="at">${esc(e.place)}</span></h3>
          ${e.body ? `<p>${esc(e.body)}</p>` : ''}
        </div>
      </article>`;

export function renderCv(cv) {
  const c = cv.contact;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(cv.name)}, CV</title>
  <meta name="description" content="${esc(cv.headline)} in ${esc(cv.location)}. Experience, education and skills.">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
</head>
<body class="cv">
  <main>
    <nav class="cv-nav">
      <a class="tape small" href="/">mattcree.fyi</a>
      <button type="button" class="print" onclick="window.print()">Save as PDF</button>
    </nav>

    <header class="cv-head">
      <h1>${esc(cv.name)}</h1>
      <p class="lede">${esc(cv.headline)}, ${esc(cv.location)}.</p>
      <dl class="contact">
        <dt>Email</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd>
        <dt>GitHub</dt><dd><a href="https://github.com/${esc(c.github)}">github.com/${esc(c.github)}</a></dd>
        <dt>LinkedIn</dt><dd><a href="https://uk.linkedin.com/in/${esc(c.linkedin)}">linkedin.com/in/${esc(c.linkedin)}</a></dd>
      </dl>
      ${cv.summary.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
    </header>

    <section>
      <h2>Experience</h2>
${cv.experience.map(role).join('\n')}
    </section>

    <section>
      <h2>Education</h2>
${cv.education.map(school).join('\n')}
    </section>

    <section>
      <h2>Skills</h2>
      <dl class="skills">
${cv.skills.map((s) => `        <dt>${esc(s.group)}</dt><dd>${esc(s.items)}</dd>`).join('\n')}
      </dl>
    </section>

    <section>
      <h2>Elsewhere</h2>
      <p>${esc(cv.elsewhere)} Some of it is in the <a href="/playthings">playthings</a>.</p>
    </section>
  </main>
</body>
</html>
`;
}
