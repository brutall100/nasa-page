/* Small interface helpers: theme toggle, button ripple,
   scroll reveal and counting numbers. */
(function () {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    /* ---------- Light / dark theme ---------- */
    const toggle = document.querySelector('.theme-toggle');

    function currentTheme() {
        return root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
    }

    function updateToggleLabel() {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        toggle.setAttribute('aria-label', `Switch to ${next} theme`);
    }

    toggle.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try {
            localStorage.setItem('theme', next);
        } catch (error) {
            /* Storage blocked: the choice lasts until the page reloads */
        }
        updateToggleLabel();
    });

    systemDark.addEventListener('change', updateToggleLabel);
    updateToggleLabel();

    /* ---------- Ripple on every button ---------- */
    document.addEventListener('pointerdown', (event) => {
        const button = event.target.closest('.btn');
        if (!button || reduceMotion) return;
        const box = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = `${event.clientX - box.left}px`;
        ripple.style.top = `${event.clientY - box.top}px`;
        ripple.addEventListener('animationend', () => ripple.remove());
        button.appendChild(ripple);
    });

    /* ---------- Count-up numbers ---------- */
    function countUp(element, target) {
        const format = (value) => Math.round(value).toLocaleString('en-US');
        if (reduceMotion) {
            element.textContent = format(target);
            return;
        }
        const duration = 1600;
        const start = performance.now();
        function frame(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = format(target * eased);
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    /* ---------- Reveal on scroll ---------- */
    const revealItems = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        revealItems.forEach((item) => observer.observe(item));
    }

    /* Start counting when the number scrolls into view */
    function countWhenVisible(element, target) {
        if (!('IntersectionObserver' in window)) {
            countUp(element, target);
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            countUp(element, target);
            observer.disconnect();
        });
        observer.observe(element);
    }

    window.UI = { countWhenVisible };
})();
