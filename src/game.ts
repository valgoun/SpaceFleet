//Phaser = require('phaser');
///<reference path="../typings/phaser/phaser.d.ts" />

class SimpleGame {

    constructor() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create });
    }

    game: Phaser.Game;

    preload() {
        this.game.load.image('ship', 'phaser/assets/Ship.png');
    }

    create() {
        var sprite = this.game.add.sprite(400, 300, 'ship');
        sprite.height = 40;
        sprite.width = 40;
        sprite.anchor.set(0.5);

    }

    update() {

    }

}

window.onload = () => {

    var game = new SimpleGame();

};
