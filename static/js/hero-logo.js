globalThis.addEventListener('DOMContentLoaded', () => {
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
