class Asteroid extends Phaser.Sprite {

    private drag: number = 8000;
    private mass: number = 1;
    private collider: number = 0.5;

    private asteroidSize = { min: 30, max: 90 };
    private positionMargin: number = 5;

    constructor(game: Phaser.Game, asset: string, asteroidsData?, index?) {

        super(game, 0, 0, asset);

        //MainState.instance.asteroidsGroup.add(this);

        this.anchor.setTo(0.5, 0.5);

        if (typeof asteroidsData !== 'undefined') {
            this.width = asteroidsData[index].width;
            this.height = asteroidsData[index].height;

            this.x = asteroidsData[index].x;
            this.y = asteroidsData[index].y;

            this.angle = asteroidsData[index].angle;
        }
        else {
            let size = MainState.instance.randomIntFromInterval(this.asteroidSize.min, this.asteroidSize.max);

            this.width = size;
            this.height = size;

            this.angle = MainState.instance.randomIntFromInterval(0, 359);

            this.x = MainState.instance.randomIntFromInterval(size + this.positionMargin, screenWidth - size - this.positionMargin);
            this.y = MainState.instance.randomIntFromInterval(size + this.positionMargin, screenHeight - size - this.positionMargin);
        }

        this.game.physics.arcade.enable(this);
        this.body.drag = this.drag;

        //this.body.setCircle(this.width * this.radius, 256 * 0.5, 256 * 0.5);
        this.body.setSize(256 * this.collider, 256 * this.collider,
            256 * (1 - this.collider) * 0.5, 256 * (1 - this.collider) * 0.5);

        game.add.existing(this);
    }

    update() {

        //Wrap Asteroid
        this.game.world.wrap(this, 16);
    }
}
