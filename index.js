const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec; // To execute the Python script

const app = express();

// Function to call Python script and get open port
function getOpenPort(callback) {
    exec('python server.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${stderr}`);
            return callback(null);
        }
        const portMatch = stdout.match(/Open port found: (\d+)/);
        if (portMatch) {
            const port = parseInt(portMatch[1], 10);
            callback(port);
        } else {
            console.error('No open port found in Python script output');
            callback(null);
        }
    });
}

// Multer storage settings for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); // Create uploads folder if it doesn't exist
        }
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname); // Save file with original name
    }
});

const upload = multer({ storage: storage });

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // Send response after file upload
    res.send('File uploaded successfully.');
});

// Serve a simple HTML page for uploading files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to list all uploaded files and provide download links
app.get('/files', (req, res) => {
    const uploadPath = path.join(__dirname, 'uploads');
    fs.readdir(uploadPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to list files.');
        }
        let fileList = '<h1>Uploaded Files</h1><ul>';
        files.forEach(file => {
            fileList += `<li><a href="/download/${file}">${file}</a></li>`;
        });
        fileList += '</ul><a href="/">Go back</a>';
        res.send(fileList);
    });
});

// Endpoint to download a specific file
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    
    // Check if the file exists before trying to download
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('File not found.');
        }

        // Only try to send the file if no previous response has been sent
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                if (!res.headersSent) {
                    return res.status(500).send('Error downloading file.');
                }
            }
        });
    });
});

// Start server after finding an open port
getOpenPort((openPort) => {
    if (!openPort) {
        console.error('Could not find an open port.');
        return;
    }
    app.listen(openPort, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${openPort}`);
    });
});