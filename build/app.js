"use strict";
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="S_player.ts" />
var express = require("express");
var http = require("http");
var io = require("socket.io");
var S_player_1 = require("./S_player");
var Server = (function () {
    function Server(port) {
        this.nodePort = port;
        this.app = express();
        this.server = http.createServer(this.app);
        this.sio = io(this.server);
        this.server.listen(port);
        console.log("listening on port :" + port);
        this.players = new Array();
        this.sio.on('connection', this.OnConnection.bind(this));
    }
    Server.prototype.OnConnection = function (socket) {
        var _this = this;
        console.log("connection");
        //msg function binding
        socket.on('fleetName', function (name) {
            _this.OnFleetName(name, socket);
        });
        socket.on('disconnect', function () {
            _this.OnDisconnect(socket);
        });
    };
    Server.prototype.OnFleetName = function (name, socket) {
        console.log(name);
        this.players.push(new S_player_1.Player(0, name, socket));
    };
    Server.prototype.OnJoin = function () {
    };
    Server.prototype.OnCreate = function () {
    };
    Server.prototype.OnDisconnect = function (socket) {
        var p = this.players.filter(function (val) {
            return val.socket === socket;
        })[0];
        if (p) {
            this.players.splice(this.players.indexOf(p), 1);
            console.log("Fleet " + p.name + " has disconnected");
        }
    };
    return Server;
}());
var server = new Server(8080);
//# sourceMappingURL=app.js.map