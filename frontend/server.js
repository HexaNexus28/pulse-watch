const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes (proxy to backend)
app.use('/api/*', (req, res) => {
    const targetUrl = `http://localhost:5000${req.originalUrl}`;

    // Simple proxy implementation
    const http = require('http');
    const https = require('https');
    const url = require('url');

    const parsedUrl = url.parse(targetUrl);
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: req.method,
        headers: {
            'Content-Type': 'application/json',
            ...req.headers,
            host: parsedUrl.hostname,
        },
    };

    const proxy = parsedUrl.protocol === 'https:' ? https : http;

    const proxyReq = proxy.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error' });
    });

    req.pipe(proxyReq);
});

// PWA Routes
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// Serve PWA icons
app.get('/pwa-192x192.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pwa-192x192.png'));
});

app.get('/pwa-512x512.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pwa-512x512.png'));
});

// Catch all handler - serve index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 PulseWatch Frontend Server running on port ${PORT}`);
    console.log(`📱 PWA features enabled`);
    console.log(`🔗 Proxying API requests to http://localhost:5000`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
