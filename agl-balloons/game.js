/**
 * AGLBalloons is a game that involves picking correct symbols. Create a new instance of AGLBalloons to start the game.
 * 
 * @param   full        whether to play fullscreen
 * @param   targetDiv   the HTML element in which to put the game
 */
function AGLBalloons(full, targetDiv)
{
    this.game = AGLSuite.createGame(full,targetDiv,AGLBalloons.minWidth,AGLBalloons.minHeight);
    if (this.game == null)
        return;
       
	this.portfolio = true;    
        
    AGLBalloons.states.load(this);
    AGLBalloons.states.start(this.game);
};

AGLBalloons.minWidth = 200;
AGLBalloons.minHeight = 200;
AGLBalloons.defaultFont = "Sans-Serif";
AGLBalloons.backgroundColour = "#5588ff";
AGLBalloons.defaultColour = "#ffffff";
AGLBalloons.prototype.gameLevel = 0;
AGLBalloons.balloonFont = "Sans-Serif";
AGLBalloons.rightProportion = 0.4;

AGLBalloons.prototype.getMinDimension = function()
{
	var maxWidth = Math.floor(this.game.width);
	var maxHeight = Math.floor(this.game.height);
	
	if (maxWidth > maxHeight)
		return maxHeight;
	else
		return maxWidth;
};

AGLBalloons.prototype.stateCreated = function()
{
	if (this.portfolio)
		this.createGameLinks();
};

AGLBalloons.Cloud = function(game)
{
    this.game = game;
    
    this.sprite =  game.add.sprite(0,0);
    this.sprite.angle = -55 + Math.random()*20;
    game.physics.arcade.enable(this.sprite);
    this.reset();
};

AGLBalloons.Cloud.defaultSpeed = 0;
AGLBalloons.Cloud.maxClouds = 12;

AGLBalloons.Cloud.prototype.updateWind = function(x)
{
    var tween = this.game.add.tween(this.sprite.body.velocity);
	tween.to({x:this.speed + x},2000+1000*Math.random());
	tween.start();
};

AGLBalloons.Cloud.prototype.reset = function()
{
    var bmd = AGLBalloons.graphics.Cloud(20 + Math.random()*30,this.game);
    this.sprite.loadTexture(bmd);
    this.sprite.width = bmd.width;
    this.sprite.height = bmd.height;
    
    var min = this.game.height/5;
    var max = this.game.height*(2/3);
    var y = min+(Math.random()*(max-min))/2;
    
    this.sprite.reset(-this.sprite.width-this.sprite.height,y,1);
    this.speed = AGLBalloons.Cloud.defaultSpeed/2+Math.random()*AGLBalloons.Cloud.defaultSpeed;
    
    this.sprite.body.velocity.x = this.speed;
};

AGLBalloons.Balloon = function(game,targetNumber)
{
    this.game = game;
    
    var radius = game.height/13 + Math.random()*(game.height/13);
    this.sprite = AGLBalloons.graphics.Balloon(0,0,radius,game);
    game.physics.arcade.enable(this.sprite);
    this.reset(targetNumber);
    
    this.speed = AGLBalloons.Balloon.defaultSpeed/2+Math.random()*AGLBalloons.Balloon.defaultSpeed;
    
    this.sprite.body.velocity.x = this.speed;
        
    this.sprite.inputEnabled = true;
    this.sprite.events.onInputDown.add(this.onInputDown, this);

    AGLSuite.log.recordEvent("newballoon");
};

AGLBalloons.Balloon.maxBalloons = 5;
AGLBalloons.Balloon.defaultSpeed = 30;
AGLBalloons.Balloon.prototype.emitter = null;
AGLBalloons.Balloon.prototype.contentsGood = false;

AGLBalloons.Balloon.SweetParticle = function(game, x, y)
{
    Phaser.Particle.call(this, game, x, y, game.cache.getBitmapData('sweetParticle'));
};
AGLBalloons.Balloon.SweetParticle.prototype = Object.create(Phaser.Particle.prototype);
AGLBalloons.Balloon.SweetParticle.prototype.constructor = AGLBalloons.Balloon.SweetParticle;

AGLBalloons.Balloon.CabbageParticle = function(game, x, y)
{
    Phaser.Particle.call(this, game, x, y, game.cache.getBitmapData('cabbageParticle'));
};
AGLBalloons.Balloon.CabbageParticle.prototype = Object.create(Phaser.Particle.prototype);
AGLBalloons.Balloon.CabbageParticle.prototype.constructor = AGLBalloons.Balloon.CabbageParticle;

AGLBalloons.Balloon.spawnDropable = function(game,sprite,dropable)
{
    var emitter = game.add.emitter(0, 0, 10);
    emitter.particleClass = dropable;
    emitter.makeParticles(null,0,10,true,true);
    emitter.width=sprite.width/4;
    emitter.setScale(1, 0.5, 1, 0.5, 500);
    
    emitter.gravity = 300;
    //emitter.emitX = sprite.body.x+sprite.width*2;
   // emitter.emitY = sprite.body.y+sprite.height/2;
    
    emitter.lifespan = 100;
    emitter.maxParticleSpeed = new Phaser.Point(0,200);
    emitter.minParticleSpeed = new Phaser.Point(0,0);
    emitter.particleDrag = new Phaser.Point(100,0);
    emitter.angularDrag = 80;
    emitter.bounce = 1;
    emitter.start(false,0,100);//,10);
    
    return emitter;
};

AGLBalloons.Balloon.prototype.reset = function(targetNumber)
{
    var min = this.game.height/4;
    var max = this.game.height*(3/4);
    var y = min+(Math.random()*(max-min))/2;
    this.sprite.reset(this.game.width-this.sprite.width,y,1);
    
    this.contentsGood = Math.random() < AGLBalloons.rightProportion;
    this.empty = false;
    this.emitter = null;
    
    //this.sprite.scale.x = 0.8+Math.random()/5;
    //this.sprite.scale.y = this.sprite.scale.x;  
    this.sprite.angle = 6;
    
    if (this.text == null)
    {
        this.text = this.game.add.text(0,0);
        this.text.anchor.setTo(0.5,0.5);
        this.sprite.addChild(this.text);
    }
    this.text.text = AGLBalloons.Balloon.expression(targetNumber,this.contentsGood);
    this.text.setStyle({font:this.sprite.height/7 + "px "+ AGLBalloons.balloonFont});
    this.text.fill = "white";
    this.text.setShadow(1,2,"grey",2);
    
    if (this.text.width > this.sprite.width)
    {
        this.text.width = this.sprite.width;
        this.text.scale.y = this.text.scale.x;
    }
    
    //this.text.stroke = "grey";
    //this.text.strokeThickness = 1;
    
    var tween = this.game.add.tween(this.sprite);
    tween.to({angle:-6},3000+3000*Math.random(),Phaser.Easing.Back.InOut,true,0,Number.MAX_VALUE,true);
	tween.start();
};

AGLBalloons.Balloon.expression = function(targetNumber,correct)
{
    var a = Math.round(Math.random()*targetNumber-1);
    a = Math.max(a,1);
    var b = targetNumber - a;
    
    if (correct)
    {
        if (b>=0)
            return a+"+"+b;
        else
            return a+""+b;
    }
    else
    {
        var wrong = b;
        while (wrong == b)
        {
            wrong = Math.round(Math.random()*targetNumber-1);
            wrong = Math.max(wrong,1);
        }
        return a+"+"+wrong;
    }
        
};

AGLBalloons.Balloon.prototype.updateWind = function(x)
{
    var tween = this.game.add.tween(this.sprite.body.velocity);
    tween.to({x:this.speed + x},2000+1000*Math.random());
	tween.start();
};

AGLBalloons.Balloon.prototype.onInputDown = function()
{
    if (this.empty)
        return;
    if (this.contentsGood)
    {
        this.emitter = AGLBalloons.Balloon.spawnDropable(this.game,this.sprite,AGLBalloons.Balloon.SweetParticle);
        this.game.state.getCurrentState().sweetDrop();
    }
    else
    {
        this.emitter = AGLBalloons.Balloon.spawnDropable(this.game,this.sprite,AGLBalloons.Balloon.CabbageParticle);
        this.game.state.getCurrentState().cabbageDrop();
    }
    
    this.empty = true;
    var tween = this.game.add.tween(this.sprite.body.velocity);
    tween.to({y:-100},500+500*Math.random());
	tween.start();
};

AGLBalloons.Balloon.prototype.survived = function()
{
    if (!this.empty)
        if (!this.contentsGood)
        {
             AGLSuite.log.recordEvent("avoided");
        }
        else
        {
             AGLSuite.log.recordEvent("missed");
        }
    this.sprite.kill();
};

AGLBalloons.Balloon.prototype.exit = function()
{
    this.sprite.kill();
};

AGLBalloons.Balloon.prototype.update = function()
{
    if (this.emitter != null)
    {
        this.emitter.emitX = this.sprite.body.x;
        this.emitter.emitY = this.sprite.body.y+this.sprite.height/2;
    }
};


AGLBalloons.createAssets = function(game)
{
     var sweetSize = game.height/20;
    game.cache.addBitmapData('sweetParticle', AGLBalloons.graphics.Sweet(sweetSize,game));
    game.cache.addBitmapData('cabbageParticle', AGLBalloons.graphics.Cabbage(sweetSize,sweetSize,game));
};

AGLBalloons.states = function()
{};

AGLBalloons.states.load = function(AGL)
{
	AGL.game.state.add('load', new AGLBalloons.states.Load(AGL));
	AGL.game.state.add('main', new AGLBalloons.states.Main(AGL));
	AGL.game.state.add('level', new AGLBalloons.states.Level(AGL));
};

AGLBalloons.states.start = function(game)
{
   game.state.start('load');
};

AGLBalloons.states.Load = function(AGL)
{
    this.AGL = AGL;
};

AGLBalloons.states.Load.loadingText = "Balloons";

AGLBalloons.states.Load.prototype.preload = function()
{
	this.AGL.game.stage.backgroundColor = AGLBalloons.backgroundColour;

	var loadingLabel = this.AGL.game.add.text(this.AGL.game.world.centerX, this.game.height*(1/2),AGLBalloons.states.Load.loadingText, { font: this.game.height/6 + 'px '+AGLBalloons.defaultFont, fill: AGLBalloons.defaultColour });
	loadingLabel.anchor.setTo(0.5, 0.5);
    
    AGLBalloons.createAssets(this.AGL.game);
    this.AGL.game.load.image('blocksLink','assets/blocks.png');
};

AGLBalloons.states.Load.prototype.create = function()
{
	this.AGL.game.state.start('level');
};

AGLBalloons.states.Level = function(AGL)
{
    this.AGL = AGL;
};

AGLBalloons.states.Level.wait = 0;
AGLBalloons.states.Level.levelText = "Level";

AGLBalloons.states.Level.prototype.preload = function()
{
	this.AGL.game.stage.backgroundColor = AGLBalloons.backgroundColour;
};

AGLBalloons.states.Level.prototype.create = function()
{
    /*var lText = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY, AGLBalloons.states.Level.levelText + ' ' + this.AGL.gameLevel, { font: this.AGL.game.height/10 + 'px ' + AGLBalloons.defaultFont, fill: AGLBalloons.defaultColour });
    lText.anchor.setTo(0.5, 0.5);*/
    this.time.events.add(AGLBalloons.states.Level.wait, function (){ this.AGL.game.state.start('main');
    }, this);
    this.AGL.stateCreated();
};

AGLBalloons.states.Main  = function(AGL)
{
    this.AGL = AGL;
};

AGLBalloons.states.Main.prototype.windX = 30;
AGLBalloons.states.Main.prototype.maxWindX = 50;
AGLBalloons.states.Main.prototype.minWindX = 10;
AGLBalloons.states.Main.prototype.windY = 0;
AGLBalloons.states.Main.prototype.score = 0;
AGLBalloons.states.Main.prototype.complete = false;
AGLBalloons.states.Main.prototype.targetScore = 2;

AGLBalloons.states.Main.prototype.preload = function ()
{
	this.AGL.game.stage.backgroundColor = AGLBalloons.backgroundColour;
};

AGLBalloons.states.Main.prototype.create = function ()
{
    AGLSuite.log.recordEvent("started");
    this.AGL.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.complete = AGLBalloons.states.Main.prototype.complete;
    this.score = AGLBalloons.states.Main.prototype.score;
    
    this.targetNumber = Math.round(Math.random()*10)+3;
         
    AGLBalloons.graphics.Landscape(this.AGL.game.width*3,this.AGL.game.height,this.AGL.game);
    
    this.AGL.game.world.resize(this.AGL.game.width*3,this.AGL.game.height);
    this.AGL.game.camera.x += this.AGL.game.width*2;
    var tween = this.game.add.tween(this.AGL.game.camera);
	tween.to({x:this.AGL.game.width},2000);
    tween.onComplete.add(this.levelStarted,this);
	tween.start();

    this.balloons = [];
    this.clouds = [];
    this.startClouds();
    this.startBalloons();
    
    this.AGL.game.time.events.loop(Phaser.Timer.SECOND*3, this.newBalloon, this);
    this.AGL.game.time.events.loop(Phaser.Timer.SECOND*3, this.newCloud, this);
    this.AGL.game.time.events.loop(Phaser.Timer.SECOND*3, this.updateWind, this);
    

    
    var targetText = this.game.add.text(this.game.world.width*(1/3)+ this.game.width*(5/6),this.game.height*(5/6));
    targetText.anchor.setTo(0.5,0.5);
    targetText.text = this.targetNumber;
    targetText.setStyle({font:this.game.height/5 + "px "+ AGLBalloons.balloonFont});
    targetText.fill = "white";
    targetText.setShadow(1,2,"grey",2);
    
    this.createStartEndText();
    this.AGL.stateCreated();
};


/**
 * Creates links to other games in the portfolio.
 */
AGLBalloons.prototype.createGameLinks = function()
{
    var uiGroup = this.game.add.group();
	
	var shadow = this.game.add.sprite(this.game.width*(1/10)-this.getMinDimension()/80,this.game.height*(4/5)+this.getMinDimension()/80, 'blocksLink');
    shadow.anchor.set(0.5,0.5);
    shadow.tint = 0x000000;
    shadow.alpha = 0.6;
	shadow.width = this.getMinDimension()/4;
	shadow.scale.y = shadow.scale.x;
		
	uiGroup.add(shadow);
    
	var gameLink = this.game.add.sprite(this.game.width*(1/10),this.game.height*(4/5),'blocksLink');
	gameLink.anchor.set(0.5,0.5);
	gameLink.width = shadow.width
	gameLink.scale.y = shadow.scale.x;
	
	var originalX = gameLink.x;
	var originalY = gameLink.y;
	
	gameLink.inputEnabled = true;
	gameLink.events.onInputDown.add(function() {
		gameLink.x = shadow.x;
		gameLink.y = shadow.y;
		window.location = "../agl-blocks/index.html";
	},this);
	
	gameLink.events.onInputUp.add(function() {
		gameLink.x = originalX;
		gameLink.y = originalY;
	}, this);

	uiGroup.add(gameLink);
	uiGroup.fixedToCamera = true;
};


AGLBalloons.states.Main.prototype.createStartEndText = function()
{
    var cloudRadius = this.AGL.game.width/40;
        
    var startTextSprite =this.AGL.game.add.sprite(this.AGL.game.world.width*(4/6),this.AGL.game.world.height/2,new AGLBalloons.graphics.CloudText("level",cloudRadius,this.AGL.game));
    startTextSprite.anchor.setTo(0.5,0.5);
    this.AGL.game.physics.arcade.enable(startTextSprite);
    startTextSprite.body.velocity.x = this.game.width/7;
    
    var endTextSprite =this.AGL.game.add.sprite(this.game.world.width/6,this.AGL.game.world.height/2,new AGLBalloons.graphics.CloudText("welldone",cloudRadius,this.AGL.game));

    endTextSprite.anchor.setTo(0.5,0.5);
}

AGLBalloons.states.Main.prototype.newBalloon = function()
{
    if (!this.complete)
    if (this.balloons.length < AGLBalloons.Balloon.maxBalloons)
    {
        var balloon = new AGLBalloons.Balloon(this.AGL.game,this.targetNumber);
        balloon.updateWind(this.windX,this.windY);
        this.balloons.push(balloon);
    }
    else
    {
        for (var i=0;i<this.balloons.length;i++)
        {
            if (this.balloons[i].sprite.x > this.AGL.game.width+this.AGL.game.width+this.balloons[i].sprite.width/2)
                this.balloons[i].survived();
            if (this.balloons[i].sprite.y < -this.balloons[i].sprite.width/2)
                this.balloons[i].exit();
        }
        for (var i=0;i<this.balloons.length;i++)
        {
            if (!this.balloons[i].sprite.alive)
            {
                if (this.balloons[i].emitter != null)
                {
                    //TODO: get a reference to all emitted things
                }
                this.balloons[i].reset(this.targetNumber);
                this.balloons[i].updateWind(this.windX);
                break;
            }
        };
    }
    return balloon;
};

AGLBalloons.states.Main.prototype.startClouds = function()
{
    for (var i=0;i<AGLBalloons.Cloud.maxClouds;i++)
    {
        var cloud = this.newCloud();
        cloud.sprite.x = Math.random()*this.AGL.game.world.width;
    }
};

AGLBalloons.states.Main.prototype.startBalloons = function()
{
    var balloonDensity = AGLBalloons.Balloon.maxBalloons;
    var balloonOffset = balloonDensity - AGLBalloons.Balloon.maxBalloons;
    for (var i=0;i<AGLBalloons.Balloon.maxBalloons;i++)
    {
        var balloon = this.newBalloon();
        balloon.sprite.x = this.AGL.game.width+(i+balloonOffset)*this.AGL.game.width/balloonDensity;
    }
};

AGLBalloons.states.Main.prototype.newCloud = function()
{    
    if (this.clouds.length < AGLBalloons.Cloud.maxClouds)
    {
        var cloud = new AGLBalloons.Cloud(this.AGL.game);
        cloud.updateWind(this.windX);
        this.clouds.push(cloud);
    }
    else
    {
        for (var i=0;i<this.clouds.length;i++)
        {
            if (this.clouds[i].sprite.x > this.AGL.game.world.width+this.clouds[i].sprite.width/2)
                this.clouds[i].sprite.kill();
            if (!this.clouds[i].sprite.alive)
            {
                this.clouds[i].reset();
                this.clouds[i].updateWind(this.windX);
                break;
            }
        };
    }
    return cloud;
};

AGLBalloons.states.Main.prototype.updateWind = function()
{
    this.windX = (this.maxWindX-this.minWindX)*Math.random()+this.minWindX;
    if (this.windX > this.maxWindX)
        this.windX = this.maxWindX;
    else if (this.windX < this.minWindX)
        this.windX = this.minWindX;

    for (var i=0;i<this.balloons.length;i++)
        this.balloons[i].updateWind(this.windX);
        
    for (var i=0;i<this.clouds.length;i++)
        this.clouds[i].updateWind(this.windX);
};

AGLBalloons.states.Main.prototype.update = function()
{
   for (var i=0;i<this.balloons.length;i++)
        this.balloons[i].update();
};

AGLBalloons.states.Main.prototype.sweetDrop = function()
{
    AGLSuite.log.recordEvent("success");
    this.score++;
    
    if ((this.score == this.targetScore) && (!this.complete))
        this.levelComplete();
};

AGLBalloons.states.Main.prototype.cabbageDrop = function()
{
    AGLSuite.log.recordEvent("failure");
};

AGLBalloons.states.Main.prototype.levelStarted = function()
{
    console.log("level started!");
};

AGLBalloons.states.Main.prototype.levelComplete = function()
{
    this.complete = true;
    this.AGL.game.time.events.add(1000,this.levelExit,this);
};

AGLBalloons.states.Main.prototype.levelExit = function()
{
    var tween = this.game.add.tween(this.AGL.game.camera);
	tween.to({x:0},2000);
	tween.start();
    
    this.time.events.add(4000, function ()
    {
        this.AGL.game.tweens.removeAll();
        this.complete = false;
        this.AGL.game.state.start('level');
    }, this);
}