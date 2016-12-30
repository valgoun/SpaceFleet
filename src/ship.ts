class Ship extends Phaser.Sprite {

    public motherShip: MotherShip;
    public shipIndex: number;
    public playerShip: boolean;

    //Creation Variables
    private shipWidth: number = 40 * screenWidthRatio;
    private shipHeight: number = 40 * screenWidthRatio;

    private shipSpeed: number = 400;
    private shipRotationSpeed = 300;
    private shipDrag = 700;
    private shipMaxVelocity = 150;

    private shipsSpawnGap = 60 * screenWidthRatio;

    private shipsCollider = 0.7;

    constructor(game: Phaser.Game, playerShip: boolean, mother: MotherShip, index: number, asset: string) {

        super(game, 0, 0, asset);

        this.playerShip = playerShip;

        this.motherShip = mother;
        this.shipIndex = index;

        this.position.x = this.getShipSpawnPosition().x;
        this.position.y = this.getShipSpawnPosition().y;

        this.anchor.setTo(0.5, 0.5);
        this.width = this.shipWidth;
        this.height = this.shipHeight;

        this.setupShip(playerShip);

        game.add.existing(this);
    }

    setupShip(playerShip: boolean) {
        //Set Physics Settings
        this.game.physics.arcade.enable(this);
        this.body.drag.set(this.shipDrag);
        this.body.maxVelocity.set(this.shipMaxVelocity);

        //Set Ship Spawn Angle
        this.angle = this.motherShip.angle - 90;

        this.body.setSize(720 * this.shipsCollider, 713 * this.shipsCollider,
            720 * (1 - this.shipsCollider) * 0.5, 713 * (1 - this.shipsCollider) * 0.5);

        //Set Ship Group
        if (playerShip)
            MainState.instance.playerShipsGroup.add(this);
        else
            MainState.instance.enemiesShipsGroup.add(this);
    }

    //Get Ship Spawn Position From MotherShip
    getShipSpawnPosition() {
        let point: Phaser.Point = new Phaser.Point();

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
    }
}