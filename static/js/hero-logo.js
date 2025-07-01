window.addEventListener('DOMContentLoaded', () => {
  const particlesContainer = document.querySelector('.tech-particles');
  if(particlesContainer){            // defensive

  function createParticle(){
    const p=document.createElement('div');
    p.className='particle';
    p.style.left=Math.random()*100+'%';
    p.style.animationDelay=Math.random()*4+'s';
    p.style.animationDuration=3+Math.random()*2+'s';
    particlesContainer.appendChild(p);
    setTimeout(()=>p.remove(),5000);
  }
    /* first burst immediately, then every 600 ms */
    createParticle();
    setInterval(createParticle,600);
  }                                   // if container exists

  /* hover-tilt */
  const logo=document.querySelector('.logo-container');
  logo.addEventListener('mousemove',e=>{
    const r=logo.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top )/r.height-.5;
    logo.style.transform=`perspective(1000px) rotateY(${x*10}deg) rotateX(${-y*10}deg)`;
  });
  logo.addEventListener('mouseleave',()=>logo.style.transform='perspective(1000px)');
});
