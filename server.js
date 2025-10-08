const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(express.static('public'));

// Serve book files from 'downloads' folder
app.use('/downloads', express.static('downloads'));
app.use('/images', express.static('images'));

// Simple book storage (in production, use a database)
let books = [];
const booksFile = path.join(__dirname, 'books.json');
if (fs.existsSync(booksFile)) {
    books = require('./books.json');
}

// Upload book endpoint
app.post('/upload-book', (req, res) => {
    try {
        const { title, description, price, category } = req.body;
        const bookFile = req.files.bookFile;
        const coverImage = req.files.bookCover;

        // Save files
        const bookId = Date.now();
        const bookPath = `downloads/book-${bookId}.pdf`;
        const coverPath = `images/book-${bookId}.jpg`;

        bookFile.mv(path.join(__dirname, bookPath));
        if (coverImage) coverImage.mv(path.join(__dirname, coverPath));

        // Add to books array
        const newBook = {
            id: bookId,
            title,
            description,
            price: parseFloat(price),
            category,
            file: bookPath,
            image: coverPath
        };

        books.push(newBook);

        // Save to JSON file (in production, use database)
        fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

        res.json({ success: true, book: newBook });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get books endpoint
app.get('/books', (req, res) => {
    res.json(books);
});

app.listen(3000, () => {
    console.log('Book store server running on port 3000');
});
