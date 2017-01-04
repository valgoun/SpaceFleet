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
            _this.LocalName = $("#fleetname").val();
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
            $("#Play").hide();
            _this.ChoosePanel.show();
            $("#Lobby p").remove();
            _this.socket.emit("Leave");
            return false;
        });
        $("#Play").click(function () {
            console.log("Play");
            _this.socket.emit("Play");
            return false;
        });
        $("#Refresh").click(function () {
            console.log("Refresh");
            _this.socket.emit("refreshLobbyList");
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
        this.socket.on("GameReady", function () {
            $("#Play").show();
        });
        this.socket.on("GameNotReady", function () {
            $("#Play").hide();
        });
        this.socket.on("LaunchGame", function (players) {
            _this.ActualLobby.hide();
            console.log("LaunchGame");
            _this.game = new SpaceFleet(_this.socket, _this.LocalName, players);
            //this.game = new OldGame.SimpleGame();
            //this.game.setupGame(this.socket, this.LocalName, players);
        });
        this.socket.on("PasswordCheck", function (lobby) {
            var password = prompt("Password", "");
            if (password != "" && password != null)
                _this.socket.emit("PasswordJoin", lobby, password);
            else
                _this.SelectionLobby.show();
        });
    };
    return LobbyClient;
}());
window.onload = function () {
    //var game = new SpaceFleet(this.socket, "Player1", ["Player1", "Player2", "Player3", "Player4"]);
};
var lb = new LobbyClient();
//# sourceMappingURL=lobby-client.js.map