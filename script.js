document.addEventListener('DOMContentLoaded', () => {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    console.log("Mobile detected - skipping animation scripts.");
    return;
  }

  // 背景動畫
  const bg = document.getElementById('bg');
  if (!bg) {
    console.error("Background element (#bg) not found");
    return;
  }

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let animationFrameId;

  function handleMouseMove(e) {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    targetX = x * -100;
    targetY = y * -100;
  }

  function animateBackground() {
    currentX += (targetX - currentX) * 0.02;
    currentY += (targetY - currentY) * 0.02;
    bg.style.transform = `translate(${currentX}px, ${currentY}px)`;
    animationFrameId = requestAnimationFrame(animateBackground);
  }

  // Icon 動畫
  const icons = document.querySelectorAll('.icon');
  const table = document.querySelector('table');
  
  if (!table || icons.length === 0) {
    console.error("Table or icons not found");
    return;
  }

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
      const y = -influence * 20;
      const x = 0;

      targetTransforms[i] = { x, y, scale };
    });

    icons.forEach((img, i) => {
      const target = targetTransforms[i];
      const current = currentTransforms[i];

      current.x += (target.x - current.x) * 0.3;
      current.y += (target.y - current.y) * 0.3;
      current.scale += (target.scale - current.scale) * 0.5;

      img.style.transform = `translate(${current.x}px, ${current.y}px) scale(${current.scale})`;
    });

    requestAnimationFrame(animateIcons);
  }

  // Event listeners
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mousemove', handleIconMouseMove);
  
  // Start animations
  animateBackground();
  animateIcons();

  // Cleanup function
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mousemove', handleIconMouseMove);
    cancelAnimationFrame(animationFrameId);
  };
});