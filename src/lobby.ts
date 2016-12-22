import { Player } from "./player";


export class Lobby {
    Name: string;
    Password: string;
    Host: Player;
    Players: string[];

    constructor(name: string, host: Player, password = "") {
        this.Name = name;
        this.Password = password;
        this.Host = host;
        this.Players = new Array<string>();
        this.Players.push(host.name);
    }
}