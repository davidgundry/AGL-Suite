
AGLBalloons.states = function()
{};

AGLBalloons.states.load = function(AGL)
{
	AGL.game.state.add('load', new AGLBalloons.states.Load(AGL));
	AGL.game.state.add('menu', new AGLBalloons.states.Menu(AGL));
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
	this.AGL.game.state.start('menu');
};


AGLBalloons.states.Menu = function(AGL)
{
    this.AGL = AGL;
};


AGLBalloons.states.Menu.prototype.preload = function()
{
    this.windX = this.AGL.game.width/18;
    this.maxWindX = this.AGL.game.width/15;
	this.AGL.game.stage.backgroundColor = AGLBalloons.backgroundColour;
};

AGLBalloons.states.Menu.prototype.create = function()
{
	AGLBalloons.graphics.Landscape(this.AGL.game.width*3,this.AGL.game.height,this.AGL.game);
    
    this.clouds = [];
    this.startClouds();
    
    this.AGL.game.time.events.loop(Phaser.Timer.SECOND*3, this.newCloud, this);
    
	var balloon = AGLBalloons.graphics.Balloon(this.AGL.game.width/4,this.AGL.game.width/10,this.AGL.getMinDimension()/10,this.AGL.game);
	

    var text = this.game.add.text(0,0);
    text.anchor.setTo(0.5,0.5);
    balloon.addChild(text);
    text.text = "Start";
    text.setStyle({font:balloon.height/7 + "px "+ AGLBalloons.balloonFont});
    text.fill = "white";
    text.setShadow(1,2,"grey",2);
    
    if (text.width > balloon.width)
    {
        text.width = balloon.width;
        text.scale.y = text.scale.x;
    }
	
    var tween = this.game.add.tween(balloon);
    tween.to({angle:-6},3000+3000*Math.random(),Phaser.Easing.Back.InOut,true,0,Number.MAX_VALUE,true);
	tween.start();
	
	balloon.inputEnabled = true;
	balloon.events.onInputDown.add(function() {
        this.AGL.level = 0;
		this.AGL.game.state.start('level');
	},this);
    balloon.fixedToCamera = true;
	
	var label = this.AGL.game.add.text(this.AGL.game.width/2, this.game.height*(1/2),"Balloons", { font: this.game.height/6 + 'px '+AGLBalloons.defaultFont, fill: AGLBalloons.defaultColour });
	label.anchor.setTo(0.5, 0.5);
	label.setShadow(1,2,"grey",2);
    label.fixedToCamera = true;
	
	 this.AGL.stateCreated();
};


AGLBalloons.states.Menu.prototype.startClouds = function()
{
    for (var i=0;i<AGLBalloons.Cloud.maxClouds;i++)
    {
        var cloud = this.newCloud();
        cloud.sprite.x = Math.random()*this.AGL.game.world.width;
    }
};

AGLBalloons.states.Menu.prototype.newCloud = function()
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


AGLBalloons.states.Level = function(AGL)
{
    this.AGL = AGL;
};

AGLBalloons.states.Level.wait = 0;
AGLBalloons.states.Level.levelText = "Level";

AGLBalloons.states.Level.prototype.create = function()
{
    /*var lText = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY, AGLBalloons.states.Level.levelText + ' ' + this.AGL.gameLevel, { font: this.AGL.game.height/10 + 'px ' + AGLBalloons.defaultFont, fill: AGLBalloons.defaultColour });
    lText.anchor.setTo(0.5, 0.5);*/

	this.AGL.level++;
    
    this.AGL.stateCreated();
    
    if (this.AGL.level > this.AGL.totalLevels)
        this.time.events.add(AGLBalloons.states.Level.wait, function (){ this.AGL.game.state.start('menu');
    }, this);
    else 
        this.time.events.add(AGLBalloons.states.Level.wait, function (){ this.AGL.game.state.start('main');
    }, this);
};

AGLBalloons.states.Main  = function(AGL)
{
    this.AGL = AGL;
};

AGLBalloons.states.Main.prototype.minWindX = 10;
AGLBalloons.states.Main.prototype.windY = 0;
AGLBalloons.states.Main.prototype.score = 0;
AGLBalloons.states.Main.prototype.complete = false;
AGLBalloons.states.Main.prototype.targetScore = 7;

AGLBalloons.states.Main.prototype.preload = function ()
{
	this.AGL.game.stage.backgroundColor = AGLBalloons.backgroundColour;
    this.windX = this.AGL.game.width/18;
    this.maxWindX = this.AGL.game.width/15;
};

AGLBalloons.isPrime = function(value)
{
    switch (value)
    {
        case 1:
        case 2:
        case 3:
        case 5:
        case 7:
        case 11:
        case 13:
        case 17:
        case 19:
        case 23:
        case 29:
            return true;
    }
    return false;
};

AGLBalloons.states.Main.prototype.create = function ()
{
    AGLSuite.log.recordEvent("started");
    this.AGL.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.complete = AGLBalloons.states.Main.prototype.complete;
    this.score = AGLBalloons.states.Main.prototype.score;
    
    if (this.AGL.level == 1)
        this.targetNumber = Math.round(Math.random()*20)+3;
    else if (this.AGL.level == 2)
    {
        this.targetNumber = 2;
        while(AGLBalloons.isPrime(this.targetNumber))
            this.targetNumber = Math.round(Math.random()*20)+3;
    }
    else
        this.targetNumber = Math.round(Math.random()*20)+3;
        
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
    
    if (AGLBalloons.targetText)
    {
        var targetText = this.game.add.text(this.game.world.width*(1/3)+ this.game.width*(5/6),this.game.height*(5/6));
        targetText.anchor.setTo(0.5,0.5);
        targetText.text = this.targetNumber;
        targetText.setStyle({font:this.game.height/5 + "px "+ AGLBalloons.balloonFont});
        targetText.fill = "white";
        targetText.setShadow(1,2,"grey",2);
    }
    this.createStartEndText();
	this.createUI();
    this.AGL.stateCreated();
};

AGLBalloons.states.Main.prototype.createUI = function()
{
	var radius = this.AGL.getMinDimension()/70;
	var padding = this.AGL.getMinDimension()/100;
	var uiGroup = this.AGL.game.add.group();
 	var bmd = this.AGL.game.add.bitmapData(radius*2, (radius*2+padding)*this.AGL.totalLevels);
	var ctx = bmd.context;
	
	for (var i=0;i<this.AGL.totalLevels;i++)
	{
		ctx.fillStyle = '#aaaaaa';
		if (i<this.AGL.level)
			ctx.fillStyle = '#ffffff';
		    
	    ctx.beginPath();
	    ctx.arc(radius, (radius*2+padding)*this.AGL.totalLevels-(radius*2*i+radius+padding*i), radius, 0, 2*Math.PI, true); 
	    ctx.fill();
	}
	
	var levelIndicator = this.AGL.game.add.sprite(this.game.width*(14/15),this.game.height*(13/15),bmd);
    levelIndicator.anchor.setTo(0.5,0.5);
	levelIndicator.alpha = 0.75;
	uiGroup.add(levelIndicator);
	uiGroup.fixedToCamera = true;
    
};

AGLBalloons.states.Main.prototype.createStartEndText = function()
{
    var cloudRadius = this.AGL.game.width/40;
        
     if (AGLBalloons.startText)
     {
        var startTextSprite =this.AGL.game.add.sprite(this.AGL.game.world.width*(4/6),this.AGL.game.world.height/2,new AGLBalloons.graphics.CloudText("level",cloudRadius,this.AGL.game));
        startTextSprite.anchor.setTo(0.5,0.5);
        this.AGL.game.physics.arcade.enable(startTextSprite);
        startTextSprite.body.velocity.x = this.game.width/7;
     }
     
     if (AGLBalloons.endText)
     {
        var endTextSprite =this.AGL.game.add.sprite(this.game.world.width/6,this.AGL.game.world.height/2,new AGLBalloons.graphics.CloudText("welldone",cloudRadius,this.AGL.game));
     }

    endTextSprite.anchor.setTo(0.5,0.5);
}

AGLBalloons.states.Main.prototype.newBalloon = function()
{
    if (!this.complete)
    if (this.balloons.length < AGLBalloons.Balloon.maxBalloons)
    {
        var balloon = new AGLBalloons.Balloon(this.AGL.game,this.targetNumber,this.AGL.level);
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
                this.balloons[i].reset(this.targetNumber,this.AGL.level);
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