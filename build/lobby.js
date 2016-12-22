"use strict";
var Lobby = (function () {
    function Lobby(name, host, password) {
        if (password === void 0) { password = ""; }
        this.Name = name;
        this.Password = password;
        this.Host = host;
        this.Players = new Array();
        this.Players.push(host.name);
    }
    return Lobby;
}());
exports.Lobby = Lobby;
//# sourceMappingURL=lobby.js.map