/**
 * AGLBlocks is a game that involves sliding blocks. Create a new instance of AGLBlocks to create and start the game.
 * 
 * @param 	targetDiv		the HTML element in which to put the game
 * @param 	greyLocked		if true, locked tiles are greyed out
 * @param 	contentsType	defines tile type, options: "sprite" or "colour"
 * @param 	audio			if true, audio is enabled
 */
function AGLBlocks(targetDiv,greyLocked,contentsType,audio)
{
	if (typeof greyLocked !== "undefined")
		this.lockedTilesAreGrey = greyLocked;
	else
		this.lockedTilesAreGrey = false;
		
	if ((contentsType !== "colour") && (contentsType !== "sprite"))
		this.contentsType = "colour";
	else
		this.contentsType = contentsType;
	this.audio = typeof audio !== 'undefined' ? audio : true;
	
	if (typeof targetDiv !== "undefined")
	{
		var container = document.getElementById(targetDiv);
		if (container != null)
			this.game = new Phaser.Game(container.clientWidth, container.clientHeight, Phaser.AUTO, container);
		else
		{
			console.log("Invalid target container");
			return;
		}
	}
	else
	{	
		this.game = new Phaser.Game(Math.max(AGLBlocks.minWidth,window.innerWidth), Math.max(AGLBlocks.minHeight,window.innerHeight), Phaser.AUTO);
	}
		this.paddingLeft = Math.round(this.game.width/8);
		this.paddingRight = Math.round(this.game.width/8);
		this.paddingTop  = Math.round(this.game.height/8);
		this.paddingBottom = Math.round(this.game.height/8);

		this.boxMarginLeft = Math.round(this.game.width/10);
		this.boxMarginRight = Math.round(this.game.width/10);
		this.boxMarginTop = Math.round(this.game.height/10);
		this.boxMarginBottom = Math.round(this.game.height/10);

		this.maxBlockSize = Math.min(Math.round(this.game.width/3),Math.round(this.game.height/3));
		
		this.addGameStates();
		this.game.state.start('load');
};

AGLBlocks.title = "blocks";
AGLBlocks.showLoadingScreen = false;
AGLBlocks.levelList = [
	{level:[[5,4,0,1,3,2,1,0,0,4]],
	locked:[[true,true,false,false,true,true,true,true,true,true]]},
	{level:[[5,4,1,0,3,1,2,0,0,4]],
	locked:[[true,true,true,true,true,false,false,true,true,true]]},
	{level:[[5,4,1,0,3,0,2,1,0,4]],
	locked:[[true,true,true,true,false,false,false,true,true,true]]},
];
AGLBlocks.totalLevels = AGLBlocks.levelList.length;
AGLBlocks.minHeight = 200;
AGLBlocks.minWidth = 200;
AGLBlocks.defaultFont = 'Sans-Serif';
AGLBlocks.titleFont = 'Serif';
AGLBlocks.dropDepth = 1/40;
AGLBlocks.staticTileContents = ['#ff2a2a','#8dd35f','#0066ff','#ffaaaa','#aaaaaa','#ccaa33'];

AGLBlocks.fillArray = function(width,height,fill)
{
	var array = [];
	for (var i=0;i<width;i++)
	{
		array.push([]);
		for (var j=0;j<height;j++)
		{
			array[i][j] = fill;
		}
	}
	return array;
};

AGLBlocks.recordEvent = function(description)
{
	var events = [];
	if (sessionStorage.events)
		events = JSON.parse(sessionStorage.events); 

	var time = Date.now();
	events.push({t:time,d:description});//,level:this.gameLevel});
	sessionStorage.events = JSON.stringify(events);
	AGLBlocks.log(time + ": " + description);
};

AGLBlocks.log = function(message)
{
	console.log(message);
};

AGLBlocks.shuffleArray = function(array)
{
	for (var i=array.length;i>=0;i--)
	{
		var r = Math.round(Math.random()*i);
		var c = array[r];
		array.splice(r,1);
		array.push(c);
	}
	return array;
};

AGLBlocks.randomLevel = function(height,width,length)
{
	var level = [];
	for (var i=0;i<height;i++)
	{
		level.push([]);
		for (var j=0;j<width;j++)
			level[i].push(Math.floor(Math.random()*length));
	}
	return level;
};

AGLBlocks.roundRect = function(ctx, x, y, width, height, radius, fill, stroke)
{
	if (typeof stroke == "undefined" )
		stroke = true;
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
	if (stroke)
		ctx.stroke();
	if (fill)
		ctx.fill();
};

AGLBlocks.pointToGridIndex = function(x,y,tiles)
{
	for (var i=0;i<tiles.length;i++)
		for (var j=0;j<tiles[i].length;j++)
		{
			var area = new Phaser.Rectangle(tiles[i][j].x, tiles[i][j].y, tiles[i][j].width, tiles[i][j].height);
			if (area.contains(x, y))
				return {x:j,y:i};
		}
	return null;
};

/**
 * Currently only shuffles within rows.
 */
AGLBlocks.shuffleLevel = function(level)
{
	for (var i=level.length*level[0].length;i>=0;i--)
	{
		var r = Math.floor(Math.random()*i);
		var c = level[Math.floor(r/level[0].length)][r%level[0].length];
				level[Math.floor(r/level[0].length)].push(c);
		level[Math.floor(r/level[0].length)].splice(r%level[0].length,1);
	}
	if (!AGLBlocks.checkLevel(level))
		return level;
	else
		return AGLBlocks.shuffleLevel(level);
};

AGLBlocks.checkLevel = function(level)
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
};

AGLBlocks.createLevel = function(level)
{
	return AGLBlocks.levelList[level-1].level;
};

AGLBlocks.getLockedTiles = function(level)
{
	return AGLBlocks.levelList[level-1].locked;
};

/*
AGLBlocks.tileToGridIndex = function(tile)
{
	if (tile == null)
		return null;
	return {x:tile.gridX,y:tile.gridY};	
}*/


AGLBlocks.prototype.gameLevel = 0;
AGLBlocks.prototype.progress = 0;
AGLBlocks.prototype.tileContents = [];
AGLBlocks.prototype.playable = false;

AGLBlocks.prototype.dragging = false;
AGLBlocks.prototype.swapping = false;
AGLBlocks.prototype.size = 0;
AGLBlocks.prototype.originX = 0;
AGLBlocks.prototype.originY = 0;

AGLBlocks.prototype.inputBlock = false;
AGLBlocks.prototype.tileContents = AGLBlocks.staticTileContents;

AGLBlocks.prototype.pretty = function(tiles,tileAlpha,time,menu)
{
	var y = Math.round(Math.random()*(tiles.length-1));
	var x = Math.round(Math.random()*(tiles[y].length-1));
	if ((menu) && (((x==0) && (y==0)) || ((x==5) && (y==4)) || ((x==6) && (y==4)))) {}
	else
	{
		var tween = this.game.add.tween(tiles[y][x]);
		tween.to({alpha: tiles[y][x].alpha-0.2+Math.random()*0.15},200);
		tween.onComplete.add(function() {this.depretty(y,x,tiles,tileAlpha,time);}, this);
		tween.start();
	}
	time.events.add(Math.random()*2000+500,function() {this.pretty(tiles,tileAlpha,time,menu);},this);
};

AGLBlocks.prototype.depretty = function(y,x,tiles,tileAlpha)
{
	var tween = this.game.add.tween(tiles[y][x]);
	tween.to({alpha: tileAlpha},200);
	tween.start();
};

AGLBlocks.prototype.tileToGridPosition = function(tile)
{
	return this.pointToGridPosition(tile.x,tile.y);
};

AGLBlocks.prototype.pointToGridPosition = function(x,y)
{
	x -= this.originX;
	x /= this.size;
	y -= this.originY;
	y /= this.size;

	return {x:Math.floor(x),y:Math.floor(y)};
};

AGLBlocks.prototype.boxCenterX = function()
{
    return ((this.game.world.width-this.boxMarginRight)+this.boxMarginLeft)/2;
};

AGLBlocks.prototype.boxCenterY = function()
{
    return ((this.game.world.height-this.boxMarginBottom)+this.boxMarginTop)/2;
};

AGLBlocks.prototype.drawBackground = function()
{
	this.game.stage.backgroundColor = "#fff6d5";
	var graphics = this.game.add.graphics(0, 0);
	graphics.beginFill(0xffffe7);
	graphics.lineStyle(10, 0xFFEEAA, 1);
	graphics.drawRect(this.boxMarginLeft, this.boxMarginTop, this.game.width-this.boxMarginLeft-this.boxMarginRight, this.game.height-this.boxMarginTop-this.boxMarginBottom);
};

AGLBlocks.prototype.makeTile = function(x,y,iy,ix,width,height,tileContents,contentsIndex,locked,state)
{
	if (typeof state == 'undefined')
		state == null;
		
	var bmd = this.game.add.bitmapData(width+3, height+3);
	var ctx = bmd.context;
	
	//ctx.save();

	ctx.fillStyle = tileContents[contentsIndex];
	if ((locked) && (this.lockedTilesAreGrey))
		ctx.fillStyle = "lightgrey";
	else if (this.contentsType!="colour")
		ctx.globalAlpha = 0;
		
	if (locked)
		AGLBlocks.roundRect(ctx,width/6,height/6,width*(2/3),height*(2/3),width/8,true,false);
	else
		AGLBlocks.roundRect(ctx,0,0,width,height,width/8,true,false);
	
	var mainTile = this.game.add.sprite(x,y,bmd);
	//ctx.restore();
			
	mainTile.inputEnabled = true;
	
	mainTile.events.onInputDown.add(function() {
		this.scope.tileDown(this.iy,this.ix,this.sprite,this.state);
	}, {ix:ix,iy:iy,sprite:mainTile, state:state,scope:this});

	mainTile.events.onInputUp.add(function() {
		this.scope.tileUp(iy,ix,this.sprite,this.state);
	}, {ix:ix,iy:iy,sprite:mainTile, state:state, scope:this});

	bmd = this.game.add.bitmapData(width+width/5, height+height/5);
	ctx = bmd.context;
	ctx.strokeStyle='blue';
	ctx.lineWidth=height/10;
	AGLBlocks.roundRect(ctx,ctx.lineWidth/2,ctx.lineWidth/2,width,height,width/8,false,true);
	var outline = this.game.add.sprite(-ctx.lineWidth/2,-ctx.lineWidth/2,bmd);
	outline.visible = false;

	mainTile.addChild(outline);
	var symbol = null;
	if (this.contentsType=="sprite")
	{
		if (locked)
		{
			symbol = this.game.add.sprite(width/6,height/6,"symbols");
			symbol.width = width*(2/3);
			symbol.height = height*(2/3);
		}
		else
		{
			symbol = this.game.add.sprite(0,0,"symbols");
			symbol.width = width;
			symbol.height = height;
		}
		symbol.frame = contentsIndex;
		if ((locked) && (this.lockedTilesAreGrey))
			symbol.alpha=0;
		mainTile.addChild(symbol);
	}
	mainTile.bringToTop();
	
	mainTile.gridX = ix;
	mainTile.gridY = iy;

	return mainTile;
};


AGLBlocks.prototype.tileDown = function(iy,ix,group,state)
{
	if (this.playable)
	{
		if (!state.lockedTiles[iy][ix])
		{
			this.dragging = true;
			state.swapX = -1;
			state.swapY = -1;
			this.game.sound.play('pick');
			group.getChildAt(0).visible = true;
			group.bringToTop();
			if (typeof state != 'undefined')
				this.selected(state,iy,ix);
		}
	}
};

AGLBlocks.prototype.tileUp = function(iy,ix,group,state)
{
	if (this.playable)
	{
		if (this.dragging)
		{
			var p = this.tileToGridPosition(state.tiles[iy][ix]);
			AGLBlocks.recordEvent("drop x:"+p.x+","+p.y);
		}
		this.dragging = false;
		group.getChildAt(0).visible = false;
		this.game.sound.play('drop');
		if (typeof state != 'undefined')
			this.selected(state,iy,ix);
	}
};

AGLBlocks.prototype.resetTilePosition = function(tile,tiles)
{
	var tilePadding = this.size/10;
	tile.x = this.originX+tile.gridX*(this.size)+tilePadding/2;
	tile.y = this.originY+tile.gridY*(this.size)+tilePadding/2;
};

AGLBlocks.prototype.getMinDimension = function()
{
	var maxWidth = Math.floor(this.game.world.width-this.paddingLeft-this.paddingRight);
	var maxHeight = Math.floor(this.game.world.height-this.paddingTop-this.paddingBottom);
	
	if (maxWidth/7 > maxHeight/5)
		return maxHeight;
	else
		return maxWidth;
};

AGLBlocks.prototype.getTileSize = function(tiles)
{
    var maxWidth = Math.floor(this.game.world.width-this.paddingLeft-this.paddingRight);
    var maxHeight = Math.floor(this.game.world.height-this.paddingTop-this.paddingBottom);
    var tileSize = 0;
	
    if (maxWidth/tiles[0].length > maxHeight/tiles.length)
    {
		  //var minDimension = maxHeight;
		   tileSize = maxHeight/tiles.length;
    }
    else
    {
		  //var minDimension = maxWidth;
		  tileSize = maxWidth/tiles[0].length;
    }
    
    return Math.min(this.maxBlockSize,tileSize);
};

AGLBlocks.prototype.setOrigin = function(tiles)
{
	if (tiles != null)
	{
		this.originY = Math.round(this.boxCenterY()-(this.size*tiles.length)/2);
		this.originX = Math.round(this.boxCenterX()-(this.size*tiles[0].length)/2);
	}
};

AGLBlocks.prototype.makeLevel = function(tiles,lockedTiles,xOffset,state)
{
	this.size = this.getTileSize(tiles);
	this.setOrigin(tiles);
	
    var tilePadding = Math.round(this.size/10);
    
    var tileSprites = [];
    
    for (var j=0;j<tiles.length;j++)
    {
		tileSprites.push([]);
		for (var i=0;i<tiles[j].length;i++)
		{
			tileSprites[j][i] = this.makeTile(0,0,j,i,this.size-tilePadding,this.size-tilePadding,this.tileContents,tiles[j][i],lockedTiles[j][i],state); 
			this.resetTilePosition(tileSprites[j][i],tiles);
		}
    }
    return tileSprites;
};

AGLBlocks.prototype.drawProgressBar = function(fadeIn)
{
	var graphics = this.game.add.graphics(0, 0);
	graphics.beginFill(0x917c6f);
	graphics.lineStyle(5, 0xa39791, 1);
	graphics.drawRect(this.game.width-this.boxMarginRight+this.boxMarginRight/3, this.boxMarginTop, this.boxMarginRight/3, this.game.height-this.boxMarginTop-this.boxMarginBottom);
	
	if (fadeIn)
	{
		graphics.alpha = 0;
		var tween = this.game.add.tween(graphics);
		tween.to({alpha:1});
		tween.start();
	}
	  
	var progressHeight = this.getProgressHeight(this.progress);
	var bmd = this.game.add.bitmapData(this.boxMarginRight/3, progressHeight);
	var ctx = bmd.context;
	ctx.fillStyle="lightblue";
	AGLBlocks.roundRect(ctx,0,0,this.boxMarginRight/3,progressHeight,5,true,false);
	
	var sprite = this.game.add.sprite(this.game.width-this.boxMarginRight+this.boxMarginRight/3,this.game.height-this.boxMarginBottom-progressHeight,bmd);
	if (this.progress == 0)
		sprite.visible = false;
	return sprite;
};

AGLBlocks.prototype.getProgressHeight = function(p)
{
	return Math.max(1,p*(this.game.height-this.boxMarginTop-this.boxMarginBottom));
};

AGLBlocks.prototype.updateProgress = function()
{
	this.progress = ((this.gameLevel-1)/AGLBlocks.totalLevels);
	this.progress = Math.max(this.progress,0);
	this.progress = Math.min(this.progress,1);
};

AGLBlocks.prototype.swap = function(state,indexX,indexY,ix,iy)
{
	if ((state.indexX != ix) || (state.indexY != iy))
	{
		
		var p = this.tileToGridPosition(state.tiles[iy][ix]);
		AGLBlocks.recordEvent("swapto x:"+p.x+","+p.y);
		var tilePadding = this.size/10;
		
		//var depth = state.tiles[iy][ix].height*AGLBlocks.dropDepth;
		var newX = state.tiles[state.indexY][state.indexX].x;
		var newY = state.tiles[state.indexY][state.indexX].y;
	
		var x1 = state.tiles[iy][ix].x - this.originX;
		x1 /= this.size;
		x1 = Math.round(x1);
		
		var y1 = state.tiles[iy][ix].y - this.originY;
		y1 /= this.size;
		y1 = Math.round(y1);
		
		var x2 = newX - this.originX;
		x2 /= this.size;
		x2 = Math.round(x2);
		
		var y2 = newY - this.originY;
		y2 /= this.size;
		y2 = Math.round(Math.abs(y2));
		
		var lvlTmp = state.level[y2][x2];
		state.level[y2][x2] = state.level[y1][x1];
		state.level[y1][x1] = lvlTmp;
		
		var tween = this.game.add.tween(state.tiles[state.indexY][state.indexX]);
		tween.to({x:this.originX+this.size*x1+tilePadding/2,
		y:this.originY+this.size*y1+tilePadding/2},80);
		tween.onComplete.add(function() {this.inputBlock = false; this.swapping = false;},this);
		tween.start();
		
		tween = this.game.add.tween(state.tiles[iy][ix]);
		tween.to({x:this.originX+this.size*x2+tilePadding/2,
		y:this.originY+this.size*y2+tilePadding/2},80);
		tween.onComplete.add(function() {this.inputBlock = false;},this);
		tween.start();
		this.inputBlock = true;
		
		this.swapping = true;
		if (this.audio)
			this.game.sound.play('swap');
	}
};

AGLBlocks.prototype.selected = function(state,iy,ix)
{
	if (!state.lockedTiles[iy][ix])
	{
		if (state.indexX == -1)
		{
			state.indexX = ix;
			state.indexY = iy;
			var p = this.tileToGridPosition(state.tiles[iy][ix]);
			AGLBlocks.recordEvent("selected x:"+p.x+","+p.y);
		}
		else
		{
			this.swap(state,this.indexX,this.indexY,ix,iy);
			if (AGLBlocks.checkLevel(state.level))
			  state.levelComplete();
			state.tiles[state.indexY][state.indexX].getChildAt(0).visible = false;
			state.tiles[iy][ix].getChildAt(0).visible = false;
			state.indexX = -1;
			state.indexY = -1;
		}
	}
};

AGLBlocks.prototype.addGameStates = function()
{
	this.loadState = new AGLBlocks.LoadState(this);
	this.menuState = new AGLBlocks.MenuState(this);
	this.levelState = new AGLBlocks.LevelState(this);
	this.mainState = new AGLBlocks.MainState(this);
		
	this.game.state.add('load', this.loadState);
	this.game.state.add('main', this.mainState);
	this.game.state.add('level', this.levelState);
	this.game.state.add('menu', this.menuState);
};