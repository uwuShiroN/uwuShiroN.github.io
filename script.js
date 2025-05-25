document.addEventListener('DOMContentLoaded', () => {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    return;
  }

  const bg = document.getElementById('bg');
  const icons = document.querySelectorAll('.icon');
  const table = document.querySelector('table');
  const footer = document.querySelector('footer');

  if (!table || icons.length === 0 || !footer || !bg) {
    return;
  }

  let bgTargetX = 0, bgTargetY = 0;
  let bgCurrentX = 0, bgCurrentY = 0;
  let animationFrameId = null;
  let isMouseActive = false;
  let isMouseOnFooter = false;
  let mouseX = 0;
  let footerShown = false;
  
  const tableBounds = table.getBoundingClientRect();
  
  const iconData = Array.from(icons).map(icon => {
    const rect = icon.getBoundingClientRect();
    return {
      element: icon,
      center: rect.left - tableBounds.left + rect.width / 2,
      currentX: 0,
      currentY: 0,
      currentScale: 1,
      targetX: 0,
      targetY: 0,
      targetScale: 1
    };
  });

  const CONFIG = {
    bgParallaxIntensity: 100,
    iconHoverDistance: 100,
    iconLiftAmount: 20,
    iconScaleAmount: 0.5,
    bgReturnSpeed: 0.008,
    bgFollowSpeed: 0.02,
    iconReturnSpeed: 0.1,
    iconFollowSpeed: 0.3
  };

  function resetAnimations() {
    bgTargetX = 0;
    bgTargetY = 0;
    mouseX = -1000;
    iconData.forEach(data => {
      data.targetX = 0;
      data.targetY = 0;
      data.targetScale = 1;
    });
  }

  let lastMouseMoveTime = 0;
  const mouseMoveThrottle = 16;

  function handleMouseMove(e) {
    const now = Date.now();
    if (now - lastMouseMoveTime < mouseMoveThrottle) return;
    lastMouseMoveTime = now;

    if (!isMouseActive) isMouseActive = true;
    if (isMouseOnFooter) return;

    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    bgTargetX = x * -CONFIG.bgParallaxIntensity;
    bgTargetY = y * -CONFIG.bgParallaxIntensity;
    mouseX = e.clientX - tableBounds.left;
  }

  function animateBackground() {
    const speed = (bgTargetX === 0 && bgTargetY === 0) ? CONFIG.bgReturnSpeed : CONFIG.bgFollowSpeed;
    
    if (!isMouseActive || isMouseOnFooter) {
      bgTargetX = 0;
      bgTargetY = 0;
    }
    
    bgCurrentX += (bgTargetX - bgCurrentX) * speed;
    bgCurrentY += (bgTargetY - bgCurrentY) * speed;
    
    bg.style.willChange = 'transform';
    bg.style.transform = `translate(${bgCurrentX}px, ${bgCurrentY}px)`;
  }

  function animateIcons() {
    iconData.forEach(data => {
      const distance = Math.abs(mouseX - data.center);
      
      if (isMouseActive && !isMouseOnFooter && distance < CONFIG.iconHoverDistance) {
        const influence = 1 - (distance / CONFIG.iconHoverDistance);
        data.targetY = -influence * CONFIG.iconLiftAmount;
        data.targetScale = 1 + influence * CONFIG.iconScaleAmount;
      } else {
        data.targetY = 0;
        data.targetScale = 1;
      }
      
      const speed = (data.targetX === 0 && data.targetY === 0 && data.targetScale === 1) 
        ? CONFIG.iconReturnSpeed 
        : CONFIG.iconFollowSpeed;
      
      data.currentX += (data.targetX - data.currentX) * speed;
      data.currentY += (data.targetY - data.currentY) * speed;
      data.currentScale += (data.targetScale - data.currentScale) * speed;
      
      data.element.style.willChange = 'transform';
      data.element.style.transform = 
        `translate(${data.currentX}px, ${data.currentY}px) scale(${data.currentScale})`;
    });
  }

  function animateAll() {
    animateBackground();
    animateIcons();
    
    if (isMouseActive || 
        bgCurrentX !== 0 || bgCurrentY !== 0 || 
        iconData.some(data => data.currentX !== 0 || data.currentY !== 0 || data.currentScale !== 1)) {
      animationFrameId = requestAnimationFrame(animateAll);
    } else {
      animationFrameId = null;
    }
  }

  function handleMouseEnter() {
    if (!isMouseActive) {
      isMouseActive = true;
      if (!animationFrameId) {
        animateAll();
      }
    }
  }

  function handleMouseLeave() {
    isMouseActive = false;
    resetAnimations();
  }

  function handleFooterMouseEnter() {
    isMouseOnFooter = true;
    resetAnimations();
  }

  function handleFooterMouseLeave() {
    isMouseOnFooter = false;
  }

  const passiveOptions = { passive: true };
  document.addEventListener('mouseenter', handleMouseEnter, true);
  document.addEventListener('mouseleave', handleMouseLeave, true);
  document.addEventListener('mousemove', handleMouseMove, passiveOptions);
  footer.addEventListener('mouseenter', handleFooterMouseEnter);
  footer.addEventListener('mouseleave', handleFooterMouseLeave);

  function showFooterOnce() {
    if (!footerShown) {
      footer.classList.add('show');
      footerShown = true;
    }
  }

  function hideFooter() {
    if (footerShown) {
      footer.classList.remove('show');
      footerShown = false;
    }
  }

  let lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  let scrollTimeout = null;

  function handleScroll() {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (currentScrollPosition > lastScrollPosition) {
        showFooterOnce();
      } else if (currentScrollPosition < lastScrollPosition) {
        hideFooter();
      }
      lastScrollPosition = currentScrollPosition <= 0 ? 0 : currentScrollPosition;
    }, 50);
  }

  window.addEventListener('scroll', handleScroll, passiveOptions);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      showFooterOnce();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      hideFooter();
    }
  }, passiveOptions);

  window.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) {
      showFooterOnce();
    } else {
      hideFooter();
    }
  }, passiveOptions);

  animateAll();
});
