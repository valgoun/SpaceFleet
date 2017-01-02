class Ship extends Phaser.Sprite {

    public motherShip: MotherShip;
    public shipIndex: number;
    public playerShip: boolean;

    private shipsRespawnDelay: number = 3;

    //Ship Controls
    private leftKey;
    private rightKey;

    //Ship Damages
    private shipsCrashDamage: number = 10;
    private shipsWeaponsDamage: number = 2;

    //Ship Weapons
    public weapon: Phaser.Weapon;
    private weaponsBulletCount = 30;
    private weaponsBulletSpeed = 600;
    private weaponsFireRate = 500;
    private canShoot: boolean = true;

    //Respawn Text
    private respawnText: Phaser.Text;

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
        this.createWeapon();
        this.createRespawnText();

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

        //Setup Controls
        switch (this.shipIndex) {
            case 0:
                this.leftKey = Phaser.Keyboard.Q;
                this.rightKey = Phaser.Keyboard.D;
                break;
            case 1:
                this.leftKey = Phaser.Keyboard.K;
                this.rightKey = Phaser.Keyboard.M;
                break;
            case 2:
                this.leftKey = Phaser.Keyboard.LEFT;
                this.rightKey = Phaser.Keyboard.RIGHT;
                break;
        }
    }

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

    createWeapon() {
        this.weapon = this.game.add.weapon(this.weaponsBulletCount, 'Bullet');

        this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.weapon.bulletSpeed = this.weaponsBulletSpeed;
        this.weapon.fireRate = this.weaponsFireRate;
        this.weapon.trackSprite(this, 0, 0, true);

        /*if (this.playerShip) {
            let shootData = { motherShipIndex: this.motherShip.motherShipIndex, shipIndex: this.shipIndex };

            this.weapon.onFire.add(function () {
                MainState.instance.socket.emit("shoot", shootData)
            }, this);
        }*/
    }

    createRespawnText() {
        let style = { font: "bold 10px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        let x: number = this.getShipSpawnPosition().x;
        let y: number = this.getShipSpawnPosition().y;

        switch (this.motherShip.motherShipIndex) {
            case 0:
                y -= 40 * screenWidthRatio;
                break;
            case 1:
                y += 40 * screenWidthRatio;
                break;
            case 2:
                x += 40 * screenWidthRatio;
                break;
            case 3:
                x -= 40 * screenWidthRatio;
                break;
        }

        this.respawnText = this.game.add.text(x, y, "", style);
        this.respawnText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.respawnText.anchor.x = 0.5;
        this.respawnText.anchor.y = 0.5;
    }

    update() {
        if (this.alive && MainState.instance.gameStarted) {
            this.shipWeapon();
            this.shipMovement();
        }
    }

    shipMovement() {

        //Ship acceleration
        this.game.physics.arcade.accelerationFromRotation(this.rotation, this.shipSpeed, this.body.acceleration);

        //Wrap ship
        this.game.world.wrap(this, 16);

        if (this.playerShip) {

            //Ship Rotation
            if (this.game.input.keyboard.isDown(this.leftKey) && !this.game.input.keyboard.isDown(this.rightKey)) {
                this.body.angularVelocity = -this.shipRotationSpeed;
            }
            else if (this.game.input.keyboard.isDown(this.rightKey) && !this.game.input.keyboard.isDown(this.leftKey)) {
                this.body.angularVelocity = this.shipRotationSpeed;
            }
            else {
                this.body.angularVelocity = 0;
            }
        }
    }

    shipWeapon() {
        if (this.playerShip)
            if (this.game.input.keyboard.isDown(this.leftKey) && this.game.input.keyboard.isDown(this.rightKey) && this.canShoot) {

                MainState.instance.socket.emit("shoot", { motherShipIndex: this.motherShip.motherShipIndex, shipIndex: this.shipIndex });
                this.canShoot = false;

                setTimeout(function () { this.canShoot = true; }.bind(this), this.weaponsFireRate);
            }
    }

    onShoot() {
        this.weapon.fire();
    }

    destroyShip() {
        this.kill();

        //Send Death Data
        MainState.instance.socket.emit("death", { motherShipIndex: this.motherShip.motherShipIndex, shipIndex: this.shipIndex });


        //Reset Ship
        if (this.playerShip) {
            this.position = this.getShipSpawnPosition();
            this.angle = this.motherShip.angle - 90;

            this.respawnDisplay();
        }

        //Respawn Ship After Delay
        setTimeout(function () { this.reviveShip(); }.bind(this), this.shipsRespawnDelay * 1000);
    }

    onDeath() {
        if (this.alive) {
            this.destroyShip();
            //console.log("Alive but Destroed Received");
        }
        else {
            //console.log("Already Dead Received");
        }
    }

    reviveShip() {
        if (this.motherShip.alive && MainState.instance.playersDead[this.motherShip.motherShipIndex] !== true) {
            //Reset Ship
            let position = this.getShipSpawnPosition();
            this.reset(position.x, position.y);
        }
    }

    respawnDisplay() {
        //Set Respawn text
        this.respawnText.text = this.shipsRespawnDelay.toString();
        let delay: number = 1;

        setTimeout(function setRespawnText() {
            if (delay < this.shipsRespawnDelay) {
                this.respawnText.text = (this.shipsRespawnDelay - delay).toString();
                setTimeout(setRespawnText.bind(this), 1 * 1000);
                delay++;
            }

            else if (delay == this.shipsRespawnDelay) {
                this.respawnText.text = (this.shipsRespawnDelay - delay).toString();
                setTimeout(function () { this.respawnText.text = "" }.bind(this), 0.5 * 1000);
            }
        }.bind(this), 1 * 1000);
    }
}