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
        socket.on('PasswordJoin', (lobby: string, password: string) => {
            this.OnJoin(socket, lobby, password);
        });
        socket.on('Leave', () => {
            this.OnLeave(socket);
        });
        socket.on('Play', () => {
            this.OnPlay(socket);
        });

        //Phaser msg function binding
        socket.on('ready', (playerName) => {
            this.OnReady(playerName, socket);
        });

        socket.on('moveShip', (index, shipsData) => {
            this.OnMoveShip(index, shipsData, socket);
        });

        socket.on('damage', (motherShipData) => {
            this.OnDamage(motherShipData, socket);
        });

        socket.on('shoot', (shootData) => {
            this.OnShoot(shootData, socket);
        });

        socket.on('death', (deathData) => {
            this.OnDeath(deathData, socket);
        });

        socket.on('asteroids', (asteroidsData) => {
            this.OnAsteroid(asteroidsData, socket);
        });

        socket.on('moveAsteroid', (asteroidsData) => {
            this.onMoveAsteroid(asteroidsData, socket);
        });

        socket.on('explosion', (explosionData) => {
            this.onExplosion(explosionData, socket);
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

    OnJoin(socket: SocketIO.Socket, lobbyName: string, password: string = "") {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (!p) {
            console.error("A non player socket try to connect to a lobby");
        } else {
            let g = this.Games.filter((val) => {
                return val.Name === lobbyName;
            })[0];
            if (g.Password == password) {
                g.Players.push(p.name);
                socket.emit("LobbyConnection", g.Name, g.Players);
                socket.join(g.Name);
                socket.to(g.Name).broadcast.emit('PlayerJoined', p.name);
                if (g.Players.length == 2)
                    g.Host.socket.emit("GameReady");
            } else {
                socket.emit("PasswordCheck", g.Name);
            }
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
    OnReady(playerName, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                this.sio.in(g.Name).emit("ready", playerName);
            }
        }
    }

    OnMoveShip(index, shipsData, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                socket.to(g.Name).broadcast.emit("moveShip", index, shipsData);
            }
        }
    }

    OnDamage(motherShipData, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                socket.to(g.Name).broadcast.emit("damage", motherShipData);
            }
        }
    }

    OnShoot(shootData, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                this.sio.in(g.Name).emit("shoot", shootData);
                //socket.to(g.Name).broadcast.emit("shoot", shootData);
                //socket.emit("shoot", shootData);
            }
        }
    }

    OnDeath(deathData, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                socket.to(g.Name).broadcast.emit("death", deathData);
            }
        }
    }

    OnAsteroid(asteroidsData, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                socket.to(g.Name).broadcast.emit("asteroids", asteroidsData);
            }
        }
    }

    onMoveAsteroid(asteroidsData, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                socket.to(g.Name).broadcast.emit("moveAsteroid", asteroidsData);
            }
        }
    }

    onExplosion(explosionData, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            let g = this.Games.filter((val) => {
                return val.Players.indexOf(p.name) !== -1;
            })[0];

            if (g) {
                socket.to(g.Name).broadcast.emit("explosion", explosionData);
            }
        }
    }

    //when host of a game disconnect or leave
    ReHost(game: Lobby) {
        //todo
        console.log("Rehost " + game.Players.length);
        if (game.Players.length == 0) {
            this.Games.splice(this.Games.indexOf(game), 1);
            console.log(this.Games.length);
            return;
        }
        game.Host = this.players.filter((val) => {
            return val.name === game.Players[0];
        })[0];
        if (game.Players.length >= 2)
            game.Host.socket.emit("GameReady");
    }
}

let server = new Server(8080);