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
        _this.gameOver = false;
        _this.localPlayerDead = false;
        _this.playersName = [];
        if (typeof MainState.instance === 'undefined')
            MainState.instance = _this;
        return _this;
    }
    //Load Images For Sprites
    MainState.prototype.preload = function () {
        this.game.load.image('Ship', 'src/assets/Ship.png');
        this.game.load.image('MotherShip', 'src/assets/MotherShip.png');
        this.game.load.image('Bullet', 'src/assets/Bullet.png');
    };
    //Setup Game
    MainState.prototype.create = function () {
        this.setEventHandlers();
        //Initialize Arrays
        this.motherShips = [];
        this.weapons = [];
        for (var i = 0; i < 4; i++) {
            this.weapons[i] = [];
        }
        this.healthTexts = [];
        this.respawnTexts = [];
        for (var i = 0; i < 4; i++) {
            this.respawnTexts[i] = [];
        }
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.disableVisibilityChange = true;
        //Initialize Groups
        this.playerMotherShipGroup = this.game.add.physicsGroup();
        this.enemiesMotherShipsGroup = this.game.add.physicsGroup();
        this.playerShipsGroup = this.game.add.physicsGroup();
        this.enemiesShipsGroup = this.game.add.physicsGroup();
        this.weaponsBulletsGroup = this.game.add.physicsGroup();
        this.enemiesWeaponsBulletsGroup = this.game.add.physicsGroup();
        this.startGame();
    };
    //Setup Listeners  
    MainState.prototype.setEventHandlers = function () {
        var _this = this;
        //Socket Listener
        MainState.instance.socket.on("moveShip", function (playerName, shipData) {
            if (_this.localPlayerName !== playerName)
                _this.motherShips[shipData.motherShipIndex].ships[shipData.shipIndex].onMoveShip(shipData);
        });
        MainState.instance.socket.on("shoot", function (playerName, shootData) {
            if (_this.localPlayerName !== playerName)
                _this.motherShips[shootData.motherShipIndex].ships[shootData.shipIndex].onShoot(shootData);
        });
    };
    MainState.prototype.startGame = function () {
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
        if (shipsCount === void 0) { shipsCount = 1; }
        var index = 0;
        //Check Which Slot is Free
        for (var i = 0; i < 4; i++)
            if (typeof this.motherShips[i] === 'undefined') {
                index = i;
                break;
            }
        this.motherShips[index] = new MotherShip(this.game, this.localPlayerName, playerMotherShip, index, 'MotherShip');
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
                this.enemiesWeaponsBulletsGroup.add(this.motherShips[index].ships[i].weapon.bullets);
            }
        }
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
            for (var i = 0; i < this.motherShips.length; i++) {
                if (i !== winnerMotherShipIndex) {
                    for (var j = 0; j < 3; j++)
                        if (this.motherShips[i].ships[j].alive)
                            this.motherShips[i].ships[j].kill();
                }
            }
        }
    };
    MainState.prototype.render = function () {
        //Debug Colliders
        for (var i = 0; i < this.motherShips.length; i++) {
            if (typeof this.motherShips[i] !== 'undefined' && this.motherShips[i].alive)
                this.game.debug.body(this.motherShips[i]);
            for (var j = 0; j < this.motherShips[i].ships.length; j++)
                if (typeof this.motherShips[i].ships[j] !== 'undefined' && this.motherShips[i].ships[j].alive) {
                    this.game.debug.body(this.motherShips[i].ships[j]);
                }
        }
        for (var i = 0; i < this.healthTexts.length; i++)
            if (typeof this.healthTexts[i] !== 'undefined') {
            }
    };
    return MainState;
}(Phaser.State));
//# sourceMappingURL=mainState.js.map