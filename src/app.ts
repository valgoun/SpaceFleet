/// <reference path="../typings/tsd.d.ts" />
/// <reference path="S_player.ts" />
import express = require('express');
import http = require('http');
import io = require('socket.io');
import { Player } from "./S_player";

class Server {
    nodePort: number;
    app: express.Application;
    server: http.Server;
    sio: SocketIO.Server;
    players: Player[];

    constructor(port: number) {
        this.nodePort = port;
        this.app = express();
        this.server = http.createServer(this.app);
        this.sio = io(this.server);
        this.server.listen(port);
        console.log("listening on port :" + port);
        this.players = new Array<Player>();
        this.sio.on('connection', this.OnConnection.bind(this));
    }

    OnConnection(socket: SocketIO.Socket) {
        console.log("connection");

        //msg function binding
        socket.on('fleetName', (name) => {
            this.OnFleetName(name, socket);
        });
        socket.on('disconnect', () => {
            this.OnDisconnect(socket);
        });
    }

    OnFleetName(name: string, socket: SocketIO.Socket) {
        console.log(name);
        this.players.push(new Player(0, name, socket));
    }

    OnJoin() {

    }

    OnCreate() {

    }

    OnDisconnect(socket: SocketIO.Socket) {
        let p = this.players.filter((val) => {
            return val.socket === socket
        })[0];
        if (p) {
            this.players.splice(this.players.indexOf(p), 1);
            console.log("Fleet " + p.name + " has disconnected");
        }
    }
}

let server = new Server(8080);