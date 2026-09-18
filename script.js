(() => {
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('nav a[data-target]');
  const header = document.querySelector('.site-header');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastY = window.scrollY;
  let scrollTicking = false;

  function updateHeader() {
    const currentY = window.scrollY;
    if(header) {
      header.style.transform = currentY > lastY && currentY > 100 ? 'translateY(-100%)' : 'translateY(0)';
    }
    lastY = currentY;
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if(!scrollTicking) {
      window.requestAnimationFrame(updateHeader);
      scrollTicking = true;
    }
  }, {passive:true});

  function showPage(id){
    pages.forEach(p => p.classList.toggle('active', p.id === id));
    navLinks.forEach(link => link.classList.toggle('is-active', link.dataset.target === id));
    history.replaceState(null, '', `#${id}`);
    if(header) header.classList.toggle('show-logo', id !== 'home');
    document.body.classList.toggle('home-hidden', id !== 'home');
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

  const initial = location.hash ? location.hash.replace('#','') : 'home';
  const known = Array.from(pages).some(p => p.id === initial);
  showPage(known ? initial : 'home');

  // tetris bg 
  (function generateTetrominos(){
    const svg = document.querySelector('.animated-bg svg');
    if(!svg || reduceMotion) return;
    svg.querySelectorAll('g.tetra').forEach(n => n.remove());
    if(window._tetrominoSpawner) clearInterval(window._tetrominoSpawner);

    const colors = ['#A0E7E5','#B5E2FA','#FFD3B6','#FFF1C1','#CAFFBF','#E4C1F9','#FFADAD'];
    const vw = 1200;
    const maxPieces = 120;
    const initialCount = 60;
    let total = 0;

    function createPiece(){
      if(!svg) return;
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
      const variant = Math.floor(Math.random()*4);
      const size = 20;
      const rects = [];

      if(variant===0){ // I
        for(let k=0;k<4;k++){
          const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
          r.setAttribute('x', (k*size).toString()); r.setAttribute('y','0'); r.setAttribute('width', size); r.setAttribute('height', size); r.setAttribute('fill', color);
          rects.push(r);
        }
      } else if(variant===1){ // square
        const coords = [[0,0],[20,0],[0,20],[20,20]];
        coords.forEach(c => { const r=document.createElementNS('http://www.w3.org/2000/svg','rect'); r.setAttribute('x', c[0]); r.setAttribute('y', c[1]); r.setAttribute('width', size); r.setAttribute('height', size); r.setAttribute('fill', color); rects.push(r); });
      } else if(variant===2){ // L
        const coords = [[0,0],[0,20],[0,40],[20,40]];
        coords.forEach(c => { const r=document.createElementNS('http://www.w3.org/2000/svg','rect'); r.setAttribute('x', c[0]); r.setAttribute('y', c[1]); r.setAttribute('width', size); r.setAttribute('height', size); r.setAttribute('fill', color); rects.push(r); });
      } else { // T
        const coords = [[0,20],[20,20],[40,20],[20,0]];
        coords.forEach(c => { const r=document.createElementNS('http://www.w3.org/2000/svg','rect'); r.setAttribute('x', c[0]); r.setAttribute('y', c[1]); r.setAttribute('width', size); r.setAttribute('height', size); r.setAttribute('fill', color); rects.push(r); });
      }

      rects.forEach(r => gx.appendChild(r));
      svg.appendChild(gx);
      // fade-in/enter transition
      requestAnimationFrame(()=> gx.classList.add('entered'));
      total++;
      setTimeout(()=>{ if(gx && gx.parentNode) { gx.parentNode.removeChild(gx); total--; } }, (dur*1000) + 15000);
    }

    // initial batch
    for(let i=0;i<initialCount;i++) createPiece();

    window._tetrominoSpawner = setInterval(()=>{
      const n = 2;
      for(let i=0;i<n;i++) createPiece();
    }, 1800);
  })();

  document.documentElement.classList.add('ready');
})();
