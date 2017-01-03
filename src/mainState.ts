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
    public playersDead: boolean[] = [];

    //Winner Text
    public winnerText: Phaser.Text;

    //Mother Ships
    public motherShips: MotherShip[];
    public playerMotherShipIndex: number;

    //Asteroids
    private asteroids: Asteroid[];
    private asteroidsCount = { min: 10, max: 15 };

    //Ship Damages
    private shipsCrashDamage: number = 10;
    private shipsWeaponsDamage: number = 2;

    //Groups For Sprite Rendering Sort and Collision Layer
    public playerMotherShipGroup: Phaser.Group;
    public enemiesMotherShipsGroup: Phaser.Group;
    public playerShipsGroup: Phaser.Group;
    public enemiesShipsGroup: Phaser.Group;
    public weaponsBulletsGroup: Phaser.Group;
    public asteroidsGroup: Phaser.Group;

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
        this.game.load.image('Asteroid', 'src/assets/Asteroid.png');
    }

    //Setup Game
    create() {
        MainState.instance.socket.on("ready", (playerName) => {
            this.everyoneReady(playerName)
        });

        MainState.instance.socket.on("asteroids", (asteroidsData) => {
            this.createAsteroids(asteroidsData)
        });

        //Initialize Arrays
        this.motherShips = [];
        this.playersReady = [];
        this.playersDead = [];
        this.asteroids = [];

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.stage.disableVisibilityChange = true;

        //Initialize Groups
        this.playerMotherShipGroup = this.game.add.group();
        this.enemiesMotherShipsGroup = this.game.add.group();
        this.playerShipsGroup = this.game.add.group();
        this.enemiesShipsGroup = this.game.add.group();
        this.weaponsBulletsGroup = this.game.add.group();
        this.asteroidsGroup = this.game.add.group();

        this.createGame();
        this.createWinnerText();
        this.setEventHandlers();

        if (this.playerMotherShipIndex === 0)
            this.createAsteroids();
    }

    createAsteroids(asteroidsData?) {

        if (typeof asteroidsData !== 'undefined') {
            for (let i = 0; i < asteroidsData.length; i++) {
                let newlyAsteroid: Asteroid = new Asteroid(this.game, 'Asteroid', asteroidsData, i);
                this.asteroidsGroup.add(newlyAsteroid);
                this.asteroids[i] = newlyAsteroid;
            }
        }

        else {
            let asteroidCount = this.randomIntFromInterval(this.asteroidsCount.min, this.asteroidsCount.max);
            let asteroidsDataToSend = [];

            for (let i = 0; i < asteroidCount; i++) {
                let newlyAsteroid: Asteroid = new Asteroid(this.game, 'Asteroid', undefined, i);

                this.game.physics.arcade.overlap(newlyAsteroid, MainState.instance.asteroidsGroup, function () { newlyAsteroid.kill() }.bind(this), null, this);
                this.game.physics.arcade.overlap(newlyAsteroid, MainState.instance.playerMotherShipGroup, function () { newlyAsteroid.kill() }.bind(this), null, this);
                this.game.physics.arcade.overlap(newlyAsteroid, MainState.instance.enemiesMotherShipsGroup, function () { newlyAsteroid.kill() }.bind(this), null, this);

                if (newlyAsteroid.alive) {
                    this.asteroidsGroup.add(newlyAsteroid);
                    this.asteroids[i] = newlyAsteroid;

                    asteroidsDataToSend[i] =
                        {
                            x: newlyAsteroid.x,
                            y: newlyAsteroid.y,

                            angle: newlyAsteroid.angle,

                            width: newlyAsteroid.width,
                            height: newlyAsteroid.height
                        }
                }
                else
                    i--;
            }

            MainState.instance.socket.emit("asteroids", asteroidsDataToSend);
        }
    }

    setEventHandlers() {
        this.socket.on("PlayerLeave", (name) => {
            let index = this.playersName.indexOf(name);
            this.playersDead[index] = true;
            this.motherShips[index].leaverText.visible = true;

            for (let i = 0; i < 3; i++)
                this.motherShips[index].ships[i].kill();
        });

        this.socket.on("moveAsteroid", (asteroidsData) => {
            for (let i = 0; i < asteroidsData.length; i++) {
                this.asteroids[i].x = asteroidsData[i].x;
                this.asteroids[i].y = asteroidsData[i].y;
            }

        });
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

    createFleet(playerMotherShip: boolean, shipsCount: number = 3) {
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

    createWinnerText() {
        let style = { font: "bold 20px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        this.winnerText = this.game.add.text(15, 15, "", style);
        this.winnerText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }

    update() {
        if (this.gameStarted) {
            this.collisions();

            if (this.playerMotherShipIndex === 0)
                this.sendAsteroidsData();
        }
    }

    sendAsteroidsData() {
        let asteroidsData = [];

        for (let i = 0; i < this.asteroids.length; i++)
            asteroidsData[i] =
                {
                    x: this.asteroids[i].x,
                    y: this.asteroids[i].y
                }

        MainState.instance.socket.emit("moveAsteroid", asteroidsData);

    }

    collisions() {
        //Players Ships Collisions
        this.game.physics.arcade.collide(this.playerShipsGroup);
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesShipsGroup, this.shipAgainstShip.bind(this), null, this);
        this.game.physics.arcade.collide(this.playerShipsGroup, this.enemiesMotherShipsGroup, this.shipAgainstMotherShip.bind(this), null, this);

        //Asteroids Collisions
        this.game.physics.arcade.collide(this.asteroidsGroup);
        this.game.physics.arcade.collide(this.asteroidsGroup, this.playerShipsGroup);
        this.game.physics.arcade.collide(this.asteroidsGroup, this.enemiesShipsGroup);

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

            if (winnerMotherShipIndex === this.playerMotherShipIndex)
                this.winnerText.text = "You won you bad motherfucker!";
            else
                this.winnerText.text = "You lost and " + winnerName + " wons!";

            this.winnerText

            for (let i = 0; i < this.motherShips.length; i++) {
                if (i !== winnerMotherShipIndex) {
                    for (let j = 0; j < 3; j++)
                        if (this.motherShips[i].ships[j].alive)
                            this.motherShips[i].ships[j].kill();
                }
            }
        }
    }

    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
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

        for (let i = 0; i < this.asteroids.length; i++)
            this.game.debug.body(this.asteroids[i]);
    }


}
