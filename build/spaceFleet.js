var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//Global Screen Variables
var screenWidth = 1600;
var screenHeight = 900;
var screenWidthRatio = 1 + ((this.screenWidth - 1024) / 1024);
var SpaceFleet = (function (_super) {
    __extends(SpaceFleet, _super);
    function SpaceFleet(so, localName, players) {
        var _this = _super.call(this, screenWidth, screenHeight, Phaser.AUTO, 'content', null) || this;
        //Create Game only State
        _this.state.add('MainState', MainState, true);
        MainState.instance.localPlayerName = localName;
        MainState.instance.playersName = players;
        MainState.instance.socket = so;
        return _this;
    }
    return SpaceFleet;
}(Phaser.Game));
//# sourceMappingURL=spaceFleet.js.map