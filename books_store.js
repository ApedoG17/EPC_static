// Simple book store functionality
document.addEventListener('DOMContentLoaded', function() {
    // Sample book data (in real app, this comes from your backend)
    const books = [
        {
            id: 1,
            title: "PMP Certification Mastery Guide",
            description: "Complete guide to passing the PMP exam on your first attempt. Includes practice questions and study strategies.",
            price: 49.99,
            category: "pmp",
            pages: 350,
            formats: ["PDF", "EPUB", "Word"],
            image: "images/pmp-guide.jpg",
            file: "downloads/pmp-guide.pdf"
        },
        {
            id: 2,
            title: "Microsoft Project Complete Guide", 
            description: "From basics to advanced features. Learn to plan, track, and manage projects effectively.",
            price: 39.99,
            category: "pmp", 
            pages: 280,
            formats: ["PDF", "Word"],
            image: "images/ms-project-guide.jpg",
            file: "downloads/ms-project-guide.pdf"
        }
    ];

    const booksGrid = document.getElementById('booksGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Display books
    function displayBooks(booksToShow) {
        booksGrid.innerHTML = '';
        booksToShow.forEach(book => {
            const bookCard = `
                <div class="book-card" data-category="${book.category}">
                    <div class="book-image">
                        <img src="${book.image}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x250/4A90E2/FFFFFF?text=Book+Cover'">
                    </div>
                    <div class="book-details">
                        <h3>${book.title}</h3>
                        <p class="book-description">${book.description}</p>
                        <div class="book-meta">
                            <span>📖 ${book.pages} pages</span>
                            <span>📄 ${book.formats.join(', ')}</span>
                        </div>
                        <div class="pricing">
                            <div class="price">$${book.price}</div>
                            <button class="buy-btn" onclick="initiatePayment(${book.id})">
                                <i class="fas fa-shopping-cart"></i>
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
            booksGrid.innerHTML += bookCard;
        });
    }

    // Filter books
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filteredBooks = category === 'all' 
                ? books 
                : books.filter(book => book.category === category);
            
            displayBooks(filteredBooks);
        });
    });

    // Initial display
    displayBooks(books);
});

// Payment function (simplified - will integrate with Paystack)
function initiatePayment(bookId) {
    // For now, just show an alert
    alert('This will redirect to Paystack payment page. Book ID: ' + bookId);
    
    // In real implementation:
    // 1. Redirect to Paystack checkout
    // 2. After payment, redirect to success page with download link
    // 3. Or use Paystack inline payment modal
}