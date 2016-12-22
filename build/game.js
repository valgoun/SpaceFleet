//Phaser = require('phaser');
///<reference path="../typings/phaser/phaser.d.ts" />
var shipWidth = 40;
var shipHeight = 40;
var shipSpeed = 300;
var shipRotationSpeed = 300;
var shipDrag = 70;
var shipMaxVelocity = 200;
var SimpleGame = (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(1280, 720, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update,
            createSprite: this.createSprite, shipsMovement: this.shipsMovement, createShip: this.createShip });
    }
    SimpleGame.prototype.preload = function () {
        this.game.load.image('ship', 'src/assets/Ship.png');
    };
    SimpleGame.prototype.create = function () {
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.ships = [];
        this.createShip(0);
        this.createShip(1);
    };
    SimpleGame.prototype.createShip = function (shipIndex) {
        this.ships[shipIndex] = this.createSprite('ship', 400, 300, shipHeight, shipWidth);
        this.game.physics.arcade.enable(this.ships[shipIndex]);
        this.ships[shipIndex].body.drag.set(shipDrag);
        this.ships[shipIndex].body.maxVelocity.set(shipMaxVelocity);
    };
    SimpleGame.prototype.createSprite = function (name, x, y, width, height) {
        var sprite = this.game.add.sprite(x, y, name);
        sprite.width = width;
        sprite.height = height;
        sprite.anchor.set(0.5);
        return sprite;
    };
    SimpleGame.prototype.update = function () {
        this.shipsMovement();
    };
    SimpleGame.prototype.shipsMovement = function () {
        for (var i = 0; i < this.ships.length; i++)
            if (typeof this.ships[i] !== 'undefined') {
                this.game.physics.arcade.accelerationFromRotation(this.ships[i].rotation, shipSpeed, this.ships[i].body.acceleration);
                this.game.world.wrap(this.ships[i], 16);
            }
        if (typeof this.ships[0] !== 'undefined') {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
                this.ships[0].body.angularVelocity = -shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.ships[0].body.angularVelocity = shipRotationSpeed;
            }
            else {
                this.ships[0].body.angularVelocity = 0;
            }
        }
        if (typeof this.ships[1] !== 'undefined') {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                this.ships[1].body.angularVelocity = -shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                this.ships[1].body.angularVelocity = shipRotationSpeed;
            }
            else {
                this.ships[1].body.angularVelocity = 0;
            }
        }
    };
    return SimpleGame;
}());
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=game.js.map