  const screenWidth = 500;
  const screenHeight = 500;
  
  const shipWidth: number = 40;
  const shipHeight: number = 40;

  const shipSpeed: number = 300;
  const shipRotationSpeed = 300;
  const shipDrag = 70;
  const shipMaxVelocity = 200;

  const motherShipWidth: number = 40;
  const motherShipHeight: number = 40;
  let playerMotherShipIndex: number;

  const motherShipsPosition = 
  [{x: screenWidth * 0.5, y: screenHeight * 0.8},
  {x: screenWidth * 0.5, y: screenHeight * 0.2},
  {x: screenWidth * 0.2, y: screenHeight * 0.5},
  {x: screenWidth * 0.8, y: screenHeight * 0.5}];

class SimpleGame {

    constructor() {
        this.game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update, 
            createSprite: this.createSprite, shipsMovement: this.shipsMovement, createShip: this.createShip, 
            createMotherShip: this.createMotherShip});
    }

    game: Phaser.Game;
    cursors: Phaser.CursorKeys;

    ships: Phaser.Sprite[];
    motherShips: Phaser.Sprite[];

    preload() {
        this.game.load.image('Ship', 'src/assets/Ship.png');
        this.game.load.image('MotherShip', 'src/assets/MotherShip.png');
    }

    create() {
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.ships = [];
        this.motherShips = [];
        
        this.createMotherShip(true);
        this.createMotherShip(false);

        console.log("position : " + this.motherShips[playerMotherShipIndex].position);

        this.motherShips[playerMotherShipIndex].angle = 90;

        console.log("angle : " + this.motherShips[playerMotherShipIndex].angle);

        this.createShip(0);
        //this.createShip(1);
    }

    createShip(shipIndex: number)
    {
        this.ships[shipIndex] = this.createSprite('Ship', 0, 0, shipHeight, shipWidth);

        this.game.physics.arcade.enable(this.ships[shipIndex]);
        this.ships[shipIndex].body.drag.set(shipDrag);
        this.ships[shipIndex].body.maxVelocity.set(shipMaxVelocity);
    }

    createMotherShip (playerMotherShip: boolean)
    {
        let index = 0;

        for(let i = 0; i < 4; i++)
            if(typeof this.motherShips[i] === 'undefined')
            {
                index = i;
                break;
            }

        this.motherShips[index] = this.createSprite('MotherShip', motherShipsPosition[index].x, motherShipsPosition[index].y, motherShipWidth, motherShipHeight);
        
        if(playerMotherShip)
            playerMotherShipIndex = index;
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
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.K)) {
                this.ships[1].body.angularVelocity = -shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.M)) {
                this.ships[1].body.angularVelocity = shipRotationSpeed;
            }
            else {
                this.ships[1].body.angularVelocity = 0;
            }
        }

        if(typeof this.ships[2] !== 'undefined')
        {   
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                this.ships[2].body.angularVelocity = -shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                this.ships[2].body.angularVelocity = shipRotationSpeed;
            }
            else {
                this.ships[2].body.angularVelocity = 0;
            }
        }
    }

}

window.onload = () => {
    var game = new SimpleGame();
};
