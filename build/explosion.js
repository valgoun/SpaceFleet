var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Explosion = (function (_super) {
    __extends(Explosion, _super);
    function Explosion(game, asset, sprite, size) {
        var _this = _super.call(this, game, 0, 0, asset) || this;
        _this.explosionSize = 50 * screenWidthRatio;
        _this.growthDuration = 0.2;
        _this.shrinkDuration = 0.3;
        _this.anchor.setTo(0.5, 0.5);
        _this.x = sprite.x;
        _this.y = sprite.y;
        if (typeof size !== 'undefined')
            _this.explosionSize = size;
        _this.explosionSize += MainState.instance.randomIntFromInterval(-5, 5);
        _this.angle = MainState.instance.randomIntFromInterval(0, 359);
        game.add.existing(_this);
        _this.grow();
        return _this;
    }
    Explosion.prototype.grow = function () {
        this.width = 0;
        this.height = 0;
        this.tween = this.game.add.tween(this);
        this.tween.to({ width: this.explosionSize, height: this.explosionSize }, this.growthDuration * 1000, null, true);
        this.tween.onComplete.add(this.shrink, this);
    };
    Explosion.prototype.shrink = function () {
        this.tween.to({ width: 0, height: 0 }, this.shrinkDuration * 1000, null, true);
        this.tween.onComplete.add(this.remove, this);
    };
    Explosion.prototype.remove = function () {
        this.kill();
    };
    return Explosion;
}(Phaser.Sprite));
//# sourceMappingURL=explosion.js.map