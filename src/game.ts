//Phaser = require('phaser');
///<reference path="../typings/phaser/phaser.d.ts" />

  let shipWidth: number = 40;
  let shipHeight: number = 40;

  let shipSpeed: number = 300;
  let shipRotationSpeed = 300;
  let shipDrag = 70;
  let shipMaxVelocity = 200;

class SimpleGame {

    constructor() {
        this.game = new Phaser.Game(1280, 720, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update, 
            createSprite: this.createSprite, shipsMovement: this.shipsMovement, createShip: this.createShip});
    }

    game: Phaser.Game;
    cursors: Phaser.CursorKeys;

    ships: Phaser.Sprite[];

    preload() {
        this.game.load.image('ship', 'src/assets/Ship.png');
    }

    create() {
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.ships = [];

        this.createShip(0);
        this.createShip(1);
    }

    createShip(shipIndex: number)
    {
        this.ships[shipIndex] = this.createSprite('ship', 400, 300, shipHeight, shipWidth);

        this.game.physics.arcade.enable(this.ships[shipIndex]);
        this.ships[shipIndex].body.drag.set(shipDrag);
        this.ships[shipIndex].body.maxVelocity.set(shipMaxVelocity);
    }

    createSprite(name: string, x: number, y: number, width: number, height: number) {
        let sprite = this.game.add.sprite(x, y, name);
        sprite.width = width;
        sprite.height = height;
        sprite.anchor.set(0.5);

        return sprite;
    }

    update() {
        this.shipsMovement();
    }

    shipsMovement()
    {
        for(let i = 0; i < this.ships.length; i++)
            if(typeof this.ships[i] !== 'undefined')
            {
                this.game.physics.arcade.accelerationFromRotation(this.ships[i].rotation, shipSpeed, this.ships[i].body.acceleration);
                this.game.world.wrap(this.ships[i], 16);
            }
        
        if(typeof this.ships[0] !== 'undefined')
        {
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

        if(typeof this.ships[1] !== 'undefined')
        {   
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
    }

}

window.onload = () => {
    var game = new SimpleGame();
};
