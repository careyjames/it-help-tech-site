// Particle animation - Math.random() is safe here as it's only for visual effects
const particlesContainer = document.querySelector('.tech-particles');

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    // Safe usage: visual-only positioning, no security implications
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 4 + 's';
    particle.style.animationDuration = (3 + Math.random() * 2) + 's';
    particlesContainer.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 5000);
}

// Create particles at optimized intervals
setInterval(createParticle, 600);

// Interactive hover effect
const logoContainer = document.querySelector('.logo-container');

logoContainer.addEventListener('mousemove', (e) => {
    const rect = logoContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    logoContainer.style.transform = `
        perspective(1000px)
        rotateY(${x * 10}deg)
        rotateX(${-y * 10}deg)
    `;
});

logoContainer.addEventListener('mouseleave', () => {
    logoContainer.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
});
