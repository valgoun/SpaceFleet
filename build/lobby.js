var lobby = (function () {
    function lobby() {
        this.socket = io.connect("http://localhost:8080");
        $(document).ready(this.Awake);
    }
    lobby.prototype.Awake = function () {
        var _this = this;
        console.log($('#SelectName'));
        $('#caca').submit(function () {
            console.log("caca");
            _this.socket.emit('fleetName', $('#fleetName').val());
            $('#SelectName').hide();
            return false;
        });
    };
    return lobby;
}());
var lb = new lobby();
//# sourceMappingURL=lobby.js.map