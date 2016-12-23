const screenWidth = 500;
const screenHeight = 500;

const shipWidth: number = 40;
const shipHeight: number = 40;

const shipSpeed: number = 300;
const shipRotationSpeed = 300;
const shipDrag = 70;
const shipMaxVelocity = 200;

const shipsSpawnGap = 60;

const motherShipWidth: number = 240;
const motherShipHeight: number = 120;
let playerMotherShipIndex: number;

const motherShipsPosition =
    [{ x: screenWidth * 0.5, y: screenHeight * 0.8 },
    { x: screenWidth * 0.5, y: screenHeight * 0.2 },
    { x: screenWidth * 0.2, y: screenHeight * 0.5 },
    { x: screenWidth * 0.8, y: screenHeight * 0.5 }];

const motherShipsAngles = [0, 180, 270, 90];

class SimpleGame {

    constructor() {
        this.game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'content', {
            preload: this.preload, create: this.create, update: this.update,
            createSprite: this.createSprite, shipsMovement: this.shipsMovement, createShip: this.createShip,
            createMotherShip: this.createMotherShip, getShipSpawnPosition: this.getShipSpawnPosition
        });
    }

    game: Phaser.Game;

    ships: Phaser.Sprite[][];
    motherShips: Phaser.Sprite[];

    backgroundGroup: Phaser.Group;
    shipsGroup: Phaser.Group;

    preload() {
        this.game.load.image('Ship', 'src/assets/Ship.png');
        this.game.load.image('MotherShip', 'src/assets/MotherShip.png');
    }

    create() {
        this.ships = [];
        for (let i = 0; i < this.ships.length; i++)
            this.ships[i] = [];

        this.motherShips = [];

        this.backgroundGroup = this.game.add.group();
        this.shipsGroup = this.game.add.group();

        this.createMotherShip(true);
        //this.createMotherShip(false);
        //this.createMotherShip(false);

        this.createShip(playerMotherShipIndex, 0);
        this.createShip(playerMotherShipIndex, 1);
        this.createShip(playerMotherShipIndex, 2);
    }

    createMotherShip(playerMotherShip: boolean) {
        let index = 0;

        for (let i = 0; i < 4; i++)
            if (typeof this.motherShips[i] === 'undefined') {
                index = i;
                break;
            }

        this.motherShips[index] = this.createSprite('MotherShip', motherShipsPosition[index], motherShipWidth, motherShipHeight);
        this.motherShips[index].angle = motherShipsAngles[index];

        this.backgroundGroup.add(this.motherShips[index]);

        if (playerMotherShip)
            playerMotherShipIndex = index;
    }

    createShip(motherShipIndex: number, shipIndex: number) {
        this.ships[motherShipIndex][shipIndex] = this.createSprite('Ship', this.getShipSpawnPosition(shipIndex, motherShipIndex), shipHeight, shipWidth);

        this.game.physics.arcade.enable(this.ships[shipIndex]);
        this.ships[motherShipIndex][shipIndex].body.drag.set(shipDrag);
        this.ships[motherShipIndex][shipIndex].body.maxVelocity.set(shipMaxVelocity);

        this.ships[motherShipIndex][shipIndex].angle = this.motherShips[motherShipIndex].angle - 90;

        this.shipsGroup.add(this.ships[shipIndex]);
    }

    getShipSpawnPosition(shipIndex: number, motherShipIndex: number) {
        let x = 0;
        let y = 0;

        if (motherShipIndex < 3) {
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

        if (motherShipIndex > 2) {
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

    createSprite(name: string, position: { x: number; y: number }, width: number, height: number) {
        let sprite = this.game.add.sprite(position.x, position.y, name);
        sprite.width = width;
        sprite.height = height;
        sprite.anchor.set(0.5);

        return sprite;
    }

    update() {
        //this.shipsMovement();

        this.game.world.bringToTop(this.shipsGroup);
    }

    shipsMovement() {
        for (let i = 0; i < this.ships.length; i++)
            if (typeof this.ships[i] !== 'undefined') {
                this.game.physics.arcade.accelerationFromRotation(this.ships[playerMotherShipIndex][i].rotation, shipSpeed, this.ships[playerMotherShipIndex][i].body.acceleration);
                this.game.world.wrap(this.ships[i], 16);
            }

        if (typeof this.ships[0] !== 'undefined') {
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

        if (typeof this.ships[1] !== 'undefined') {
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

        if (typeof this.ships[2] !== 'undefined') {
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

}

window.onload = () => {
    var game = new SimpleGame();
};
