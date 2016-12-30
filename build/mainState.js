var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MainState = (function (_super) {
    __extends(MainState, _super);
    function MainState() {
        var _this = _super.call(this) || this;
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
        this.playerMotherShipGroup = this.game.add.group();
        this.enemiesMotherShipsGroup = this.game.add.group();
        this.playerShipsGroup = this.game.add.group();
        this.enemiesShipsGroup = this.game.add.group();
        this.weaponsBulletsGroup = this.game.add.group();
        this.enemiesWeaponsBulletsGroup = this.game.add.group();
        this.startGame();
    };
    //Setup Listeners  
    MainState.prototype.setEventHandlers = function () {
        /*socket.on("moveShip", (playerName: string, shipsData) => {
            this.onMoveShip(playerName, shipsData);
        });

        socket.on("damage", (playerName: string, motherShipData) => {
            this.onDamage(playerName, motherShipData);
        });

        socket.on("shoot", (playerName: string, shootData) => {
            this.onShoot(playerName, shootData);
        });*/
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
        if (shipsCount === void 0) { shipsCount = 3; }
        var index = 0;
        //Check Which Slot is Free
        for (var i = 0; i < 4; i++)
            if (typeof this.motherShips[i] === 'undefined') {
                index = i;
                break;
            }
        this.motherShips[index] = new MotherShip(this.game, 'PlayerTest', playerMotherShip, index, 'MotherShip');
        //Created Ships Asked
        for (var i = 0; i < shipsCount; i++)
            this.motherShips[index].ships[i] = new Ship(this.game, playerMotherShip, this.motherShips[index], i, 'Ship');
    };
    return MainState;
}(Phaser.State));
//# sourceMappingURL=mainState.js.map