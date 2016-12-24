// import { Lobby } from "./lobby"
var LobbyClient = (function () {
    function LobbyClient() {
        this.socket = io.connect("http://localhost:8080");
        $(document).ready(this.Awake.bind(this));
    }
    LobbyClient.prototype.Awake = function () {
        var _this = this;
        //div initialisation
        this.NameSelection = $("#SelectName");
        this.ChoosePanel = $("#ChoosePanel");
        this.CreationLobby = $("#CreationLobby");
        this.SelectionLobby = $("#SelectionLobby");
        this.ActualLobby = $("#Lobby");
        //Button binding
        $("#Go").click(function () {
            console.log("Go");
            _this.socket.emit('fleetName', $("#fleetname").val());
            _this.NameSelection.hide();
            _this.ChoosePanel.show();
            return false;
        });
        $("#Join").click(function () {
            console.log("Join");
            _this.socket.emit("refreshLobbyList");
            _this.ChoosePanel.hide();
            _this.SelectionLobby.show();
            return false;
        });
        $("#Create").click(function () {
            console.log("Create");
            _this.ChoosePanel.hide();
            _this.CreationLobby.show();
            return false;
        });
        $("#CreateLobby").click(function () {
            var name = $("#LobbyName").val();
            var password = $("#LobbyPwd").val();
            console.log("Name : " + name + " Password : " + password);
            _this.socket.emit("CreateLobby", name, password);
            _this.CreationLobby.hide();
            return false;
        });
        $("#Leave").click(function () {
            console.log("Leave");
            _this.ActualLobby.hide();
            _this.ChoosePanel.show();
            $("#Lobby p").remove();
            _this.socket.emit("Leave");
            return false;
        });
        $("#Play").click(function () {
            console.log("Play");
            return false;
        });
        //socket binding
        this.socket.on("LobbyConnection", function (name, players) {
            _this.ActualLobby.show();
            $("#LobbyTitle").text(name);
            players.forEach(function (element) {
                $("#LobbyTitle").after("<p>" + element + "<p>");
            });
        });
        this.socket.on("LobbyList", function (entries) {
            var contener = $("#Entries");
            contener.empty();
            entries.forEach(function (lobby, index) {
                contener.append('<form>' + lobby + '<button id="' + index + 'Btn">Connect</button></form>');
                $("#" + index + 'Btn').click(function () {
                    console.log(lobby);
                    _this.socket.emit("Join", lobby);
                    _this.SelectionLobby.hide();
                    return false;
                });
            });
        });
        this.socket.on("PlayerJoined", function (name) {
            console.log("caca");
            $("#LobbyTitle").after("<p>" + name + "</p>");
        });
        this.socket.on("PlayerLeave", function (name) {
            console.log("Leaver !!!!!");
            $("#Lobby p:contains('" + name + "')").remove();
        });
    };
    return LobbyClient;
}());
var lb = new LobbyClient();
//# sourceMappingURL=lobby-client.js.map