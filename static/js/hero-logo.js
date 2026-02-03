globalThis.addEventListener('DOMContentLoaded', () => {
  const cryptoObj = globalThis.crypto;
  const hasCSPRNG = cryptoObj && typeof cryptoObj.getRandomValues === 'function';
  const randomFloat = () => {
    if (!hasCSPRNG) {
      return 0;
    }
    const buf = new Uint32Array(1);
    cryptoObj.getRandomValues(buf);
    return buf[0] / 2 ** 32;
  };

  const particlesContainer = document.querySelector('.tech-particles');
  if (particlesContainer && hasCSPRNG) { // defensive

  function createParticle(){
    const p=document.createElement('div');
    p.className='particle';
    particlesContainer.appendChild(p);
    if(typeof p.animate!=='function'){p.remove();return;}
    const r=particlesContainer.getBoundingClientRect();
    const x=randomFloat()*r.width;
    const delay=randomFloat()*4000;              // ms
    const duration=3000+randomFloat()*2000;      // ms
    p.animate([
      {opacity:0,transform:`translate3d(${x}px,100px,0) scale(0)`},
      {opacity:1,transform:`translate3d(${x}px,0,0) scale(1)`,offset:.2},
      {opacity:0,transform:`translate3d(${x}px,-100px,0) scale(0)`}
    ],{duration,delay,iterations:1,fill:'forwards'});
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
