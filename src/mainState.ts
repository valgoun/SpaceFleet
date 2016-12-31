class MainState extends Phaser.State {

    //Singleton instance    
    static instance: MainState;

    //Global Variables
    public ready: boolean = false;
    public gameStarted: boolean = false;
    public gameOver: boolean = false;
    public localPlayerDead: boolean = false;

    //Sockets Settings
    public socket: SocketIOClient.Socket;
    public localPlayerName: string;
    public playersReady = [];
    public playersName = [];

    //Mother Ships
    public motherShips: MotherShip[];
    public playerMotherShipIndex: number;

    //Ship Damages
    private shipsCrashDamage: number = 10;
    private shipsWeaponsDamage: number = 2;

    //Groups For Sprite Rendering Sort and Collision Layer
    public playerMotherShipGroup: Phaser.Group;
    public enemiesMotherShipsGroup: Phaser.Group;
    public playerShipsGroup: Phaser.Group;
    public enemiesShipsGroup: Phaser.Group;
    public weaponsBulletsGroup: Phaser.Group;

    constructor() {
        super();

        if (typeof MainState.instance === 'undefined')
            MainState.instance = this;
    }

    everyoneReady(playerName) {
        this.playersReady[this.playersName.indexOf(playerName)] = playerName;

        let playerReadyCount = 0;

        for (let i = 0; i < this.playersReady.length; i++)
            if (typeof this.playersReady[i] !== 'undefined')
                playerReadyCount++;

        if (playerReadyCount === this.playersName.length) {
            this.gameStarted = true;
            let date = new Date();
            //console.log("EO Ready !!");
        }
        else {
            //console.log("NOT EO Ready !!");
        }
    }

    //Load Images For Sprites
    preload() {
        this.game.load.image('Ship', 'src/assets/Ship.png');
        this.game.load.image('MotherShip', 'src/assets/MotherShip.png');
        this.game.load.image('Bullet', 'src/assets/Bullet.png');
    }

    //Setup Game
    create() {
        MainState.instance.socket.on("ready", (playerName) => {
            this.everyoneReady(playerName)
        });

        //Initialize Arrays
        this.motherShips = [];
        this.playersReady = [];

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.stage.disableVisibilityChange = true;

        //Initialize Groups
        this.playerMotherShipGroup = this.game.add.physicsGroup();
        this.enemiesMotherShipsGroup = this.game.add.physicsGroup();
        this.playerShipsGroup = this.game.add.physicsGroup();
        this.enemiesShipsGroup = this.game.add.physicsGroup();
        this.weaponsBulletsGroup = this.game.add.physicsGroup();

        this.createGame();
    }

    createGame() {
        //Create Fleets
        //console.log("Local Name : " + this.localPlayerName);

        for (let i = 0; i < this.playersName.length; i++) {
            if (this.playersName[i] === this.localPlayerName)
                this.createFleet(true);
            else
                this.createFleet(false);
        }
    }

    createFleet(playerMotherShip: boolean, shipsCount: number = 2) {
        let index = 0;

        //Check Which Slot is Free
        for (let i = 0; i < 4; i++)
            if (typeof this.motherShips[i] === 'undefined') {
                index = i;
                break;
            }

        this.motherShips[index] = new MotherShip(this.game, this.localPlayerName, playerMotherShip, index, 'MotherShip');

        if (playerMotherShip)
            this.playerMotherShipIndex = index;

        //Set Group
        if (playerMotherShip)
            this.playerMotherShipGroup.add(this.motherShips[index]);
        else
            this.enemiesMotherShipsGroup.add(this.motherShips[index]);

        //Created Ships Asked
        for (let i = 0; i < shipsCount; i++) {
            this.motherShips[index].ships[i] = new Ship(this.game, playerMotherShip, this.motherShips[index], i, 'Ship');

            //Set Group
            if (playerMotherShip) {
                this.playerShipsGroup.add(this.motherShips[index].ships[i]);
                this.weaponsBulletsGroup.add(this.motherShips[index].ships[i].weapon.bullets);
            }
            else {
                this.enemiesShipsGroup.add(this.motherShips[index].ships[i]);
                this.weaponsBulletsGroup.add(this.motherShips[index].ships[i].weapon.bullets);
            }
        }

        MainState.instance.socket.emit("ready", this.localPlayerName);
    }

    update() {
        if (this.gameStarted)
            this.collisions();
    }

    collisions() {
        //Players Ships Collision
        this.game.physics.arcade.collide(this.playerShipsGroup);
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesShipsGroup, this.shipAgainstShip.bind(this), null, this);
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesMotherShipsGroup, this.shipAgainstMotherShip.bind(this), null, this);

        //Enemies Ships Collisions
        this.game.physics.arcade.collide(this.enemiesShipsGroup);
        this.game.physics.arcade.collide(this.enemiesShipsGroup, this.playerMotherShipGroup, this.shipAgainstMotherShip.bind(this), null, this);

        //Weapons Bullets Collisions
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.enemiesMotherShipsGroup, this.bulletAgainstMotherShip.bind(this), null, this);
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.enemiesShipsGroup, this.bulletAgainstShip.bind(this), null, this);
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.playerShipsGroup, this.bulletAgainstShip.bind(this), null, this);
        this.game.physics.arcade.overlap(this.weaponsBulletsGroup, this.playerMotherShipGroup, this.bulletAgainstMotherShip.bind(this), null, this);
    }

    shipAgainstMotherShip(ship: Ship, motherShip: MotherShip) {
        //console.log("Ship vs MotherShip !");
        ship.destroyShip();

        if (!ship.playerShip)
            return;

        motherShip.damageMotherShip(this.shipsCrashDamage);
    }

    shipAgainstShip(thisShip: Ship, otherShip: Ship) {
        //console.log("Ship vs Ship !");
        thisShip.destroyShip();
        otherShip.destroyShip();
    }

    bulletAgainstMotherShip(bullet: Phaser.Bullet, motherShip: MotherShip) {
        //console.log("bullet vs MotherShip !");
        let bulletInfos = this.getBulletInfo(bullet);

        //Prevent From Shooting On Its Own MotherShip
        if (bulletInfos.motherShipIndex !== motherShip.motherShipIndex) {
            bullet.kill();

            if (bulletInfos.motherShipIndex === this.playerMotherShipIndex)
                motherShip.damageMotherShip(this.shipsWeaponsDamage);
        }
    }

    bulletAgainstShip(bullet: Phaser.Bullet, ship: Ship) {
        //console.log("bullet vs Ship !");
        let bulletInfos = this.getBulletInfo(bullet);

        //Enemy Fire        
        if (bulletInfos.motherShipIndex !== ship.motherShip.motherShipIndex) {
            bullet.kill();
            ship.destroyShip();
        }
        //Friendly Fire        
        else {
            //bullet.kill();
            //ship.destroyShip();
        }
    }

    getBulletInfo(bullet: Phaser.Bullet) {
        let motherShipIndex = 0;
        let shipIndex = 0;

        for (let i = 0; i < this.motherShips.length; i++)
            for (let j = 0; j < this.motherShips[i].ships.length; j++)
                if (this.motherShips[i].ships[j].weapon.bullets.contains(bullet)) {
                    motherShipIndex = i;
                    shipIndex = j;
                    break;
                }

        return { motherShipIndex: motherShipIndex, shipIndex: shipIndex };
    }

    checkGameOver() {
        let aliveMotherShips = 0;
        let winnerMotherShipIndex = 0;
        let winnerName;

        for (let i = 0; i < this.motherShips.length; i++)
            if (this.motherShips[i].alive) {
                aliveMotherShips++;
                winnerMotherShipIndex = i;
                winnerName = this.motherShips[i].playerName;
            }

        //Game Over
        if (aliveMotherShips < 2) {
            this.gameOver = true;

            console.log("Game Over !!");
            console.log(winnerName + " won !!");

            for (let i = 0; i < this.motherShips.length; i++) {
                if (i !== winnerMotherShipIndex) {
                    for (let j = 0; j < 3; j++)
                        if (this.motherShips[i].ships[j].alive)
                            this.motherShips[i].ships[j].kill();
                }
            }
        }
    }

    render() {
        //Debug Colliders
        for (let i = 0; i < this.motherShips.length; i++) {
            if (typeof this.motherShips[i] !== 'undefined' && this.motherShips[i].alive)
                //this.game.debug.body(this.motherShips[i]);

                for (let j = 0; j < this.motherShips[i].ships.length; j++)
                    if (typeof this.motherShips[i].ships[j] !== 'undefined' && this.motherShips[i].ships[j].alive) {
                        //this.game.debug.body(this.motherShips[i].ships[j]);
                    }
        }
    }
}
