// import { Lobby } from "./lobby"

class LobbyClient {
    socket: SocketIOClient.Socket;

    //the different scene of the lobby selection
    NameSelection: JQuery;
    ChoosePanel: JQuery;
    CreationLobby: JQuery;
    SelectionLobby: JQuery;
    ActualLobby: JQuery;
    TitleImg: JQuery;

    //the name of the local player
    LocalName: string;
    //the Game
    //game: OldGame.SimpleGame;
    game: SpaceFleet;

    constructor() {
        this.socket = io.connect("http://localhost:8080");
        $(document).ready(this.Awake.bind(this));
    }

    Awake() {
        //div initialisation
        this.NameSelection = $("#SelectName");
        this.ChoosePanel = $("#ChoosePanel");
        this.CreationLobby = $("#CreationLobby");
        this.SelectionLobby = $("#SelectionLobby");
        this.ActualLobby = $("#Lobby");
        this.TitleImg = $("#TitleImg");

        //Button binding
        $("#Go").click(() => {
            console.log("Go");
            this.socket.emit('fleetName', $("#fleetname").val());
            this.LocalName = $("#fleetname").val();
            this.NameSelection.hide();
            this.ChoosePanel.show();
            return false;
        });
        $("#Join").click(() => {
            console.log("Join");

            this.socket.emit("refreshLobbyList");

            this.ChoosePanel.hide();
            this.SelectionLobby.show();
            this.TitleImg.hide();
            return false;
        });
        $("#Create").click(() => {
            console.log("Create");
            this.ChoosePanel.hide();
            this.CreationLobby.show();
            return false;
        });
        $("#CreateLobby").click(() => {
            let name = $("#LobbyName").val();
            let password = $("#LobbyPwd").val();
            console.log("Name : " + name + " Password : " + password);
            this.socket.emit("CreateLobby", name, password);
            this.CreationLobby.hide();
            return false;
        });
        $("#Leave").click(() => {
            console.log("Leave");
            this.ActualLobby.hide();
            $("#Play").hide();
            this.ChoosePanel.show();
            this.TitleImg.show();
            $("#Lobby p").remove();
            this.socket.emit("Leave");
            return false;
        });
        $("#Play").click(() => {
            console.log("Play");
            this.socket.emit("Play");
            return false;
        });
        $("#Refresh").click(() => {
            console.log("Refresh");
            this.socket.emit("refreshLobbyList");
        });


        //socket binding
        this.socket.on("LobbyConnection", (name: string, players: string[]) => {
            this.ActualLobby.show();
            this.TitleImg.hide();
            $("#LobbyTitle").text(name);
            players.forEach(element => {
                $("#PlayerList").append("<p>" + element + "<p>");
            });
        });
        this.socket.on("LobbyList", (entries: string[]) => {
            let contener = $("#Entries");
            contener.empty();
            entries.forEach((lobby, index) => {
                contener.append('<form><button id="' + index + 'Btn">' + lobby + '</button></form>');
                $("#" + index + 'Btn').click(() => {
                    console.log(lobby);
                    this.socket.emit("Join", lobby);
                    this.SelectionLobby.hide();
                    return false;
                });
            });
        });
        this.socket.on("PlayerJoined", (name: string) => {
            console.log("caca");
            $("#PlayerList").append("<p>" + name + "</p>");
        });
        this.socket.on("PlayerLeave", (name: string) => {
            console.log("Leaver !!!!!");
            $("#Lobby p:contains('" + name + "')").remove();
        });
        this.socket.on("GameReady", () => {
            $("#Play").show();
        });
        this.socket.on("GameNotReady", () => {
            $("#Play").hide();
        });
        this.socket.on("LaunchGame", (players: string[]) => {
            this.ActualLobby.hide();
            console.log("LaunchGame");
            $("Body").width(1024);

            this.game = new SpaceFleet(this.socket, this.LocalName, players);
        });
        this.socket.on("PasswordCheck", (lobby: string) => {
            let password = prompt("Password", "");
            if (password != "" && password != null)
                this.socket.emit("PasswordJoin", lobby, password);
            else
                this.SelectionLobby.show();
        });


    }
}


window.onload = () => {

    //var game = new SpaceFleet(this.socket, "Player1", ["Player1", "Player2", "Player3", "Player4"]);

};

let lb = new LobbyClient();