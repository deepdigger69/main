const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const publicDirectory = path.join(__dirname, 'public');
const contentTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.svg': 'image/svg+xml',
};

const server = http.createServer((request, response) => {
	const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
	const requestedPath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
	const filePath = path.resolve(publicDirectory, requestedPath);

	if (!filePath.startsWith(`${publicDirectory}${path.sep}`)) {
		response.writeHead(403);
		response.end('Forbidden');
		return;
	}

	fs.readFile(filePath, (error, contents) => {
		if (error) {
			response.writeHead(error.code === 'ENOENT' ? 404 : 500);
			response.end(error.code === 'ENOENT' ? 'Not found' : 'Unable to read file');
			return;
		}

		response.writeHead(200, {
			'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
			'X-Content-Type-Options': 'nosniff',
		});
		response.end(contents);
	});
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, '0.0.0.0', () => {
	console.log(`IceRen is running at http://localhost:${port}`);
});
