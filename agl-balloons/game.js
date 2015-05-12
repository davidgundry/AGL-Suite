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

AGLBalloons.Cloud = function(game)
{
    this.game = game;
    
    this.sprite =  game.add.sprite(0,0);
    this.sprite.angle = -55 + Math.random()*20;
    game.physics.arcade.enable(this.sprite);
    this.reset();
};

AGLBalloons.Cloud.defaultSpeed = 0;
AGLBalloons.Cloud.maxClouds = 8;

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
    
    this.sprite.reset(-this.sprite.width,y,1);
    this.speed = AGLBalloons.Cloud.defaultSpeed/2+Math.random()*AGLBalloons.Cloud.defaultSpeed;
    
    this.sprite.body.velocity.x = this.speed;
};

AGLBalloons.Balloon = function(game)
{
    this.game = game;
    
    var radius = game.height/13 + Math.random()*(game.height/13);
    this.sprite = AGLBalloons.graphics.Balloon(0,0,radius,game);
    game.physics.arcade.enable(this.sprite);
    this.reset();
    
    this.speed = AGLBalloons.Balloon.defaultSpeed/2+Math.random()*AGLBalloons.Balloon.defaultSpeed;
    
    this.sprite.body.velocity.x = this.speed;
        
    this.sprite.inputEnabled = true;
    this.sprite.events.onInputDown.add(this.onInputDown, this);

    AGLSuite.log.recordEvent("newballoon");
};

AGLBalloons.Balloon.maxBalloons = 4;
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

AGLBalloons.Balloon.prototype.reset = function()
{
    var min = this.game.height/4;
    var max = this.game.height*(3/4);
    var y = min+(Math.random()*(max-min))/2;
    this.sprite.reset(-this.sprite.width,y,1);
    
    this.contentsGood = Math.round(Math.random()) == 1;
    this.empty = false;
    this.emitter = null;
    
    //this.sprite.scale.x = 0.8+Math.random()/5;
    //this.sprite.scale.y = this.sprite.scale.x;  
    this.sprite.angle = 12;
    
    if (this.text == null)
    {
        this.text = this.game.add.text(0,0);
        this.text.anchor.setTo(0.5,0.5);
        this.sprite.addChild(this.text);
    }
    this.text.text = "5+6";
    this.text.setStyle({font:this.sprite.height/7 + "px "+ AGLBalloons.balloonFont});
    
    var tween = this.game.add.tween(this.sprite);
    tween.to({angle:-12},5000+1000*Math.random(),Phaser.Easing.Back.InOut,true,0,Number.MAX_VALUE,true);
	tween.start();
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
        AGLSuite.log.recordEvent("success");
    }
    else
    {
        this.emitter = AGLBalloons.Balloon.spawnDropable(this.game,this.sprite,AGLBalloons.Balloon.CabbageParticle);
        AGLSuite.log.recordEvent("failure");
    }
    
    this.empty = true;
    var tween = this.game.add.tween(this.sprite.body.velocity);
    tween.to({y:-100},500+500*Math.random());
	tween.start();
};

AGLBalloons.Balloon.prototype.survived = function()
{
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
    var lText = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY, AGLBalloons.states.Level.levelText + ' ' + this.AGL.gameLevel, { font: this.AGL.game.height/10 + 'px ' + AGLBalloons.defaultFont, fill: AGLBalloons.defaultColour });
    lText.anchor.setTo(0.5, 0.5);
    this.time.events.add(AGLBalloons.states.Level.wait, function (){ this.AGL.game.state.start('main');
     }, this);
};

AGLBalloons.states.Main  = function(AGL)
{
    this.AGL = AGL;
};

AGLBalloons.states.Main.prototype.windX = 30;
AGLBalloons.states.Main.prototype.maxWindX = 50;
AGLBalloons.states.Main.prototype.minWindX = 10;
AGLBalloons.states.Main.prototype.windY = 0;

AGLBalloons.states.Main.prototype.preload = function ()
{
	this.AGL.game.stage.backgroundColor = AGLBalloons.backgroundColour;
};

AGLBalloons.states.Main.prototype.create = function ()
{
    AGLSuite.log.recordEvent("started");
    this.AGL.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    AGLBalloons.graphics.Landscape(this.AGL.game.width,this.AGL.game.height,this.AGL.game);
    
    //this.AGL.game.add.sprite(10,10, AGLBalloons.graphics.Sweet(sweetSize,sweetSize,this.AGL.game));
 
    this.balloons = [];
    this.clouds = [];
    this.startClouds();
    this.startBalloons();
    
    this.AGL.game.time.events.loop(Phaser.Timer.SECOND*3, this.newBalloon, this);
    this.AGL.game.time.events.loop(Phaser.Timer.SECOND*3, this.newCloud, this);
    this.AGL.game.time.events.loop(Phaser.Timer.SECOND*3, this.updateWind, this);
};

AGLBalloons.states.Main.prototype.newBalloon = function()
{
    if (this.balloons.length < AGLBalloons.Balloon.maxBalloons)
    {
        var balloon = new AGLBalloons.Balloon(this.AGL.game);
        balloon.updateWind(this.windX,this.windY);
        this.balloons.push(balloon);
    }
    else
    {
        for (var i=0;i<this.balloons.length;i++)
        {
            if (this.balloons[i].sprite.x > this.AGL.game.width+this.balloons[i].sprite.width/2)
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
                this.balloons[i].reset();
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
        cloud.sprite.x = Math.random()*this.AGL.game.width;
    }
};

AGLBalloons.states.Main.prototype.startBalloons = function()
{
    for (var i=0;i<AGLBalloons.Balloon.maxBalloons;i++)
    {
        var balloon = this.newBalloon();
        balloon.sprite.x = Math.random()*this.AGL.game.width/2;
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
            if (this.clouds[i].sprite.x > this.AGL.game.width+this.clouds[i].sprite.width/2)
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
