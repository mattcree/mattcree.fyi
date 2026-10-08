// Renders cv/cv.json to public/cv/index.html. Plain, typeset, prints well.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const entry = (period, inner) => `
      <div class="entry">
        <div class="when">${esc(period)}</div>
        <div class="what">${inner}
        </div>
      </div>`;

const role = (r) => entry(r.period, `
          <h3>${esc(r.role)}<span class="at">${esc(r.company)}, ${esc(r.location)}</span></h3>
          ${r.summary ? `<p>${esc(r.summary)}</p>` : ''}
          ${r.points ? `<ul>${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
          ${r.projects ? r.projects.map((p) => `<p class="project"><b>${esc(p.title)}.</b> ${esc(p.body)}</p>`).join('\n          ') : ''}`);

const school = (e) => entry(e.period, `
          <h3>${esc(e.title)}<span class="at">${esc(e.place)}</span></h3>
          ${e.body ? `<p>${esc(e.body)}</p>` : ''}`);

export function renderCv(cv) {
  const c = cv.contact;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(cv.name)}, CV</title>
  <meta name="description" content="${esc(cv.headline)}, ${esc(cv.location)}. Experience, education and skills.">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/cv/cv.css">
</head>
<body>
  <main>
    <header>
      <h1>${esc(cv.name)}</h1>
      <p class="sub">${esc(cv.headline)}, ${esc(cv.location)}.</p>
      <p class="links">
        <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>
        <a href="https://github.com/${esc(c.github)}">github.com/${esc(c.github)}</a>
        <a href="https://uk.linkedin.com/in/${esc(c.linkedin)}">linkedin.com/in/${esc(c.linkedin)}</a>
      </p>
    </header>

    <p class="summary">${esc(cv.summary)}</p>

    <section>
      <h2>Experience</h2>${cv.experience.map(role).join('')}
    </section>

    <section>
      <h2>Education</h2>${cv.education.map(school).join('')}
    </section>

    <section>
      <h2>Skills</h2>
      <dl>
${cv.skills.map((s) => `        <dt>${esc(s.group)}</dt><dd>${esc(s.items)}</dd>`).join('\n')}
      </dl>
    </section>

    <section>
      <h2>Elsewhere</h2>
      <p>${esc(cv.elsewhere)} Some of it is at <a href="https://mattcree.fyi/playthings">mattcree.fyi/playthings</a>.</p>
    </section>
  </main>
</body>
</html>
`;
}
