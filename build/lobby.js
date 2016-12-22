"use strict";
var Lobby = (function () {
    function Lobby(name, host, password) {
        if (password === void 0) { password = ""; }
        this.Name = name;
        this.Password = password;
        this.Host = host;
    }
    return Lobby;
}());
exports.Lobby = Lobby;
//# sourceMappingURL=lobby.js.map