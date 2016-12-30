var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ship = (function (_super) {
    __extends(Ship, _super);
    function Ship(game, playerShip, mother, index, asset) {
        var _this = _super.call(this, game, 0, 0, asset) || this;
        _this.shipsRespawnDelay = 3;
        //Ship Damages
        _this.shipsCrashDamage = 10;
        _this.shipsWeaponsDamage = 2;
        _this.weaponsBulletCount = 30;
        _this.weaponsBulletSpeed = 600;
        _this.weaponsFireRate = 500;
        //Creation Variables
        _this.shipWidth = 40 * screenWidthRatio;
        _this.shipHeight = 40 * screenWidthRatio;
        _this.shipSpeed = 400;
        _this.shipRotationSpeed = 300;
        _this.shipDrag = 700;
        _this.shipMaxVelocity = 150;
        _this.shipsSpawnGap = 60 * screenWidthRatio;
        _this.shipsCollider = 0.7;
        _this.playerShip = playerShip;
        _this.motherShip = mother;
        _this.shipIndex = index;
        _this.position.x = _this.getShipSpawnPosition().x;
        _this.position.y = _this.getShipSpawnPosition().y;
        _this.anchor.setTo(0.5, 0.5);
        _this.width = _this.shipWidth;
        _this.height = _this.shipHeight;
        _this.setupShip(playerShip);
        _this.createWeapon();
        _this.createRespawnText();
        game.add.existing(_this);
        return _this;
    }
    Ship.prototype.setupShip = function (playerShip) {
        //Set Physics Settings
        this.game.physics.arcade.enable(this);
        this.body.drag.set(this.shipDrag);
        this.body.maxVelocity.set(this.shipMaxVelocity);
        //Set Ship Spawn Angle
        this.angle = this.motherShip.angle - 90;
        this.body.setSize(720 * this.shipsCollider, 713 * this.shipsCollider, 720 * (1 - this.shipsCollider) * 0.5, 713 * (1 - this.shipsCollider) * 0.5);
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
    };
    Ship.prototype.getShipSpawnPosition = function () {
        var point = new Phaser.Point();
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
    };
    Ship.prototype.createWeapon = function () {
        this.weapon = this.game.add.weapon(this.weaponsBulletCount, 'Bullet');
        this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.weapon.bulletSpeed = this.weaponsBulletSpeed;
        this.weapon.fireRate = this.weaponsFireRate;
        this.weapon.trackSprite(this, 0, 0, true);
        if (this.playerShip) {
            var shootData_1 = { motherShipIndex: this.motherShip.motherShipIndex, shipIndex: this.shipIndex };
            this.weapon.onFire.add(function () {
                MainState.instance.socket.emit("shoot", MainState.instance.localPlayerName, shootData_1);
            }, this);
        }
    };
    Ship.prototype.createRespawnText = function () {
        var style = { font: "bold 10px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        var x = this.getShipSpawnPosition().x;
        var y = this.getShipSpawnPosition().y;
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
    };
    Ship.prototype.update = function () {
        if (this.alive) {
            this.shipWeapon();
            this.shipMovement();
            this.collision();
        }
    };
    //Socket function
    Ship.prototype.onMoveShip = function (shipData) {
        this.x = shipData.x;
        this.y = shipData.y;
        this.angle = shipData.angle;
        /* if (shipData.alive && !this.alive)
             this.reset(shipData.x, shipData.y);
 
         if (!shipData.alive && this.alive)
             this.kill();*/
    };
    Ship.prototype.onShoot = function (shootData) {
        this.weapon.fire();
    };
    Ship.prototype.shipMovement = function () {
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
            var shipData = { motherShipIndex: this.motherShip.motherShipIndex, shipIndex: this.shipIndex, x: this.x, y: this.y, angle: this.angle, alive: this.alive };
            MainState.instance.socket.emit("moveShip", MainState.instance.localPlayerName, shipData);
        }
    };
    Ship.prototype.shipWeapon = function () {
        if (this.playerShip && this.playerShip)
            if (this.game.input.keyboard.isDown(this.leftKey) && this.game.input.keyboard.isDown(this.rightKey))
                this.weapon.fire();
    };
    Ship.prototype.collision = function () {
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
        if (!this.playerShip)
            this.game.physics.arcade.collide(this.weapon.bullets, MainState.instance.playerShipsGroup, this.bulletAgainstShip.bind(this), null, this);
    };
    Ship.prototype.shipAgainstMotherShip = function (sprite, motherShip) {
        var damage;
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
    };
    Ship.prototype.bulletAgainstShip = function (bullet, ship) {
        console.log("bullet vs Ship !");
        bullet.kill();
        this.destroyShip(ship);
    };
    Ship.prototype.shipAgainstShip = function (thisShip, otherShip) {
        this.destroyShip(thisShip);
        this.destroyShip(otherShip);
    };
    Ship.prototype.destroyShip = function (ship) {
        ship.kill();
        //Reset Ship
        if (ship.playerShip) {
            ship.position = ship.getShipSpawnPosition();
            ship.angle = ship.motherShip.angle - 90;
            ship.respawnDisplay();
        }
        //Respawn Ship After Delay
        setTimeout(function () { this.reviveShip(ship); }.bind(this), this.shipsRespawnDelay * 1000);
    };
    Ship.prototype.reviveShip = function (ship) {
        if (ship.motherShip.alive) {
            //Reset Ship
            var position = ship.getShipSpawnPosition();
            ship.reset(position.x, position.y);
        }
    };
    Ship.prototype.respawnDisplay = function () {
        //Set Respawn text
        this.respawnText.text = this.shipsRespawnDelay.toString();
        var delay = 1;
        setTimeout(function setRespawnText() {
            if (delay < this.shipsRespawnDelay) {
                this.respawnText.text = (this.shipsRespawnDelay - delay).toString();
                setTimeout(setRespawnText.bind(this), 1 * 1000);
                delay++;
            }
            else if (delay == this.shipsRespawnDelay) {
                this.respawnText.text = (this.shipsRespawnDelay - delay).toString();
                setTimeout(function () { this.respawnText.text = ""; }.bind(this), 0.5 * 1000);
            }
        }.bind(this), 1 * 1000);
    };
    return Ship;
}(Phaser.Sprite));
//# sourceMappingURL=ship.js.map