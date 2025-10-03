document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formFields = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        message: document.getElementById('message')
    };

    // Real-time validation
    Object.keys(formFields).forEach(field => {
        formFields[field].addEventListener('blur', function() {
            validateField(this);
        });
    });

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields before submission
        const isValid = Object.values(formFields).every(field => validateField(field));
        
        if (isValid) {
            submitForm();
        }
    });

    function validateField(field) {
        let isValid = true;
        const value = field.value.trim();

        // Remove existing error messages
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        switch(field.id) {
            case 'name':
                if (value.length < 2) {
                    showError(field, 'Name must be at least 2 characters long');
                    isValid = false;
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    showError(field, 'Please enter a valid email address');
                    isValid = false;
                }
                break;

            case 'message':
                if (value.length < 10) {
                    showError(field, 'Message must be at least 10 characters long');
                    isValid = false;
                }
                break;
        }

        // Visual feedback
        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
        }

        return isValid;
    }

    function showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
    }

    function submitForm() {
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        // Disable form and show loading state
        submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
        submitBtn.disabled = true;
        Object.values(formFields).forEach(field => field.disabled = true);

        // Prepare form data
        const formData = {
            name: formFields.name.value,
            email: formFields.email.value,
            message: formFields.message.value,
            newsletter: document.getElementById('newsletter').checked,
            timestamp: new Date().toISOString()
        };

        // Simulate API call
        setTimeout(() => {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message show';
            successMessage.textContent = 'Thank you for your message! We will get back to you within 24 hours.';
            contactForm.insertBefore(successMessage, contactForm.firstChild);

            // Reset form
            contactForm.reset();
            Object.values(formFields).forEach(field => {
                field.disabled = false;
                field.classList.remove('valid');
            });
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.classList.remove('show');
                setTimeout(() => successMessage.remove(), 300);
            }, 5000);

            // Log form submission (replace with actual API call)
            console.log('Form submitted:', formData);

            // Send confirmation email (simulated)
            sendConfirmationEmail(formData.email, formData.name);

        }, 2000);
    }

    function sendConfirmationEmail(email, name) {
        console.log(`Sending confirmation email to ${email}`);
        // In a real application, this would make an API call to your backend
    }
});
