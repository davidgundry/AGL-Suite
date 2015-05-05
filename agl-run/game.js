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
AGLRun.defaultColour = "#ffffff";
AGLRun.playerForce = 10;
AGLRun.coinVelocity = 750;

AGLRun.log = function(message)
{
    console.log(message);
}

AGLRun.createPlayer = function(game)
{
	var player = game.add.sprite(game.world.centerX, game.world.height*(9/10), 'player');
	player.anchor.setTo(0.5, 0.5);
    player.height = game.world.height/12;
    game.physics.arcade.enable(player);
    
    return player;
};

AGLRun.interpret = function (symbol)
{
	switch (symbol) {
		case "a":
			return -this.moveDistance;
		case "b":
		    return this.moveDistance;
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
        html += this.grammars[l];
        for (var i = 0; i < this.scores[l].length; i++)
            html += "," + this.scores[l][i];
        html += "<br />";
    }
    html += "</p>";
	document.getElementById("gameOutput").innerHTML = html;
};




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
	this.AGL.game.state.start('level');
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
    var lText = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY, 'Level ' + this.AGL.gameLevel, { font: this.AGL.game.height/10 + 'px ' + AGLRun.defaultFont, fill: AGLRun.defaultColour });
    lText.anchor.setTo(0.5, 0.5);
    this.time.events.add(2000, function () { this.AGL.game.state.start('main'); }, this);
};

AGLRun.states.Main = function(AGL)
{
    this.AGL = AGL;
};

AGLRun.states.Main.prototype.timer = 0;
AGLRun.states.Main.prototype.score = 0;
AGLRun.states.Main.prototype.xOffset = 0;
AGLRun.states.Main.prototype.coinOriginX = 0;
AGLRun.states.Main.prototype.levelLength = 100;
AGLRun.states.Main.prototype.startTime = 0;

AGLRun.states.Main.prototype.preload = function ()
{
	this.AGL.game.stage.backgroundColor = AGLRun.backgroundColour;
};

AGLRun.states.Main.prototype.create = function ()
{
    this.started = false;
    this.grammar = this.setGrammar();
    
    this.AGL.grammars.push(this.grammar.name);
    this.AGL.levels.push([]);
    this.AGL.scores.push([]);

	this.keys = this.game.input.keyboard.createCursorKeys();

	this.AGL.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.player = AGLRun.createPlayer(this.AGL.game);

    this.createUI();

	this.game.time.events.loop(Phaser.Timer.SECOND, this.createCoin, this);

	/*this.time.events.add(this.startTime, function ()
    {
        this.coin.body.velocity.y = AGLRun.coinVelocity;
	}, this);*/
};

AGLRun.states.Main.prototype.setGrammar = function()
{
    var g;
    
    if (this.AGL.gameLevel == 0) {
        if (Math.round(Math.random()) == 1)
            g = new AGLSuite.grammar.RandomGrammar();
        else
            g = new AGLSuite.grammar.FiniteStateGrammar(0, fsg1);
    }
    else {
        if (this.grammar.name == "Random")
            g = new AGLSuite.grammar.FiniteStateGrammar(0, fsg1);
        else
            g = new AGLSuite.grammar.RandomGrammar();
    }
    return g;
}

AGLRun.states.Main.prototype.createCoin = function()
{
    if (this.coin == null)
    {
        this.coin = this.AGL.game.add.sprite(this.grammar.next(), -16, 'coin');
        this.coin.anchor.setTo(0.5, 0.5);
        this.coin.height = this.AGL.game.world.height/20;
        this.AGL.game.physics.arcade.enable(this.coin);
        this.coin.body.velocity.y = AGLRun.coinVelocity;
    }
    this.resetCoin(this.coin);
}

AGLRun.states.Main.prototype.createUI = function()
{
	this.timerText = this.game.add.text(15, 20, "Time: 0", { font: this.AGL.game.height/12 + "px " +AGLRun.defaultFont, fill: AGLRun.defaultColour });
	this.scoreText = this.game.add.text(this.AGL.game.world.width - 50, 20, "0", { font: this.AGL.game.height/12 + "px "+AGLRun.defaultFont, fill: AGLRun.defaultColour });
	this.game.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);
}

AGLRun.states.Main.prototype.update = function ()
{
    this.checkCollision();
    
    if (this.AGL.levels[this.AGL.gameLevel].length == this.levelLength)
    {
        this.AGL.gameLevel++;
        this.game.state.start('level');
    }
    
    var force = 0;
    
    if (this.keys.left.isDown)
        force = AGLRun.playerForce;
    else if (this.keys.right.isDown)
        force = -AGLRun.playerForce;
    else if (this.keys.up.isDown)
        this.AGL.output();
    
    this.move(force);
};

AGLRun.states.Main.prototype.checkCollision = function()
{
    if ((this.coin == null) || (this.player == null))
        return;
        
    this.AGL.game.physics.arcade.collide(this.player, this.coin, this.coinCollision, null, this);
    if (this.coin.exists)
    {
        if (this.coin.y > this.AGL.game.world.height)
        {
            this.AGL.scores[this.AGL.gameLevel].push(this.coin.x-this.AGL.game.world.centerX);
            this.coin.kill();
        }
    }
};

AGLRun.states.Main.prototype.coinCollision = function (player, coin)
{
	this.score++;
	this.scoreText.text = this.score;
	this.AGL.scores[this.AGL.gameLevel].push(0);
	coin.kill();
};

AGLRun.states.Main.prototype.move = function(force)
{
    if (force == 0)
     return;
     
    this.xOffset += force;
    if (this.xOffset > 150)
        this.xOffset = 150;
    else if (this.xOffset < -150)
        this.xOffset = -150;
        
    this.coin.body.x = this.xOffset + this.coinOriginX;
};

AGLRun.states.Main.prototype.updateCounter = function()
{
	this.timer++;
	this.timerText.text = "Time: " + this.timer;
};

AGLRun.states.Main.prototype.resetCoin = function (coin)
{
    var symbol = this.grammar.next();
    if (symbol !== " ")
    {
        this.AGL.levels[this.AGL.gameLevel].push(symbol);
        coin.reset(this.player.x + AGLRun.interpret(symbol), -16, 10);
        coin.body.velocity.y = AGLRun.coinVelocity;
        this.coinOriginX = this.player.x + AGLRun.interpret(symbol);
    }
};
