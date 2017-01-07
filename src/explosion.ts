class Explosion extends Phaser.Sprite {

    private explosionWidth = 50 * screenWidthRatio;
    private explosionHeight = 50 * screenWidthRatio;

    constructor(game: Phaser.Game, asset: string, sprite) {

        super(game, 0, 0, asset);

        this.anchor.setTo(0.5, 0.5);

        this.x = sprite.x;
        this.y = sprite.y;

        this.width = this.explosionWidth;
        this.height = this.explosionHeight;

        this.angle = MainState.instance.randomIntFromInterval(0, 359);

        game.add.existing(this);
    }
}
