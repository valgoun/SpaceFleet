var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Asteroid = (function (_super) {
    __extends(Asteroid, _super);
    function Asteroid(game, asset, asteroidsData, index) {
        var _this = _super.call(this, game, 0, 0, asset) || this;
        _this.drag = 8000;
        _this.mass = 1;
        _this.collider = 0.5;
        _this.asteroidSize = { min: 30, max: 90 };
        _this.positionMargin = 5;
        //MainState.instance.asteroidsGroup.add(this);
        _this.anchor.setTo(0.5, 0.5);
        if (typeof asteroidsData !== 'undefined') {
            _this.width = asteroidsData[index].width;
            _this.height = asteroidsData[index].height;
            _this.x = asteroidsData[index].x;
            _this.y = asteroidsData[index].y;
            _this.angle = asteroidsData[index].angle;
        }
        else {
            var size = MainState.instance.randomIntFromInterval(_this.asteroidSize.min, _this.asteroidSize.max);
            _this.width = size;
            _this.height = size;
            _this.angle = MainState.instance.randomIntFromInterval(0, 359);
            _this.x = MainState.instance.randomIntFromInterval(size + _this.positionMargin, screenWidth - size - _this.positionMargin);
            _this.y = MainState.instance.randomIntFromInterval(size + _this.positionMargin, screenHeight - size - _this.positionMargin);
        }
        _this.game.physics.arcade.enable(_this);
        _this.body.drag = _this.drag;
        //this.body.setCircle(this.width * this.radius, 256 * 0.5, 256 * 0.5);
        _this.body.setSize(256 * _this.collider, 256 * _this.collider, 256 * (1 - _this.collider) * 0.5, 256 * (1 - _this.collider) * 0.5);
        game.add.existing(_this);
        return _this;
    }
    Asteroid.prototype.update = function () {
        //Wrap Asteroid
        this.game.world.wrap(this, 16);
    };
    return Asteroid;
}(Phaser.Sprite));
//# sourceMappingURL=asteroid.js.map