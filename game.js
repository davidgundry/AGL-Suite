var preloadState = {
	preload: function () {
		game.stage.backgroundColor = "#000000";
		game.load.image('loadingBar', 'images/loadingBar.png');
	},
	create: function () {
		game.state.start('load');
	}
}

var loadState = {
	preload: function () {
		game.stage.backgroundColor = "#000000";

		var loadingLabel = game.add.text(game.world.centerX, 150, 'loading...', { font: '15px Courier New', fill: '#ffffff' });
		loadingLabel.anchor.setTo(0.5, 0.5);
		var loadingBar = game.add.sprite(game.world.centerX, 200, 'loadingBar');
		loadingBar.anchor.setTo(0.5, 0.5);
		game.load.setPreloadSprite(loadingBar);

		game.load.image('player', 'images/player.png');
		game.load.image('coin', 'images/coin.png');

	},
	create: function () {
		game.state.start('level');
	},
	update: function () {
	}
};

var levelState = {
    preload: function () {
        game.stage.backgroundColor = "#aaccaa";
    },
    create: function () {
        var lText = game.add.text(game.world.centerX, game.world.centerY, 'Level ' + gameLevel, { font: '25px Courier New', fill: '#ffffff' });
        lText.anchor.setTo(0.5, 0.5);
        this.time.events.add(2000, function () { this.game.state.start('main') }, this);
    }
}

var mainState = {
	preload: function () {
		game.stage.backgroundColor = "#aaccaa";
	},
	create: function () {
	    this.started = false;
	    if (gameLevel == 0) {
	        if (Math.round(Math.random()) == 1)
	            this.grammar = new RandomGrammar();
	        else
	            this.grammar = new FiniteStateGrammar(0, fsg1);
	    }
	    else {
	        if (this.grammar.name == "Random")
	            this.grammar = new FiniteStateGrammar(0, fsg1);
	        else
	            this.grammar = new RandomGrammar();
	    }

	    grammars.push(this.grammar.name);
	    levels.push([]);
	    scores.push([]);
		this.levelLength = 100;

		this.keys = this.game.input.keyboard.createCursorKeys();

		game.physics.startSystem(Phaser.Physics.ARCADE);
		this.player = game.add.sprite(game.world.centerX, game.world.height - 40, 'player');
		this.player.anchor.setTo(0.5, 0.5);
		this.coinGroup = game.add.group();
		game.physics.arcade.enable(this.player);
		
		this.player.body.collideWorldBounds = true;

		this.timer = 0;
		this.score = 0;
		this.timerText = this.game.add.text(15, 20, "Time: 0", { font: "24px Courier New", fill: "#ffffff" });
		this.scoreText = this.game.add.text(game.world.width - 50, 20, "0", { font: "24px Courier New", fill: "#ffffff" });
		this.game.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);
		this.game.time.events.loop(Phaser.Timer.SECOND, this.newCoins, this);

		this.xOffset = 0;
		this.coinOriginX = 0;

		this.time.events.add(2000, function () {
		    this.coinGroup.create(this.grammar.next(), -16, 'coin').anchor.setTo(0.5, 0.5);
		    game.physics.arcade.enable(this.coinGroup)
		}, this);
	},

	update: function () {
	    game.physics.arcade.collide(this.player, this.coinGroup, this.coinCollision, null, this);
	    this.coinGroup.forEach(
            function (coin, index, array) {
                if (coin.exists) {
                    if (coin.y > game.world.height) {
                        scores[gameLevel].push(coin.x-game.world.centerX);
                        coin.kill();
                    }
                }
            }, this, true);

	    if (levels[gameLevel].length == this.levelLength) {
	        gameLevel++;
	        this.game.state.start('level');
	    }

	    var force = 10;
	    if (this.keys.left.isDown) {
	        this.move(force);
	        this.coinGroup.forEach(
            function (coin, index, array) {
                coin.body.x = this.xOffset + this.coinOriginX;
            }, this, true);
	    }
	    else if (this.keys.right.isDown) {
	        this.move(-force);
	        this.coinGroup.forEach(
            function (coin, index, array) {
                coin.body.x = this.xOffset + this.coinOriginX;
            }, this, true);
	    }
	    else if (this.keys.up.isDown) {
	        this.output();
	    }
	},

	move: function(force) {
	    this.xOffset += force;
	    if (this.xOffset > 150)
	        this.xOffset = 150;
	    else if (this.xOffset < -150)
	        this.xOffset = -150;
	},

	updateCounter: function() {
		this.timer++;
		this.timerText.text = "Time: " + this.timer;
	},

	newCoins: function () {
	    this.xOffset = 0;
	    this.coinGroup.forEach(
			function (coin, index, array) {
			    this.resetCoin(coin);
			}, this, false);
	},

	resetCoin: function (coin) {
	    var symbol = this.grammar.next()
	    if (symbol != " ") {
	        levels[gameLevel].push(symbol);
	        coin.reset(this.interpret(symbol), -16, 10);
	        coin.body.velocity.y = 750;
	        this.coinOriginX = this.interpret(symbol);
	    }
	},

	coinCollision: function (player, coin) {
		this.score++;
		this.scoreText.text = this.score;
		scores[gameLevel].push(0);
		coin.kill();
	},

	interpret: function (symbol) {
		switch (symbol) {
			case "a":
				return this.player.x - 100;
			case "b":
			    return this.player.x + 100;

		    case "M":
		        return this.player.x - 150;
		    case "V":
		        return this.player.x - 100;
		    case "X":
		        return this.player.x + 0;
		    case "R":
		        return this.player.x + 100;
		    case "S":
		        return this.player.x + 150;
		}
	},

	output: function () {
	    var html = "<p>Grammar";
	    for (var i = 0; i < levels[0].length; i++)
	        html += "," + i;
	    html += "<br />";
	    for (var l = 0; l < scores.length; l++) {
	        html += grammars[l];
	        for (var i = 0; i < scores[l].length; i++)
	            html += "," + scores[l][i];
	        html += "<br />";
	    }
	    html += "</p>";
		document.getElementById("gameOutput").innerHTML = html;
	}

};


function RandomGrammar() {
    this.name = "Random";
}

/**
 * Returns a random character fromn the alphabet M, V, X, R, S
 */
RandomGrammar.prototype.next = function() {
    /*var p = Math.round(Math.random()*5);
    if (p == 0)
        return "M";
    else if (p == 1)
        return "V";
    else if (p == 2)
        return "X";
    else if (p == 3)
        return "R";
    else
        return "S";*/

    if (Math.round(Math.random() * 5) == 1)
        return " ";

    var p = Math.round(Math.random());
    if (p == 0)
        return "a";
    else
        return "b";
}

function FiniteStateGrammar(start,transition) {
	this.current = start;
	this.transition = transition;
	this.name = "FSG";
}

FiniteStateGrammar.prototype.next = function () {
	var n = this.transition(this.current);
	this.current = n.s;
	return n.o;
}

/**
* A really simple finite state grammar with an alphabet of two symbols: a, b
*/
function fsg1(s) {
	switch (s) {
		case 0:
			return { s: 1, o: "a" };
		case 1:
			if (Math.round(Math.random()) == 0)
				return { s: 1, o: "b" };
			else
			    return { s: 2, o: "a" };
	    case 2:
	        return { s: 0, o: " " };
	}
}
/**
* 
* Alphabet: M, V, X, R, S
* 
* Taken from page 124 of:
* Redington, M. & Chater, N., 1996. Transfer in artificial grammar learning: A reevaluation.
* Journal of experimental psychology: …, 125(2), pp.123–138.
* Available at: http://psycnet.apa.org/psycinfo/1996-04201-001 [Accessed February 23, 2015].
*/
function fsg2(s) { 
    switch (s) {
        case 0:
            if (Math.round(Math.random()) == 0)
                return { s: 1, o: "M" };
            else
                return { s: 2, o: "V" };
        case 1:
            if (Math.round(Math.random()) == 0)
                return { s: 1, o: "S" };
            else
                return { s: 3, o: "V" };
        case 2:
            if (Math.round(Math.random()) == 0)
                return { s: 1, o: "X" };
            else
                return { s: 4, o: "X" };
        case 3:
            var p = Math.round(Math.random() * 2);
            if (p == 0)
                return { s: 5, o: "S" };
            else if (p==1)
                return { s: 2, o: "R" };
            else
                return { s: 0, o: " " };
        case 4:
            var p = Math.round(Math.random()*2);
            if (p==0)
                return { s: 4, o: "R" };
            else if (p==1)
                return { s: 5, o: "M" };
            else
                return { s: 0, o: " " };
        case 5:
            return { s: 0, o: " " };
    }
}




var game = new Phaser.Game(420, 300, Phaser.AUTO, 'gameDiv');

game.state.add('preload', preloadState);
game.state.add('load', loadState);
game.state.add('main', mainState);
game.state.add('level', levelState);

var gameLevel = 0;
var levels = [];
var scores = [];
var grammars = [];
game.state.start('preload');