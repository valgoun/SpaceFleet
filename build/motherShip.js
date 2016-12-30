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
        //Set Group
        if (playerMotherShip) {
            MainState.instance.playerMotherShipGroup.add(this);
        }
        else
            MainState.instance.enemiesMotherShipsGroup.add(this);
        //this.createHealthText(index);
        //this.createRespawnText(index);
    };
    return MotherShip;
}(Phaser.Sprite));
//# sourceMappingURL=motherShip.js.map