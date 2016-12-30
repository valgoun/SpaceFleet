class MainState extends Phaser.State {

    //Singleton instance    
    static instance: MainState;

    //Global Variables
    public gameOver: boolean = false;
    public localPlayerDead: boolean = false;

    //Sockets Settings
    public socket: SocketIOClient.Socket;
    public localPlayerName: string;
    public playersName = [];

    //Ships
    public motherShips: MotherShip[];

    //Ships Weapons
    private weapons: Phaser.Weapon[][];

    //Texts
    private healthTexts: Phaser.Text[];
    private respawnTexts: Phaser.Text[][];

    //Groups For Sprite Rendering Sort and Collision Layer
    public playerMotherShipGroup: Phaser.Group;
    public enemiesMotherShipsGroup: Phaser.Group;
    public playerShipsGroup: Phaser.Group;
    public enemiesShipsGroup: Phaser.Group;
    public weaponsBulletsGroup: Phaser.Group;
    public enemiesWeaponsBulletsGroup: Phaser.Group;

    constructor() {
        super();

        if (typeof MainState.instance === 'undefined')
            MainState.instance = this;
    }

    //Load Images For Sprites
    preload() {
        this.game.load.image('Ship', 'src/assets/Ship.png');
        this.game.load.image('MotherShip', 'src/assets/MotherShip.png');
        this.game.load.image('Bullet', 'src/assets/Bullet.png');
    }

    //Setup Game
    create() {
        this.setEventHandlers();

        //Initialize Arrays
        this.motherShips = [];
        this.weapons = [];
        for (let i = 0; i < 4; i++) {
            this.weapons[i] = [];
        }
        this.healthTexts = [];
        this.respawnTexts = [];
        for (let i = 0; i < 4; i++) {
            this.respawnTexts[i] = [];
        }

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.stage.disableVisibilityChange = true;

        //Initialize Groups
        this.playerMotherShipGroup = this.game.add.physicsGroup();
        this.enemiesMotherShipsGroup = this.game.add.physicsGroup();
        this.playerShipsGroup = this.game.add.physicsGroup();
        this.enemiesShipsGroup = this.game.add.physicsGroup();
        this.weaponsBulletsGroup = this.game.add.physicsGroup();
        this.enemiesWeaponsBulletsGroup = this.game.add.physicsGroup();

        this.startGame();
    }

    //Setup Listeners  
    setEventHandlers() {
        //Socket Listener
        MainState.instance.socket.on("moveShip", (playerName, shipData) => {
            if (this.localPlayerName !== playerName)
                this.motherShips[shipData.motherShipIndex].ships[shipData.shipIndex].onMoveShip(shipData);
        });

        MainState.instance.socket.on("shoot", (playerName, shootData) => {
            if (this.localPlayerName !== playerName)
                this.motherShips[shootData.motherShipIndex].ships[shootData.shipIndex].onShoot(shootData);
        });
    }

    startGame() {
        //Create Fleets
        //console.log("Local Name : " + this.localPlayerName);

        for (let i = 0; i < this.playersName.length; i++) {
            if (this.playersName[i] === this.localPlayerName)
                this.createFleet(true);
            else
                this.createFleet(false);
        }
    }

    createFleet(playerMotherShip: boolean, shipsCount: number = 1) {
        let index = 0;

        //Check Which Slot is Free
        for (let i = 0; i < 4; i++)
            if (typeof this.motherShips[i] === 'undefined') {
                index = i;
                break;
            }

        this.motherShips[index] = new MotherShip(this.game, this.localPlayerName, playerMotherShip, index, 'MotherShip');

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
                this.enemiesWeaponsBulletsGroup.add(this.motherShips[index].ships[i].weapon.bullets);
            }
        }
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
                this.game.debug.body(this.motherShips[i]);

            for (let j = 0; j < this.motherShips[i].ships.length; j++)
                if (typeof this.motherShips[i].ships[j] !== 'undefined' && this.motherShips[i].ships[j].alive) {
                    this.game.debug.body(this.motherShips[i].ships[j]);
                }
        }

        for (let i = 0; i < this.healthTexts.length; i++)
            if (typeof this.healthTexts[i] !== 'undefined') {
                //this.game.debug.geom(this.healthTexts[i].textBounds);
            }
    }
}
