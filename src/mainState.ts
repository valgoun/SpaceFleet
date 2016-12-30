class MainState extends Phaser.State {

    //Singleton instance    
    static instance: MainState;

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
        this.playerMotherShipGroup = this.game.add.group();
        this.enemiesMotherShipsGroup = this.game.add.group();
        this.playerShipsGroup = this.game.add.group();
        this.enemiesShipsGroup = this.game.add.group();
        this.weaponsBulletsGroup = this.game.add.group();
        this.enemiesWeaponsBulletsGroup = this.game.add.group();

        this.startGame();
    }

    //Setup Listeners  
    setEventHandlers() {
        /*socket.on("moveShip", (playerName: string, shipsData) => {
            this.onMoveShip(playerName, shipsData);
        });

        socket.on("damage", (playerName: string, motherShipData) => {
            this.onDamage(playerName, motherShipData);
        });

        socket.on("shoot", (playerName: string, shootData) => {
            this.onShoot(playerName, shootData);
        });*/
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

    createFleet(playerMotherShip: boolean, shipsCount: number = 3) {
        let index = 0;

        //Check Which Slot is Free
        for (let i = 0; i < 4; i++)
            if (typeof this.motherShips[i] === 'undefined') {
                index = i;
                break;
            }

        this.motherShips[index] = new MotherShip(this.game, 'PlayerTest', playerMotherShip, index, 'MotherShip');

        //Created Ships Asked
        for (let i = 0; i < shipsCount; i++)
            this.motherShips[index].ships[i] = new Ship(this.game, playerMotherShip, this.motherShips[index], i, 'Ship');
    }
}
