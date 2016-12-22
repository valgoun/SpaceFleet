/**
 * Player
 * hold data about the player on the server
 */

export class Player {
    public id:number;
    public name:string;
    public socket: SocketIO.Socket;

    constructor(id:number, name:string, socket:SocketIO.Socket) {
        this.id = id;
        this.name = name;
        this.socket = socket;
    }
}
