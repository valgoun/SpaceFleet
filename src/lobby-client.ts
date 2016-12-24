// import { Lobby } from "./lobby"

class LobbyClient {
    socket: SocketIOClient.Socket;

    //the different scene of the lobby selection
    NameSelection: JQuery;
    ChoosePanel: JQuery;
    CreationLobby: JQuery;
    SelectionLobby: JQuery;
    ActualLobby: JQuery;

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

        //Button binding
        $("#Go").click(() => {
            console.log("Go");
            this.socket.emit('fleetName', $("#fleetname").val());
            this.NameSelection.hide();
            this.ChoosePanel.show();
            return false;
        });
        $("#Join").click(() => {
            console.log("Join");

            this.socket.emit("refreshLobbyList");

            this.ChoosePanel.hide();
            this.SelectionLobby.show();
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
            this.ChoosePanel.show();
            $("#Lobby p").remove();
            this.socket.emit("Leave");
            return false;
        });
        $("#Play").click(() => {
            console.log("Play");
            return false;
        });

        //socket binding
        this.socket.on("LobbyConnection", (name: string, players: string[]) => {
            this.ActualLobby.show();
            $("#LobbyTitle").text(name);
            players.forEach(element => {
                $("#LobbyTitle").after("<p>" + element + "<p>");
            });
        });
        this.socket.on("LobbyList", (entries: string[]) => {
            let contener = $("#Entries");
            contener.empty();
            entries.forEach((lobby, index) => {
                contener.append('<form>' + lobby + '<button id="' + index + 'Btn">Connect</button></form>');
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
            $("#LobbyTitle").after("<p>" + name + "</p>");
        });
        this.socket.on("PlayerLeave", (name: string) => {
            console.log("Leaver !!!!!");
            $("#Lobby p:contains('" + name + "')").remove();
        });

    }
}

let lb = new LobbyClient();