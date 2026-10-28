(() => {
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('nav a[data-target]');
  const header = document.querySelector('.site-header');
  const card = document.querySelector('.card');
  const footer = document.querySelector('.card-footer');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if('scrollRestoration' in history) history.scrollRestoration = 'manual';

  let lastY = window.scrollY;
  let scrollTicking = false;

  function resetHeaderPosition() {
    lastY = window.scrollY;
    if(header) {
      header.style.transform = 'translateY(0)';
    }
  }

  function updateHeader() {
    const currentY = window.scrollY;
    if(header) {
      header.style.transform = currentY > lastY && currentY > 100 ? 'translateY(-100%)' : 'translateY(0)';
    }
    lastY = currentY;
    scrollTicking = false;
  }

  function updateScrollMode() {
    if(!card || !footer) return;
    const cardBounds = card.getBoundingClientRect();
    const footerBounds = footer.getBoundingClientRect();
    const fitsViewport = cardBounds.top >= 0 && footerBounds.bottom <= window.innerHeight;
    document.documentElement.classList.toggle('fit-viewport', fitsViewport);
  }

  function scheduleScrollModeUpdate() {
    window.requestAnimationFrame(updateScrollMode);
  }

  
  window.addEventListener('scroll', () => {
    if(!scrollTicking) {
      window.requestAnimationFrame(updateHeader);
      scrollTicking = true;
    }
  }, {passive:true});
  window.addEventListener('hashchange', () => {
    resetHeaderPosition();
  });
  window.addEventListener('resize', scheduleScrollModeUpdate, {passive:true});
  document.querySelectorAll('.about-timeline').forEach(timeline => {
    timeline.addEventListener('toggle', scheduleScrollModeUpdate);
  });
  if(card && 'ResizeObserver' in window) {
    new ResizeObserver(scheduleScrollModeUpdate).observe(card);
  }

  function showPage(id, updateUrl = true){
    pages.forEach(p => p.classList.toggle('active', p.id === id));
    navLinks.forEach(link => link.classList.toggle('is-active', link.dataset.target === id));
    if(updateUrl) history.replaceState(null, '', `#${id}`);
    if(header) header.classList.toggle('show-logo', id !== 'home');
    document.body.classList.toggle('home-hidden', id !== 'home');
    resetHeaderPosition();
    scheduleScrollModeUpdate();
  }

  const logoLink = document.getElementById('logo-link');
  if(logoLink){
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      showPage('home');
    });
  }

  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = a.dataset.target;
      if(target) showPage(target);
    });
  });

  const termsButtons = document.querySelectorAll('.terms-switch-button');
  function selectTermsPanel(panelId, updateUrl = false) {
    const selectedButton = Array.from(termsButtons).find(button => button.dataset.termsPanel === panelId);
    if(!selectedButton) return;

    termsButtons.forEach(button => {
      const active = button === selectedButton;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll('.terms-panel').forEach(panel => {
      const active = panel.id === panelId;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
    if(updateUrl) {
      history.replaceState(null, '', panelId === 'terms-commission' ? '#terms-commission' : '#terms');
    }
    scheduleScrollModeUpdate();
  }

  termsButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      selectTermsPanel(button.dataset.termsPanel, true);
    });

    button.addEventListener('keydown', event => {
      if(!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      termsButtons[(index + direction + termsButtons.length) % termsButtons.length].focus();
    });
  });

  const initial = location.hash ? location.hash.slice(1) : 'home';
  const initialPanel = initial === 'terms-commission' ? initial : null;
  const initialPage = initialPanel ? 'terms' : initial;
  const known = Array.from(pages).some(p => p.id === initialPage);
  showPage(known ? initialPage : 'home', false);
  if(initialPanel) selectTermsPanel(initialPanel);

  // tetris bg 
  (function generateTetrominos(){
    const svg = document.querySelector('.animated-bg svg');
    if(!svg || reduceMotion) return;

    const colors = ['#A0E7E5','#B5E2FA','#FFD3B6','#FFF1C1','#CAFFBF','#E4C1F9','#FFADAD'];
    const shapes = [
      [[0, 0], [20, 0], [40, 0], [60, 0]],
      [[0, 0], [20, 0], [0, 20], [20, 20]],
      [[0, 0], [0, 20], [0, 40], [20, 40]],
      [[0, 20], [20, 20], [40, 20], [20, 0]]
    ];
    const vw = 1200;
    const maxPieces = 120;
    const initialCount = 60;
    let total = 0;

    function createPiece(){
      if(total >= maxPieces){
        const first = svg.querySelector('g.tetra');
        if(first){ first.remove(); total--; }
      }

      const gx = document.createElementNS('http://www.w3.org/2000/svg','g');
      gx.classList.add('tetra','small','dynamic');
      const x = Math.floor(Math.random()*vw);
      const dur = 35 + Math.floor(Math.random()*35); // 35-70s
      const delay = Math.floor(Math.random()*-dur);
      const s = (0.12 + Math.random()*0.18).toFixed(3);
      gx.setAttribute('style', `--x:${x}px; --dur:${dur}s; --delay:${delay}s; --s:${s}`);
      const color = colors[Math.floor(Math.random()*colors.length)];
      const variant = Math.floor(Math.random()*shapes.length);
      const size = 20;
      shapes[variant].forEach(([x, y]) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);
        rect.setAttribute('fill', color);
        gx.appendChild(rect);
      });
      svg.appendChild(gx);
      // fade-in/enter transition
      requestAnimationFrame(()=> gx.classList.add('entered'));
      total++;
      setTimeout(()=>{ if(gx && gx.parentNode) { gx.parentNode.removeChild(gx); total--; } }, (dur*1000) + 15000);
    }

    // initial batch
    for(let i=0;i<initialCount;i++) createPiece();

    setInterval(()=>{
      const n = 2;
      for(let i=0;i<n;i++) createPiece();
    }, 1800);
  })();

  const lastUpdated = document.getElementById('last-updated');
  const fileDate = new Date(document.lastModified);
  const dateOptions = { year: '2-digit', month: 'numeric', day: 'numeric' };
  lastUpdated.textContent = fileDate.toLocaleDateString('en-US', dateOptions);

  document.documentElement.classList.add('ready');
})();
