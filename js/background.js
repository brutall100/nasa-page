/* Live background: a Mars dust storm.
   Dust grains drift across the screen on the wind, stars twinkle at night.
   Only transform and opacity are animated (in CSS), so it stays light on the CPU. */
(function () {
    const layer = document.querySelector('.sky__particles');
    if (!layer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const isSmallScreen = window.matchMedia('(max-width: 640px)').matches;
    const DUST_COUNT = isSmallScreen ? 28 : 56;
    const STAR_COUNT = isSmallScreen ? 20 : 40;

    const random = (min, max) => Math.random() * (max - min) + min;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < DUST_COUNT; i++) {
        const grain = document.createElement('span');
        const duration = random(14, 34);
        grain.className = Math.random() < 0.3 ? 'dust dust--blur' : 'dust';
        grain.style.setProperty('--y', `${random(0, 100)}vh`);
        grain.style.setProperty('--size', `${random(1.5, 5).toFixed(1)}px`);
        grain.style.setProperty('--duration', `${duration.toFixed(1)}s`);
        /* Negative delay: grains are already mid-flight when the page opens */
        grain.style.setProperty('--delay', `${(-random(0, duration)).toFixed(1)}s`);
        grain.style.setProperty('--wobble', `${random(-6, 6).toFixed(1)}vh`);
        grain.style.setProperty('--fall', `${random(-4, 12).toFixed(1)}vh`);
        fragment.appendChild(grain);
    }

    for (let i = 0; i < STAR_COUNT; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.style.setProperty('--x', `${random(0, 100)}vw`);
        star.style.setProperty('--y', `${random(0, 55)}vh`);
        star.style.setProperty('--size', `${random(1, 2.6).toFixed(1)}px`);
        star.style.setProperty('--duration', `${random(3, 7).toFixed(1)}s`);
        star.style.setProperty('--delay', `${(-random(0, 7)).toFixed(1)}s`);
        star.style.setProperty('--peak', random(0.4, 1).toFixed(2));
        fragment.appendChild(star);
    }

    layer.appendChild(fragment);
})();
