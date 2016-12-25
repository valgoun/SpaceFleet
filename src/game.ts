//Screen Variables
const screenWidth = 1024;
const screenHeight = 576;

//Ships Variables
const shipWidth: number = 40;
const shipHeight: number = 40;

const shipSpeed: number = 300;
const shipRotationSpeed = 300;
const shipDrag = 70;
const shipMaxVelocity = 200;

const shipsSpawnGap = 60;

const shipsColliderRadius = 15;

//MotherShips Variables
const motherShipWidth: number = 240;
const motherShipHeight: number = 120;
let playerMotherShipIndex: number;

const motherShipsPosition =
    [{ x: screenWidth * 0.5, y: screenHeight * 0.8 },
    { x: screenWidth * 0.5, y: screenHeight * 0.2 },
    { x: screenWidth * 0.2, y: screenHeight * 0.5 },
    { x: screenWidth * 0.8, y: screenHeight * 0.5 }];

const motherShipsAngles = [0, 180, 90, 270];

const motherShipsWidthCollider = 0.9;
const motherShipsHeightCollider = 0.5;

class SimpleGame {

    constructor() {
        //Create Phaser Game With All Functions Needed
        this.game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'content', {
            preload: this.preload, create: this.create, update: this.update, render: this.render,
            createSprite: this.createSprite, shipsMovement: this.shipsMovement, createShip: this.createShip,
            createMotherShip: this.createMotherShip, getShipSpawnPosition: this.getShipSpawnPosition,
            collisions: this.collisions, destroyShip: this.destroyShip
        });
    }

    game: Phaser.Game;

    ships: Phaser.Sprite[][];
    motherShips: Phaser.Sprite[];

    //Groups For Sprite Rendering Sort and Collision Layer    
    playerMotherShipGroup: Phaser.Group;
    enemiesMotherShipsGroup: Phaser.Group;
    playerShipsGroup: Phaser.Group;
    enemiesShipsGroup: Phaser.Group;

    preload() {
        //Load Images For Sprites
        this.game.load.image('Ship', 'src/assets/Ship.png');
        this.game.load.image('MotherShip', 'src/assets/MotherShip.png');
    }

    create() {
        //Initialize Arrays
        this.ships = [];
        for (let i = 0; i < 4; i++) {
            this.ships[i] = [];
        }
        this.motherShips = [];

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        //Initialize Groups        
        this.playerMotherShipGroup = this.game.add.group();
        this.enemiesMotherShipsGroup = this.game.add.group();
        this.playerShipsGroup = this.game.add.group();
        this.enemiesShipsGroup = this.game.add.group();

        //Create MotherShips and Ships        
        this.createMotherShip(true);
        this.createMotherShip(false);
        this.createMotherShip(false);
        this.createMotherShip(false);

        this.createShip(playerMotherShipIndex, 0);
        this.createShip(playerMotherShipIndex, 1);
        this.createShip(playerMotherShipIndex, 2);

        this.createShip(1, 0);
        this.createShip(1, 1);
        this.createShip(1, 2);

        this.createShip(2, 0);
        this.createShip(2, 1);
        this.createShip(2, 2);

        this.createShip(3, 0);
        this.createShip(3, 1);
        this.createShip(3, 2);
    }

    createMotherShip(playerMotherShip: boolean) {
        let index = 0;

        //Check Which Slot is Free
        for (let i = 0; i < 4; i++)
            if (typeof this.motherShips[i] === 'undefined') {
                index = i;
                break;
            }

        this.motherShips[index] = this.createSprite('MotherShip', motherShipsPosition[index], motherShipWidth, motherShipHeight);
        this.motherShips[index].angle = motherShipsAngles[index];

        //Set Physics Settings        
        this.game.physics.arcade.enable(this.motherShips[index]);
        this.motherShips[index].body.collideWorldBounds = true;
        this.motherShips[index].body.immovable = true;

        //Set Collider Bounds
        if (index < 2) {
            this.motherShips[index].body.setSize(944 * motherShipsWidthCollider, 447 * motherShipsHeightCollider,
                944 * (1 - motherShipsWidthCollider) * 0.5, 447 * (1 - motherShipsHeightCollider) * 0.5);
        }
        else {
            this.motherShips[index].body.setSize(447 * motherShipsHeightCollider, (944 * motherShipsWidthCollider) - 80,
                944 * 0.381, (-447 + 80) * 0.5);
        }


        //Set Group        
        if (playerMotherShip) {
            playerMotherShipIndex = index;
            this.playerMotherShipGroup.add(this.motherShips[index]);
        }
        else
            this.enemiesMotherShipsGroup.add(this.motherShips[index]);

    }

    createShip(motherShipIndex: number, shipIndex: number) {
        this.ships[motherShipIndex][shipIndex] = this.createSprite('Ship', this.getShipSpawnPosition(motherShipIndex, shipIndex), shipHeight, shipWidth);

        //Set Physics Settings        
        this.game.physics.arcade.enable(this.ships[motherShipIndex][shipIndex]);
        this.ships[motherShipIndex][shipIndex].body.drag.set(shipDrag);
        this.ships[motherShipIndex][shipIndex].body.maxVelocity.set(shipMaxVelocity);

        //Set Ship Spawn Angle
        this.ships[motherShipIndex][shipIndex].angle = this.motherShips[motherShipIndex].angle - 90;

        this.ships[motherShipIndex][shipIndex].body.setCircle(shipsColliderRadius, 720 * 0.5, 713 * 0.5);


        //Set Ship Group
        if (motherShipIndex === playerMotherShipIndex)
            this.playerShipsGroup.add(this.ships[motherShipIndex][shipIndex]);
        else
            this.enemiesShipsGroup.add(this.ships[motherShipIndex][shipIndex]);
    }

    //Get Ship Spawn Position From MotherShip    
    getShipSpawnPosition(motherShipIndex: number, shipIndex: number) {
        let x = 0;
        let y = 0;

        if (motherShipIndex < 2) {
            y = this.motherShips[motherShipIndex].position.y;
            x = this.motherShips[motherShipIndex].position.x;

            switch (shipIndex) {
                case 0:
                    x -= shipsSpawnGap;
                    break;
                case 1:
                    break;
                case 2:
                    x += shipsSpawnGap;
                    break;
            }
        }

        else {
            y = this.motherShips[motherShipIndex].position.y;
            x = this.motherShips[motherShipIndex].position.x;

            switch (shipIndex) {
                case 0:
                    y -= shipsSpawnGap;
                    break;
                case 1:
                    break;
                case 2:
                    y += shipsSpawnGap;
                    break;
            }
        }

        return { x: x, y: y };
    }

    //General Method to create Sprite    
    createSprite(name: string, position: { x: number; y: number }, width: number, height: number) {
        let sprite = this.game.add.sprite(position.x, position.y, name);
        sprite.width = width;
        sprite.height = height;
        sprite.anchor.set(0.5);

        return sprite;
    }

    update() {
        this.shipsMovement();
        this.collisions();

        this.game.world.bringToTop(this.playerShipsGroup);
        this.game.world.bringToTop(this.enemiesShipsGroup);
    }

    //Movement of 3 players' ships    
    shipsMovement() {
        for (let i = 0; i < this.ships[playerMotherShipIndex].length; i++)
            if (typeof this.ships[playerMotherShipIndex][i] !== 'undefined') {
                this.game.physics.arcade.accelerationFromRotation(this.ships[playerMotherShipIndex][i].rotation, shipSpeed, this.ships[playerMotherShipIndex][i].body.acceleration);
                //this.game.world.wrap(this.ships[playerMotherShipIndex][i], 16);
            }

        //Wrap for all ships
        for (let i = 0; i < this.ships.length; i++) {
            for (let j = 0; j < this.ships[i].length; j++)
                if (typeof this.ships[i][j] !== 'undefined')
                    this.game.world.wrap(this.ships[i][j], 16);
        }

        if (typeof this.ships[playerMotherShipIndex][0] !== 'undefined') {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
                this.ships[playerMotherShipIndex][0].body.angularVelocity = -shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.ships[playerMotherShipIndex][0].body.angularVelocity = shipRotationSpeed;
            }
            else {
                this.ships[playerMotherShipIndex][0].body.angularVelocity = 0;
            }
        }

        if (typeof this.ships[playerMotherShipIndex][1] !== 'undefined') {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.K)) {
                this.ships[playerMotherShipIndex][1].body.angularVelocity = -shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.M)) {
                this.ships[playerMotherShipIndex][1].body.angularVelocity = shipRotationSpeed;
            }
            else {
                this.ships[playerMotherShipIndex][1].body.angularVelocity = 0;
            }
        }

        if (typeof this.ships[playerMotherShipIndex][2] !== 'undefined') {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                this.ships[playerMotherShipIndex][2].body.angularVelocity = -shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                this.ships[playerMotherShipIndex][2].body.angularVelocity = shipRotationSpeed;
            }
            else {
                this.ships[playerMotherShipIndex][2].body.angularVelocity = 0;
            }
        }
    }

    collisions() {
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesShipsGroup);
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesMotherShipsGroup, this.destroyShip.bind(this));
    }

    destroyShip(motherShipIndex: number, shipIndex: number) {
        console.log("Dead : " + motherShipIndex + shipIndex);
    }

    render() {
        //Debug Colliders
        for (let i = 0; i < this.ships.length; i++) {
            //this.game.debug.body(this.motherShips[i]);

            for (let j = 0; j < this.ships[i].length; j++)
                if (typeof this.ships[i][j] !== 'undefined') {
                    //this.game.debug.body(this.ships[i][j]);
                }
        }

    }
}

window.onload = () => {
    var game = new SimpleGame();
};
