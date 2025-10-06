// Careers page functionality
document.addEventListener('DOMContentLoaded', function() {
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
});