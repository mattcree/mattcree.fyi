// One Worker serves the whole site from public/. The only logic here is the
// cv.mattcree.fyi host, which shows public/cv/ at its root, and sending the
// old /cv path on the main host to the subdomain.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === 'cv.mattcree.fyi') {
      if (url.pathname === '/' || url.pathname === '/index.html') {
        url.pathname = '/cv/';
      } else if (url.pathname === '/cv' || url.pathname === '/cv/' || url.pathname === '/cv/index.html') {
        // Don't let the subdomain also answer at /cv/. Other /cv/* paths are
        // the page's own assets (cv.css) and pass through.
        return Response.redirect(`${url.origin}/`, 301);
      }
      return env.ASSETS.fetch(new Request(url, request));
    }

    if (url.pathname === '/cv' || url.pathname.startsWith('/cv/')) {
      return Response.redirect('https://cv.mattcree.fyi/', 301);
    }

    return env.ASSETS.fetch(request);
  },
};
