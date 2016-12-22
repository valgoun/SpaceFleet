import { Player } from "./player";


export class Lobby {
    Name: string;
    Password: string;
    Host: Player;
    Players: Player[];

    constructor(name: string, host: Player, password = "") {
        this.Name = name;
        this.Password = password;
        this.Host = host;
    }
}