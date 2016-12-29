///<reference path="../typings/phaser/phaser.d.ts" />
var socket;
var localPlayerName;
var playersName = [];
//Screen Variables
var screenWidth = 1024;
var screenHeight = 576;
var screenWidthRatio = 1 + ((screenWidth - 1024) / 1024);
//Game Variables
var gameStarted = false;
var gameOver = false;
var playerDead = false;
var motherShipsHealth = [];
var shipsRespawnDelay = 3;
var shipsCrashDamage = 0;
var shipsWeaponsDamage = 2;
//Ships Variables
var shipWidth = 40 * screenWidthRatio;
var shipHeight = 40 * screenWidthRatio;
var shipSpeed = 400;
var shipRotationSpeed = 300;
var shipDrag = 700;
var shipMaxVelocity = 150;
var shipsSpawnGap = 60 * screenWidthRatio;
var shipsCollider = 0.7;
//Weapons Variables
var weaponsBulletCount = 30;
var weaponsBulletSpeed = 600;
var weaponsFireRate = 500;
//MotherShips Variables
var motherShipWidth = 240 * screenWidthRatio;
var motherShipHeight = 120 * screenWidthRatio;
var playerMotherShipIndex;
var motherShipsPosition = [{ x: screenWidth * 0.5, y: screenHeight * 0.8 },
    { x: screenWidth * 0.5, y: screenHeight * 0.2 },
    { x: screenWidth * 0.2, y: screenHeight * 0.5 },
    { x: screenWidth * 0.8, y: screenHeight * 0.5 }];
var motherShipsAngles = [0, 180, 90, 270];
var motherShipsWidthCollider = 0.7;
var motherShipsHeightCollider = 0.3;
var SimpleGame = (function () {
    function SimpleGame() {
        //console.log("Constructor");
        // console.log(this);
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
            bulletAgainstShip: this.bulletAgainstShip, bulletAgainstMotherShip: this.bulletAgainstMotherShip,
            setEventHandlers: this.setEventHandlers, onMoveShip: this.onMoveShip, setupGame: this.setupGame
        });
    }
    SimpleGame.prototype.preload = function () {
        //Load Images For Sprites
        this.game.load.image('Ship', 'src/assets/Ship.png');
        this.game.load.image('MotherShip', 'src/assets/MotherShip.png');
        this.game.load.image('Bullet', 'src/assets/Bullet.png');
    };
    SimpleGame.prototype.setupGame = function (so, localName, players) {
        socket = so;
        localPlayerName = localName;
        playersName = [];
        playersName = players;
        // console.log("SetupGame");
        // console.log(this);
    };
    SimpleGame.prototype.create = function () {
        // console.log("Create");
        // console.log(this);
        this.setEventHandlers();
        //Initialize Arrays
        this.ships = [];
        for (var i = 0; i < 4; i++) {
            this.ships[i] = [];
        }
        this.weapons = [];
        this.motherShips = [];
        this.healthTexts = [];
        this.respawnTexts = [];
        for (var i = 0; i < 4; i++) {
            this.respawnTexts[i] = [];
        }
        motherShipsHealth = [];
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.disableVisibilityChange = true;
        //Initialize Groups
        this.playerMotherShipGroup = this.game.add.group();
        this.enemiesMotherShipsGroup = this.game.add.group();
        this.playerShipsGroup = this.game.add.group();
        this.enemiesShipsGroup = this.game.add.group();
        this.weaponsBulletsGroup = this.game.add.group();
        this.startGame();
    };
    SimpleGame.prototype.setEventHandlers = function () {
        var _this = this;
        socket.on("moveShip", function (playerName, shipsData) {
            _this.onMoveShip(playerName, shipsData);
        });
    };
    SimpleGame.prototype.startGame = function () {
        //Create Fleets
        //console.log("Local Name : " + localPlayerName);
        for (var i = 0; i < playersName.length; i++) {
            //console.log("Players Name : " + playersName[i]);
            if (playersName[i] === localPlayerName)
                this.createFleet(true);
            else
                this.createFleet(false);
        }
        gameStarted = true;
        gameOver = false;
    };
    SimpleGame.prototype.createFleet = function (playerMotherShip, shipsCount) {
        if (shipsCount === void 0) { shipsCount = 3; }
        //Create MotherShip and get MotherShipIndex
        var motherShipIndex = this.createMotherShip(playerMotherShip);
        //Created Ships Asked
        for (var i = 0; i < shipsCount; i++)
            this.createShip(motherShipIndex, i);
        if (playerMotherShip)
            this.createWeapons();
    };
    SimpleGame.prototype.createHealthText = function (motherShipIndex) {
        var x = this.motherShips[motherShipIndex].position.x;
        var y = this.motherShips[motherShipIndex].position.y;
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
        var style = { font: "bold 12px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        this.healthTexts[motherShipIndex] = this.game.add.text(x, y, "Health : 100", style);
        this.healthTexts[motherShipIndex].setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.healthTexts[motherShipIndex].anchor.x = 0.5;
        this.healthTexts[motherShipIndex].anchor.y = 0.5;
    };
    SimpleGame.prototype.createRespawnText = function (motherShipIndex) {
        var style = { font: "bold 10px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        for (var j = 0; j < 3; j++) {
            var x = this.getShipSpawnPosition(motherShipIndex, j).x;
            var y = this.getShipSpawnPosition(motherShipIndex, j).y;
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
    };
    SimpleGame.prototype.createMotherShip = function (playerMotherShip) {
        var index = 0;
        //Check Which Slot is Free
        for (var i = 0; i < 4; i++)
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
        this.motherShips[index].anchor.x = 0.5;
        this.motherShips[index].anchor.y = 0.5;
        //Set Collider Bounds
        if (index < 2) {
            this.motherShips[index].body.setSize(944 * motherShipsWidthCollider, 447 * motherShipsHeightCollider, 944 * (1 - motherShipsWidthCollider) * 0.5, 447 * (1 - motherShipsHeightCollider) * 0.5);
        }
        else {
            this.motherShips[index].body.setSize(447 * motherShipsHeightCollider, (944 * motherShipsWidthCollider) - 40, 944 * 0.42, -447 * 0.2);
        }
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
    };
    SimpleGame.prototype.createShip = function (motherShipIndex, shipIndex) {
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
    };
    SimpleGame.prototype.createWeapons = function () {
        for (var i = 0; i < 3; i++) {
            this.weapons[i] = this.game.add.weapon(weaponsBulletCount, 'Bullet');
            this.weapons[i].bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
            this.weapons[i].bulletSpeed = weaponsBulletSpeed;
            this.weapons[i].fireRate = weaponsFireRate;
            this.weapons[i].trackSprite(this.ships[playerMotherShipIndex][i], 0, 0, true);
            this.weaponsBulletsGroup.add(this.weapons[i].bullets);
        }
    };
    //Get Ship Spawn Position From MotherShip
    SimpleGame.prototype.getShipSpawnPosition = function (motherShipIndex, shipIndex) {
        var point = new Phaser.Point();
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
        if (gameStarted) {
            this.shipsMovement();
            this.shipsWeapons();
            this.collisions();
            //Stock Ships data
            var shipsData = [];
            for (var i = 0; i < 3; i++) {
                if (typeof this.ships[playerMotherShipIndex][i] !== 'undefined')
                    shipsData[i] =
                        {
                            x: this.ships[playerMotherShipIndex][i].x,
                            y: this.ships[playerMotherShipIndex][i].y,
                            angle: this.ships[playerMotherShipIndex][i].angle
                        };
            }
            //Send Ships data
            socket.emit("moveShip", localPlayerName, shipsData);
        }
        this.healthDisplay();
        this.game.world.bringToTop(this.enemiesShipsGroup);
        this.game.world.bringToTop(this.playerShipsGroup);
    };
    //Socket Methods
    SimpleGame.prototype.onMoveShip = function (playerName, shipsData) {
        //console.log("Data Received !");
        if (localPlayerName == playerName)
            return;
        var playerIndex = 0;
        for (var i = 0; i < playersName.length; i++)
            if (playersName[i] == playerName)
                playerIndex = i;
        if (!this.motherShips[playerIndex].alive)
            return;
        for (var i = 0; i < 3; i++)
            if (typeof this.ships[playerMotherShipIndex][i] !== 'undefined') {
                this.ships[playerIndex][i].x = shipsData[i].x;
                this.ships[playerIndex][i].y = shipsData[i].y;
                this.ships[playerIndex][i].angle = shipsData[i].angle;
            }
    };
    SimpleGame.prototype.healthDisplay = function () {
        for (var i = 0; i < this.healthTexts.length; i++)
            if (typeof this.healthTexts[i] !== 'undefined' && this.motherShips[i].alive) {
                this.healthTexts[i].text = "Health : " + motherShipsHealth[i];
                this.healthTexts[i].bringToTop();
            }
    };
    SimpleGame.prototype.respawnDisplay = function (motherShipIndex, shipIndex) {
        //Set Respawn text
        this.respawnTexts[motherShipIndex][shipIndex].text = shipsRespawnDelay.toString();
        var delay = 1;
        setTimeout(function setRespawnText() {
            if (delay < shipsRespawnDelay) {
                this.respawnTexts[motherShipIndex][shipIndex].text = (shipsRespawnDelay - delay).toString();
                setTimeout(setRespawnText.bind(this), 1 * 1000);
                delay++;
            }
            else if (delay == shipsRespawnDelay) {
                this.respawnTexts[motherShipIndex][shipIndex].text = (shipsRespawnDelay - delay).toString();
                setTimeout(function () { this.respawnTexts[motherShipIndex][shipIndex].text = ""; }.bind(this), 0.5 * 1000);
            }
        }.bind(this), 1 * 1000);
    };
    //Movement of 3 players' ships
    SimpleGame.prototype.shipsMovement = function () {
        for (var i = 0; i < this.ships[playerMotherShipIndex].length; i++)
            if (typeof this.ships[playerMotherShipIndex][i] !== 'undefined' && this.ships[playerMotherShipIndex][i].alive) {
                this.game.physics.arcade.accelerationFromRotation(this.ships[playerMotherShipIndex][i].rotation, shipSpeed, this.ships[playerMotherShipIndex][i].body.acceleration);
            }
        //Wrap all ships
        for (var i = 0; i < this.ships.length; i++) {
            for (var j = 0; j < this.ships[i].length; j++)
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
    };
    SimpleGame.prototype.shipsWeapons = function () {
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
    };
    SimpleGame.prototype.collisions = function () {
        //Players Ships Collision
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesShipsGroup, this.shipAgainstShip.bind(this), null, this);
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesMotherShipsGroup, this.shipAgainstMotherShip.bind(this), null, this);
        //Enemies Ships Collisions
        this.game.physics.arcade.collide(this.enemiesShipsGroup, this.playerMotherShipGroup, this.shipAgainstMotherShip.bind(this), null, this);
        //Weapons Bullets Collisions
        this.game.physics.arcade.collide(this.weaponsBulletsGroup, this.enemiesShipsGroup, this.bulletAgainstShip.bind(this), null, this);
        this.game.physics.arcade.collide(this.weaponsBulletsGroup, this.enemiesMotherShipsGroup, this.bulletAgainstMotherShip.bind(this), null, this);
        this.game.physics.arcade.collide(this.weaponsBulletsGroup, this.playerMotherShipGroup, this.bulletAgainstMotherShip.bind(this), null, this);
    };
    SimpleGame.prototype.shipAgainstMotherShip = function (ship, motherShip) {
        this.destroyShip(ship);
        for (var i = 0; i < this.motherShips.length; i++)
            if (this.motherShips[i] === motherShip) {
                motherShipsHealth[i] -= shipsCrashDamage;
                console.log("MotherShip " + i + " Health : " + motherShipsHealth[i]);
                if (motherShipsHealth[i] <= 0)
                    this.destroyMotherShip(i);
                break;
            }
    };
    SimpleGame.prototype.destroyMotherShip = function (motherShipIndex) {
        if (motherShipIndex == playerMotherShipIndex) {
            playerDead = true;
            console.log("Player's Dead !!");
        }
        this.motherShips[motherShipIndex].kill();
        this.checkGameOver();
        this.healthTexts[motherShipIndex].text = "Dead !";
        setTimeout(function () { this.healthTexts[motherShipIndex].destroy(); }.bind(this), 2 * 1000);
    };
    SimpleGame.prototype.shipAgainstShip = function (ship1, ship2) {
        this.destroyShip(ship1);
        this.destroyShip(ship2);
    };
    SimpleGame.prototype.destroyShip = function (ship) {
        ship.kill();
        var motherShipIndex = 0;
        var shipIndex = 0;
        for (var i = 0; i < this.ships.length; i++) {
            for (var j = 0; j < this.ships[i].length; j++) {
                if (this.ships[i][j] === ship) {
                    //console.log("Same Ship! : " + i + " " + j);
                    motherShipIndex = i;
                    shipIndex = j;
                    break;
                }
            }
        }
        //Reset Ship
        if (motherShipIndex === playerMotherShipIndex) {
            this.ships[motherShipIndex][shipIndex].position = this.getShipSpawnPosition(motherShipIndex, shipIndex);
            this.ships[motherShipIndex][shipIndex].angle = this.motherShips[motherShipIndex].angle - 90;
        }
        //Respawn Ship After Delay
        setTimeout(function () { this.reviveShip(motherShipIndex, shipIndex); }.bind(this), shipsRespawnDelay * 1000);
        if (motherShipIndex === playerMotherShipIndex)
            this.respawnDisplay(motherShipIndex, shipIndex);
    };
    SimpleGame.prototype.reviveShip = function (motherShipIndex, shipIndex) {
        if (this.motherShips[motherShipIndex].alive) {
            //Reset Ship
            var position = this.getShipSpawnPosition(motherShipIndex, shipIndex);
            this.ships[motherShipIndex][shipIndex].reset(position.x, position.y);
        }
    };
    SimpleGame.prototype.bulletAgainstShip = function (bullet, ship) {
        bullet.kill();
        this.destroyShip(ship);
    };
    SimpleGame.prototype.bulletAgainstMotherShip = function (bullet, motherShip) {
        bullet.destroy();
        for (var i = 0; i < this.motherShips.length; i++)
            if (this.motherShips[i] === motherShip) {
                motherShipsHealth[i] -= shipsWeaponsDamage;
                console.log("MotherShip " + i + " Health : " + motherShipsHealth[i]);
                if (motherShipsHealth[i] <= 0)
                    this.destroyMotherShip(i);
                break;
            }
    };
    SimpleGame.prototype.checkGameOver = function () {
        var aliveMotherShips = 0;
        var winnerMotherShipIndex = 0;
        for (var i = 0; i < this.motherShips.length; i++)
            if (this.motherShips[i].alive) {
                aliveMotherShips++;
                winnerMotherShipIndex = i;
            }
        //Game Over
        if (aliveMotherShips < 2) {
            gameOver = true;
            console.log("Game Over !!");
            console.log("MotherShip " + winnerMotherShipIndex + " won !!");
            for (var i = 0; i < this.ships.length; i++) {
                if (i !== winnerMotherShipIndex) {
                    for (var j = 0; j < this.ships[i].length; j++)
                        if (this.ships[i][j].alive)
                            this.ships[i][j].kill();
                }
            }
        }
    };
    SimpleGame.prototype.render = function () {
        //Debug Colliders
        for (var i = 0; i < this.ships.length; i++) {
            if (typeof this.motherShips[i] !== 'undefined' && this.motherShips[i].alive)
                this.game.debug.body(this.motherShips[i]);
            for (var j = 0; j < this.ships[i].length; j++)
                if (typeof this.ships[i][j] !== 'undefined' && this.ships[i][j].alive) {
                    this.game.debug.body(this.ships[i][j]);
                }
        }
        for (var i = 0; i < this.healthTexts.length; i++)
            if (typeof this.healthTexts[i] !== 'undefined') {
            }
    };
    return SimpleGame;
}());
window.onload = function () {
    // var game = new SimpleGame();
};
//# sourceMappingURL=game.js.map