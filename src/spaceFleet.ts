//Global Screen Variables
const screenWidth = 1024;
const screenHeight = 576;
const screenWidthRatio = 1 + ((this.screenWidth - 1024) / 1024);

class SpaceFleet extends Phaser.Game {

    constructor(so: SocketIOClient.Socket, localName: string, players: string[]) {
        super(screenWidth, screenHeight, Phaser.AUTO, 'content', null);

        //Create Game only State
        this.state.add('MainState', MainState, true);

        MainState.instance.localPlayerName = localName;
        MainState.instance.playersName = players;
        MainState.instance.socket = so;
    }
}