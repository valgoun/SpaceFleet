//Screen Variables
var screenWidth = 1024;
var screenHeight = 576;
//Ships Variables
var shipWidth = 40;
var shipHeight = 40;
var shipSpeed = 300;
var shipRotationSpeed = 300;
var shipDrag = 70;
var shipMaxVelocity = 200;
var shipsSpawnGap = 60;
var shipsColliderRadius = 15;
//MotherShips Variables
var motherShipWidth = 240;
var motherShipHeight = 120;
var playerMotherShipIndex;
var motherShipsPosition = [{ x: screenWidth * 0.5, y: screenHeight * 0.8 },
    { x: screenWidth * 0.5, y: screenHeight * 0.2 },
    { x: screenWidth * 0.2, y: screenHeight * 0.5 },
    { x: screenWidth * 0.8, y: screenHeight * 0.5 }];
var motherShipsAngles = [0, 180, 90, 270];
var motherShipsWidthCollider = 0.9;
var motherShipsHeightCollider = 0.5;
var SimpleGame = (function () {
    function SimpleGame() {
        //Create Phaser Game With All Functions Needed
        this.game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'content', {
            preload: this.preload, create: this.create, update: this.update, render: this.render,
            createSprite: this.createSprite, shipsMovement: this.shipsMovement, createShip: this.createShip,
            createMotherShip: this.createMotherShip, getShipSpawnPosition: this.getShipSpawnPosition,
            collisions: this.collisions, destroyShip: this.destroyShip
        });
    }
    SimpleGame.prototype.preload = function () {
        //Load Images For Sprites
        this.game.load.image('Ship', 'src/assets/Ship.png');
        this.game.load.image('MotherShip', 'src/assets/MotherShip.png');
    };
    SimpleGame.prototype.create = function () {
        //Initialize Arrays
        this.ships = [];
        for (var i = 0; i < 4; i++) {
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
    };
    SimpleGame.prototype.createMotherShip = function (playerMotherShip) {
        var index = 0;
        //Check Which Slot is Free
        for (var i = 0; i < 4; i++)
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
            this.motherShips[index].body.setSize(944 * motherShipsWidthCollider, 447 * motherShipsHeightCollider, 944 * (1 - motherShipsWidthCollider) * 0.5, 447 * (1 - motherShipsHeightCollider) * 0.5);
        }
        else {
            this.motherShips[index].body.setSize(447 * motherShipsHeightCollider, (944 * motherShipsWidthCollider) - 80, 944 * 0.381, (-447 + 80) * 0.5);
        }
        //Set Group        
        if (playerMotherShip) {
            playerMotherShipIndex = index;
            this.playerMotherShipGroup.add(this.motherShips[index]);
        }
        else
            this.enemiesMotherShipsGroup.add(this.motherShips[index]);
    };
    SimpleGame.prototype.createShip = function (motherShipIndex, shipIndex) {
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
    };
    //Get Ship Spawn Position From MotherShip    
    SimpleGame.prototype.getShipSpawnPosition = function (motherShipIndex, shipIndex) {
        var x = 0;
        var y = 0;
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
    };
    //General Method to create Sprite    
    SimpleGame.prototype.createSprite = function (name, position, width, height) {
        var sprite = this.game.add.sprite(position.x, position.y, name);
        sprite.width = width;
        sprite.height = height;
        sprite.anchor.set(0.5);
        return sprite;
    };
    SimpleGame.prototype.update = function () {
        this.shipsMovement();
        this.collisions();
        this.game.world.bringToTop(this.playerShipsGroup);
        this.game.world.bringToTop(this.enemiesShipsGroup);
    };
    //Movement of 3 players' ships    
    SimpleGame.prototype.shipsMovement = function () {
        for (var i = 0; i < this.ships[playerMotherShipIndex].length; i++)
            if (typeof this.ships[playerMotherShipIndex][i] !== 'undefined') {
                this.game.physics.arcade.accelerationFromRotation(this.ships[playerMotherShipIndex][i].rotation, shipSpeed, this.ships[playerMotherShipIndex][i].body.acceleration);
            }
        //Wrap for all ships
        for (var i = 0; i < this.ships.length; i++) {
            for (var j = 0; j < this.ships[i].length; j++)
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
    };
    SimpleGame.prototype.collisions = function () {
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesShipsGroup);
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesMotherShipsGroup, this.destroyShip.bind(this));
    };
    SimpleGame.prototype.destroyShip = function (motherShipIndex, shipIndex) {
        console.log("Dead : " + motherShipIndex + shipIndex);
    };
    SimpleGame.prototype.render = function () {
        //Debug Colliders
        for (var i = 0; i < this.ships.length; i++) {
            //this.game.debug.body(this.motherShips[i]);
            for (var j = 0; j < this.ships[i].length; j++)
                if (typeof this.ships[i][j] !== 'undefined') {
                }
        }
    };
    return SimpleGame;
}());
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=game.js.map