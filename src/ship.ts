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

    //Respawn Text
    respawnText: Phaser.Text;

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

        if (this.playerShip) {
            let shootData = { motherShipIndex: this.motherShip.motherShipIndex, shipIndex: this.shipIndex };
            this.weapon.onFire.add(function () {
                MainState.instance.socket.emit("shoot", MainState.instance.localPlayerName, shootData)
            }, this);
        }
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
        if (this.alive) {
            this.shipWeapon();
            this.shipMovement();
            this.collision();
        }
    }

    //Socket function
    onMoveShip(shipData) {
        this.x = shipData.x;
        this.y = shipData.y;
        this.angle = shipData.angle;

        /* if (shipData.alive && !this.alive)
             this.reset(shipData.x, shipData.y);
 
         if (!shipData.alive && this.alive)
             this.kill();*/
    }

    onShoot(shootData) {
        this.weapon.fire();
    }

    shipMovement() {

        //Wrap ship
        this.game.world.wrap(this, 16);

        if (this.playerShip) {

            //Ship acceleration
            this.game.physics.arcade.accelerationFromRotation(this.rotation, this.shipSpeed, this.body.acceleration);

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

            //Send Ships data
            let shipData = { motherShipIndex: this.motherShip.motherShipIndex, shipIndex: this.shipIndex, x: this.x, y: this.y, angle: this.angle, alive: this.alive };
            MainState.instance.socket.emit("moveShip", MainState.instance.localPlayerName, shipData);
        }
    }

    shipWeapon() {
        if (this.playerShip && this.playerShip)
            if (this.game.input.keyboard.isDown(this.leftKey) && this.game.input.keyboard.isDown(this.rightKey))
                this.weapon.fire();
    }

    collision() {
        //Player Ship Collision
        if (this.playerShip) {
            this.game.physics.arcade.collide(this, MainState.instance.enemiesMotherShipsGroup, this.shipAgainstMotherShip.bind(this), null, this);
            this.game.physics.arcade.collide(this, MainState.instance.enemiesShipsGroup, this.shipAgainstShip.bind(this), null, this);
            this.game.physics.arcade.collide(this, MainState.instance.playerShipsGroup);
        }
        else
            this.game.physics.arcade.collide(this, MainState.instance.playerMotherShipGroup, this.shipAgainstMotherShip.bind(this), null, this);

        //Bullet Against MotherShips
        if (this.playerShip)
            this.game.physics.arcade.collide(this.weapon.bullets, MainState.instance.enemiesMotherShipsGroup, this.shipAgainstMotherShip.bind(this), null, this);

        else
            this.game.physics.arcade.collide(this.weapon.bullets, MainState.instance.playerMotherShipGroup, this.shipAgainstMotherShip.bind(this), null, this);

        //Friendly Fire
        //this.game.physics.arcade.collide(this.weapon.bullets, MainState.instance.playerMotherShipGroup, this.shipAgainstMotherShip.bind(this), null, this);

        //Bullet Against Ships

        if (this.playerShip)
            this.game.physics.arcade.collide(this.weapon.bullets, MainState.instance.enemiesShipsGroup, this.bulletAgainstShip.bind(this), null, this);

        if (!this.playerShip)
            this.game.physics.arcade.collide(this.weapon.bullets, MainState.instance.playerShipsGroup, this.bulletAgainstShip.bind(this), null, this);

        if (!this.playerShip) //Prevent Friendly Fire
            this.game.physics.arcade.collide(this.weapon.bullets, MainState.instance.playerShipsGroup, this.bulletAgainstShip.bind(this), null, this);
    }

    shipAgainstMotherShip(sprite, motherShip: MotherShip) {
        let damage: number;

        if (sprite instanceof Ship) {
            this.destroyShip(sprite);
            damage = this.shipsCrashDamage;
        }
        else {
            sprite.kill();
            damage = this.shipsWeaponsDamage;
        }

        if (!this.playerShip)
            return;

        motherShip.damageMotherShip(damage);
    }

    bulletAgainstShip(bullet: Phaser.Bullet, ship: Ship) {
        console.log("bullet vs Ship !");
        bullet.kill();
        this.destroyShip(ship);
    }

    shipAgainstShip(thisShip: Ship, otherShip: Ship) {
        this.destroyShip(thisShip);
        this.destroyShip(otherShip);
    }

    destroyShip(ship: Ship) {
        ship.kill();

        //Reset Ship
        if (ship.playerShip) {
            ship.position = ship.getShipSpawnPosition();
            ship.angle = ship.motherShip.angle - 90;

            ship.respawnDisplay();
        }

        //Respawn Ship After Delay
        setTimeout(function () { this.reviveShip(ship); }.bind(this), this.shipsRespawnDelay * 1000);
    }

    reviveShip(ship: Ship) {
        if (ship.motherShip.alive) {
            //Reset Ship
            let position = ship.getShipSpawnPosition();
            ship.reset(position.x, position.y);
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