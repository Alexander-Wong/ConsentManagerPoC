import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist (compiled library)
app.use(express.static('dist'));

// Serve static files from public (HTML examples)
app.use(express.static(path.join(__dirname, 'public')));

// Serve bundled files from bundles directory
app.use('/bundles', express.static(path.join(__dirname, 'bundles')));

// Handle favicon requests to prevent 404 errors
app.get('/favicon.ico', (_req, res) => {
    res.status(204).end(); // No Content
});

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});