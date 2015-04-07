var loadState = {
	preload: function () {
		drawBackground();
		var loadingLabel = game.add.text(game.world.centerX, 150, 'loading...', { font: '15px Courier New', fill: '#ffffff' });
		loadingLabel.anchor.setTo(0.5, 0.5);

		//game.load.audio('plock', 'assets/plock.wav');
	},
	create: function () {
		game.state.start('menu');
	},
	update: function () {
	}
};


function boxCenterX()
{
    return ((game.world.width-boxMarginRight)+boxMarginLeft)/2
}

function boxCenterY()
{
    return ((game.world.height-boxMarginBottom)+boxMarginTop)/2
}

var menuState = {
    preload: function () {
		drawBackground();
		playable = true;
    },
    create: function () {
		tileColours = ['#ff2a2a','#8dd35f','#0066ff','#ffaaaa','#241c1c'];
		var maxWidth = Math.floor(game.world.width-paddingLeft-paddingRight);
		var maxHeight = Math.floor(game.world.height-paddingTop-paddingBottom);
		
		if (maxWidth/7 > maxHeight/5)
		{
		  var minDimension = maxHeight;
		  var size = maxHeight/5;
		}
		else
		{
		  var minDimension = maxWidth;
		  var size = maxWidth/7;
		}
		
		var originX = Math.round(boxCenterX()-(size*7)/2);
		var originY = Math.round(boxCenterY()-(size*5)/2);
		
		var tilePadding = Math.round(size/10);
		size = Math.round(size * (9/10));
		
		this.tilesGroup = game.add.group();
		
		for (var i=0;i<7;i++)
		  for (var j=0;j<5;j++)
		  {
			  var tileColour = Math.floor(Math.random()*5);
			  if ((i==0) && (j==0))
			tileColour = 0;
			  else if  ((i==5) && (j==4))
			tileColour = 1;
			  else if ((i==6) && (j==4))
			tileColour = 2;
			  
			  var s = makeTile(i*size+i*tilePadding+originX,j*size+j*tilePadding+originY,j,i,size,size,tileColours[tileColour],this);
			  s.alpha = 0.3;
			  
			  if ((i==0) && (j==0))
			  {
			var qText = s.addChild(game.add.text(size/2,size/2, 'quit', { font: size/3+'px Sans', fill: '#222222' }));
			qText.anchor.setTo(0.5, 0.5);
			s.alpha =1;
			s.events.onInputDown.add(this.quit);
			  }
			  else if  ((i==5) && (j==4))
			  {
			var pText = s.addChild(game.add.text(size/2,size/2, 'play', { font: size/3+'px Sans', fill: '#222222' }));
			pText.anchor.setTo(0.5, 0.5);
			s.alpha = 1;
			s.events.onInputDown.add(this.play);
			  }
			  else if ((i==6) && (j==4))
			  {
			var iText = s.addChild(game.add.text(+size/2,size/2, 'info', { font: size/3+'px Sans', fill: '#222222' }));
			iText.anchor.setTo(0.5, 0.5);
			s.alpha = 1;
			s.events.onInputDown.add(this.info);
			  }
			this.tilesGroup.add(s);
		  }
		this.tilesGroup.alpha = -0.2;
		var tween = game.add.tween(this.tilesGroup);
		tween.to({alpha: 1},2000);
		tween.start();
		 
		var titleText = game.add.text(game.world.centerX, game.world.centerY, 'blocks', { font: minDimension/4+'px Sans', fill: '#000000' });
		titleText.anchor.setTo(0.5, 0.5);
		titleText.alpha= 0;
		var texttween = game.add.tween(titleText);
		texttween.to({alpha: 0.8},700);
		texttween.start();
		
    },
    
    quit: function()
    {
		game.state.start('preload');
    },
    
    play: function()
    {
		gameLevel = 1;
		updateProgress();
		for (var i=tileColours.length;i>=0;i--)
		{
			var r = Math.round(Math.random()*i)
			var c = tileColours[r];
			tileColours.splice(r,1);
			tileColours.push(c);
		}
		game.state.start('level');
    },
    
    info: function()
    {
      
    }
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
  roundRect(ctx,0,0,width,height,5,true,false);
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
    tileUp(this.state);
  }, {ix:ix,iy:iy,sprite:mainTile, state:state});

  var shadowDrop = Math.floor(height/40);
  var bmd = this.game.add.bitmapData(width+shadowDrop, height+shadowDrop);
  var ctx=bmd.context;
  ctx.fillstyle='0x111111';
  roundRect(ctx,shadowDrop,shadowDrop,width,height,5,true,false);
  var shadow = game.add.sprite(0, 0, bmd);
  shadow.alpha = 0.0;
  
  var bmd = this.game.add.bitmapData(width+width/5, height+height/5);
  var ctx=bmd.context;
  ctx.strokeStyle='blue';
  ctx.lineWidth=height/10;
  roundRect(ctx,ctx.lineWidth/2,ctx.lineWidth/2,width,height,5,false,true);
  var outline = game.add.sprite(-ctx.lineWidth/2,-ctx.lineWidth/2,bmd);
  outline.visible = false;
  
  mainTile.addChild(shadow);
  mainTile.addChild(outline);
  mainTile.bringToTop();
  
  return mainTile;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
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
		var depth = sprite.height/40;
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
		var depth = sprite.height/40;
		sprite.y -= depth;
		sprite.x -= depth;
		sprite.getChildAt(0).y = 0;
		sprite.getChildAt(0).x = 0;
	}
}

function tileDown(iy,ix,group,state)
{
	if (playable)
	{
		game.sound.play('plock');
		group.getChildAt(1).visible = !group.getChildAt(1).visible;
		if (typeof state != 'undefined')
		  if (typeof state.selected != 'undefined')
			state.selected(iy,ix);
	}
}

function tileUp(state)
{
	if (playable)
	{
		game.sound.play('plock');
		if (typeof state != 'undefined')
		  if (typeof state.selected != 'undefined')
			state.pointerUp(game.input.x,game.input.y);
	}
}

var levelState = {
    preload: function () {
        drawBackground();
		drawProgressBar();
		playable = false;
    },
    create: function () {
      	var maxWidth = Math.floor(game.world.width-paddingLeft-paddingRight);
		var maxHeight = Math.floor(game.world.height-paddingTop-paddingBottom);
		
		if (maxWidth/7 > maxHeight/5)
		{
		  var minDimension = maxHeight;
		}
		else
		{
		  var minDimension = maxWidth;
		}
		 
		if (progress < 1)
		{
			 
			this.lText = game.add.text(game.world.centerX, game.world.centerY, 'Level ' + gameLevel, { font: minDimension/6+'px Sans', fill: '#111111' });
			this.lText.anchor.setTo(0.5, 0.5);
			this.time.events.add(700, function () { this.game.state.start('main') }, this);
			this.lText.alpha = 0;
			
			var tween = game.add.tween(this.lText);
			tween.to({alpha: 0.7}, 400);
			tween.onComplete.add(this.tweenOut,this);
			tween.start();
		}
		else
		{
			this.lText = game.add.text(game.world.centerX, game.world.centerY, 'Well Done!', { font: minDimension/6+'px Sans', fill: '#111111' });
			this.lText.anchor.setTo(0.5, 0.5);
			this.time.events.add(1500, function () { this.game.state.start('menu') }, this);
			this.lText.alpha = 0;
			var tween = game.add.tween(this.lText);
			tween.to({alpha: 0.7}, 800);
			tween.onComplete.add(this.tweenOut,this);
			tween.start();
		}
    },
	
	tweenOut: function()
	{
		var tween = game.add.tween(this.lText);
		tween.to({alpha: 0}, 700);
		tween.start();
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
    
    return size;
}

function makeLevel(tiles,xOffset,state)
{
    var size = getTileSize(tiles);
    var originY = Math.round(boxCenterY()-(size*tiles.length)/2);
    var originX = Math.round(boxCenterX()-(size*tiles[0].length)/2);
    
    var tilePadding = Math.round(size/10);
    size = Math.round(size * (9/10));
    
    var tileSprites = [];
    
    for (var j=0;j<tiles.length;j++)
    {
	tileSprites.push([]);
	for (var i=0;i<tiles[j].length;i++)
	    if (tiles[j][i] > -1)
		tileSprites[j][i] = makeTile(originX+i*(size+tilePadding),originY+j*(size+tilePadding),j,i,size,size,tileColours[tiles[j][i]],state); 
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
	ctx.fillStyle="blue";
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

var mainState = {
	preload: function () {
		drawBackground();
		this.progressBar = drawProgressBar();
		playable = false;
	},
	create: function () {
		var xOffset = -game.width;
	    this.level = createLevel(gameLevel);
	    this.tiles = makeLevel(this.level,xOffset,this);
	    this.indexX = -1;
	    this.indexY = -1;
		
		this.tilesGroup = game.add.group();
		for (var i=0;i<this.tiles.length;i++)
			for (var j=0;j<this.tiles[i].length;j++)
				this.tilesGroup.add(this.tiles[i][j]);
		this.tilesGroup.x +=xOffset;
		
		var tween = game.add.tween(this.tilesGroup);
		tween.to({x: 0},400);
		tween.onComplete.add(this.startPlay, this);
		tween.start();
	},

	startPlay: function() {
		playable = true;
	},
	
	update: function () {
	   
	},
	
	pointerUp: function(x,y)
	{
		var size = getTileSize(this.tiles);
		var originY = Math.round(boxCenterY()-(size*this.tiles.length)/2);
		var originX = Math.round(boxCenterX()-(size*this.tiles[0].length)/2);
		
		var x = x - originX;
		x /= size;
		x = Math.floor(x);
		
		var y = y - originY;
		y /= size;
		y = Math.floor(y);
		
		if (((x != this.indexX) || (y != this.indexY)) && (x >= 0) && (y >= 0) && (y<this.tiles.length))
			if (x < this.tiles[y].length)
			{
				//this.tiles[y][x].getChildAt(1).visible = !this.tiles[y][x].getChildAt(1).visible;
				//this.selected(y,x);
			}
	},
	
	selected: function(iy,ix)
	{
	    if (this.indexX == -1)
	    {
			this.indexX = ix;
			this.indexY = iy;
	    }
	    else
		{
			if ((this.indexX != ix) || (this.indexY != iy))
			{
				var size = getTileSize(this.tiles);
				var originY = Math.round(boxCenterY()-(size*this.tiles.length)/2);
				var originX = Math.round(boxCenterX()-(size*this.tiles[0].length)/2);
				
				var depth = this.tiles[iy][ix].height/40;
				var newX = this.tiles[this.indexY][this.indexX].x;
				var newY = this.tiles[this.indexY][this.indexX].y;
				
				var x1 = this.tiles[iy][ix].x - originX;
				x1 /= size;
				x1 = Math.round(x1);
				
				var y1 = this.tiles[iy][ix].y - originY;
				y1 /= size;
				y1 = Math.round(y1);
				
				var x2 = newX - originX;
				x2 /= size;
				x2 = Math.round(x2);
				
				var y2 = newY - originY;
				y2 /= size;
				y2 = Math.round(Math.abs(y2));
				
				var lvlTmp = this.level[y2][x2];
				this.level[y2][x2] = this.level[y1][x1];
				this.level[y1][x1] = lvlTmp;
			
				this.tiles[this.indexY][this.indexX].getChildAt(1).visible = false;
				this.tiles[iy][ix].getChildAt(1).visible = false;
				
				this.tiles[this.indexY][this.indexX].x = originX+size*x1;
				this.tiles[this.indexY][this.indexX].y = originY+size*y1;
				this.tiles[iy][ix].x = originX+size*x2;
				this.tiles[iy][ix].y = originY+size*y2;
				console.log(this.level[0]);
				//hoverOverTileOut(this.tiles[this.indexY][this.indexX]);
				//hoverOverTileOut(this.tiles[iy][ix]);
				if (checkLevel(this.level))
				  this.levelComplete();
			}
			this.tiles[this.indexY][this.indexX].getChildAt(1).visible = false;
			this.tiles[iy][ix].getChildAt(1).visible = false;
			this.indexX = -1;
			this.indexY = -1;
	    }
	},
	
	levelComplete: function()
	{
		for (var i=0;i<this.tiles.length;i++)
			for (var j=0;j<this.tiles[i].length;j++)
				this.tiles[i][j].getChildAt(1).visible = true;
		playable = false;
		this.time.events.add(1000, this.levelExitTween, this);
		
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
	
	levelExitTween: function()
	{
		var tween = game.add.tween(this.tilesGroup);
		tween.to({x: 2*game.width}, 400);
		tween.onComplete.add(this.changeLevel,this);
		tween.start();
	},
	
	changeLevel: function()
	{
	    game.state.start('level');
	}
};

function createLevel(level)
{
	switch(level)
	{
		case 1:
			return [[1,0]];
		case 2:
			return [[2,1,0]];
		case 3:
			return [[1,0,0]];
	}
	return shuffleLevel([[0,1,2,3,4],[0,1,2,3,4]]);
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
					if (level[i][j+1] != 1)
						falsified = true;
					break;
				case 1:
					if ((j+1 < level[i].length) && (level[i][j+1] != 2))
						falsified = true;
					break;
			}
			j++;
		}
		i++;
	}

  return !falsified;
}


var minHeight = 200;
var minWidth = 200;

var playable = false;

var tileColours = [];

var game = new Phaser.Game(Math.max(minWidth,window.innerWidth), Math.max(minHeight,window.innerHeight), Phaser.AUTO, 'gameDiv');
var paddingLeft = Math.round(game.width/8);
var paddingRight = Math.round(game.width/8);
var paddingTop  = Math.round(game.height/8);
var paddingBottom = Math.round(game.height/8);

var boxMarginLeft = Math.round(game.width/10);
var boxMarginRight = Math.round(game.width/10);
var boxMarginTop = Math.round(game.height/10);
var boxMarginBottom = Math.round(game.height/10);

console.log(boxMarginLeft);

game.state.add('load', loadState);
game.state.add('main', mainState);
game.state.add('level', levelState);
game.state.add('menu', menuState);

var gameLevel = 0;
var progress = 0;
var totalLevels = 2;
game.state.start('load');