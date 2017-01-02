class MotherShip extends Phaser.Sprite {

    public playerName: string;
    public playerMotherShip: boolean;
    public motherShipIndex: number;

    public health: number = 100;

    public ships: Ship[];

    //Health text
    private healthText: Phaser.Text;

    //Health text
    public leaverText: Phaser.Text;

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
        this.createHealthText();
        this.createLeaverText();
        this.setEventHandlers();

        game.add.existing(this);
    }

    setupMotherShip(playerMotherShip: boolean) {

        //Set Physics Settings
        this.game.physics.arcade.enable(this);
        this.body.immovable = true;
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
    }

    createHealthText() {
        let x: number = this.position.x;
        let y: number = this.position.y;

        switch (this.motherShipIndex) {
            case 0:
                x += 80 * screenWidthRatio;
                y += 50 * screenWidthRatio;
                break;
            case 1:
                x -= 80 * screenWidthRatio;
                y -= 50 * screenWidthRatio;
                break;
            case 2:
                x -= 60 * screenWidthRatio;
                y += 80 * screenWidthRatio;
                break;
            case 3:
                x += 60 * screenWidthRatio;
                y -= 80 * screenWidthRatio;
                break;
        }

        let style = { font: "bold 12px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        this.healthText = this.game.add.text(x, y, "Health : 100", style);
        this.healthText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.healthText.anchor.x = 0.5;
        this.healthText.anchor.y = 0.5;
    }

    createLeaverText() {
        let x: number = this.position.x;
        let y: number = this.position.y;

        switch (this.motherShipIndex) {
            case 0:
                y += 80 * screenWidthRatio;
                break;
            case 1:
                y -= 80 * screenWidthRatio;
                break;
            case 2:
                x -= 90 * screenWidthRatio;
                break;
            case 3:
                x += 90 * screenWidthRatio;
                break;
        }

        let style = { font: "bold 14px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        this.leaverText = this.game.add.text(x, y, "Player has left!", style);
        this.leaverText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.leaverText.anchor.x = 0.5;
        this.leaverText.anchor.y = 0.5;

        this.leaverText.visible = false;
    }

    setEventHandlers() {
        //Socket Listener
        MainState.instance.socket.on("damage", (motherShipData) => {
            this.onDamage(motherShipData);
        });

        MainState.instance.socket.on("moveShip", (index, shipsData) => {
            this.onMoveShip(index, shipsData);
        });

        MainState.instance.socket.on("shoot", (shootData) => {
            if (shootData.motherShipIndex === this.motherShipIndex)
                this.ships[shootData.shipIndex].onShoot();
        });

        MainState.instance.socket.on("death", (deathData) => {
            if (deathData.motherShipIndex === this.motherShipIndex)
                this.ships[deathData.shipIndex].onDeath();
        });
    }

    update() {

        if (this.playerMotherShip && MainState.instance.gameStarted)
            this.sendMoveShip();
    }

    //Socket function    
    sendMoveShip() {
        //Send Ships data
        let shipsData = [];

        for (let i = 0; i < 3; i++) {
            if (typeof this.ships[i] !== 'undefined')
                shipsData[i] =
                    {
                        x: this.ships[i].x,
                        y: this.ships[i].y,
                        angle: this.ships[i].angle
                    };
        }

        MainState.instance.socket.emit("moveShip", this.motherShipIndex, shipsData);
    }

    onMoveShip(index, shipsData) {

        if (index === this.motherShipIndex)
            for (let i = 0; i < 3; i++)
                if (typeof this.ships[i] !== 'undefined') {

                    this.ships[i].x = shipsData[i].x;
                    this.ships[i].y = shipsData[i].y;
                    this.ships[i].angle = shipsData[i].angle;
                }
    }

    damageMotherShip(damage: number) {
        this.health -= damage;
        this.healthText.text = "Health : " + this.health.toString();
        this.healthText.bringToTop();

        //Send Damage Data                
        let motherShipData = { index: this.motherShipIndex, health: this.health };
        MainState.instance.socket.emit("damage", motherShipData)

        this.checkDeath();
    }

    onDamage(motherShipData) {
        if (motherShipData.index === this.motherShipIndex) {
            this.health = motherShipData.health;
            this.healthText.text = "Health : " + this.health.toString();
            this.healthText.bringToTop();

            this.checkDeath();
        }
    }

    checkDeath() {
        if (this.health <= 0) {

            if (this.playerMotherShip) {
                console.log("Local Player's Dead !!");
            }

            this.kill();
            MainState.instance.playersDead[this.motherShipIndex] = true;
            MainState.instance.checkGameOver();

            this.healthText.text = "Dead !";
            setTimeout(function () { this.healthText.destroy() }.bind(this), 2 * 1000);
        }
    }
}