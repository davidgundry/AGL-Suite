/**
 * AGLRun is a game that involves reacting to falling sprites. Create a new instance of AGLRun to start the game.
 * 
 * @param   full        whether to play fullscreen
 * @param   targetDiv   the HTML element in which to put the game
 */
function AGLRun(full, targetDiv)
{
    if (!full)
	{
		var container = document.getElementById(targetDiv);
		if (container != null)
			this.game = new Phaser.Game(container.clientWidth, container.clientHeight, Phaser.AUTO, container);
		else
		{
			AGLRun.log("Invalid target container");
			return;
		}
	}
	else
	{	
		this.game = new Phaser.Game(Math.max(AGLRun.minWidth,window.innerWidth), Math.max(AGLRun.minHeight,window.innerHeight), Phaser.AUTO);
	}
    
	this.gameLevel = 0;
	this.levels = [];
	this.scores = [];
	this.grammars = [];
    
    this.moveDistance = this.game.width/10;
    
	this.game.state.add('load', new AGLRun.states.Load(this));
	this.game.state.add('main', new AGLRun.states.Level(this));
	this.game.state.add('level', new AGLRun.states.Main(this));
    
	this.game.state.start('load');
};


AGLRun.minWidth = 200;
AGLRun.minHeight = 200;
AGLRun.defaultFont = "Sans-Serif";
AGLRun.backgroundColour = "#aaccaa";

AGLRun.log = function(message)
{
    console.log(message);
}

AGLRun.states = function()
{};

AGLRun.states.Load = function(AGL)
{
    this.AGL = AGL;
};

AGLRun.states.Load.prototype.preload = function()
{
	this.AGL.game.stage.backgroundColor = AGLRun.backgroundColour;

	var loadingLabel = this.AGL.game.add.text(this.AGL.game.world.centerX, this.game.height*(1/2), 'loading...', { font: this.game.height/10 + 'px '+AGLRun.defaultFont, fill: '#ffffff' });
	loadingLabel.anchor.setTo(0.5, 0.5);

	this.AGL.game.load.image('player', 'images/player.png');
	this.AGL.game.load.image('coin', 'images/coin.png');

};

AGLRun.states.Load.prototype.create = function()
{
	//this.AGL.game.state.start('level');
};

AGLRun.states.Level = function(AGL)
{
    this.AGL = AGL;
};

AGLRun.states.Level.prototype.preload = function()
{
	this.AGL.game.stage.backgroundColor = AGLRun.backgroundColour;
};

AGLRun.states.Level.prototype.create = function()
{
    var lText = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY, 'Level ' + this.AGL.gameLevel, { font: '25px Courier New', fill: '#ffffff' });
    lText.anchor.setTo(0.5, 0.5);
    this.time.events.add(2000, function () { this.game.state.start('main'); }, this);
};

AGLRun.states.Main = function(AGL)
{
    this.AGL = AGL;
};

AGLRun.states.Main.prototype.preload = function ()
{
	this.AGL.game.stage.backgroundColor = AGLRun.backgroundColour;
};

AGLRun.states.Main.prototype.create = function ()
{
    this.started = false;
    if (this.AGL.gameLevel == 0) {
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

    this.AGL.grammars.push(this.grammar.name);
    this.AGL.levels.push([]);
    this.AGL.scores.push([]);
	this.levelLength = 100;

	this.keys = this.game.input.keyboard.createCursorKeys();

	this.AGL.game.physics.startSystem(Phaser.Physics.ARCADE);
	this.player = this.AGL.game.add.sprite(this.AGL.game.world.centerX, this.AGL.game.world.height - 40, 'player');
	this.player.anchor.setTo(0.5, 0.5);
	this.coinGroup = this.AGL.game.add.group();
	this.AGL.game.physics.arcade.enable(this.player);
	
	this.player.body.collideWorldBounds = true;

	this.timer = 0;
	this.score = 0;
	this.timerText = this.game.add.text(15, 20, "Time: 0", { font: "24px Courier New", fill: "#ffffff" });
	this.scoreText = this.game.add.text(this.AGL.game.world.width - 50, 20, "0", { font: "24px Courier New", fill: "#ffffff" });
	this.game.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);
	this.game.time.events.loop(Phaser.Timer.SECOND, this.newCoins, this);

	this.xOffset = 0;
	this.coinOriginX = 0;

	this.time.events.add(2000, function ()
    {
	    this.coinGroup.create(this.grammar.next(), -16, 'coin').anchor.setTo(0.5, 0.5);
	    this.AGL.game.physics.arcade.enable(this.coinGroup);
	}, this);
};

AGLRun.states.Main.prototype.update = function ()
{
    this.AGL.game.physics.arcade.collide(this.player, this.coinGroup, this.coinCollision, null, this);
    this.coinGroup.forEach(
        function (coin, index, array) {
            if (coin.exists) {
                if (coin.y > this.AGL.game.world.height) {
                    this.AGL.scores[this.AGL.gameLevel].push(coin.x-this.AGL.game.world.centerX);
                    coin.kill();
                }
            }
        }, this, true);

    if (this.AGL.levels[this.AGL.gameLevel].length == this.levelLength) {
        this.AGL.gameLevel++;
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
        this.AGL.output();
    }
};

AGLRun.states.Main.prototype.move = function(force)
{
    this.xOffset += force;
    if (this.xOffset > 150)
        this.xOffset = 150;
    else if (this.xOffset < -150)
        this.xOffset = -150;
};

AGLRun.states.Main.prototype.updateCounter = function()
{
	this.timer++;
	this.timerText.text = "Time: " + this.timer;
};

AGLRun.states.Main.prototype.newCoins = function ()
{
    this.xOffset = 0;
    this.coinGroup.forEach(
		function (coin, index, array) {
		    this.resetCoin(coin);
		}, this, false);
};

AGLRun.states.Main.prototype.resetCoin = function (coin)
{
    var symbol = this.grammar.next();
    if (symbol != " ") {
        this.AGL.levels[this.AGL.gameLevel].push(symbol);
        coin.reset(this.interpret(symbol), -16, 10);
        coin.body.velocity.y = 750;
        this.coinOriginX = this.AGL.interpret(symbol);
    }
};

AGLRun.states.Main.prototype.coinCollision = function (player, coin)
{
	this.score++;
	this.scoreText.text = this.score;
	this.AGL.scores[this.AGL.gameLevel].push(0);
	coin.kill();
};

AGLRun.prototype.interpret = function (symbol)
{
	switch (symbol) {
		case "a":
			return this.player.x - this.moveDistance;
		case "b":
		    return this.player.x + this.moveDistance;
    }
	/*    case "M":
	        return this.player.x - 150;
	    case "V":
	        return this.player.x - 100;
	    case "X":
	        return this.player.x + 0;
	    case "R":
	        return this.player.x + 100;
	    case "S":
	        return this.player.x + 150;
	}*/
};

AGLRun.prototype.output = function ()
{
    var html = "<p>Grammar";
    for (var i = 0; i < this.levels[0].length; i++)
        html += "," + i;
    html += "<br />";
    for (var l = 0; l < this.scores.length; l++) {
        html += this.AGL.grammars[l];
        for (var i = 0; i < this.scores[l].length; i++)
            html += "," + this.scores[l][i];
        html += "<br />";
    }
    html += "</p>";
	document.getElementById("gameOutput").innerHTML = html;
};

function RandomGrammar() {
    this.name = "Random";
};

/**
 * Returns a random character fromn the alphabet M, V, X, R, S
 */
RandomGrammar.prototype.next = function()
{
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
};

function FiniteStateGrammar(start,transition)
{
	this.current = start;
	this.transition = transition;
	this.name = "FSG";
};

FiniteStateGrammar.prototype.next = function()
{
	var n = this.transition(this.current);
	this.current = n.s;
	return n.o;
};

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
};
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
};