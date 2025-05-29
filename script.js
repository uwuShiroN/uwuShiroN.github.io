document.addEventListener('DOMContentLoaded', () => {
  // detect mobile，load css
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = isMobile ? 'mobile.css' : 'desktop.css';
  document.head.appendChild(link);

  // DOM
  const footer = document.querySelector('footer');
  const arrowUp = document.getElementById('arrowUp');

  // mobile script
  if (isMobile) {
    let footerShown = false;
    function updateArrowPosition() {
      if (!arrowUp || !footer) return;
      if (footerShown) {
        arrowUp.style.transform = 'translateX(-50%) rotate(180deg)';
        const footerHeight = footer.offsetHeight;
        arrowUp.style.bottom = `${footerHeight + 20}px`;
      } else {
        arrowUp.style.transform = 'translateX(-50%) rotate(0deg)';
        arrowUp.style.bottom = `20px`;
      }
    }
    function handleArrowClick() {
      if (!footer) return;
      footerShown = !footerShown;
      if (footerShown) {
        footer.classList.add('show');
      } else {
        footer.classList.remove('show');
      }
      updateArrowPosition();
    }
    if (arrowUp) arrowUp.addEventListener('click', handleArrowClick);
    window.addEventListener('resize', () => {
      if (footerShown && footer) {
        const footerHeight = footer.offsetHeight;
        document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      }
    });
    return;
  }

  // desktop script
  const bg = document.getElementById('bg');
  const icons = document.querySelectorAll('.icon');
  const table = document.querySelector('table');
  if (!table || icons.length === 0 || !footer || !bg) return;

  // --- 背景動畫 ---
  let bgTargetX = 0, bgTargetY = 0;
  let bgCurrentX = 0, bgCurrentY = 0;

  function handleBgMouseMove(e) {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    bgTargetX = x * -100;
    bgTargetY = y * -100;
  }

  function animateBackground() {
    bgCurrentX += (bgTargetX - bgCurrentX) * 0.02;
    bgCurrentY += (bgTargetY - bgCurrentY) * 0.02;
    // 極小直接歸零
    if (Math.abs(bgCurrentX) < 0.01) bgCurrentX = 0;
    if (Math.abs(bgCurrentY) < 0.01) bgCurrentY = 0;
    bg.style.transform = `translate(${bgCurrentX}px, ${bgCurrentY}px)`;
  }

  // --- Icon 動畫 ---
  let mouseX = 0;
  const targetTransforms = Array.from(icons).map(() => ({ x: 0, y: 0, scale: 1 }));
  const currentTransforms = Array.from(icons).map(() => ({ x: 0, y: 0, scale: 1 }));

  function handleIconMouseMove(e) {
    const bounds = table.getBoundingClientRect();
    mouseX = e.clientX - bounds.left;
  }

  function animateIcons() {
    const bounds = table.getBoundingClientRect();

    icons.forEach((img, i) => {
      const iconRect = img.getBoundingClientRect();
      const iconCenter = iconRect.left - bounds.left + iconRect.width / 2;
      const distance = mouseX - iconCenter;
      const influence = Math.max(0, 1 - Math.abs(distance) / 150);
      const scale = 1 + influence * 0.5;
      const y = 0;
      const x = 0;

      targetTransforms[i] = { x, y, scale };
    });

    icons.forEach((img, i) => {
      const target = targetTransforms[i];
      const current = currentTransforms[i];

      current.x += (target.x - current.x) * 0.3;
      current.y += (target.y - current.y) * 0.3;
      current.scale += (target.scale - current.scale) * 0.5;
      if (Math.abs(current.x - target.x) < 0.01) current.x = target.x;
      if (Math.abs(current.y - target.y) < 0.01) current.y = target.y;
      if (Math.abs(current.scale - target.scale) < 0.001) current.scale = target.scale;

      img.style.transform = `translate(${current.x}px, ${current.y}px) scale(${current.scale})`;
      img.style.transformOrigin = 'center bottom';
    });
  }

  // --- Footer/箭頭 ---
  let isMouseOnFooter = false;
  let footerShown = false;
  let animationFrameId = null;

  function updateArrowPosition() {
    if (!arrowUp) return;
    if (footerShown) {
      arrowUp.style.transform = 'translateX(-50%) rotate(180deg)';
      const footerHeight = footer.offsetHeight;
      arrowUp.style.bottom = `${footerHeight + 20}px`;
    } else {
      arrowUp.style.transform = 'translateX(-50%) rotate(0deg)';
      arrowUp.style.bottom = `20px`;
    }
  }
  function handleArrowClick() {
    footerShown = !footerShown;
    if (footerShown) {
      footer.classList.add('show');
    } else {
      footer.classList.remove('show');
    }
    updateArrowPosition();
  }
  function showFooterOnce() {
    if (!footerShown) {
      footer.classList.add('show');
      footerShown = true;
      updateArrowPosition();
    }
  }
  function hideFooter() {
    if (footerShown) {
      footer.classList.remove('show');
      footerShown = false;
      updateArrowPosition();
    }
  }
  function handleFooterMouseEnter() {
    isMouseOnFooter = true;
    resetAnimations();
    currentTransforms.forEach((trans, i) => {
      trans.x = 0;
      trans.y = 0;
      trans.scale = 1;
      icons[i].style.transform = `scale(1)`;
    });
  }
  function handleFooterMouseLeave() {
    isMouseOnFooter = false;
  }

  function resetAnimations() {
    bgTargetX = 0;
    bgTargetY = 0;
    targetTransforms.forEach(t => {
      t.x = 0;
      t.y = 0;
      t.scale = 1;
    });
  }

  // --- scroll, wheel, keydown for footer ---
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

  // --- listeners ---
  const passiveOptions = { passive: true };
  document.addEventListener('mousemove', handleBgMouseMove, passiveOptions);
  document.addEventListener('mousemove', handleIconMouseMove, passiveOptions);
  document.addEventListener('mouseleave', resetAnimations, true);
  if (footer) {
    footer.addEventListener('mouseenter', handleFooterMouseEnter);
    footer.addEventListener('mouseleave', handleFooterMouseLeave);
  }
  if (arrowUp) arrowUp.addEventListener('click', handleArrowClick);
  window.addEventListener('resize', () => {
    if (footerShown) {
      const footerHeight = footer.offsetHeight;
      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
    }
  });
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

    // --- animate all ---
  function animateAll() {
    animateBackground();
    animateIcons();
    animationFrameId = requestAnimationFrame(animateAll);
  }

  animateAll();
});
