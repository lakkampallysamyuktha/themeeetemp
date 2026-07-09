// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if(hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            if(navLinks.classList.contains('active')) {
                hamburger.textContent = 'close';
                document.body.style.overflow = 'hidden'; // prevent scrolling when menu is open
            } else {
                hamburger.textContent = 'menu';
                document.body.style.overflow = '';
            }
        });
    }

    // Sticky Header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if(window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }

    // Initialize Swiper for Hero Section
    if (document.querySelector('.hero-swiper')) {
        const heroSwiper = new Swiper('.hero-swiper', {
            direction: 'horizontal',
            slidesPerView: 1,
            spaceBetween: 0,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination-custom',
                clickable: true,
            },
            navigation: {
                nextEl: '.hero-swiper-next',
                prevEl: '.hero-swiper-prev',
            },
            on: {
                slideChangeTransitionStart: function () {
                    // Re-trigger animations in the new slide
                    const activeSlide = this.slides[this.activeIndex];
                    const animatedElements = activeSlide.querySelectorAll('.hero-text-block h1, .hero-text-block h4, .hero-meta, .hero-visualizer-container');
                    
                    // Simple hack to restart CSS animations if any
                    animatedElements.forEach(el => {
                        el.style.animation = 'none';
                        el.offsetHeight; /* trigger reflow */
                        el.style.animation = null; 
                    });
                }
            }
        });

        // Pause swiper on button hover
        const heroButtons = document.querySelectorAll('.hero-action-buttons .btn');
        heroButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => heroSwiper.autoplay.stop());
            btn.addEventListener('mouseleave', () => heroSwiper.autoplay.start());
        });
    }

    // Initialize Swiper for Trending Podcasts
    if (document.querySelector('.trending-swiper')) {
        new Swiper('.trending-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            breakpoints: {
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
            },
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            }
        });
    }
    
    // Initialize Swiper for Creators
    if (document.querySelector('.creator-swiper')) {
        new Swiper('.creator-swiper', {
            slidesPerView: 2,
            spaceBetween: 20,
            breakpoints: {
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 }
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            }
        });
    }

    // Initialize Swiper for Recommended (Top Podcasts style)
    if (document.querySelector('.recommend-swiper')) {
        new Swiper('.recommend-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            centeredSlides: false,
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 }
            },
            navigation: {
                nextEl: '.recommend-swiper-next',
                prevEl: '.recommend-swiper-prev',
            },
            pagination: {
                el: '.recommend-pagination',
                clickable: true,
            },
            autoplay: {
                delay: 3000, // Scroll every 3 seconds
                disableOnInteraction: false,
                pauseOnMouseEnter: false // Keep scrolling even if hovered
            },
            on: {
                init: function () {
                    updateBg(this);
                },
                slideChange: function () {
                    updateBg(this);
                }
            }
        });

        function updateBg(swiper) {
            const activeSlide = swiper.slides[swiper.activeIndex];
            if (activeSlide) {
                const img = activeSlide.querySelector('.slide-img-wrap img');
                if (img) {
                    const imgSrc = img.getAttribute('src');
                    const bgDiv = document.querySelector('.recommend-section');
                    if (bgDiv) {
                        bgDiv.style.backgroundImage = `linear-gradient(rgba(31, 36, 48, 0.82), rgba(31, 36, 48, 0.82)), url('${imgSrc}')`;
                    }
                }
            }
        }
    }


    // Billboard Click to Swap Logic
    const sideCards = document.querySelectorAll('.billboard-side-card');
    const mainBillboard = document.querySelector('.billboard-main');
    
    if (sideCards.length > 0 && mainBillboard) {
        sideCards.forEach(card => {
            card.style.cursor = 'pointer'; // Make it look clickable
            card.addEventListener('click', function() {
                // Get elements of the main billboard
                const mainImg = mainBillboard.querySelector('.billboard-bg');
                const mainTitle = mainBillboard.querySelector('.billboard-title');
                const mainAuthor = mainBillboard.querySelector('.billboard-author');

                // Get elements of the clicked side card
                const sideImg = this.querySelector('img');
                const sideTitle = this.querySelector('h4');
                const sideAuthor = this.querySelector('p');

                // Visual flash effect on main billboard
                mainBillboard.style.transition = 'opacity 0.2s';
                mainBillboard.style.opacity = '0.5';

                setTimeout(() => {
                    // Swap image sources
                    const tempImgSrc = mainImg.src;
                    mainImg.src = sideImg.src;
                    sideImg.src = tempImgSrc;

                    // Swap Titles
                    const tempTitle = mainTitle.innerHTML;
                    mainTitle.innerHTML = sideTitle.innerHTML;
                    sideTitle.innerHTML = tempTitle;

                    // Swap Authors
                    const tempAuthor = mainAuthor.innerHTML;
                    mainAuthor.innerHTML = sideAuthor.innerHTML;
                    sideAuthor.innerHTML = tempAuthor;
                    
                    mainBillboard.style.opacity = '1';
                }, 150);
            });
        });
    }

    // Make specific buttons inside cards clickable to 404 page
    const actionButtons = document.querySelectorAll('.card-overlay, .overlay-play-btn, .topic-chevron, .topic-card-content, .btn-play, .side-play-btn');
    actionButtons.forEach(btn => {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '404.html';
        });
    });

    // Clear forms when using browser back button (Bfcache)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            document.querySelectorAll('form').forEach(form => form.reset());
        }
    });

    // Basic GSAP Animations if GSAP is available
    if (typeof gsap !== 'undefined') {
        // Hero Timeline
        const tl = gsap.timeline();
        tl.from('.hero-text h1', {y: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2})
          .from('.hero-text p', {y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'}, "-=0.6")
          .from('.hero-buttons .btn', {y: 20, opacity: 0, duration: 0.5, stagger: 0.2, ease: 'power2.out'}, "-=0.4")
          .from('.stats .stat-item', {x: -20, opacity: 0, duration: 0.5, stagger: 0.2, ease: 'power2.out'}, "-=0.2");
    }

    // =========================================
    // NATIVE SCROLL ANIMATIONS (Intersection Observer)
    // =========================================
    const autoElements = document.querySelectorAll('.section-title, .podcast-card, .creator-card, .creative-cat-card, .episode-item-creative, .plan-card, .testimonial-card');
    
    // Add base class if no scroll animation class is already manually defined in HTML
    const animClasses = [
        'fade-up-element', 'fade-down-element', 'fade-left-element', 'fade-right-element',
        'zoom-in-element', 'zoom-out-element', 'flip-left-element', 'flip-right-element'
    ];
    
    autoElements.forEach((el, index) => {
        const hasAnimClass = animClasses.some(cls => el.classList.contains(cls));
        if (!hasAnimClass) {
            el.classList.add('fade-up-element');
            // Add a slight stagger based on index for siblings
            el.style.transitionDelay = `${(index % 4) * 0.1}s`;
        }
    });

    const selector = animClasses.map(cls => `.${cls}`).join(', ');
    const allAnimateElements = document.querySelectorAll(selector);

    const scrollObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // Animate progress bars if any exist inside this element
                const progressBars = entry.target.querySelectorAll('.epi-progress');
                progressBars.forEach(bar => {
                    const targetWidth = bar.getAttribute('data-width');
                    if (targetWidth) {
                        // Small delay to allow the fade-up animation to start first
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 300);
                    }
                });

                // Trigger number counters if present in this element
                const counterSpans = entry.target.querySelectorAll('.counter-value');
                counterSpans.forEach(span => {
                    const target = parseInt(span.getAttribute('data-target'), 10);
                    if (!isNaN(target)) {
                        let current = 0;
                        const duration = 1200; // 1.2s duration
                        const stepTime = Math.max(Math.floor(duration / target), 15);
                        const stepValue = Math.ceil(target / (duration / stepTime));
                        const timer = setInterval(() => {
                            current += stepValue;
                            if (current >= target) {
                                span.textContent = target;
                                clearInterval(timer);
                            } else {
                                span.textContent = current;
                            }
                        }, stepTime);
                    }
                });

                obs.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    allAnimateElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // =========================================
    // IMAGE LAZY LOADING (Intersection Observer)
    // =========================================
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0 && 'IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    img.style.opacity = '1';
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '0px 0px 100px 0px' // Load slightly before entering viewport
        });
        lazyImages.forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease-in-out';
            imageObserver.observe(img);
        });
    }
});
