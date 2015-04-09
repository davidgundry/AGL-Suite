var loadState = {
	preload: function ()
	{
		drawBackground();
		
		this.titleText = game.add.text(game.world.centerX, game.world.centerY, 'blocks', { font: getMinDimension()/4+'px Serif', fill: '#999999' });
		this.titleText.anchor.setTo(0.5, 0.5);
		
		var loadingLabel = game.add.text(boxCenterX(), boxCenterY()+getMinDimension()/4, '   loading...', { font: getMinDimension()/12+'px '+defaultFont, fill: '#cccccc' });
		loadingLabel.anchor.setTo(0.5, 0.5);
		
		//game.load.audio('plock', 'assets/plock.wav');
	},
	create: function ()
	{
		game.state.start('menu');
	}
};

var menuState = {
    preload: function ()
	{
		drawBackground();
		playable = true;
		this.tileAlpha = 0.3;
		this.menu = true;
    },
    create: function ()
	{
		recordEvent("startedmenu")
		tileColours = ['#ff2a2a','#8dd35f','#0066ff','#ffaaaa','#aaaaaa','#ccaa33'];
		
		this.level = randomLevel(5,7);
		this.level[0][0] = 0;
		this.level[4][5] = 1;
		this.level[4][6] = 2
	    this.tiles = makeLevel(this.level,0,this);
	    this.indexX = -1;
	    this.indexY = -1;
		this.swapX = -1;
		this.swapY = -1;
		
		var size = getTileSize(this.tiles)*(9/10);
		
		this.tilesGroup = game.add.group();
		for (var i=0;i<this.tiles.length;i++)
			for (var j=0;j<this.tiles[i].length;j++)
			{
				this.tiles[i][j].alpha = this.tileAlpha;
			  
				if ((j==0) && (i==0))
				{
					var qText = this.tiles[i][j].addChild(game.add.text(size/2,size/2, 'quit', { font: size/3+'px '+defaultFont, fill: '#222222' }));
					qText.anchor.setTo(0.5, 0.5);
					this.tiles[i][j].alpha = 1;
					this.tiles[i][j].events.onInputDown.removeAll();
					this.tiles[i][j].events.onInputDown.add(this.quit,this);
				}
				else if  ((j==5) && (i==4))
				{
					var pText = this.tiles[i][j].addChild(game.add.text(size/2,size/2, 'play', { font: size/3+'px '+defaultFont, fill: '#222222' }));
					this.tiles[i][j].alpha = 1;
					pText.anchor.setTo(0.5, 0.5);
					this.tiles[i][j].events.onInputDown.removeAll();
					this.tiles[i][j].events.onInputDown.add(this.play,this);
				}
				else if ((j==6) && (i==4))
				{
					var iText = this.tiles[i][j].addChild(game.add.text(size/2,size/2, 'info', { font: size/3+'px '+defaultFont, fill: '#222222' }));
					iText.anchor.setTo(0.5, 0.5);
					this.tiles[i][j].alpha = 1;
					this.tiles[i][j].events.onInputDown.removeAll();
					this.tiles[i][j].events.onInputDown.add(this.info,this);
				}
				this.tilesGroup.add(this.tiles[i][j]);
				}
		
		this.titleText = game.add.text(game.world.centerX, game.world.centerY, 'blocks', { font: getMinDimension()/4+'px Serif', fill: '#000000' });
		this.titleText.anchor.setTo(0.5, 0.5);
		this.createIntroTweens();
		
		this.time.events.add(Math.random()*1000+500,function() {this.pretty();},this);
		this.time.events.add(Math.random()*2000+500,function() {this.pretty();},this);

		},
	
	pretty: function()
	{
		var y = Math.round(Math.random()*(this.tiles.length-1));
		var x = Math.round(Math.random()*(this.tiles[y].length-1));
		if (((y==0) && (x==0)) || ((y==5) && (x==4)) || ((y==6) && (x==4))) {}
		else
		{
			this.tiles[y][x].alpha = 0.1+Math.random()*0.15;
			this.time.events.add(100+Math.random()*200,function() {this.depretty(y,x);},this)
		}
		this.time.events.add(Math.random()*2000+500,function() {this.pretty();},this)
	},
	
	depretty: function(oldY,oldX)
	{
		this.tiles[oldY][oldX].alpha = this.tileAlpha;
	},
	
	update: update,
	
	createIntroTweens: function()
	{
		game.tweens.removeAll();
		this.tilesGroup.alpha = -0.2;
		var tween = game.add.tween(this.tilesGroup);
		tween.to({alpha: 1},2000);
		tween.start();
		 
		this.titleText.alpha= 0;
		var texttween = game.add.tween(this.titleText);
		texttween.to({alpha: 1},700);
		texttween.start();
	},
	
	createOutroTweens: function()
	{
		game.tweens.removeAll();
		var tween = game.add.tween(this.tilesGroup);
		tween.to({alpha: 0},800);
		tween.start();
		 
		var texttween = game.add.tween(this.titleText);
		texttween.to({alpha: 0},700);
		texttween.start();
	},
    
    quit: function()
    {
		playable = false;
		this.createOutroTweens();
		this.time.events.add(1000,function() {game.state.start('load')},this);
    },
    
    play: function()
    {
		recordEvent("play")
		playable = false;
		this.createOutroTweens();
		gameLevel = 1;
		updateProgress();
		
		for (var i=tileColours.length;i>=0;i--)
		{
			var r = Math.round(Math.random()*i)
			var c = tileColours[r];
			tileColours.splice(r,1);
			tileColours.push(c);
		}
		this.time.events.add(1000,function() {game.state.start('level');},this);
    },
    
    info: function()
    {
		playable = false;
		this.createOutroTweens();
		this.time.events.add(1000,function() {game.state.start('load')},this);
    }
}

var levelState = {
    preload: function ()
	{
        drawBackground();
		drawProgressBar();
		playable = false;
    },
    create: function ()
	{
		var textTime = 0;
		if (progress < 1)
		{
			this.lText = game.add.text(game.world.centerX, game.world.centerY, 'Level ' + gameLevel, { font: getMinDimension()/6+'px '+defaultFont, fill: '#111111' });
			this.lText.anchor.setTo(0.5, 0.5);
			this.time.events.add(800, function () { this.game.state.start('main') }, this);
		}
		else
		{
			this.lText = game.add.text(game.world.centerX, game.world.centerY, 'Well Done!', { font: getMinDimension()/6+'px '+defaultFont, fill: '#111111' });
			this.lText.anchor.setTo(0.5, 0.5);
			this.time.events.add(1800, function () { this.game.state.start('menu') }, this);
			textTime = 1000;
		}
		this.tweenIn();
		this.time.events.add(textTime+400,function() {this.tweenOut();},this);
    },
	
	tweenIn: function()
	{
		this.lText.alpha = 0;
		var tween = game.add.tween(this.lText);
		tween.to({alpha: 0.7}, 400);
		tween.start();
	},
	
	tweenOut: function()
	{
		var tween = game.add.tween(this.lText);
		tween.to({alpha: 0}, 400);
		tween.start();
	}
}

function recordEvent(description)
{
	if (sessionStorage.events)
		var events = JSON.parse(sessionStorage.events); 
	else
		var events = []
		
	var time = Date.now();
	events.push({t:time,d:description,level:gameLevel});
	sessionStorage.events = JSON.stringify(events)
	console.log(time + ": " + description);
}

var mainState = {
	preload: function ()
	{
		drawBackground();
		this.progressBar = drawProgressBar();
		playable = false;
	},
	
	create: function ()
	{
		recordEvent("createdlevel");
		var xOffset = -game.width;
	    this.level = createLevel(gameLevel);
	    this.tiles = makeLevel(this.level,xOffset,this);
	    this.indexX = -1;
	    this.indexY = -1;
		this.swapX = -1;
		this.swapY = -1;
		
		this.tilesGroup = game.add.group();
		for (var i=0;i<this.tiles.length;i++)
			for (var j=0;j<this.tiles[i].length;j++)
				this.tilesGroup.add(this.tiles[i][j]);
		this.tilesGroup.x +=xOffset;
		this.introTween();
	},
	
	update: update,

	startPlay: function()
	{
		playable = true;
		recordEvent("started");
	},
	
	levelComplete: function()
	{
		//for (var i=0;i<this.tiles.length;i++)
		//	for (var j=0;j<this.tiles[i].length;j++)
		//		this.tiles[i][j].getChildAt(1).visible = false;
		playable = false;
		recordEvent("complete");
		
		this.progressBarTween();
		game.input.onDown.add(this.levelExitTween, this);
		//this.time.events.add(1000, this.levelExitTween, this);
	},
	
	progressBarTween: function()
	{
		var oldHeight = getProgressHeight(progress);
		gameLevel++;
		updateProgress();
		
		var tween = game.add.tween(this.progressBar);
		tween.to({
			height: progress*(this.game.height-boxMarginTop-boxMarginBottom),
			y: this.progressBar.y+oldHeight-getProgressHeight(progress)
		}, 800);
		this.progressBar.visible = true;
		tween.start();
	},
	
	introTween: function()
	{
		game.tweens.removeAll();
		var tween = game.add.tween(this.tilesGroup);
		tween.to({x: 0},400);
		tween.onComplete.add(this.startPlay, this);
		tween.start();
	},
	
	levelExitTween: function()
	{
		recordEvent("moveon");
		game.tweens.removeAll();
		var tween = game.add.tween(this.tilesGroup);
		tween.to({x: 2*game.width}, 400);
		tween.onComplete.add(this.changeLevel,this);
		tween.start();
	},
	
	changeLevel: function()
	{
		recordEvent("changelevel");
	    game.state.start('level');
	}
};

function update()
{
	if (dragging)
	{
		if (this.indexX != -1)
		{
			if (this.swapX == -1)
			{
				var tileCoord = pointToGridIndex(game.input.x,game.input.y,this.tiles);
				if (tileCoord != null)
				{
					swap(this,this.indexX,this.indexY,tileCoord.x,tileCoord.y);
					this.swapX = this.indexX;
					this.swapY = this.indexY;
				}
			} else
			{
				var tileCoord = pointToGridIndex(game.input.x,game.input.y,this.tiles);
				if (tileCoord != null)
				{
					if ((this.swapX != tileCoord.x) || (this.swapY != tileCoord.y))
					{
						if ((this.menu) && (((tileCoord.x == 0) && (tileCoord.y == 0)) || ((tileCoord.x == 5) && (tileCoord.y == 4)) || ((tileCoord.x == 6) && (tileCoord.y == 4))))
						{}
						else
						{
							swap(this,this.indexX,this.indexY,this.swapX,this.swapY);
							swap(this,this.indexX,this.indexY,tileCoord.x,tileCoord.y);
							this.tiles[this.swapY][this.swapX].getChildAt(1).visible = false;
							this.swapX = this.indexX;
							this.swapY = this.indexY;
						}
					}
				}
				this.tiles[this.indexY][this.indexX].getChildAt(1).visible = true;
				this.tiles[this.swapY][this.swapX].getChildAt(1).visible = true;
			}
		}
	}
}

function pointToGridIndex(x,y,tiles)
{
	for (var i=0;i<tiles.length;i++)
		for (var j=0;j<tiles[i].length;j++)
		{
			var area = new Phaser.Rectangle(tiles[i][j].x, tiles[i][j].y, tiles[i][j].width, tiles[i][j].height);
			if (area.contains(x, y))
				return {x:j,y:i};
		}
	return null;
}

function boxCenterX()
{
    return ((game.world.width-boxMarginRight)+boxMarginLeft)/2
}

function boxCenterY()
{
    return ((game.world.height-boxMarginBottom)+boxMarginTop)/2
}

function randomLevel(height,width)
{
	var level = [];
	for (var i=0;i<height;i++)
	{
		level.push([]);
		for (var j=0;j<width;j++)
			level[i].push(Math.floor(Math.random()*tileColours.length));
	}
	return level;
}

function drawBackground()
{
	game.stage.backgroundColor = "#fff6d5";
	var graphics = game.add.graphics(0, 0);
	graphics.beginFill(0xffffe7);
	graphics.lineStyle(10, 0xFFEEAA, 1);
	graphics.drawRect(boxMarginLeft, boxMarginTop, this.game.width-boxMarginLeft-boxMarginRight, this.game.height-boxMarginTop-boxMarginBottom);
}

function makeTile(x,y,iy,ix,width,height,colour,state)
{
	if (typeof state == 'undefined')
		state == null;
	var bmd = this.game.add.bitmapData(width+3, height+3);
	var ctx=bmd.context;
	ctx.fillStyle=colour;
	roundRect(ctx,0,0,width,height,width/8,true,false);
	var mainTile = game.add.sprite(x,y,bmd);
	mainTile.inputEnabled = true;
	mainTile.events.onInputOver.add(function() {
		hoverOverTile(this);
	}, mainTile);
	
	mainTile.events.onInputOut.add(function() {
		hoverOverTileOut(this);
	}, mainTile);
	
	mainTile.events.onInputDown.add(function() {
		tileDown(this.iy,this.ix,this.sprite,this.state);
	}, {ix:ix,iy:iy,sprite:mainTile, state:state});

	mainTile.events.onInputUp.add(function() {
		tileUp(iy,ix,this.sprite,this.state);
	}, {ix:ix,iy:iy,sprite:mainTile, state:state});

	var shadowDrop = Math.floor(height*dropDepth);
	var bmd = this.game.add.bitmapData(width+shadowDrop, height+shadowDrop);
	var ctx=bmd.context;
	ctx.fillstyle='0x111111';
	roundRect(ctx,shadowDrop,shadowDrop,width,height,width/8,true,false);
	var shadow = game.add.sprite(0, 0, bmd);
	shadow.alpha = 0.0;

	var bmd = this.game.add.bitmapData(width+width/5, height+height/5);
	var ctx=bmd.context;
	ctx.strokeStyle='blue';
	ctx.lineWidth=height/10;
	roundRect(ctx,ctx.lineWidth/2,ctx.lineWidth/2,width,height,width/8,false,true);
	var outline = game.add.sprite(-ctx.lineWidth/2,-ctx.lineWidth/2,bmd);
	outline.visible = false;

	mainTile.addChild(shadow);
	mainTile.addChild(outline);
	mainTile.bringToTop();
	
	mainTile.gridX = ix;
	mainTile.gridY = iy;

	return mainTile;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke)
{
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }        
}

function hoverOverTile(sprite)
{
	if (playable)
	{
		var depth = sprite.height*dropDepth;
		sprite.y +=depth;
		sprite.x +=depth;
		sprite.getChildAt(0).y = -depth;
		sprite.getChildAt(0).x = -depth;
	}
}

function hoverOverTileOut(sprite)
{
	if (playable)
	{
		//var depth = sprite.height*dropDepth;
		//sprite.y -= depth;
		//sprite.x -= depth;
		//sprite.getChildAt(0).y = 0;
		//sprite.getChildAt(0).x = 0;
		resetTilePosition(sprite);
	}
}

function tileDown(iy,ix,group,state)
{
	if (playable)
	{
		dragging = true;
		state.swapX = -1;
		state.swapY = -1;
		game.sound.play('plock');
		group.getChildAt(1).visible = true;
		if (typeof state != 'undefined')
			selected(state,iy,ix);

	}
}

function tileUp(iy,ix,group,state)
{
	if (playable)
	{
		dragging = false;
		group.getChildAt(1).visible = false;
		game.sound.play('plock');
		if (typeof state != 'undefined')
			selected(state,iy,ix);
	}
}

function resetTilePosition(tile,tiles)
{
	tilePadding = size/10;
	tile.x = originX+tile.gridX*(size)+tilePadding/2;
	tile.y = originY+tile.gridY*(size)+tilePadding/2;
}

function getMinDimension()
{
	var maxWidth = Math.floor(game.world.width-paddingLeft-paddingRight);
	var maxHeight = Math.floor(game.world.height-paddingTop-paddingBottom);
	
	if (maxWidth/7 > maxHeight/5)
	{
	  return maxHeight;
	}
	else
	{
	  return maxWidth;
	}
}

function getTileSize(tiles)
{
    var maxWidth = Math.floor(game.world.width-paddingLeft-paddingRight);
    var maxHeight = Math.floor(game.world.height-paddingTop-paddingBottom);
    
    if (maxWidth/tiles[0].length > maxHeight/tiles.length)
    {
      var minDimension = maxHeight;
      var size = maxHeight/tiles.length;
    }
    else
    {
      var minDimension = maxWidth;
      var size = maxWidth/tiles[0].length;
    }
    
    return Math.min(maxBlockSize,size);
}

function setOrigin(tiles)
{
	if (tiles != null)
	{
		originY = Math.round(boxCenterY()-(size*tiles.length)/2);
		originX = Math.round(boxCenterX()-(size*tiles[0].length)/2);
	}
}

function makeLevel(tiles,xOffset,state)
{
	size = getTileSize(tiles);
	setOrigin(tiles);
	
    var tilePadding = Math.round(size/10);
    
    var tileSprites = [];
    
    for (var j=0;j<tiles.length;j++)
    {
		tileSprites.push([]);
		for (var i=0;i<tiles[j].length;i++)
			if (tiles[j][i] > -1)
			{
				tileSprites[j][i] = makeTile(0,0,j,i,size-tilePadding,size-tilePadding,tileColours[tiles[j][i]],state); 
				resetTilePosition(tileSprites[j][i],tiles);
			}
    }
    return tileSprites;
}

function drawProgressBar()
{
	var graphics = game.add.graphics(0, 0);
	graphics.beginFill(0x917c6f);
	graphics.lineStyle(5, 0xa39791, 1);
	graphics.drawRect(this.game.width-boxMarginRight+boxMarginRight/3, boxMarginTop, boxMarginRight/3, this.game.height-boxMarginTop-boxMarginBottom);
	  
	var progressHeight = getProgressHeight(progress);
	  
	var bmd = this.game.add.bitmapData(boxMarginRight/3, progressHeight);
	var ctx=bmd.context;
	ctx.fillStyle="lightblue";
	roundRect(ctx,0,0,boxMarginRight/3,progressHeight,5,true,false);
	
	var sprite = game.add.sprite(this.game.width-boxMarginRight+boxMarginRight/3,
						   this.game.height-boxMarginBottom-progressHeight,bmd);
	if (progress ==0)
		sprite.visible = false;
	return sprite;
}

function getProgressHeight(p)
{
	return Math.max(1,p*(this.game.height-boxMarginTop-boxMarginBottom));
}

function updateProgress()
{
	progress = ((gameLevel-1)/totalLevels);
	progress = Math.max(progress,0);
	progress = Math.min(progress,1);
}

function tileToGridIndex(tile)
{
	if (tile == null)
		return null;
	return {x:tile.gridX,y:tile.gridY};	
}

function swap(state,indexX,indexY,ix,iy)
{
	if ((state.indexX != ix) || (state.indexY != iy))
	{
		var tilePadding = size/10;
		
		var depth = state.tiles[iy][ix].height*dropDepth;
		var newX = state.tiles[state.indexY][state.indexX].x;
		var newY = state.tiles[state.indexY][state.indexX].y;
	
		var x1 = state.tiles[iy][ix].x - originX;
		x1 /= size;
		x1 = Math.round(x1);
		
		var y1 = state.tiles[iy][ix].y - originY;
		y1 /= size;
		y1 = Math.round(y1);
		
		var x2 = newX - originX;
		x2 /= size;
		x2 = Math.round(x2);
		
		var y2 = newY - originY;
		y2 /= size;
		y2 = Math.round(Math.abs(y2));
		
		var lvlTmp = state.level[y2][x2];
		state.level[y2][x2] = state.level[y1][x1];
		state.level[y1][x1] = lvlTmp;
		
		state.tiles[state.indexY][state.indexX].x = originX+size*x1+tilePadding/2;
		state.tiles[state.indexY][state.indexX].y = originY+size*y1+tilePadding/2;
		state.tiles[iy][ix].x = originX+size*x2+tilePadding/2;
		state.tiles[iy][ix].y = originY+size*y2+tilePadding/2;
	}
}

function selected(state,iy,ix)
{
	if (state.indexX == -1)
	{
		state.indexX = ix;
		state.indexY = iy;
		recordEvent("selected");
	}
	else
	{
		swap(state,this.indexX,this.indexY,ix,iy);
		recordEvent("swap");
		if (checkLevel(state.level))
		  state.levelComplete();
		state.tiles[state.indexY][state.indexX].getChildAt(1).visible = false;
		state.tiles[iy][ix].getChildAt(1).visible = false;
		state.indexX = -1;
		state.indexY = -1;
	}
}

function createLevel(level)
{
	//return shuffleLevel([[0,1,2,3,4,5],[0,1,2,3,4,5]]);
	//return shuffleLevel(randomLevel(1,10));
	switch(level)
	{
		case 1:
			return [[0,1]];
		case 2:
			return [[1,2]];
		case 3:
			return [[2,0,1]];
		case 4:
			return [[0,2,1]];
		case 5:
			return [[0,1,0]];
		case 6:
			return [[3,1,1]];
		case 7:
			return shuffleLevel([[3,2,1,0]]);
		case 8:
			return shuffleLevel([[1,3,2,1,]]);
		case 9:
			return shuffleLevel([[4,1,3,1]]);
		case 10:
			return shuffleLevel([[5,4,1,4,]]);
		case 11:
			return shuffleLevel([[2,1,3,2,1,0]]);
		case 12:
			return shuffleLevel([[4,2,1,0,3,1,0,0,4]])
		//case 10:
		//	return shuffleLevel([[5,4,2,1,0,3,1,0,0,4]])
	}

}

/**
 * Currently only shuffles within rows.
 */
function shuffleLevel(level)
{
	for (var i=level.length*level[0].length;i>=0;i--)
	{
		var r = Math.floor(Math.random()*i)
		var c = level[Math.floor(r/level[0].length)][r%level[0].length];
				level[Math.floor(r/level[0].length)].push(c);
		level[Math.floor(r/level[0].length)].splice(r%level[0].length,1);
	}
	if (!checkLevel(level))
		return level;
	else
		return shuffleLevel(level);
}

function checkLevel(level)
{
	var falsified = false;
	var i=0;
	var j=0;
	while ((i<level.length) && (!falsified))
	{
		j = 0;
		while ((j<level[i].length) && (!falsified))
		{
			switch (level[i][j])
			{
				case 0:
					switch (level[i][j+1])
					{
						case 1:
						case 2:
						case 5:
						falsified = true;
					}
					break;
				case 1:
					switch (level[i][j+1])
					{
						case 1:
						case 2:
						case 5:
						falsified = true;
					}
					break;
				case 2:
					switch (level[i][j+1])
					{
						case 0:
						case 2:
						case 3:
						case 4:
						case 5:
						falsified = true;
					}
					break;
				case 3:
					switch (level[i][j+1])
					{
						case 0:
						case 3:
						case 4:
						falsified = true;
					}
					break;
				case 4:
					switch (level[i][j+1])
					{
						case 0:
						case 3:
						case 4:
						case 5:
						falsified = true;
					}
					break;
				case 5:
					switch (level[i][j+1])
					{
						case 0:
						case 1:
						case 2:
						case 3:
						case 5:
						falsified = true;
					}
					break;
			}
			j++;
		}
		i++;
	}

  return !falsified;
}

var totalLevels = 10;

var minHeight = 200;
var minWidth = 200;

var game = new Phaser.Game(Math.max(minWidth,window.innerWidth), Math.max(minHeight,window.innerHeight), Phaser.AUTO, 'gameDiv');

var paddingLeft = Math.round(game.width/8);
var paddingRight = Math.round(game.width/8);
var paddingTop  = Math.round(game.height/8);
var paddingBottom = Math.round(game.height/8);

var boxMarginLeft = Math.round(game.width/10);
var boxMarginRight = Math.round(game.width/10);
var boxMarginTop = Math.round(game.height/10);
var boxMarginBottom = Math.round(game.height/10);

var maxBlockSize = Math.min(Math.round(game.width/3),Math.round(game.height/3));
var defaultFont = 'Sans-Serif';
var dropDepth = 1/40;

var gameLevel = 0;
var progress = 0;
var tileColours = [];
var playable = false;

var dragging = false;
var size = 0;
var originX = 0;
var originY = 0;

game.state.add('load', loadState);
game.state.add('main', mainState);
game.state.add('level', levelState);
game.state.add('menu', menuState);
game.state.start('load');