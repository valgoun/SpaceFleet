"use strict";
/// <reference path="../typings/tsd.d.ts" />
var express = require("express");
var http = require("http");
var io = require("socket.io");
var Server = (function () {
    function Server(port) {
        this.nodePort = port;
        this.app = express();
        this.server = http.createServer(this.app);
        this.sio = io(this.server);
        this.server.listen(port);
        console.log("listening on port :" + port);
        this.sio.on('connection', this.OnConnection);
    }
    Server.prototype.OnConnection = function (socket) {
        console.log("connection");
        socket.on('fleetName', function (msg) {
            console.log(msg);
        });
    };
    return Server;
}());
var server = new Server(8080);
//# sourceMappingURL=app.js.map