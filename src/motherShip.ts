class MotherShip extends Phaser.Sprite {

    public playerName: string;
    public playerMotherShip: boolean;
    public motherShipIndex: number;

    public health: number = 100;

    public ships: Ship[];

    //Creation Variables
    private motherShipWidth: number = 240 * screenWidthRatio;
    private motherShipHeight: number = 120 * screenWidthRatio;

    private motherShipsPosition =
    [{ x: screenWidth * 0.5, y: screenHeight * 0.8 },
    { x: screenWidth * 0.5, y: screenHeight * 0.2 },
    { x: screenWidth * 0.2, y: screenHeight * 0.5 },
    { x: screenWidth * 0.8, y: screenHeight * 0.5 }];

    private motherShipsAngles = [0, 180, 90, 270];

    private motherShipsWidthCollider = 0.7;
    private motherShipsHeightCollider = 0.3;

    constructor(game: Phaser.Game, playerName: string, playerMotherShip: boolean, index: number, asset: string) {

        super(game, 0, 0, asset);

        this.ships = [];

        this.playerMotherShip = playerMotherShip;
        this.playerName = playerName;
        this.motherShipIndex = index;

        this.position.x = this.motherShipsPosition[index].x;
        this.position.y = this.motherShipsPosition[index].y;

        this.angle = this.motherShipsAngles[index];

        this.anchor.setTo(0.5, 0.5);
        this.width = this.motherShipWidth;
        this.height = this.motherShipHeight;

        this.setupMotherShip(playerMotherShip);

        game.add.existing(this);
    }

    setupMotherShip(playerMotherShip: boolean) {

        //Set Physics Settings
        this.game.physics.arcade.enable(this);
        this.body.immovable = true;
        this.body.collideWorldBounds = true;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;

        //Set Collider Bounds
        if (this.motherShipIndex < 2) {
            this.body.setSize(944 * this.motherShipsWidthCollider, 447 * this.motherShipsHeightCollider,
                944 * (1 - this.motherShipsWidthCollider) * 0.5, 447 * (1 - this.motherShipsHeightCollider) * 0.5);
        }
        else {
            this.body.setSize(447 * this.motherShipsHeightCollider, (944 * this.motherShipsWidthCollider) - 40,
                944 * 0.42, -447 * 0.2);
        }

        //Set Group
        if (playerMotherShip) {
            MainState.instance.playerMotherShipGroup.add(this);
        }
        else
            MainState.instance.enemiesMotherShipsGroup.add(this);

        //this.createHealthText(index);
        //this.createRespawnText(index);
    }
}