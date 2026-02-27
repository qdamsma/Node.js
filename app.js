const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;
    // Handle GET request to root URL
    if (url === '/') {
        res.write('<html>');
        res.write('<head><title>Home Page</title></head>');
        res.write('<body><form action="/message" method="POST"><input type="text" name="message" placeholder="Enter message"><button type="submit">Send</button></form></body>');
        res.write('</html>');
        return res.end();
    }
    // Handle POST request to /message
    if (url === '/message' && method === 'POST') {
        const body = [];
        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1];
            fs.writeFileSync('messages.txt', message);
        });
        res.writeHead(302, { 'Location': '/' });
        return res.end();
    }
    res.setHeader('Content-Type', 'text/html');
    res.write('<h1>Hello World</h1>');
    res.end();
});

server.listen(3000);