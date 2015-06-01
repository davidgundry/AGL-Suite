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
AGLBalloons.rightProportion = 0.55;

AGLBalloons.startText = false;
AGLBalloons.endText = true;
AGLBalloons.targetText = true;

AGLBalloons.createAssets = function(game)
{
     var sweetSize = game.height/20;
    game.cache.addBitmapData('sweetParticle', AGLBalloons.graphics.Sweet(sweetSize,game));
    game.cache.addBitmapData('cabbageParticle', AGLBalloons.graphics.Cabbage(sweetSize,sweetSize,game));
};

AGLBalloons.prototype.level = 2;
AGLBalloons.prototype.totalLevels = 3;

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

AGLBalloons.Balloon = function(game,targetNumber,level)
{
    this.game = game;
    
    var radius = game.height/13 + Math.random()*(game.height/13);
    this.sprite = AGLBalloons.graphics.Balloon(0,0,radius,game);
    game.physics.arcade.enable(this.sprite);
    this.reset(targetNumber,level);
    
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
    emitter.lifespan = 100;
    emitter.maxParticleSpeed = new Phaser.Point(0,200);
    emitter.minParticleSpeed = new Phaser.Point(0,0);
    emitter.particleDrag = new Phaser.Point(100,0);
    emitter.angularDrag = 80;
    emitter.bounce = 1;
    emitter.start(false,0,100);
    
    return emitter;
};

AGLBalloons.Balloon.prototype.reset = function(targetNumber,level)
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
    if (level == 1)
        this.text.text = AGLBalloons.Balloon.addition(targetNumber,this.contentsGood);
    else if (level == 2)
    {
        if (Math.random() > 0.6)
            this.text.text = AGLBalloons.Balloon.addition(targetNumber,this.contentsGood);
        else
            this.text.text = AGLBalloons.Balloon.multiplication(targetNumber,this.contentsGood);
    }
    else
    {
        var r = Math.random();
        if (r > 0.7)
            this.text.text = AGLBalloons.Balloon.addition(targetNumber,this.contentsGood);
        else if (r > 0.3)
            this.text.text = AGLBalloons.Balloon.multiplication(targetNumber,this.contentsGood);
        else
            this.text.text = AGLBalloons.Balloon.division(targetNumber,this.contentsGood);
    }
       
        
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

AGLBalloons.Balloon.addition = function(targetNumber,correct)
{
    var a = Math.round(Math.random()*targetNumber-1);
    a = Math.max(a,2);
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
        var first  = (a+Math.round(Math.random()*4)-2);
        var second = (b+Math.round(Math.random()*4)-2);
        while (first+second == targetNumber)
        {
            first  = (a+Math.round(Math.random()*4)-2);
            second = (b+Math.round(Math.random()*4)-2);
        }
        return first+"+"+second;
    }
};

AGLBalloons.Balloon.multiplication = function(targetNumber,correct)
{
    var b = 0.1;
    while (Math.round(b) != b)
    {
        var a = Math.round(Math.random()*targetNumber/2);
        a = Math.max(a,2);
        b = targetNumber / a;
    }   

    if (correct)
        return a+"*"+b;
    else
    {
        var first  = (a+Math.round(Math.random()*4)-2);
        var second = (b+Math.round(Math.random()*4)-2);
        while (first*second == targetNumber)
        {
            first  = (a+Math.round(Math.random()*4)-2);
            second = (b+Math.round(Math.random()*4)-2);
        }
        return first+"*"+second;
    }
};

AGLBalloons.Balloon.division = function(targetNumber,correct)
{
    var a = Math.round(Math.random()*10)*targetNumber;
    var b = Math.round(a / targetNumber);

    if (correct)
        return a+"/"+b;
    else
    {
        var first  = (a+Math.round(Math.random()*4)-2);
        var second = (b+Math.round(Math.random()*4)-2);
        while (first/second == targetNumber)
        {
            first  = (a+Math.round(Math.random()*4)-2);
            second = (b+Math.round(Math.random()*4)-2);
        }
        return first+"/"+second;
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
