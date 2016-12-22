var lobby = (function () {
    function lobby() {
        this.socket = io.connect("http://localhost:8080");
        $(document).ready(this.Awake.bind(this));
    }
    lobby.prototype.Awake = function () {
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
            _this.ActualLobby.show();
            return false;
        });
        $("#Connect").click(function () {
            console.log("Connect");
            _this.SelectionLobby.hide();
            _this.ActualLobby.show();
            return false;
        });
        $("#Leave").click(function () {
            console.log("Leave");
            _this.ActualLobby.hide();
            _this.SelectionLobby.show();
            return false;
        });
        $("#Play").click(function () {
            console.log("Play");
            return false;
        });
    };
    return lobby;
}());
var lb = new lobby();
//# sourceMappingURL=lobby-client.js.map