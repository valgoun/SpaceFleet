var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ship = (function (_super) {
    __extends(Ship, _super);
    function Ship(game, playerShip, mother, index, asset) {
        var _this = _super.call(this, game, 0, 0, asset) || this;
        //Creation Variables
        _this.shipWidth = 40 * screenWidthRatio;
        _this.shipHeight = 40 * screenWidthRatio;
        _this.shipSpeed = 400;
        _this.shipRotationSpeed = 300;
        _this.shipDrag = 700;
        _this.shipMaxVelocity = 150;
        _this.shipsSpawnGap = 60 * screenWidthRatio;
        _this.shipsCollider = 0.7;
        _this.playerShip = playerShip;
        _this.motherShip = mother;
        _this.shipIndex = index;
        _this.position.x = _this.getShipSpawnPosition().x;
        _this.position.y = _this.getShipSpawnPosition().y;
        _this.anchor.setTo(0.5, 0.5);
        _this.width = _this.shipWidth;
        _this.height = _this.shipHeight;
        _this.setupShip(playerShip);
        game.add.existing(_this);
        return _this;
    }
    Ship.prototype.setupShip = function (playerShip) {
        //Set Physics Settings
        this.game.physics.arcade.enable(this);
        this.body.drag.set(this.shipDrag);
        this.body.maxVelocity.set(this.shipMaxVelocity);
        //Set Ship Spawn Angle
        this.angle = this.motherShip.angle - 90;
        this.body.setSize(720 * this.shipsCollider, 713 * this.shipsCollider, 720 * (1 - this.shipsCollider) * 0.5, 713 * (1 - this.shipsCollider) * 0.5);
        //Set Ship Group
        if (playerShip)
            MainState.instance.playerShipsGroup.add(this);
        else
            MainState.instance.enemiesShipsGroup.add(this);
    };
    //Get Ship Spawn Position From MotherShip
    Ship.prototype.getShipSpawnPosition = function () {
        var point = new Phaser.Point();
        if (this.motherShip.motherShipIndex < 2) {
            point.x = this.motherShip.position.x;
            point.y = this.motherShip.position.y;
            switch (this.shipIndex) {
                case 0:
                    point.x -= this.shipsSpawnGap;
                    break;
                case 1:
                    break;
                case 2:
                    point.x += this.shipsSpawnGap;
                    break;
            }
        }
        else {
            point.x = this.motherShip.position.x;
            point.y = this.motherShip.position.y;
            switch (this.shipIndex) {
                case 0:
                    point.y -= this.shipsSpawnGap;
                    break;
                case 1:
                    break;
                case 2:
                    point.y += this.shipsSpawnGap;
                    break;
            }
        }
        return point;
    };
    return Ship;
}(Phaser.Sprite));
//# sourceMappingURL=ship.js.map