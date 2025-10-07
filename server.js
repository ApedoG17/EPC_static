const express = require('express');
const multer = require('multer');
const basicAuth = require('express-basic-auth');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Basic Auth (change username/password as needed)
app.use('/admin-upload', basicAuth({
    users: { 'admin': 'yourStrongPassword' },
    challenge: true,
    realm: 'Admin Area'
}));

// Serve static files (your HTML/CSS/JS)
app.use(express.static(__dirname));

// Multer setup for file uploads
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// Handle book upload (POST)
app.post('/admin-upload', upload.fields([
    { name: 'bookFile', maxCount: 1 },
    { name: 'bookCover', maxCount: 1 }
]), (req, res) => {
    // Save book info (in production, save to a database)
    const bookData = {
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        digitalPrice: req.body.digitalPrice,
        physicalPrice: req.body.physicalPrice,
        bookFile: req.files.bookFile ? req.files.bookFile[0].filename : null,
        bookCover: req.files.bookCover ? req.files.bookCover[0].filename : null,
        uploadedAt: new Date().toISOString()
    };
    // Save to a JSON file (append)
    const booksPath = path.join(__dirname, 'books.json');
    let books = [];
    if (fs.existsSync(booksPath)) {
        books = JSON.parse(fs.readFileSync(booksPath));
    }
    books.push(bookData);
    fs.writeFileSync(booksPath, JSON.stringify(books, null, 2));
    res.json({ success: true, message: 'Book uploaded successfully!' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
