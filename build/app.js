"use strict";
/// <reference path="../typings/tsd.d.ts" />
var express = require("express");
var http = require("http");
var io = require("socket.io");
var player_1 = require("./player");
var lobby_1 = require("./lobby");
var Server = (function () {
    function Server(port) {
        this.nodePort = port;
        this.app = express();
        this.server = http.createServer(this.app);
        this.sio = io(this.server);
        this.server.listen(port);
        this.players = new Array();
        this.Games = new Array();
        console.log("listening on port :" + port);
        this.sio.on('connection', this.OnConnection.bind(this));
    }
    Server.prototype.OnConnection = function (socket) {
        var _this = this;
        console.log("----------");
        console.log("connection");
        //msg function binding
        socket.on('fleetName', function (name) {
            _this.OnFleetName(name, socket);
        });
        socket.on('disconnect', function () {
            _this.OnDisconnect(socket);
        });
        socket.on('CreateLobby', function (name, password) {
            _this.OnCreateLobby(name, password, socket);
        });
        socket.on('refreshLobbyList', function () {
            _this.OnRetrieveLobby(socket);
        });
    };
    Server.prototype.OnFleetName = function (name, socket) {
        console.log("------------------------------");
        console.log("new player : " + name);
        this.players.push(new player_1.Player(0, name, socket));
    };
    Server.prototype.OnRetrieveLobby = function (socket) {
        var names = Array();
        this.Games.forEach(function (lobby) {
            names.push(lobby.Name);
        });
        socket.emit("LobbyList", names);
    };
    Server.prototype.OnJoin = function () {
    };
    Server.prototype.OnCreateLobby = function (name, password, socket) {
        var p = this.players.filter(function (val) {
            return val.socket === socket;
        })[0];
        var lobby = new lobby_1.Lobby(name, p, password);
        this.Games.push(lobby);
        socket.emit("LobbyConnection", lobby.Name, lobby.Players);
        console.log("-------------");
        console.log("Looby created");
        console.log("Host : " + p.name);
        console.log("Lobby name : " + name);
        console.log("password : " + password);
    };
    Server.prototype.OnDisconnect = function (socket) {
        console.log("-------------------");
        console.log("disconnection");
        var p = this.players.filter(function (val) {
            return val.socket === socket;
        })[0];
        if (p) {
            var g = this.Games.filter(function (val) {
                return val.Host === p;
            })[0];
            if (g) {
                this.Games.splice(this.Games.indexOf(g), 1);
                console.log("Lobby[" + g.Name + "] has been destroyed because host has disconnected");
            }
            this.players.splice(this.players.indexOf(p), 1);
            console.log("Fleet " + p.name + " has disconnected");
        }
    };
    return Server;
}());
var server = new Server(8080);
//# sourceMappingURL=app.js.map