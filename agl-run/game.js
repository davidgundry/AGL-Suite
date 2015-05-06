﻿/**
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
       
    this.moveDistance = this.game.width*(3/9);
    this.coinVelocity = this.game.height*1.2;
    
    AGLRun.states.load(this);
    AGLRun.states.start(this.game);
};

AGLRun.minWidth = 200;
AGLRun.minHeight = 200;
AGLRun.defaultFont = "Sans-Serif";
AGLRun.backgroundColour = "#aaccaa";
AGLRun.defaultColour = "#ffffff";
AGLRun.playerForce = 10;
AGLRun.alphabet = ["a","b"," "];

AGLRun.createPlayer = function(game)
{
	var player = game.add.sprite(game.world.centerX, game.world.height*(8/9), 'squirrel');
    player.animations.add('run', [9,10,11,12], 10, true);
    player.animations.add('wait', [0,1,2], 10, true); 
    player.animations.add('jump', [12], 10, true); 
    player.animations.add('fall', [13], 10, true); 
    
	player.anchor.setTo(0.5, 0.5);
    player.height = game.world.height/5;
    player.width = game.world.height/5;
    player.originalScalex = player.scale.x;
    
    game.physics.arcade.enable(player);
    //player.body.immovable = true;
    player.body.collideWorldBounds = true;
    
    player.animations.play('wait');
    
    return player;
};

AGLRun.prototype.interpret = function (symbol)
{
	switch (symbol)
    {
		case "a":
			return -this.moveDistance;
		case "b":
		    return this.moveDistance;
    }
};

AGLRun.prototype.gameLevel = 0;
AGLRun.prototype.levels = [];
AGLRun.prototype.scores = [];
AGLRun.prototype.grammars = [];

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

AGLRun.loadAssets = function(game)
{
    game.load.image('player', 'images/player.png');
    game.load.spritesheet('squirrel', 'images/squirrel-t.png', 84, 84);
	game.load.image('acorn', 'images/acorn.png');
}

AGLRun.states = function()
{};

AGLRun.states.load = function(AGL)
{
	AGL.game.state.add('load', new AGLRun.states.Load(AGL));
	AGL.game.state.add('main', new AGLRun.states.Main(AGL));
	AGL.game.state.add('level', new AGLRun.states.Level(AGL));
}

AGLRun.states.start = function(game)
{
   game.state.start('load');
}

AGLRun.states.Load = function(AGL)
{
    this.AGL = AGL;
};

AGLRun.states.Load.loadingText = "Loading";

AGLRun.states.Load.prototype.preload = function()
{
	this.AGL.game.stage.backgroundColor = AGLRun.backgroundColour;

	var loadingLabel = this.AGL.game.add.text(this.AGL.game.world.centerX, this.game.height*(1/2),AGLRun.states.Load.loadingText, { font: this.game.height/10 + 'px '+AGLRun.defaultFont, fill: AGLRun.defaultColour });
	loadingLabel.anchor.setTo(0.5, 0.5);
    
    AGLRun.loadAssets(this.AGL.game);
};

AGLRun.states.Load.prototype.create = function()
{
	this.AGL.game.state.start('level');
};

AGLRun.states.Level = function(AGL)
{
    this.AGL = AGL;
};

AGLRun.states.Level.wait = 1000;
AGLRun.states.Level.levelText = "Level";

AGLRun.states.Level.prototype.preload = function()
{
	this.AGL.game.stage.backgroundColor = AGLRun.backgroundColour;
};

AGLRun.states.Level.prototype.create = function()
{
    var lText = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY, AGLRun.states.Level.levelText + ' ' + this.AGL.gameLevel, { font: this.AGL.game.height/10 + 'px ' + AGLRun.defaultFont, fill: AGLRun.defaultColour });
    lText.anchor.setTo(0.5, 0.5);
    this.time.events.add(AGLRun.states.Level.wait, function (){ this.AGL.game.state.start('main');
     }, this);
};

AGLRun.states.Main = function(AGL)
{
    this.AGL = AGL;
};

AGLRun.states.Main.prototype.timer = 0;
AGLRun.states.Main.prototype.score = 0;
AGLRun.states.Main.prototype.xOffset = 0;
AGLRun.states.Main.prototype.coinOriginX = 0;
AGLRun.states.Main.prototype.levelLength = 20;
AGLRun.states.Main.prototype.startTime = 0;
AGLRun.states.Main.prototype.coin = null;

AGLRun.states.Main.prototype.preload = function ()
{
	this.AGL.game.stage.backgroundColor = AGLRun.backgroundColour;
};

AGLRun.states.Main.prototype.create = function ()
{
    AGLSuite.log.recordEvent("started");
    this.grammar = this.setGrammar();
    
    this.AGL.grammars.push(this.grammar.name);
    this.AGL.levels.push([]);
    this.AGL.scores.push([]);

	this.keys = this.game.input.keyboard.createCursorKeys();

	this.AGL.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.player = AGLRun.createPlayer(this.AGL.game);

    this.createUI();
    
    this.game.physics.arcade.gravity.y = 500;

	this.time.events.add(this.startTime, function ()
    {
        this.createCoin();
        this.game.time.events.loop(Phaser.Timer.SECOND*2, this.createCoin, this);
	}, this);
};

AGLRun.states.Main.prototype.setGrammar = function()
{
    var g;
    
    if (this.AGL.gameLevel == 0)
    {
        if (Math.round(Math.random()) == 1)
            g = new AGLSuite.grammar.RG(AGLRun.alphabet);
        else
            g = new AGLSuite.grammar.FSG(AGLRun.alphabet,0, fsg1);
    }
    else if (typeof this.grammar !== 'undefined')
    {
        if (this.grammar.name == "Random")
            g = new AGLSuite.grammar.FSG(AGLRun.alphabet,0, fsg1);
        else
            g = new AGLSuite.grammar.RG(AGLRun.alphabet);
    }
    return g;
};

AGLRun.states.Main.prototype.createCoin = function()
{
    if (this.coin == null)
    {
        this.coin = this.AGL.game.add.sprite(this.grammar.next(), 26, 'acorn');
        this.coin.anchor.setTo(0.5, 0.5);
        this.coin.height = this.AGL.game.world.height/20;
        this.coin.width = this.AGL.game.world.height/20;
        this.AGL.game.physics.arcade.enable(this.coin);
        this.coin.body.collideWorldBounds = true;
        this.coin.body.bounce.set(0.2);
        
    }
    this.resetCoin(this.coin);
    this.coin.body.velocity.y = this.AGL.coinVelocity;
};

AGLRun.states.Main.prototype.createUI = function()
{
	this.timerText = this.game.add.text(15, 20, "Time: 0", { font: this.AGL.game.height/15 + "px " +AGLRun.defaultFont, fill: AGLRun.defaultColour });
	this.scoreText = this.game.add.text(this.AGL.game.world.width - 50, 20, "0", { font: this.AGL.game.height/15 + "px "+AGLRun.defaultFont, fill: AGLRun.defaultColour });
	this.game.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);
};

AGLRun.states.Main.prototype.update = function()
{
    this.checkCollision();
    
    if (this.AGL.levels[this.AGL.gameLevel].length == this.levelLength)
    {
        this.coin.destroy();
        this.coin = null;
        this.AGL.gameLevel++;
        this.game.state.start('level');
    }
    
    var force = 0;
    
    if (this.keys.left.isDown)
        force = AGLRun.playerForce;
    else if (this.keys.right.isDown)
        force = -AGLRun.playerForce;
    if ((this.keys.up.isDown) && (this.player.body.onFloor()))
        this.player.body.velocity.y = -180;
        //this.AGL.output();
    
    this.move(force);
};

AGLRun.states.Main.prototype.checkCollision = function()
{
    if ((this.coin == null) || (this.player == null))
        return;
        
    this.AGL.game.physics.arcade.overlap(this.player, this.coin, this.coinCollision, null, this);
    
    if (this.coin.exists)
        if (this.coin.y > this.AGL.game.world.height)
        {
            this.AGL.scores[this.AGL.gameLevel].push(this.coin.x-this.AGL.game.world.centerX);
            this.coin.kill();
            AGLSuite.log.recordEvent("missed",{distance:this.coin.x-this.AGL.game.world.centerX});
        }
};

AGLRun.states.Main.prototype.coinCollision = function (player, coin)
{
	this.score++;
	this.scoreText.text = this.score;
	this.AGL.scores[this.AGL.gameLevel].push(0);
	coin.kill();
    AGLSuite.log.recordEvent("collected",{distance:this.coin.x-this.AGL.game.world.centerX});
};

AGLRun.states.Main.prototype.move = function(force)
{
    if (force == 0)
    {
        this.player.animations.play("wait");
        return;
    }
     
    this.xOffset += force;
    
    if (this.coin != null)
        this.coin.x = this.coinOriginX + this.xOffset;
        
    this.player.animations.play("run");
    if (force > 0)
        this.player.scale.x = this.player.originalScalex;
    else if (force < 0)
        this.player.scale.x= -this.player.originalScalex;
        
    if (this.player.body.velocity.y > 0)
        this.player.animations.play("jump");
    else if (this.player.body.velocity.y < 0)
        this.player.animations.play("fall");
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
        coin.reset(this.player.x + this.AGL.interpret(symbol), 26, 10);
        coin.body.velocity.y = this.AGL.coinVelocity;
        this.coinOriginX = this.player.x + this.AGL.interpret(symbol) - this.xOffset;
    }
};
