(function() {
    'use strict';

    // Book navigation drawer
    const bookNavToggle = document.getElementById('book-nav-toggle');
    const bookNavDrawer = document.getElementById('book-nav-drawer');
    const bookNavOverlay = document.getElementById('book-nav-overlay');
    const bookNavClose = document.getElementById('book-nav-close');

    if (bookNavToggle && bookNavDrawer && bookNavOverlay && bookNavClose) {
        let lastActiveElement = null;
        let prevBodyOverflow = '';

        function openBookNav() {
            lastActiveElement = document.activeElement;
            prevBodyOverflow = document.body.style.overflow;

            bookNavOverlay.hidden = false;
            bookNavDrawer.hidden = false;
            bookNavDrawer.classList.add('is-open');
            bookNavDrawer.setAttribute('aria-hidden', 'false');
            bookNavToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';

            // focus close button for keyboard users
            bookNavClose.focus();
        }

        function closeBookNav() {
            bookNavDrawer.classList.remove('is-open');
            bookNavDrawer.setAttribute('aria-hidden', 'true');
            bookNavToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = prevBodyOverflow;

            // Hide after transition ends (or immediately if transitions disabled)
            const hadTransition = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches === false;
            if (hadTransition) {
                window.setTimeout(function() {
                    bookNavDrawer.hidden = true;
                    bookNavOverlay.hidden = true;
                }, 220);
            } else {
                bookNavDrawer.hidden = true;
                bookNavOverlay.hidden = true;
            }

            if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
                lastActiveElement.focus();
            } else {
                bookNavToggle.focus();
            }
        }

        function isOpen() {
            return bookNavToggle.getAttribute('aria-expanded') === 'true';
        }

        bookNavToggle.addEventListener('click', function() {
            if (isOpen()) closeBookNav();
            else openBookNav();
        });

        bookNavClose.addEventListener('click', function() {
            closeBookNav();
        });

        bookNavOverlay.addEventListener('click', function() {
            closeBookNav();
        });

        // Close on Esc
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen()) {
                closeBookNav();
            }
        });

        // Close after clicking a link inside
        bookNavDrawer.addEventListener('click', function(e) {
            const target = e.target;
            if (target && target.tagName === 'A') {
                closeBookNav();
            }
        });
    }

    // Theme switching
    const THEME_STORAGE_KEY = 'preferred-theme';
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('.theme-icon');

        function setTheme(theme) {
            if (theme === 'dark') {
                document.body.classList.add('dark');
                document.body.classList.remove('light');
                if (themeIcon) themeIcon.textContent = '☾';
            } else {
                document.body.classList.remove('dark');
                document.body.classList.add('light');
                if (themeIcon) themeIcon.textContent = '☀';
            }

            try {
                localStorage.setItem(THEME_STORAGE_KEY, theme);
            } catch (e) {
                // Ignore localStorage errors
            }
        }

        function getInitialTheme() {
            // 1. Check localStorage
            try {
                const stored = localStorage.getItem(THEME_STORAGE_KEY);
                if (stored === 'dark' || stored === 'light') {
                    return stored;
                }
            } catch (e) {
                // Ignore localStorage errors
            }

            // 2. Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }

            // 3. Default to light
            return 'light';
        }

        // Initialize theme on page load
        const initialTheme = getInitialTheme();
        setTheme(initialTheme);

        // Handle theme toggle click
        themeToggle.addEventListener('click', function() {
            const hasDark = document.body.classList.contains('dark');
            const hasLight = document.body.classList.contains('light');
            
            // If no explicit theme is set, determine from system preference
            if (!hasDark && !hasLight) {
                const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                setTheme(systemPrefersDark ? 'light' : 'dark');
            } else {
                // Toggle between dark and light
                setTheme(hasDark ? 'light' : 'dark');
            }
        });

    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // Only auto-switch if user hasn't manually set a preference
            try {
                if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                    setTheme(e.matches ? 'dark' : 'light');
                }
            } catch (e) {
                // Ignore localStorage errors
            }
        });
    }
    }

    // Reading progress bar
    const progressBar = document.querySelector('.reading-progress__bar');
    const progressContainer = document.querySelector('.reading-progress');
    
    if (progressBar && progressContainer) {
        let ticking = false;
        
        function updateProgress() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const scrollable = scrollHeight - clientHeight;
            
            if (scrollable <= 0) {
                // Страница не скроллится, скрываем индикатор
                progressContainer.style.display = 'none';
                return;
            }
            
            // Показываем индикатор если он был скрыт
            progressContainer.style.display = 'block';
            
            // Вычисляем прогресс от 0 до 1
            const progress = Math.min(Math.max(scrollTop / scrollable, 0), 1);
            
            // Обновляем transform
            progressBar.style.transform = 'scaleX(' + progress + ')';
            
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }
        
        // Инициализация при загрузке
        updateProgress();
        
        // Обновление при скролле
        window.addEventListener('scroll', requestTick, { passive: true });
        
        // Обновление при изменении размера окна (может измениться scrollHeight)
        window.addEventListener('resize', requestTick, { passive: true });
    }

    // Scroll to top button
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    const SCROLL_THRESHOLD = 300;
    
    if (scrollToTopBtn) {
        let scrollTicking = false;
        
        function updateScrollToTop() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > SCROLL_THRESHOLD) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
            
            scrollTicking = false;
        }
        
        function requestScrollTick() {
            if (!scrollTicking) {
                window.requestAnimationFrame(updateScrollToTop);
                scrollTicking = true;
            }
        }
        
        // Инициализация при загрузке
        updateScrollToTop();
        
        // Обновление при скролле
        window.addEventListener('scroll', requestScrollTick, { passive: true });
        
        // Обработчик клика для плавной прокрутки наверх
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
})();

