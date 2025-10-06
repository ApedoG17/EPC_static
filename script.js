document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Page Transitions
document.addEventListener('DOMContentLoaded', function() {
    // Create transition overlay
    const transitionElement = document.createElement('div');
    transitionElement.className = 'page-transition';
    document.body.appendChild(transitionElement);

    // Add entrance animations to elements
    const animateElements = document.querySelectorAll('.hero, .feature-card, .mission-card, .course-card');
    animateElements.forEach((element, index) => {
        element.classList.add('fade-in');
        element.classList.add(`delay-${(index + 1) * 100}`);
    });

    // Handle link clicks for page transitions
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (link.target === '_blank' || link.getAttribute('href').startsWith('#')) {
                return; // Skip transition for external links and anchor links
            }
            
            e.preventDefault();
            const nextPage = this.getAttribute('href');

            // Trigger transition animation
            transitionElement.classList.add('active');

            // Navigate to next page after animation
            setTimeout(() => {
                window.location.href = nextPage;
            }, 600);
        });
    });
});

// Initialize animations on page load
window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
});

// Scroll Animation
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.scroll-animate');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.9) {
            element.classList.add('active');
        }
    });
}

// Navigation Highlight
function updateNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 150) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(currentSection)) {
            link.classList.add('active');
        }
    });
}

// Initialize animations
window.addEventListener('scroll', () => {
    handleScrollAnimation();
    updateNavHighlight();
});

// Trigger initial animation check
window.addEventListener('load', () => {
    handleScrollAnimation();
    updateNavHighlight();
});

// Add scroll-animate class to elements
document.querySelectorAll('section, .feature-card, .mission-card, .course-card, .pathway-card').forEach(element => {
    element.classList.add('scroll-animate');
});
