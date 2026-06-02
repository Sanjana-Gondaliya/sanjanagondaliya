/* =====================================================
   Project detail — reads ?id= and fills the page
   ===================================================== */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const list = window.PROJECTS || [];
  const project = list.find(p => p.id === id) || list[0];

  if (!project) {
    window.location.replace('projects.html');
    return;
  }

  document.title = project.title + ' — Sanjana Gondaliya';

  const set = (elId, text) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = text;
  };

  set('pdTitle', project.title);
  set('pdMono', project.mono);
  set('pdOverview', project.overview);
  set('pdResults', project.results);

  // accent + photo on the hero visual
  const visual = document.getElementById('pdVisual');
  if (visual) {
    visual.setAttribute('data-accent', project.accent);
    if (project.image) {
      const img = document.createElement('img');
      img.className = 'card-photo';
      img.src = project.image;
      img.alt = project.title;
      img.onerror = function () { this.remove(); };
      visual.insertBefore(img, visual.firstChild);
    }
  }

  // meta row: client + year
  const meta = document.getElementById('pdMeta');
  if (meta) {
    meta.innerHTML =
      '<span><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/>' +
      '<path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 7a3 3 0 010 6M21 20c0-2-1-3.5-3-4.2"/></svg> ' +
      project.client + '</span>' +
      '<span><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/>' +
      '<path d="M3 9h18M8 3v4M16 3v4"/></svg> ' + project.year + '</span>' +
      project.tags.map(t => '<span class="detail__tag">' + t + '</span>').join('');
  }
})();
