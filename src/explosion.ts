class Explosion extends Phaser.Sprite {

    private explosionSize = 50 * screenWidthRatio;

    private growthDuration = 0.2;
    private shrinkDuration = 0.3;

    private tween: Phaser.Tween;

    constructor(game: Phaser.Game, asset: string, sprite, size?) {

        super(game, 0, 0, asset);

        this.anchor.setTo(0.5, 0.5);

        this.x = sprite.x;
        this.y = sprite.y;

        if (typeof size !== 'undefined')
            this.explosionSize = size;

        this.explosionSize += MainState.instance.randomIntFromInterval(-5, 5);

        this.angle = MainState.instance.randomIntFromInterval(0, 359);

        game.add.existing(this);

        this.grow();
    }

    grow() {

        this.width = 0;
        this.height = 0;

        this.tween = this.game.add.tween(this);

        this.tween.to({ width: this.explosionSize, height: this.explosionSize }, this.growthDuration * 1000, null, true);

        this.tween.onComplete.add(this.shrink, this);
    }

    shrink() {
        this.tween.to({ width: 0, height: 0 }, this.shrinkDuration * 1000, null, true);

        this.tween.onComplete.add(this.remove, this);
    }

    remove() {
        this.kill();
    }
}
