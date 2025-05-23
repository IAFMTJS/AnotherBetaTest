import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { console, process } from 'node:global';

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    const filePath = req.url === '/' ? 'UPJAP.html' : req.url;
    const fullPath = join(process.cwd(), filePath);
    
    console.log('Request URL:', req.url);
    console.log('Resolved path:', fullPath);
    console.log('Current directory:', process.cwd());

    try {
        const data = await readFile(fullPath);

        const ext = extname(fullPath);
        let contentType = 'text/html';
        
        if (ext === '.js') contentType = 'text/javascript';
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.ico') contentType = 'image/x-icon';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (err) {
        console.error('Error:', err);
        if (err.code === 'ENOENT') {
            console.log('File not found:', fullPath);
            res.writeHead(404);
            res.end('Not Found');
        } else {
            res.writeHead(500);
            res.end('Internal Server Error');
        }
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
