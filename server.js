/**
 * Server.js sets up the server on port number : 8080
 */
const http = require('http');
const app = require('./app');

const port = 8080;

const server = http.createServer(app);

server.listen(port);