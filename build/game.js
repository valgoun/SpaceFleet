//Phaser = require('phaser');
///<reference path="../typings/phaser/phaser.d.ts" />
var SimpleGame = (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create });
    }
    SimpleGame.prototype.preload = function () {
        this.game.load.image('ship', 'phaser/assets/Ship.png');
    };
    SimpleGame.prototype.create = function () {
        var sprite = this.game.add.sprite(400, 300, 'ship');
        sprite.height = 40;
        sprite.width = 40;
        sprite.anchor.set(0.5);
    };
    SimpleGame.prototype.update = function () {
    };
    return SimpleGame;
}());
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=game.js.map