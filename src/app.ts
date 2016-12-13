/// <reference path="../typings/tsd.d.ts" />
import express = require('express');
import http = require('http');
import io = require('socket.io');

class Server {
    nodePort: number;
    app: express.Application;
    server: http.Server;
    sio: SocketIO.Server;

    constructor(port: number) {
        this.nodePort = port;
        this.app = express();
        this.server = http.createServer(this.app);
        this.sio = io(this.server);
        this.server.listen(port);
        console.log("listening on port :" + port);

        this.sio.on('connection', this.OnConnection);
    }

    OnConnection(socket: SocketIO.Socket) {
        console.log("connection");
        socket.on('echo', (msg) => {
            socket.broadcast.emit('echo', msg);
        });
    }


}

let server = new Server(8080);