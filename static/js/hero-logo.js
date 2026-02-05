globalThis.addEventListener('DOMContentLoaded', () => {
  const cryptoObj = globalThis.crypto;
  const hasCSPRNG = cryptoObj && typeof cryptoObj.getRandomValues === 'function';
  const randomFloat = () => {
    if (hasCSPRNG) {
      const buf = new Uint32Array(1);
      cryptoObj.getRandomValues(buf);
      return buf[0] / 2 ** 32;
    }
    // Visual-only fallback for environments without Web Crypto (e.g., some http dev contexts).
    return Math.random();
  };

  const particlesContainer = document.querySelector('.tech-particles');
  if (particlesContainer) { // defensive

  // Cache container width to avoid forced reflow on every particle
  let containerWidth = particlesContainer.offsetWidth;
  // Use ResizeObserver for robust width tracking (catches font load, CSS changes, not just window resize)
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(entries => {
      containerWidth = entries[0].contentRect.width;
    }).observe(particlesContainer);
  } else {
    globalThis.addEventListener('resize', () => {
      containerWidth = particlesContainer.offsetWidth;
    }, { passive: true });
  }

  function createParticle(){
    const p=document.createElement('div');
    p.className='particle';
    particlesContainer.appendChild(p);
    const x=randomFloat()*containerWidth;
    const delay=randomFloat()*4000;              // ms
    const duration=3000+randomFloat()*2000;      // ms
    // Use CSS keyframes for broad compatibility (Safari-friendly).
    p.style.left=`${x}px`;
    p.style.animation=`float-up ${duration}ms ${delay}ms 1 forwards`;
    setTimeout(()=>p.remove(),delay+duration);
  }
    /* first burst immediately, then every 600 ms */
    createParticle();
    setInterval(createParticle,600);
  }                                   // if container exists

  /* hover-tilt */
  const logo=document.querySelector('.logo-container');
  if(!logo || typeof logo.animate!=='function'){return;}
  let tiltAnim;
  const setTilt=(transform)=>{
    if(tiltAnim){tiltAnim.cancel();}
    tiltAnim=logo.animate([{transform}],{duration:100,fill:'forwards',easing:'ease-out'});
  };
  logo.addEventListener('mousemove',e=>{
    const r=logo.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top )/r.height-.5;
    setTilt(`perspective(1000px) rotateY(${x*10}deg) rotateX(${-y*10}deg)`);
  });
  logo.addEventListener('mouseleave',()=>setTilt('perspective(1000px) rotateY(0) rotateX(0)'));
});
