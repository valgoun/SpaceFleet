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
        socket.on('Join', function (lobby) {
            _this.OnJoin(socket, lobby);
        });
        socket.on('Leave', function () {
            _this.OnLeave(socket);
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
    Server.prototype.OnJoin = function (socket, lobbyName) {
        var p = this.players.filter(function (val) {
            return val.socket === socket;
        })[0];
        if (!p) {
            socket.emit("Error", "A non player socket try to connect to a lobby");
        }
        else {
            var g = this.Games.filter(function (val) {
                return val.Name === lobbyName;
            })[0];
            g.Players.push(p.name);
            socket.emit("LobbyConnection", g.Name, g.Players);
            socket.join(g.Name);
            socket.to(g.Name).broadcast.emit('PlayerJoined', p.name);
            if (g.Players.length == 2)
                g.Host.socket.emit("GameReady");
        }
    };
    Server.prototype.OnCreateLobby = function (name, password, socket) {
        var p = this.players.filter(function (val) {
            return val.socket === socket;
        })[0];
        var lobby = new lobby_1.Lobby(name, p, password);
        this.Games.push(lobby);
        socket.emit("LobbyConnection", lobby.Name, lobby.Players);
        socket.join(lobby.Name);
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
    Server.prototype.OnLeave = function (socket) {
        console.log("-------------------");
        console.log("a player leave");
        var p = this.players.filter(function (val) {
            return val.socket === socket;
        })[0];
        if (!p) {
            console.error("a non player socket emited a leaving message");
            return;
        }
        var g = this.Games.filter(function (val) {
            return val.Players.indexOf(p.name) != -1;
        })[0];
        if (!g) {
            console.error("a player try to leave a lobby but he was in no lobby");
            return;
        }
        if (p === g.Host)
            this.ReHost(g);
        else {
            g.Players.splice(g.Players.indexOf(p.name), 1);
            socket.to(g.Name).broadcast.emit("PlayerLeave", p.name);
            socket.leave(g.Name);
            if (g.Players.length == 1)
                g.Host.socket.emit("GameNotReady");
        }
    };
    //when host of a game disconnect or leave
    Server.prototype.ReHost = function (game) {
    };
    return Server;
}());
var server = new Server(8080);
//# sourceMappingURL=app.js.map