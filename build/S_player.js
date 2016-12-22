/**
 * Player
 * hold data about the player on the server
 */
"use strict";
var Player = (function () {
    function Player(id, name, socket) {
        this.id = id;
        this.name = name;
        this.socket = socket;
    }
    return Player;
}());
exports.Player = Player;
//# sourceMappingURL=S_player.js.map