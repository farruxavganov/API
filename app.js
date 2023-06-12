const express = require('express');
const multer = require('multer');
const path = require("path");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const fs = require('fs');

const app = express();


// Serve Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
  }
});

// Create a multer instance with the storage configuration
const upload = multer({ storage });

// POST route for uploading video files
app.post('/api/videos', upload.single('file'), (req, res) => {
  const { file } = req;
  const filename = req.file.filename;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
  } else {
    res.json({ message: 'File uploaded successfully', filename: filename });
  }
});

// POST route for uploading image files
app.post('/api/images', upload.single('file'), (req, res) => {
  const { file } = req;
  const filename = req.file.filename;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
  } else {
    res.json({ message: 'File uploaded successfully', filename: filename });
  }
});

// POST route for uploading text files
app.post('/api/texts', upload.single('file'), (req, res) => {
  const { file } = req;
  const filename = req.file.filename;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
  } else {
    res.json({ message: 'File uploaded successfully', filename: filename });
  }
});

// GET route for video files
app.get('/api/videos/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.resolve(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// GET route for image files
app.get('/api/images/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.resolve(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// GET route for text files
app.get('/api/texts/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.resolve(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.status(500).json({ error: 'Failed to read file' });
      } else {
        res.send(data);
      }
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

