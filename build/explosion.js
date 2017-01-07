var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Explosion = (function (_super) {
    __extends(Explosion, _super);
    function Explosion(game, asset, sprite) {
        var _this = _super.call(this, game, 0, 0, asset) || this;
        _this.explosionWidth = 50 * screenWidthRatio;
        _this.explosionHeight = 50 * screenWidthRatio;
        _this.anchor.setTo(0.5, 0.5);
        _this.x = sprite.x;
        _this.y = sprite.y;
        _this.width = _this.explosionWidth;
        _this.height = _this.explosionHeight;
        _this.angle = MainState.instance.randomIntFromInterval(0, 359);
        game.add.existing(_this);
        return _this;
    }
    return Explosion;
}(Phaser.Sprite));
//# sourceMappingURL=explosion.js.map