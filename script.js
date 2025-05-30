// --- GLOBALS ---
let footerShown = false;
let arrowUp = null;

// --- Footer Hide/Show Functions ---
function hideFooter() {
  const footer = document.querySelector('footer');
  if (footer && footer.classList.contains('show')) {
    footer.classList.remove('show');
    footerShown = false;
    updateArrowPosition();
  }
}

function showFooter() {
  const footer = document.querySelector('footer');
  if (footer && !footer.classList.contains('show')) {
    footer.classList.add('show');
    footerShown = true;
    updateArrowPosition();
  }
}

function updateArrowPosition() {
  if (!arrowUp) arrowUp = document.getElementById('arrowUp');
  if (!arrowUp) return;
  if (footerShown) {
    arrowUp.style.transform = 'translateX(-50%) rotate(180deg)';
    const footer = document.querySelector('footer');
    if (footer) {
      const footerHeight = footer.offsetHeight;
      arrowUp.style.bottom = `${footerHeight + 20}px`;
    }
  } else {
    arrowUp.style.transform = 'translateX(-50%) rotate(0deg)';
    arrowUp.style.bottom = `20px`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // detect mobile，load css
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = isMobile ? 'mobile.css' : 'desktop.css';
  document.head.appendChild(link);

  // DOM
  arrowUp = document.getElementById('arrowUp');
  const footer = document.querySelector('footer');

  // mobile script
  if (isMobile) {
    function updateArrowPositionMobile() {
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
      updateArrowPositionMobile();
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
  let mouseX = null; // 修正：預設為null，避免載入時icon被誤判
  const targetTransforms = Array.from(icons).map(() => ({ x: 0, y: 0, scale: 1 }));
  const currentTransforms = Array.from(icons).map(() => ({ x: 0, y: 0, scale: 1 }));

  function handleIconMouseMove(e) {
    const bounds = table.getBoundingClientRect();
    mouseX = e.clientX - bounds.left;
  }

  function animateIcons() {
    const bounds = table.getBoundingClientRect();

    icons.forEach((img, i) => {
      let scale = 1, x = 0, y = 0;
      if (mouseX !== null) {
        const iconRect = img.getBoundingClientRect();
        const iconCenter = iconRect.left - bounds.left + iconRect.width / 2;
        const distance = mouseX - iconCenter;
        const influence = Math.max(0, 1 - Math.abs(distance) / 150);
        scale = 1 + influence * 0.5;
      }
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
  let animationFrameId = null;

  function handleArrowClick() {
    if (footerShown) {
      hideFooter();
    } else {
      showFooter();
    }
  }
  function showFooterOnce() {
    if (!footerShown) {
      footer.classList.add('show');
      footerShown = true;
      updateArrowPosition();
    }
  }
  function hideFooterInternal() {
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
    mouseX = null; // 滑鼠離開時設為null
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
        hideFooterInternal();
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
      showFooter();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      hideFooter();
    }
  }, passiveOptions);
  window.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) {
      showFooter();
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

  // --- Responsive Mobile Menu ---
  const toggle = document.getElementById('mobileMenuToggle');
  const overlay = document.getElementById('mobileMenuOverlay');
  const closeBtn = document.getElementById('closeMobileMenu');
  const menuContent = document.getElementById('mobileMenuContent');
  const desktopMenu = document.getElementById('navMenu');

  function cloneDesktopLinks() {
    menuContent.innerHTML = '';
    const links = desktopMenu.querySelectorAll('.menu-link');
    links.forEach(link => {
      const clone = link.cloneNode(true);
      clone.addEventListener('click', e => {
        if (typeof link.onclick === "function") link.onclick.call(link, e);
        overlay.classList.remove('active');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      });
      menuContent.appendChild(clone);
    });
  }

  function openMenu() {
    cloneDesktopLinks();
    overlay.classList.add('active');
    toggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    overlay.classList.remove('active');
    toggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    if (overlay.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });
  closeBtn.addEventListener('click', closeMenu);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeMenu();
  });

  function syncActiveLink() {
    const desktopLinks = desktopMenu.querySelectorAll('.menu-link');
    const mobileLinks = menuContent.querySelectorAll('.menu-link');
    desktopLinks.forEach((d, i) => {
      if (d.classList.contains('active')) {
        mobileLinks[i]?.classList.add('active');
      } else {
        mobileLinks[i]?.classList.remove('active');
      }
    });
  }
  overlay.addEventListener('transitionend', syncActiveLink);

  desktopMenu.addEventListener('click', () => {
    setTimeout(syncActiveLink, 100);
  });

  // --- Home active on load ---
  var homeLink = document.getElementById('home-link');
  if (homeLink) setActive(homeLink);

  // --- News open/close logic ---
  window.setActive = setActive;
  window.openNews = openNews;
  window.closeNews = closeNews;
  function setActive(element) {
    document.querySelectorAll('.menu-link').forEach(function(link) {
      link.classList.remove('active');
    });
    element.classList.add('active');
  }
  function openNews() {
    document.getElementById("myNews").style.width = "100%";
  }
  function closeNews() {
    document.getElementById("myNews").style.width = "0%";
    // Set Home as active again
    var homeLink = document.getElementById('home-link');
    setActive(homeLink);
  }

  // Expose globally
  window.hideFooter = hideFooter;
  window.showFooter = showFooter;
  window.updateArrowPosition = updateArrowPosition;
});
