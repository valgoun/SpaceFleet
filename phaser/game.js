var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,
};

var states = {
    game: "game",
};

var gameState = function (game) {

};

gameState.prototype = {

    preload: function () {
        game.load.image('ship', 'assets/Ship.png');
    },

    create: function () {
        sprite = this.add.sprite(400, 300, 'ship');

        sprite.anchor.set(0.5);
    },

    update: function () {

    },
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add(states.game, gameState);
game.state.start(states.game);