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

    OnJoin() {

    }

    OnCreateLobby(name: string, password: string, socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        let lobby = new Lobby(name, p, password)
        this.Games.push(lobby);
        socket.emit("LobbyConnection", lobby.Name, lobby.Players);
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
                return val.Host === p;
            })[0];
            if (g) {
                this.Games.splice(this.Games.indexOf(g), 1);
                console.log("Lobby[" + g.Name + "] has been destroyed because host has disconnected");
            }
            this.players.splice(this.players.indexOf(p), 1);
            console.log("Fleet " + p.name + " has disconnected");
        }
    }
}

let server = new Server(8080);