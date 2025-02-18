document.addEventListener('DOMContentLoaded', () => {
    // Header scroll effect
    const header = document.querySelector('.navbar');
    const scrollThreshold = 100;

    function updateHeader() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateHeader);
    // Initial header check
    updateHeader();

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    function toggleMobileMenu() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    }

    menuToggle.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightNavLink() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);
    // Initial highlight check
    highlightNavLink();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                // Close mobile menu if open
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');

                // Calculate scroll position
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form handling
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Add loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Simulate form submission
            setTimeout(() => {
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }, 1500);
        });
    }

    // Add scroll animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Blog popup functionality
    function openBlogPopup(popupId) {
        const popup = document.getElementById(popupId);
        if (!popup) return;

        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Initialize scroll effect
        const popupContent = popup.querySelector('.blog-popup-content');
        const popupImage = popup.querySelector('.blog-popup-image');
        
        if (popupContent && popupImage) {
            // Reset image position
            popupImage.style.transform = 'translateY(0)';
            
            // Add scroll listener
            popupContent.addEventListener('scroll', function() {
                const scrolled = popupContent.scrollTop;
                const parallaxSpeed = 0.4; // Increased speed for more noticeable effect
                requestAnimationFrame(() => {
                    popupImage.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
                });
            });
        }
    }

    function closeBlogPopup(popupId) {
        const popup = document.getElementById(popupId);
        if (!popup) return;

        // Reset image position
        const popupImage = popup.querySelector('.blog-popup-image');
        if (popupImage) {
            popupImage.style.transform = 'translateY(0)';
        }

        popup.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Close popup when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('blog-popup-overlay')) {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Close popup with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const popups = document.getElementsByClassName('blog-popup-overlay');
            for (let popup of popups) {
                popup.style.display = 'none';
            }
            document.body.style.overflow = 'auto';
        }
    });
}); 