"use strict";
var http = require("http");
var os = require("os");
var fs = require("fs");
var HttpServer = (function () {
    function HttpServer(port) {
        this.nodePort = port;
    }
    HttpServer.prototype.onRequest = function (request, response) {
        console.log('New request: ' + request.url);
        fs.readFile('./index.html', function (err, data) {
            if (err) {
                throw err;
            }
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(data);
            response.end();
        });
    };
    HttpServer.prototype.onStart = function () {
        var httpServer = http.createServer(this.onRequest);
        httpServer.listen(this.nodePort);
        console.log('Server listenning on http://' + os.hostname() + ':' + this.nodePort + '/');
    };
    return HttpServer;
}());
var server = new HttpServer(8080).onStart();
//# sourceMappingURL=app.js.map