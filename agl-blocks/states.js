/**
*
* LoadState is the Phaser game state which loads required assets
*
*/
AGLBlocks.LoadState = function(AGL)
{
	this.AGL = AGL;
};

AGLBlocks.LoadState.prototype.preload = function()
{
	this.AGL.drawBackground();
	if (AGLBlocks.showLoadingScreen)
	{
		var titleLabel = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY, AGLBlocks.title, { font: this.AGL.getMinDimension()/4+'px '+ AGLBlocks.titleFont, fill: '#999999' });
		titleLabel.anchor.setTo(0.5, 0.5);
		
		var loadingText = '   loading...';
		var loadingLabel = this.AGL.game.add.text(this.AGL.boxCenterX(), this.AGL.boxCenterY()+this.AGL.getMinDimension()/4, loadingText, { font: this.AGL.getMinDimension()/12+'px '+AGLBlocks.defaultFont, fill: '#cccccc' });
		loadingLabel.anchor.setTo(0.5, 0.5);
	}
	
	if (this.AGL.audio)
	{
		AGLBlocks.log("Loading Audio");
		this.AGL.game.load.audio('pick', 'assets/pick.wav');
		this.AGL.game.load.audio('drop', 'assets/drop.wav');
		this.AGL.game.load.audio('swap', 'assets/swap.wav');
		this.AGL.game.load.audio('complete', 'assets/complete.wav');
	}
	
	if (this.AGL.contentsType=="sprite")
	{
		AGLBlocks.log("Loading Sprites");
		this.AGL.game.load.spritesheet('symbols', 'assets/symbols.png', 256, 256);
	}
};

AGLBlocks.LoadState.prototype.create = function()
{
	this.AGL.game.state.start('menu');
};

/**
*
* MenuState is the Phaser game state that shows the main menu
*
*/
AGLBlocks.MenuState = function(AGL)
{
	this.AGL = AGL;
};

AGLBlocks.MenuState.tileAlpha = 0.3;
AGLBlocks.MenuState.prototype.indexX = -1;
AGLBlocks.MenuState.prototype.indexY = -1;
AGLBlocks.MenuState.prototype.swapX = -1;
AGLBlocks.MenuState.prototype.swapY = -1;
AGLBlocks.MenuState.prototype.lockedTiles = AGLBlocks.fillArray(5,7,false);
AGLBlocks.MenuState.prototype.menu = true;

AGLBlocks.MenuState.prototype.preload = function()
{
	this.AGL.drawBackground();
	this.AGL.playable = true;
	this.AGL.tileContents = AGLBlocks.staticTileContents;
};

AGLBlocks.MenuState.prototype.create = function ()
{
	AGLBlocks.recordEvent("startedmenu");

	this.AGL.tileContents = AGLBlocks.staticTileContents;
	this.level = AGLBlocks.randomLevel(5,7,AGLBlocks.staticTileContents.length);
	this.level[0][0] = 0;
	this.level[4][5] = 1;
	this.level[4][6] = 2;
	
	this.createTiles();
	this.createIntroTweens();
	
	this.time.events.add(Math.random()*1000+500,function() {this.AGL.pretty(this.tiles,AGLBlocks.MenuState.tileAlpha,this.time,true);},this);
	this.time.events.add(Math.random()*2000+500,function() {this.AGL.pretty(this.tiles,AGLBlocks.MenuState.tileAlpha,this.time,true);},this);
};

AGLBlocks.MenuState.prototype.createTiles = function()
{
	this.tiles = this.AGL.makeLevel(this.level,this.lockedTiles,0,this);
	
	var size = this.AGL.getTileSize(this.tiles)*(9/10);
	this.tilesGroup = this.AGL.game.add.group();
	for (var i=0;i<this.tiles.length;i++)
		for (var j=0;j<this.tiles[i].length;j++)
		{
			this.tiles[i][j].alpha = AGLBlocks.MenuState.tileAlpha;
		  
			if ((j==0) && (i==0))
			{
				var qText = this.tiles[i][j].addChild(this.AGL.game.add.text(size/2,size/2, 'quit', { font: size/3+'px '+AGLBlocks.defaultFont, fill: '#222222' }));
				qText.anchor.setTo(0.5, 0.5);
				this.tiles[i][j].alpha = 1;
				this.tiles[i][j].events.onInputDown.removeAll();
				this.tiles[i][j].events.onInputDown.add(this.quit,this);
			}
			else if  ((j==5) && (i==4))
			{
				var pText = this.tiles[i][j].addChild(this.AGL.game.add.text(size/2,size/2, 'play', { font: size/3+'px '+AGLBlocks.defaultFont, fill: '#222222' }));
				this.tiles[i][j].alpha = 1;
				pText.anchor.setTo(0.5, 0.5);
				this.tiles[i][j].events.onInputDown.removeAll();
				this.tiles[i][j].events.onInputDown.add(this.play,this);
			}
			else if ((j==6) && (i==4))
			{
				var iText = this.tiles[i][j].addChild(this.AGL.game.add.text(size/2,size/2, 'info', { font: size/3+'px '+AGLBlocks.defaultFont, fill: '#222222' }));
				iText.anchor.setTo(0.5, 0.5);
				this.tiles[i][j].alpha = 1;
				this.tiles[i][j].events.onInputDown.removeAll();
				this.tiles[i][j].events.onInputDown.add(this.info,this);
			}
			this.tilesGroup.add(this.tiles[i][j]);
		}
	
	this.titleText = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY, AGLBlocks.title, { font: this.AGL.getMinDimension()/4+'px '+AGLBlocks.titleFont, fill: '#000000' });
	this.titleText.anchor.setTo(0.5, 0.5);
};


AGLBlocks.MenuState.prototype.createIntroTweens = function()
{
	this.AGL.game.tweens.removeAll();
	this.tilesGroup.alpha = -0.2;
	var tween = this.AGL.game.add.tween(this.tilesGroup);
	tween.to({alpha: 1},2000);
	tween.start();
	 
	this.titleText.alpha = 0;
	var texttween = this.AGL.game.add.tween(this.titleText);
	texttween.to({alpha: 1},700);
	texttween.start();
};
	
AGLBlocks.MenuState.prototype.createOutroTweens =function()
{
	this.AGL.game.tweens.removeAll();
	var tween = this.AGL.game.add.tween(this.tilesGroup);
	tween.to({alpha: 0},800);
	tween.start();
	 
	var texttween = this.AGL.game.add.tween(this.titleText);
	texttween.to({alpha: 0},700);
	texttween.start();
};
    
AGLBlocks.MenuState.prototype.quit = function()
{
	this.AGL.playable = false;
	this.createOutroTweens();
	this.time.events.add(1000,function() {this.AGL.game.state.start('load');},this);
};
    
AGLBlocks.MenuState.prototype.play = function()
{
	AGLBlocks.recordEvent("play");
	this.AGL.playable = false;
	this.createOutroTweens();
	this.AGL.gameLevel = 1;
	this.AGL.updateProgress();
	
	this.AGL.tileContents = AGLBlocks.shuffleArray(this.AGL.tileContents);
	this.time.events.add(1000,function() {this.AGL.game.state.start('level');},this);
};
    
AGLBlocks.MenuState.prototype.info = function()
{
	this.AGL.playable = false;
	this.createOutroTweens();
	this.time.events.add(1000,function() {this.AGL.game.state.start('load');},this);
};


/**
*
* LevelState is the Phaser game state for showing what the next level is
*
*/
AGLBlocks.LevelState = function(AGL)
{
	this.AGL = AGL;
};

AGLBlocks.LevelState.prototype.preload = function()
{
	this.AGL.drawBackground();
	if (this.AGL.gameLevel==1)
		this.AGL.drawProgressBar(true);
	else
		this.AGL.drawProgressBar(false);
	this.AGL.playable = false;
};

AGLBlocks.LevelState.prototype.create = function()
{
	var textTime = 0;
	if (this.AGL.gameLevel-1 < AGLBlocks.totalLevels)
	{
		this.lText = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY, 'Level ' + this.AGL.gameLevel, { font: this.AGL.getMinDimension()/6+'px '+AGLBlocks.defaultFont, fill: '#111111' });
		this.lText.anchor.setTo(0.5, 0.5);
		this.time.events.add(800, function () { this.AGL.game.state.start('main'); }, this);
	}
	else
	{
		this.lText = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY, 'Well Done!', { font: this.AGL.getMinDimension()/6+'px '+AGLBlocks.defaultFont, fill: '#111111' });
		this.lText.anchor.setTo(0.5, 0.5);
		this.time.events.add(1800, function () { this.AGL.game.state.start('menu'); }, this);
		textTime = 1000;
	}
	this.tweenIn();
	this.time.events.add(textTime+400,function() {this.tweenOut();},this);
};
	
AGLBlocks.LevelState.prototype.tweenIn = function()
{
	this.lText.alpha = 0;
	var tween = this.AGL.game.add.tween(this.lText);
	tween.to({alpha: 0.7}, 400);
	tween.start();
};
	
AGLBlocks.LevelState.prototype.tweenOut = function()
{
	var tween = this.AGL.game.add.tween(this.lText);
	tween.to({alpha: 0}, 400);
	tween.start();
};
	
AGLBlocks.LevelState.prototype.progressBarIntro = function()
{
	this.progressBar.alpha = 0;
	var tween = this.AGL.game.add.tween(this.progressBar);
	tween.to({alpha:1}, 800);
	tween.start();
};


/**
*
* MainState is the Phaser game state for playing the core game
*
*/
AGLBlocks.MainState = function(AGL)
{
	this.AGL = AGL;
};

AGLBlocks.MainState.prototype.preload = function ()
{
	this.AGL.drawBackground();
	this.progressBar = this.AGL.drawProgressBar();
	this.AGL.playable = false;
};
	
AGLBlocks.MainState.prototype.create =function ()
{
	AGLBlocks.recordEvent("createdlevel");
	var xOffset = -this.AGL.game.width;
	this.level = AGLBlocks.createLevel(this.AGL.gameLevel);
	this.lockedTiles = AGLBlocks.getLockedTiles(this.AGL.gameLevel);
	this.tiles = this.AGL.makeLevel(this.level,this.lockedTiles,xOffset,this);
	this.indexX = -1;
	this.indexY = -1;
	this.swapX = -1;
	this.swapY = -1;
	
	this.tilesGroup = this.AGL.game.add.group();
	for (var i=0;i<this.tiles.length;i++)
		for (var j=0;j<this.tiles[i].length;j++)
			this.tilesGroup.add(this.tiles[i][j]);
	this.tilesGroup.x +=xOffset;
	this.introTween();
};
	
AGLBlocks.MainState.prototype.startPlay = function()
{
	this.AGL.playable = true;
	AGLBlocks.recordEvent("started");
};
	
AGLBlocks.MainState.prototype.levelComplete = function()
{
	this.AGL.playable = false;
	AGLBlocks.recordEvent("complete");
	
	this.progressBarTween();
	this.time.events.add(1000, this.clickToContinueTween,this);
	this.time.events.add(1000, function(){this.AGL.game.input.onDown.add(this.levelExitTween, this);}, this);
};
	
AGLBlocks.MainState.prototype.progressBarTween = function()
{
	var oldHeight = this.AGL.getProgressHeight(this.AGL.progress);
	this.AGL.gameLevel++;
	this.AGL.updateProgress();
	
	var tween = this.AGL.game.add.tween(this.progressBar);
	tween.to({
		height: this.AGL.progress*(this.AGL.game.height-this.AGL.boxMarginTop-this.AGL.boxMarginBottom),
		y: this.progressBar.y+oldHeight-this.AGL.getProgressHeight(this.AGL.progress)
	}, 800);
	this.progressBar.visible = true;
	tween.start();
};
	
AGLBlocks.MainState.prototype.clickToContinueTween = function()
{
	this.continueText = this.AGL.game.add.text(this.AGL.game.world.centerX, this.AGL.game.world.centerY+this.AGL.game.world.centerY*(2/3), 'touch to continue', { font: this.AGL.getMinDimension()/13+'px '+AGLBlocks.defaultFont, fill: '#111111' });
	this.continueText.anchor.setTo(0.5, 0.5);
	this.continueText.alpha = 0;
	var tween  = this.AGL.game.add.tween(this.continueText);
	tween.to({y:this.AGL.game.world.centerY+this.AGL.game.world.centerY/2,
		alpha:1},800);
	tween.onComplete.add(this.continueTweenFlash,this);
	tween.start();
};
	
AGLBlocks.MainState.prototype.continueTweenFlash = function()
{
	var tween = this.AGL.game.add.tween(this.continueText);
	if (this.continueText.alpha <1)
		tween.to({alpha:1},800);
	else
		tween.to({alpha:0.5},800);
	tween.onComplete.add(this.continueTweenFlash,this);
	tween.start();
};
	
AGLBlocks.MainState.prototype.introTween = function()
{
	this.AGL.game.tweens.removeAll();
	var tween = this.AGL.game.add.tween(this.tilesGroup);
	tween.to({x: 0},400);
	tween.onComplete.add(this.startPlay, this);
	tween.start();
};
	
AGLBlocks.MainState.prototype.levelExitTween = function()
{
	this.AGL.game.input.onDown.removeAll();
	AGLBlocks.recordEvent("moveon");
	this.AGL.game.tweens.removeAll();
	var tween = this.AGL.game.add.tween(this.tilesGroup);
	tween.to({x: 2*this.AGL.game.width}, 400);
	tween.onComplete.add(this.changeLevel,this);
	tween.start();
	
	tween = this.AGL.game.add.tween(this.continueText);
	tween.to({x:0,
		alpha:-1},400);
	tween.start();
};
	
AGLBlocks.MainState.prototype.changeLevel = function()
{
	AGLBlocks.recordEvent("changelevel");
	this.AGL.game.state.start('level');
};

/**
*
*	The stateUpdate function is shared between all states that allow moving tiles
*
*/
AGLBlocks.stateUpdate = function()
{
	if ((this.AGL.playable) && (!this.AGL.swapping) && (this.AGL.dragging) && (!this.AGL.inputBlock) && (this.indexX != -1))
	{
		var tileCoord = AGLBlocks.pointToGridIndex(this.AGL.game.input.x,this.AGL.game.input.y,this.tiles);
		var tilePosition = this.AGL.pointToGridPosition(this.AGL.game.input.x,this.AGL.game.input.y);
		
		if (tileCoord != null)
		{
			if (this.lockedTiles[tileCoord.y][tileCoord.x]==0)
			{
				if (this.swapX == -1)
				{
					this.swapX = tilePosition.x;
					this.swapY = tilePosition.y;
				}
				if ((tileCoord.x != this.indexX) || (tileCoord.y != this.indexY))
				{
					//AGLBlocks.log("swap "+this.swapX+","+this.swapY+" index "+this.indexX+","+this.indexY+" tilecoord "+tileCoord.x+","+tileCoord.y+" tileposition "+tilePosition.x+","+tilePosition.y);
					var xDiff = Math.abs(this.swapX-tilePosition.x);
					var yDiff = Math.abs(this.swapY-tilePosition.y);
					
					if ((xDiff<2) && (yDiff<2) && (xDiff != yDiff))
					{
						if ((this.menu) && (((tileCoord.x == 0) && (tileCoord.y == 0)) || ((tileCoord.x == 5) && (tileCoord.y == 4)) || ((tileCoord.x == 6) && (tileCoord.y == 4))))
						{}
						else
						{
							this.AGL.swap(this,this.indexX,this.indexY,tileCoord.x,tileCoord.y);
							this.swapX = tilePosition.x;
							this.swapY = tilePosition.y;
						}
					}
				}
			}
		}
	}
};
AGLBlocks.MenuState.prototype.update = AGLBlocks.stateUpdate;
AGLBlocks.MainState.prototype.update  = AGLBlocks.stateUpdate;