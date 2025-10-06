// Careers page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Animate elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.pathway-stage, .job-card, .benefit-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight - 100 && elementBottom > 0) {
                element.classList.add('animate-in');
            }
        });
    };

    // Smooth scroll for navigation
    const smoothScroll = (target) => {
        const element = document.querySelector(target);
        window.scrollTo({
            top: element.offsetTop - 80,
            behavior: 'smooth'
        });
    };

    // Initialize animations
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check

    // Add hover effects for job cards
    document.querySelectorAll('.job-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.careers-hero');
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
    });

    // Job filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const jobCards = document.querySelectorAll('.job-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active filter
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter jobs
            jobCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-type').includes(filter)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Application modal
    const applyButtons = document.querySelectorAll('.apply-btn');
    const applicationModal = document.getElementById('applicationModal');
    const closeModal = document.querySelector('.close-modal');
    const modalJobTitle = document.getElementById('modalJobTitle');
    
    applyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const jobTitle = this.closest('.job-card').querySelector('h3').textContent;
            modalJobTitle.textContent = jobTitle;
            applicationModal.style.display = 'block';
        });
    });
    
    closeModal.addEventListener('click', function() {
        applicationModal.style.display = 'none';
    });
    
    // Application form submission
    const applicationForm = document.getElementById('jobApplicationForm');
    applicationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulate form submission
        const submitBtn = this.querySelector('.submit-application-btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            alert('Application submitted successfully! We will review your application and get back to you soon.');
            applicationForm.reset();
            applicationModal.style.display = 'none';
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
    
    // Initialize job filters with animation
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.job-card').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    if (filter === 'all' || card.dataset.type.includes(filter)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });
});