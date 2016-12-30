/// <reference path="../typings/tsd.d.ts" />
import express = require('express');
import http = require('http');
import io = require('socket.io');
import { Player } from "./player";
import { Lobby } from "./lobby";

class Server {
    nodePort: number;
    app: express.Application;
    server: http.Server;
    sio: SocketIO.Server;
    players: Player[];
    Games: Lobby[];

    constructor(port: number) {
        this.nodePort = port;
        this.app = express();
        this.server = http.createServer(this.app);
        this.sio = io(this.server);
        this.server.listen(port);
        this.players = new Array<Player>();
        this.Games = new Array<Lobby>();


        console.log("listening on port :" + port);
        this.sio.on('connection', this.OnConnection.bind(this));
    }

    OnConnection(socket: SocketIO.Socket) {
        console.log("----------");
        console.log("connection");

        //msg function binding
        socket.on('fleetName', (name) => {
            this.OnFleetName(name, socket);
        });
        socket.on('disconnect', () => {
            this.OnDisconnect(socket);
        });
        socket.on('CreateLobby', (name, password) => {
            this.OnCreateLobby(name, password, socket);
        });
        socket.on('refreshLobbyList', () => {
            this.OnRetrieveLobby(socket);
        });
        socket.on('Join', (lobby: string) => {
            this.OnJoin(socket, lobby);
        });
        socket.on('Leave', () => {
            this.OnLeave(socket);
        });
        socket.on('Play', () => {
            this.OnPlay(socket);
        });

        //Phaser msg function binding
        socket.on('moveShip', (playerName: string, shipsData) => {
            this.OnMoveShip(playerName, shipsData, socket);
        });

        socket.on('damage', (playerName: string, motherShipData) => {
            this.OnDamage(playerName, motherShipData, socket);
        });

        socket.on('shoot', (playerName: string, shootData) => {
            this.OnShoot(playerName, shootData, socket);
        });
    }

    OnFleetName(name: string, socket: SocketIO.Socket) {
        console.log("------------------------------");
        console.log("new player : " + name);
        this.players.push(new Player(0, name, socket));
    }

    OnRetrieveLobby(socket: SocketIO.Socket) {
        let names = Array<string>();
        this.Games.forEach((lobby) => {
            names.push(lobby.Name);
        });
        socket.emit("LobbyList", names);
    }

    OnJoin(socket: SocketIO.Socket, lobbyName: string) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (!p) {
            console.error("A non player socket try to connect to a lobby");
        } else {
            let g = this.Games.filter((val) => {
                return val.Name === lobbyName;
            })[0];
            g.Players.push(p.name);
            socket.emit("LobbyConnection", g.Name, g.Players);
            socket.join(g.Name);
            socket.to(g.Name).broadcast.emit('PlayerJoined', p.name);
            if (g.Players.length == 2)
                g.Host.socket.emit("GameReady");
        }
    }

    OnCreateLobby(name: string, password: string, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        let lobby = new Lobby(name, p, password)
        this.Games.push(lobby);
        socket.emit("LobbyConnection", lobby.Name, lobby.Players);
        socket.join(lobby.Name);
        console.log("-------------");
        console.log("Looby created");
        console.log("Host : " + p.name);
        console.log("Lobby name : " + name);
        console.log("password : " + password);
    }

    OnDisconnect(socket: SocketIO.Socket) {
        console.log("-------------------");
        console.log("disconnection");
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];
            if (g) {
                g.Players.splice(g.Players.indexOf(p.name), 1);
                socket.to(g.Name).broadcast.emit("PlayerLeave", p.name);
                socket.leave(g.Name);
                if (g.Host === p)
                    this.ReHost(g);
                else if (g.Players.length === 1)
                    g.Host.socket.emit("GameNotReady");
            }
            this.players.splice(this.players.indexOf(p), 1);
            console.log("Fleet " + p.name + " has disconnected");
        }
    }

    OnLeave(socket: SocketIO.Socket) {
        console.log("-------------------");
        console.log("a player leave");
        let p = this.players.filter((val) => {
            return val.socket === socket;
        })[0];
        if (!p) {
            console.error("a non player socket emited a leaving message");
            return;
        }
        let g = this.Games.filter((val) => {
            return val.Players.indexOf(p.name) != -1;
        })[0];
        if (!g) {
            console.error("a player try to leave a lobby but he was in no lobby");
            return;
        }
        g.Players.splice(g.Players.indexOf(p.name), 1);
        socket.to(g.Name).broadcast.emit("PlayerLeave", p.name);
        socket.leave(g.Name);
        if (p === g.Host)
            this.ReHost(g);
        else if (g.Players.length === 1)
            g.Host.socket.emit("GameNotReady");

    }

    OnPlay(socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket;
        })[0];
        if (!p) {
            console.error("a non player socket try to launch a game");
            return;
        }
        let g = this.Games.filter((val) => {
            return val.Players.indexOf(p.name) != -1;
        })[0];
        if (!g) {
            console.error("a player try to launch a game but was in no game");
            return;
        }
        if (p === g.Host) {
            socket.to(g.Name).broadcast.emit("LaunchGame", g.Players);
            socket.emit("LaunchGame", g.Players);
        }
        else {
            console.error("a player try to launch a game but he isn't the host");
            return;
        }
    }

    //Phaser functions
    OnMoveShip(playerName: string, shipsData, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                socket.to(g.Name).broadcast.emit("moveShip", playerName, shipsData);
            }
        }
    }

    OnDamage(playerName: string, motherShipData, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                socket.to(g.Name).broadcast.emit("damage", playerName, motherShipData);
            }
        }
    }

    OnShoot(playerName: string, shootData, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                socket.to(g.Name).broadcast.emit("shoot", playerName, shootData);
            }
        }
    }

    //when host of a game disconnect or leave
    ReHost(game: Lobby) {
        //todo
        game.Host = this.players.filter((val) => {
            return val.name === game.Players[0];
        })[0];
        if (game.Players.length >= 2)
            game.Host.socket.emit("GameReady");
    }
}

let server = new Server(8080);