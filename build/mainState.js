var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MainState = (function (_super) {
    __extends(MainState, _super);
    function MainState() {
        var _this = _super.call(this) || this;
        //Global Variables
        _this.ready = false;
        _this.gameStarted = false;
        _this.gameOver = false;
        _this.localPlayerDead = false;
        _this.playersReady = [];
        _this.playersName = [];
        _this.playersDead = [];
        _this.asteroidsCount = { min: 10, max: 15 };
        //Ship Damages
        _this.shipsCrashDamage = 10;
        _this.shipsWeaponsDamage = 2;
        if (typeof MainState.instance === 'undefined')
            MainState.instance = _this;
        return _this;
    }
    MainState.prototype.everyoneReady = function (playerName) {
        this.playersReady[this.playersName.indexOf(playerName)] = playerName;
        var playerReadyCount = 0;
        for (var i = 0; i < this.playersReady.length; i++)
            if (typeof this.playersReady[i] !== 'undefined')
                playerReadyCount++;
        if (playerReadyCount === this.playersName.length) {
            this.gameStarted = true;
            var date = new Date();
        }
        else {
        }
    };
    //Load Images For Sprites
    MainState.prototype.preload = function () {
        this.game.load.image('Ship', 'src/assets/Ship.png');
        this.game.load.image('MotherShip', 'src/assets/MotherShip.png');
        this.game.load.image('Bullet', 'src/assets/Bullet.png');
        this.game.load.image('Asteroid', 'src/assets/Asteroid.png');
    };
    //Setup Game
    MainState.prototype.create = function () {
        var _this = this;
        MainState.instance.socket.on("ready", function (playerName) {
            _this.everyoneReady(playerName);
        });
        MainState.instance.socket.on("asteroids", function (asteroidsData) {
            _this.createAsteroids(asteroidsData);
        });
        //Initialize Arrays
        this.motherShips = [];
        this.playersReady = [];
        this.playersDead = [];
        this.asteroids = [];
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.disableVisibilityChange = true;
        //Initialize Groups
        this.playerMotherShipGroup = this.game.add.group();
        this.enemiesMotherShipsGroup = this.game.add.group();
        this.playerShipsGroup = this.game.add.group();
        this.enemiesShipsGroup = this.game.add.group();
        this.weaponsBulletsGroup = this.game.add.group();
        this.asteroidsGroup = this.game.add.group();
        this.createGame();
        this.createWinnerText();
        this.setEventHandlers();
        if (this.playerMotherShipIndex === 0)
            this.createAsteroids();
    };
    MainState.prototype.createAsteroids = function (asteroidsData) {
        if (typeof asteroidsData !== 'undefined') {
            for (var i = 0; i < asteroidsData.length; i++) {
                var newlyAsteroid = new Asteroid(this.game, 'Asteroid', asteroidsData, i);
                this.asteroidsGroup.add(newlyAsteroid);
                this.asteroids[i] = newlyAsteroid;
            }
        }
        else {
            var asteroidCount = this.randomIntFromInterval(this.asteroidsCount.min, this.asteroidsCount.max);
            var asteroidsDataToSend = [];
            var _loop_1 = function (i) {
                var newlyAsteroid = new Asteroid(this_1.game, 'Asteroid', undefined, i);
                this_1.game.physics.arcade.overlap(newlyAsteroid, MainState.instance.asteroidsGroup, function () { newlyAsteroid.kill(); }.bind(this_1), null, this_1);
                this_1.game.physics.arcade.overlap(newlyAsteroid, MainState.instance.playerMotherShipGroup, function () { newlyAsteroid.kill(); }.bind(this_1), null, this_1);
                this_1.game.physics.arcade.overlap(newlyAsteroid, MainState.instance.enemiesMotherShipsGroup, function () { newlyAsteroid.kill(); }.bind(this_1), null, this_1);
                if (newlyAsteroid.alive) {
                    this_1.asteroidsGroup.add(newlyAsteroid);
                    this_1.asteroids[i] = newlyAsteroid;
                    asteroidsDataToSend[i] =
                        {
                            x: newlyAsteroid.x,
                            y: newlyAsteroid.y,
                            angle: newlyAsteroid.angle,
                            width: newlyAsteroid.width,
                            height: newlyAsteroid.height
                        };
                }
                else
                    i--;
                out_i_1 = i;
            };
            var this_1 = this, out_i_1;
            for (var i = 0; i < asteroidCount; i++) {
                _loop_1(i);
                i = out_i_1;
            }
            MainState.instance.socket.emit("asteroids", asteroidsDataToSend);
        }
    };
    MainState.prototype.setEventHandlers = function () {
        var _this = this;
        this.socket.on("PlayerLeave", function (name) {
            var index = _this.playersName.indexOf(name);
            _this.playersDead[index] = true;
            _this.motherShips[index].leaverText.visible = true;
            for (var i = 0; i < 3; i++)
                _this.motherShips[index].ships[i].kill();
        });
        this.socket.on("moveAsteroid", function (asteroidsData) {
            for (var i = 0; i < asteroidsData.length; i++) {
                _this.asteroids[i].x = asteroidsData[i].x;
                _this.asteroids[i].y = asteroidsData[i].y;
            }
        });
    };
    MainState.prototype.createGame = function () {
        //Create Fleets
        //console.log("Local Name : " + this.localPlayerName);
        for (var i = 0; i < this.playersName.length; i++) {
            if (this.playersName[i] === this.localPlayerName)
                this.createFleet(true);
            else
                this.createFleet(false);
        }
    };
    MainState.prototype.createFleet = function (playerMotherShip, shipsCount) {
        if (shipsCount === void 0) { shipsCount = 3; }
        var index = 0;
        //Check Which Slot is Free
        for (var i = 0; i < 4; i++)
            if (typeof this.motherShips[i] === 'undefined') {
                index = i;
                break;
            }
        this.motherShips[index] = new MotherShip(this.game, this.localPlayerName, playerMotherShip, index, 'MotherShip');
        if (playerMotherShip)
            this.playerMotherShipIndex = index;
        //Set Group
        if (playerMotherShip)
            this.playerMotherShipGroup.add(this.motherShips[index]);
        else
            this.enemiesMotherShipsGroup.add(this.motherShips[index]);
        //Created Ships Asked
        for (var i = 0; i < shipsCount; i++) {
            this.motherShips[index].ships[i] = new Ship(this.game, playerMotherShip, this.motherShips[index], i, 'Ship');
            //Set Group
            if (playerMotherShip) {
                this.playerShipsGroup.add(this.motherShips[index].ships[i]);
                this.weaponsBulletsGroup.add(this.motherShips[index].ships[i].weapon.bullets);
            }
            else {
                this.enemiesShipsGroup.add(this.motherShips[index].ships[i]);
                this.weaponsBulletsGroup.add(this.motherShips[index].ships[i].weapon.bullets);
            }
        }
        MainState.instance.socket.emit("ready", this.localPlayerName);
    };
    MainState.prototype.createWinnerText = function () {
        var style = { font: "bold 20px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        this.winnerText = this.game.add.text(15, 15, "", style);
        this.winnerText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    };
    MainState.prototype.update = function () {
        if (this.gameStarted) {
            this.collisions();
            if (this.playerMotherShipIndex === 0)
                this.sendAsteroidsData();
        }
    };
    MainState.prototype.sendAsteroidsData = function () {
        var asteroidsData = [];
        for (var i = 0; i < this.asteroids.length; i++)
            asteroidsData[i] =
                {
                    x: this.asteroids[i].x,
                    y: this.asteroids[i].y
                };
        MainState.instance.socket.emit("moveAsteroid", asteroidsData);
    };
    MainState.prototype.collisions = function () {
        //Players Ships Collisions
        this.game.physics.arcade.collide(this.playerShipsGroup);
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesShipsGroup, this.shipAgainstShip.bind(this), null, this);
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesMotherShipsGroup, this.shipAgainstMotherShip.bind(this), null, this);
        //Asteroids Collisions
        this.game.physics.arcade.collide(this.asteroidsGroup);
        this.game.physics.arcade.collide(this.asteroidsGroup, this.playerShipsGroup);
        this.game.physics.arcade.collide(this.asteroidsGroup, this.enemiesShipsGroup);
        //Enemies Ships Collisions
        this.game.physics.arcade.collide(this.enemiesShipsGroup);
        this.game.physics.arcade.collide(this.enemiesShipsGroup, this.playerMotherShipGroup, this.shipAgainstMotherShip.bind(this), null, this);
        //Weapons Bullets Collisions
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.enemiesMotherShipsGroup, this.bulletAgainstMotherShip.bind(this), null, this);
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.enemiesShipsGroup, this.bulletAgainstShip.bind(this), null, this);
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.playerShipsGroup, this.bulletAgainstShip.bind(this), null, this);
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.playerMotherShipGroup, this.bulletAgainstMotherShip.bind(this), null, this);
    };
    MainState.prototype.shipAgainstMotherShip = function (ship, motherShip) {
        //console.log("Ship vs MotherShip !");
        ship.destroyShip();
        if (!ship.playerShip)
            return;
        motherShip.damageMotherShip(this.shipsCrashDamage);
    };
    MainState.prototype.shipAgainstShip = function (thisShip, otherShip) {
        //console.log("Ship vs Ship !");
        thisShip.destroyShip();
        otherShip.destroyShip();
    };
    MainState.prototype.bulletAgainstMotherShip = function (bullet, motherShip) {
        //console.log("bullet vs MotherShip !");
        var bulletInfos = this.getBulletInfo(bullet);
        //Prevent From Shooting On Its Own MotherShip
        if (bulletInfos.motherShipIndex !== motherShip.motherShipIndex) {
            bullet.kill();
            if (bulletInfos.motherShipIndex === this.playerMotherShipIndex)
                motherShip.damageMotherShip(this.shipsWeaponsDamage);
        }
    };
    MainState.prototype.bulletAgainstShip = function (bullet, ship) {
        //console.log("bullet vs Ship !");
        var bulletInfos = this.getBulletInfo(bullet);
        //Enemy Fire        
        if (bulletInfos.motherShipIndex !== ship.motherShip.motherShipIndex) {
            bullet.kill();
            ship.destroyShip();
        }
        else {
        }
    };
    MainState.prototype.getBulletInfo = function (bullet) {
        var motherShipIndex = 0;
        var shipIndex = 0;
        for (var i = 0; i < this.motherShips.length; i++)
            for (var j = 0; j < this.motherShips[i].ships.length; j++)
                if (this.motherShips[i].ships[j].weapon.bullets.contains(bullet)) {
                    motherShipIndex = i;
                    shipIndex = j;
                    break;
                }
        return { motherShipIndex: motherShipIndex, shipIndex: shipIndex };
    };
    MainState.prototype.checkGameOver = function () {
        var aliveMotherShips = 0;
        var winnerMotherShipIndex = 0;
        var winnerName;
        for (var i = 0; i < this.motherShips.length; i++)
            if (this.motherShips[i].alive) {
                aliveMotherShips++;
                winnerMotherShipIndex = i;
                winnerName = this.motherShips[i].playerName;
            }
        //Game Over
        if (aliveMotherShips < 2) {
            this.gameOver = true;
            console.log("Game Over !!");
            console.log(winnerName + " won !!");
            if (winnerMotherShipIndex === this.playerMotherShipIndex)
                this.winnerText.text = "You won you bad motherfucker!";
            else
                this.winnerText.text = "You lost and " + winnerName + " wons!";
            this.winnerText;
            for (var i = 0; i < this.motherShips.length; i++) {
                if (i !== winnerMotherShipIndex) {
                    for (var j = 0; j < 3; j++)
                        if (this.motherShips[i].ships[j].alive)
                            this.motherShips[i].ships[j].kill();
                }
            }
        }
    };
    MainState.prototype.randomIntFromInterval = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    MainState.prototype.render = function () {
        //Debug Colliders
        for (var i = 0; i < this.motherShips.length; i++) {
            if (typeof this.motherShips[i] !== 'undefined' && this.motherShips[i].alive)
                //this.game.debug.body(this.motherShips[i]);
                for (var j = 0; j < this.motherShips[i].ships.length; j++)
                    if (typeof this.motherShips[i].ships[j] !== 'undefined' && this.motherShips[i].ships[j].alive) {
                    }
        }
        for (var i = 0; i < this.asteroids.length; i++)
            this.game.debug.body(this.asteroids[i]);
    };
    return MainState;
}(Phaser.State));
//# sourceMappingURL=mainState.js.map