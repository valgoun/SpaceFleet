//Phaser = require('phaser');
///<reference path="../typings/phaser/phaser.d.ts" />
var SimpleGame = (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(1280, 720, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
    }
    SimpleGame.prototype.preload = function () {
        this.game.load.image('ship', 'src/assets/Ship.png');
    };
    SimpleGame.prototype.create = function () {
        //  this.createSprite('ship', 400, 300, 40, 40);
        this.sprite = this.game.add.sprite(400, 300, 'ship');
        this.sprite.width = 40;
        this.sprite.height = 40;
        this.sprite.anchor.set(0.5);
        this.game.physics.arcade.enable(this.sprite);
        this.sprite.body.drag.set(70);
        this.sprite.body.maxVelocity.set(200);
        this.cursors = this.game.input.keyboard.createCursorKeys();
    };
    SimpleGame.prototype.createSprite = function (name, x, y, width, height) {
        this.sprite = this.game.add.sprite(x, y, name);
        this.sprite.width = width;
        this.sprite.height = height;
        this.sprite.anchor.set(0.5);
    };
    SimpleGame.prototype.update = function () {
        this.game.physics.arcade.accelerationFromRotation(this.sprite.rotation, 300, this.sprite.body.acceleration);
        if (this.cursors.left.isDown) {
            this.sprite.body.angularVelocity = -300;
        }
        else if (this.cursors.right.isDown) {
            this.sprite.body.angularVelocity = 300;
        }
        else {
            this.sprite.body.angularVelocity = 0;
        }
        this.game.world.wrap(this.sprite, 16);
    };
    return SimpleGame;
}());
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=game.js.map