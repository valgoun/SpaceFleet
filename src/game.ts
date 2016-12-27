///<reference path="../typings/phaser/phaser.d.ts" />

//Screen Variables
const screenWidth = 1280;
const screenHeight = 720;
const screenWidthRatio = 1 + ((screenWidth - 1024) / 1024);

//Game Variables
let gameStarted: boolean = false;
let gameOver: boolean = false;
let playerDead: boolean = false;

let motherShipsHealth = [];

const shipsRespawnDelay: number = 3;
const shipsCrashDamage: number = 10;

const shipsWeaponsDamage: number = 2;

//Ships Variables
const shipWidth: number = 40 * screenWidthRatio;
const shipHeight: number = 40 * screenWidthRatio;

const shipSpeed: number = 400;
const shipRotationSpeed = 300;
const shipDrag = 700;
const shipMaxVelocity = 150;

const shipsSpawnGap = 60 * screenWidthRatio;

const shipsCollider = 0.7;

//Weapons Variables
const weaponsBulletCount = 30;
const weaponsBulletSpeed = 600;
const weaponsFireRate = 500;

//MotherShips Variables
const motherShipWidth: number = 240 * screenWidthRatio;
const motherShipHeight: number = 120 * screenWidthRatio;
let playerMotherShipIndex: number;

const motherShipsPosition =
    [{ x: screenWidth * 0.5, y: screenHeight * 0.8 },
    { x: screenWidth * 0.5, y: screenHeight * 0.2 },
    { x: screenWidth * 0.2, y: screenHeight * 0.5 },
    { x: screenWidth * 0.8, y: screenHeight * 0.5 }];

const motherShipsAngles = [0, 180, 90, 270];

const motherShipsWidthCollider = 0.7;
const motherShipsHeightCollider = 0.3;

class SimpleGame {

    constructor() {
        //Create Phaser Game With All Functions Needed
        this.game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'content', {
            preload: this.preload, create: this.create, update: this.update, render: this.render,
            createSprite: this.createSprite, shipsMovement: this.shipsMovement, createShip: this.createShip,
            createMotherShip: this.createMotherShip, getShipSpawnPosition: this.getShipSpawnPosition,
            collisions: this.collisions, destroyShip: this.destroyShip, shipAgainstMotherShip: this.shipAgainstMotherShip,
            shipAgainstShip: this.shipAgainstShip, reviveShip: this.reviveShip, destroyMotherShip: this.destroyMotherShip,
            checkGameOver: this.checkGameOver, startGame: this.startGame, createFleet: this.createFleet,
            createHealthText: this.createHealthText, healthDisplay: this.healthDisplay, respawnDisplay: this.respawnDisplay,
            createRespawnText: this.createRespawnText, createWeapons: this.createWeapons, shipsWeapons: this.shipsWeapons,
            bulletAgainstShip: this.bulletAgainstShip, bulletAgainstMotherShip: this.bulletAgainstMotherShip
        });
    }

    game: Phaser.Game;

    ships: Phaser.Sprite[][];
    weapons: Phaser.Weapon[];
    motherShips: Phaser.Sprite[];
    healthTexts: Phaser.Text[];
    respawnTexts: Phaser.Text[][];

    //Groups For Sprite Rendering Sort and Collision Layer    
    playerMotherShipGroup: Phaser.Group;
    enemiesMotherShipsGroup: Phaser.Group;
    playerShipsGroup: Phaser.Group;
    enemiesShipsGroup: Phaser.Group;
    weaponsBulletsGroup: Phaser.Group;

    preload() {
        //Load Images For Sprites
        this.game.load.image('Ship', 'src/assets/Ship.png');
        this.game.load.image('MotherShip', 'src/assets/MotherShip.png');
        this.game.load.image('Bullet', 'src/assets/Bullet.png');
    }

    create() {
        //Initialize Arrays
        this.ships = [];
        for (let i = 0; i < 4; i++) {
            this.ships[i] = [];
        }
        this.weapons = [];
        this.motherShips = [];
        this.healthTexts = [];
        this.respawnTexts = [];
        for (let i = 0; i < 4; i++) {
            this.respawnTexts[i] = [];
        }
        motherShipsHealth = [];

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        //Initialize Groups        
        this.playerMotherShipGroup = this.game.add.group();
        this.enemiesMotherShipsGroup = this.game.add.group();
        this.playerShipsGroup = this.game.add.group();
        this.enemiesShipsGroup = this.game.add.group();
        this.weaponsBulletsGroup = this.game.add.group();

        //Create Fleets
        this.createFleet(true, 1);
        this.createFleet(false);
        this.createFleet(false);
        //this.createFleet(false);

        this.startGame();
    }

    startGame() {
        gameStarted = true;
        gameOver = false;
    }

    createFleet(playerMotherShip: boolean, shipsCount: number = 3) {
        //Create MotherShip and get MotherShipIndex
        let motherShipIndex: number = this.createMotherShip(playerMotherShip);

        //Created Ships Asked        
        for (let i = 0; i < shipsCount; i++)
            this.createShip(motherShipIndex, i);

        if (playerMotherShip)
            this.createWeapons();
    }

    createHealthText(motherShipIndex: number) {
        let x: number = this.motherShips[motherShipIndex].position.x;
        let y: number = this.motherShips[motherShipIndex].position.y;

        switch (motherShipIndex) {
            case 0:
                x += 80 * screenWidthRatio;
                y += 50 * screenWidthRatio;
                break;
            case 1:
                x -= 80 * screenWidthRatio;
                y -= 50 * screenWidthRatio;
                break;
            case 2:
                x -= 60 * screenWidthRatio;
                y += 80 * screenWidthRatio;
                break;
            case 3:
                x += 60 * screenWidthRatio;
                y -= 80 * screenWidthRatio;
                break;
        }

        let style = { font: "bold 12px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        this.healthTexts[motherShipIndex] = this.game.add.text(x, y, "Health : 100", style);
        this.healthTexts[motherShipIndex].setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.healthTexts[motherShipIndex].anchor.x = 0.5;
        this.healthTexts[motherShipIndex].anchor.y = 0.5;
    }

    createRespawnText(motherShipIndex: number) {
        let style = { font: "bold 10px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        for (let j = 0; j < 3; j++) {
            let x: number = this.getShipSpawnPosition(motherShipIndex, j).x;
            let y: number = this.getShipSpawnPosition(motherShipIndex, j).y;

            switch (motherShipIndex) {
                case 0:
                    y -= 40 * screenWidthRatio;
                    break;
                case 1:
                    y += 40 * screenWidthRatio;
                    break;
                case 2:
                    x += 40 * screenWidthRatio;
                    break;
                case 3:
                    x -= 40 * screenWidthRatio;
                    break;
            }

            this.respawnTexts[motherShipIndex][j] = this.game.add.text(x, y, "", style);
            this.respawnTexts[motherShipIndex][j].setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            this.respawnTexts[motherShipIndex][j].anchor.x = 0.5;
            this.respawnTexts[motherShipIndex][j].anchor.y = 0.5;
        }
    }

    createMotherShip(playerMotherShip: boolean) {
        let index = 0;

        //Check Which Slot is Free
        for (let i = 0; i < 4; i++)
            if (typeof this.motherShips[i] === 'undefined') {
                index = i;
                break;
            }

        //Set MotherShip Health
        motherShipsHealth[index] = 100;

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
            this.motherShips[index].body.setSize(447 * motherShipsHeightCollider, (944 * motherShipsWidthCollider) - 40,
                944 * 0.42, -447 * 0.2);
        }

        this.motherShips[index].anchor.x = 0.5;
        this.motherShips[index].anchor.y = 0.5;


        //Set Group        
        if (playerMotherShip) {
            playerMotherShipIndex = index;
            this.playerMotherShipGroup.add(this.motherShips[index]);
        }
        else
            this.enemiesMotherShipsGroup.add(this.motherShips[index]);

        this.createHealthText(index);
        this.createRespawnText(index);

        return index;
    }

    createShip(motherShipIndex: number, shipIndex: number) {
        this.ships[motherShipIndex][shipIndex] = this.createSprite('Ship', this.getShipSpawnPosition(motherShipIndex, shipIndex), shipHeight, shipWidth);

        //Set Physics Settings        
        this.game.physics.arcade.enable(this.ships[motherShipIndex][shipIndex]);
        this.ships[motherShipIndex][shipIndex].body.drag.set(shipDrag);
        this.ships[motherShipIndex][shipIndex].body.maxVelocity.set(shipMaxVelocity);

        //Set Ship Spawn Angle
        this.ships[motherShipIndex][shipIndex].angle = this.motherShips[motherShipIndex].angle - 90;

        this.ships[motherShipIndex][shipIndex].body.setSize(720 * shipsCollider, 713 * shipsCollider, 720 * (1 - shipsCollider) * 0.5, 713 * (1 - shipsCollider) * 0.5);


        //Set Ship Group
        if (motherShipIndex === playerMotherShipIndex)
            this.playerShipsGroup.add(this.ships[motherShipIndex][shipIndex]);
        else
            this.enemiesShipsGroup.add(this.ships[motherShipIndex][shipIndex]);
    }

    createWeapons() {
        for (let i = 0; i < 3; i++) {

            this.weapons[i] = this.game.add.weapon(weaponsBulletCount, 'Bullet');
            this.weapons[i].bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
            this.weapons[i].bulletSpeed = weaponsBulletSpeed;
            this.weapons[i].fireRate = weaponsFireRate;
            this.weapons[i].trackSprite(this.ships[playerMotherShipIndex][i], 0, 0, true);

            this.weaponsBulletsGroup.add(this.weapons[i].bullets);
        }
    }

    //Get Ship Spawn Position From MotherShip    
    getShipSpawnPosition(motherShipIndex: number, shipIndex: number) {
        let point: Phaser.Point = new Phaser.Point();

        if (motherShipIndex < 2) {
            point.x = this.motherShips[motherShipIndex].position.x;
            point.y = this.motherShips[motherShipIndex].position.y;

            switch (shipIndex) {
                case 0:
                    point.x -= shipsSpawnGap;
                    break;
                case 1:
                    break;
                case 2:
                    point.x += shipsSpawnGap;
                    break;
            }
        }

        else {
            point.x = this.motherShips[motherShipIndex].position.x;
            point.y = this.motherShips[motherShipIndex].position.y;

            switch (shipIndex) {
                case 0:
                    point.y -= shipsSpawnGap;
                    break;
                case 1:
                    break;
                case 2:
                    point.y += shipsSpawnGap;
                    break;
            }
        }

        return point;
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
        if (gameStarted) {
            this.shipsMovement();
            this.shipsWeapons();
            this.collisions();
        }

        this.healthDisplay();

        this.game.world.bringToTop(this.enemiesShipsGroup);
        this.game.world.bringToTop(this.playerShipsGroup);
    }

    healthDisplay() {
        for (let i = 0; i < this.healthTexts.length; i++)
            if (typeof this.healthTexts[i] !== 'undefined' && this.motherShips[i].alive) {
                this.healthTexts[i].text = "Health : " + motherShipsHealth[i];
                this.healthTexts[i].bringToTop();
            }
    }

    respawnDisplay(motherShipIndex: number, shipIndex: number) {
        //Set Respawn text
        this.respawnTexts[motherShipIndex][shipIndex].text = shipsRespawnDelay.toString();
        let delay: number = 1;

        setTimeout(function setRespawnText() {
            if (delay < shipsRespawnDelay) {
                this.respawnTexts[motherShipIndex][shipIndex].text = (shipsRespawnDelay - delay).toString();
                setTimeout(setRespawnText.bind(this), 1 * 1000);
                delay++;
            }

            else if (delay == shipsRespawnDelay) {
                this.respawnTexts[motherShipIndex][shipIndex].text = (shipsRespawnDelay - delay).toString();
                setTimeout(function () { this.respawnTexts[motherShipIndex][shipIndex].text = "" }.bind(this), 0.5 * 1000);
            }
        }.bind(this), 1 * 1000);
    }

    //Movement of 3 players' ships    
    shipsMovement() {
        for (let i = 0; i < this.ships[playerMotherShipIndex].length; i++)
            if (typeof this.ships[playerMotherShipIndex][i] !== 'undefined' && this.ships[playerMotherShipIndex][i].alive) {
                this.game.physics.arcade.accelerationFromRotation(this.ships[playerMotherShipIndex][i].rotation, shipSpeed, this.ships[playerMotherShipIndex][i].body.acceleration);
                //this.game.world.wrap(this.ships[playerMotherShipIndex][i], 16);
            }

        //Wrap all ships
        for (let i = 0; i < this.ships.length; i++) {
            for (let j = 0; j < this.ships[i].length; j++)
                if (typeof this.ships[i][j] !== 'undefined' && this.ships[i][j].alive)
                    this.game.world.wrap(this.ships[i][j], 16);
        }

        if (typeof this.ships[playerMotherShipIndex][0] !== 'undefined' && this.ships[playerMotherShipIndex][0].alive) {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.Q) && !this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.ships[playerMotherShipIndex][0].body.angularVelocity = -shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.D) && !this.game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
                this.ships[playerMotherShipIndex][0].body.angularVelocity = shipRotationSpeed;
            }
            else {
                this.ships[playerMotherShipIndex][0].body.angularVelocity = 0;
            }
        }

        if (typeof this.ships[playerMotherShipIndex][1] !== 'undefined' && this.ships[playerMotherShipIndex][1].alive) {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.K) && !this.game.input.keyboard.isDown(Phaser.Keyboard.M)) {
                this.ships[playerMotherShipIndex][1].body.angularVelocity = -shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.M) && !this.game.input.keyboard.isDown(Phaser.Keyboard.K)) {
                this.ships[playerMotherShipIndex][1].body.angularVelocity = shipRotationSpeed;
            }
            else {
                this.ships[playerMotherShipIndex][1].body.angularVelocity = 0;
            }
        }

        if (typeof this.ships[playerMotherShipIndex][2] !== 'undefined' && this.ships[playerMotherShipIndex][2].alive) {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT) && !this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                this.ships[playerMotherShipIndex][2].body.angularVelocity = -shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && !this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                this.ships[playerMotherShipIndex][2].body.angularVelocity = shipRotationSpeed;
            }
            else {
                this.ships[playerMotherShipIndex][2].body.angularVelocity = 0;
            }
        }
    }

    shipsWeapons() {
        if (typeof this.ships[playerMotherShipIndex][0] !== 'undefined' && this.ships[playerMotherShipIndex][0].alive) {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.Q) && this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.weapons[0].fire();
            }
        }

        if (typeof this.ships[playerMotherShipIndex][1] !== 'undefined' && this.ships[playerMotherShipIndex][1].alive) {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.K) && this.game.input.keyboard.isDown(Phaser.Keyboard.M)) {
                this.weapons[1].fire();
            }
        }

        if (typeof this.ships[playerMotherShipIndex][2] !== 'undefined' && this.ships[playerMotherShipIndex][2].alive) {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT) && this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                this.weapons[2].fire();
            }
        }
    }

    collisions() {
        //Players Ships Collision
        this.game.physics.arcade.overlap(this.playerShipsGroup, this.enemiesShipsGroup, this.shipAgainstShip.bind(this));
        this.game.physics.arcade.overlap(this.playerShipsGroup, this.enemiesMotherShipsGroup, this.shipAgainstMotherShip.bind(this));

        //Enemies Ships Collisions
        this.game.physics.arcade.overlap(this.enemiesShipsGroup, this.playerMotherShipGroup, this.shipAgainstMotherShip.bind(this));

        //Weapons Bullets Collisions
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.enemiesShipsGroup, this.bulletAgainstShip.bind(this));
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.enemiesMotherShipsGroup, this.bulletAgainstMotherShip.bind(this));
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.playerMotherShipGroup, this.bulletAgainstMotherShip.bind(this));
    }

    shipAgainstMotherShip(ship: Phaser.Sprite, motherShip: Phaser.Sprite) {
        this.destroyShip(ship);

        for (let i = 0; i < this.motherShips.length; i++)
            if (this.motherShips[i] === motherShip) {
                motherShipsHealth[i] -= shipsCrashDamage;

                console.log("MotherShip " + i + " Health : " + motherShipsHealth[i]);

                if (motherShipsHealth[i] <= 0)
                    this.destroyMotherShip(i);

                break;
            }
    }

    destroyMotherShip(motherShipIndex: number) {
        if (motherShipIndex == playerMotherShipIndex) {
            playerDead = true;
            console.log("Player's Dead !!");
        }

        this.motherShips[motherShipIndex].kill();
        this.checkGameOver();

        this.healthTexts[motherShipIndex].text = "Dead !";
        setTimeout(function () { this.healthTexts[motherShipIndex].destroy() }.bind(this), 2 * 1000);
    }

    shipAgainstShip(ship1: Phaser.Sprite, ship2: Phaser.Sprite) {
        this.destroyShip(ship1);
        this.destroyShip(ship2);
    }

    destroyShip(ship: Phaser.Sprite) {
        let motherShipIndex = 0;
        let shipIndex = 0;

        for (let i = 0; i < this.ships.length; i++) {
            for (let j = 0; j < this.ships[i].length; j++) {
                if (this.ships[i][j] === ship) {
                    //console.log("Same Ship! : " + i + " " + j);
                    motherShipIndex = i;
                    shipIndex = j;
                    break;
                }
            }
        }


        //Reset Ship
        this.ships[motherShipIndex][shipIndex].position = this.getShipSpawnPosition(motherShipIndex, shipIndex);
        this.ships[motherShipIndex][shipIndex].angle = this.motherShips[motherShipIndex].angle - 90;
        this.ships[motherShipIndex][shipIndex].body.velocity = { x: 0, y: 0 };

        ship.kill();

        //Respawn Ship After Delay
        setTimeout(function () { this.reviveShip(motherShipIndex, shipIndex); }.bind(this), shipsRespawnDelay * 1000);

        this.respawnDisplay(motherShipIndex, shipIndex);
    }

    reviveShip(motherShipIndex: number, shipIndex: number) {
        if (this.motherShips[motherShipIndex].alive) {
            this.ships[motherShipIndex][shipIndex].revive();
            //console.log("Alive !");
        }
    }

    bulletAgainstShip(bullet: Phaser.Bullet, ship: Phaser.Sprite) {
        bullet.kill();
        this.destroyShip(ship);
    }

    bulletAgainstMotherShip(bullet: Phaser.Sprite, motherShip: Phaser.Sprite) {
        bullet.destroy();

        for (let i = 0; i < this.motherShips.length; i++)
            if (this.motherShips[i] === motherShip) {
                motherShipsHealth[i] -= shipsWeaponsDamage;

                console.log("MotherShip " + i + " Health : " + motherShipsHealth[i]);

                if (motherShipsHealth[i] <= 0)
                    this.destroyMotherShip(i);
                break;
            }

    }

    checkGameOver() {
        let aliveMotherShips = 0;
        let winnerMotherShipIndex = 0;

        for (let i = 0; i < this.motherShips.length; i++)
            if (this.motherShips[i].alive) {
                aliveMotherShips++;
                winnerMotherShipIndex = i;
            }

        //Game Over
        if (aliveMotherShips < 2) {
            gameOver = true;
            console.log("Game Over !!");
            console.log("MotherShip " + winnerMotherShipIndex + " won !!");

            for (let i = 0; i < this.ships.length; i++) {
                if (i !== winnerMotherShipIndex) {
                    for (let j = 0; j < this.ships[i].length; j++)
                        if (this.ships[i][j].alive)
                            this.ships[i][j].kill();
                }
            }
        }
    }

    render() {
        //Debug Colliders
        for (let i = 0; i < this.ships.length; i++) {
            if (typeof this.motherShips[i] !== 'undefined' && this.motherShips[i].alive)
                this.game.debug.body(this.motherShips[i]);

            for (let j = 0; j < this.ships[i].length; j++)
                if (typeof this.ships[i][j] !== 'undefined' && this.ships[i][j].alive) {
                    //this.game.debug.body(this.ships[i][j]);
                }
        }

        for (let i = 0; i < this.healthTexts.length; i++)
            if (typeof this.healthTexts[i] !== 'undefined') {
                //this.game.debug.geom(this.healthTexts[i].textBounds);
            }
    }
}

window.onload = () => {
    var game = new SimpleGame();
};
