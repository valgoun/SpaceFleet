var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MotherShip = (function (_super) {
    __extends(MotherShip, _super);
    function MotherShip(game, playerName, playerMotherShip, index, asset) {
        var _this = _super.call(this, game, 0, 0, asset) || this;
        _this.health = 100;
        //Creation Variables
        _this.motherShipWidth = 240 * screenWidthRatio;
        _this.motherShipHeight = 120 * screenWidthRatio;
        _this.motherShipsPosition = [{ x: screenWidth * 0.5, y: screenHeight * 0.8 },
            { x: screenWidth * 0.5, y: screenHeight * 0.2 },
            { x: screenWidth * 0.2, y: screenHeight * 0.5 },
            { x: screenWidth * 0.8, y: screenHeight * 0.5 }];
        _this.motherShipsAngles = [0, 180, 90, 270];
        _this.motherShipsWidthCollider = 0.7;
        _this.motherShipsHeightCollider = 0.3;
        _this.ships = [];
        _this.playerMotherShip = playerMotherShip;
        _this.playerName = playerName;
        _this.motherShipIndex = index;
        _this.position.x = _this.motherShipsPosition[index].x;
        _this.position.y = _this.motherShipsPosition[index].y;
        _this.angle = _this.motherShipsAngles[index];
        _this.anchor.setTo(0.5, 0.5);
        _this.width = _this.motherShipWidth;
        _this.height = _this.motherShipHeight;
        _this.setupMotherShip(playerMotherShip);
        _this.createHealthText();
        _this.setEventHandlers();
        game.add.existing(_this);
        return _this;
    }
    MotherShip.prototype.setupMotherShip = function (playerMotherShip) {
        //Set Physics Settings
        this.game.physics.arcade.enable(this);
        this.body.immovable = true;
        this.body.collideWorldBounds = true;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        //Set Collider Bounds
        if (this.motherShipIndex < 2) {
            this.body.setSize(944 * this.motherShipsWidthCollider, 447 * this.motherShipsHeightCollider, 944 * (1 - this.motherShipsWidthCollider) * 0.5, 447 * (1 - this.motherShipsHeightCollider) * 0.5);
        }
        else {
            this.body.setSize(447 * this.motherShipsHeightCollider, (944 * this.motherShipsWidthCollider) - 40, 944 * 0.42, -447 * 0.2);
        }
    };
    MotherShip.prototype.createHealthText = function () {
        var x = this.position.x;
        var y = this.position.y;
        switch (this.motherShipIndex) {
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
        this.healthText = this.game.add.text(x, y, "Health : 100", style);
        this.healthText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.healthText.anchor.x = 0.5;
        this.healthText.anchor.y = 0.5;
    };
    MotherShip.prototype.setEventHandlers = function () {
        var _this = this;
        //Socket Listener
        MainState.instance.socket.on("damage", function (motherShipData) {
            _this.onDamage(motherShipData);
        });
        MainState.instance.socket.on("moveShip", function (index, shipsData) {
            _this.onMoveShip(index, shipsData);
        });
        MainState.instance.socket.on("shoot", function (shootData) {
            if (shootData.motherShipIndex === _this.motherShipIndex)
                _this.ships[shootData.shipIndex].onShoot();
        });
        MainState.instance.socket.on("death", function (deathData) {
            if (deathData.motherShipIndex === _this.motherShipIndex)
                _this.ships[deathData.shipIndex].onDeath();
        });
    };
    MotherShip.prototype.update = function () {
        if (this.playerMotherShip && MainState.instance.gameStarted)
            this.sendMoveShip();
    };
    //Socket function    
    MotherShip.prototype.sendMoveShip = function () {
        //Send Ships data
        var shipsData = [];
        for (var i = 0; i < 3; i++) {
            if (typeof this.ships[i] !== 'undefined')
                shipsData[i] =
                    {
                        x: this.ships[i].x,
                        y: this.ships[i].y,
                        angle: this.ships[i].angle
                    };
        }
        MainState.instance.socket.emit("moveShip", this.motherShipIndex, shipsData);
    };
    MotherShip.prototype.onMoveShip = function (index, shipsData) {
        if (index === this.motherShipIndex)
            for (var i = 0; i < 3; i++)
                if (typeof this.ships[i] !== 'undefined') {
                    this.ships[i].x = shipsData[i].x;
                    this.ships[i].y = shipsData[i].y;
                    this.ships[i].angle = shipsData[i].angle;
                }
    };
    MotherShip.prototype.damageMotherShip = function (damage) {
        this.health -= damage;
        this.healthText.text = "Health : " + this.health.toString();
        this.healthText.bringToTop();
        //Send Damage Data                
        var motherShipData = { index: this.motherShipIndex, health: this.health };
        MainState.instance.socket.emit("damage", motherShipData);
        this.checkDeath();
    };
    MotherShip.prototype.onDamage = function (motherShipData) {
        if (motherShipData.index === this.motherShipIndex) {
            this.health = motherShipData.health;
            this.healthText.text = "Health : " + this.health.toString();
            this.healthText.bringToTop();
            this.checkDeath();
        }
    };
    MotherShip.prototype.checkDeath = function () {
        if (this.health <= 0) {
            if (this.playerMotherShip) {
                console.log("Local Player's Dead !!");
            }
            this.kill();
            MainState.instance.checkGameOver();
            this.healthText.text = "Dead !";
            setTimeout(function () { this.healthText.destroy(); }.bind(this), 2 * 1000);
        }
    };
    return MotherShip;
}(Phaser.Sprite));
//# sourceMappingURL=motherShip.js.map