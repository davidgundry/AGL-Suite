var preloadState = {
	preload: function () {
		game.stage.backgroundColor = "#fff6d5";
	},
	create: function () {
		game.state.start('load');
	}
}

var loadState = {
	preload: function () {
		drawBackground();

		var loadingLabel = game.add.text(game.world.centerX, 150, 'loading...', { font: '15px Courier New', fill: '#ffffff' });
		loadingLabel.anchor.setTo(0.5, 0.5);
		//var loadingBar = game.add.sprite(game.world.centerX, 200, 'loadingBar');
		//loadingBar.anchor.setTo(0.5, 0.5);
		//game.load.setPreloadSprite(loadingBar);
		
		
		//game.load.audio('plock', 'assets/plock.wav');

	},
	create: function () {
		game.state.start('menu');
	},
	update: function () {
	}
};

var tileColours = ['#ff2a2a','#8dd35f','#0066ff','#ffaaaa','#241c1c'];

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
	  }
	 
	var titleText = game.add.text(game.world.centerX, game.world.centerY, 'blocks', { font: minDimension/4+'px Sans', fill: '#000000' });
        titleText.anchor.setTo(0.5, 0.5);
	titleText.alpha= 0.8;
	
    },
    
    quit: function()
    {
		game.state.start('preload');
    },
    
    play: function()
    {
		gameLevel = 1;
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
		  
		this.lText = game.add.text(game.world.centerX, game.world.centerY, 'Level ' + gameLevel, { font: minDimension/6+'px Sans', fill: '#111111' });
		this.lText.anchor.setTo(0.5, 0.5);
		this.time.events.add(700, function () { this.game.state.start('main') }, this);
		this.lText.alpha = 0;
		
		var tween = game.add.tween(this.lText);
		tween.to({alpha: 0.7}, 400);
		tween.onComplete.add(this.tweenOut,this);
		tween.start();
    },
	
	tweenOut: function()
	{
		var tween = game.add.tween(this.lText);
		tween.to({alpha: 0}, 200);
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
    var originX = Math.round(boxCenterX()-(size*tiles[0].length)/2)+xOffset;
    
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
	
	return game.add.sprite(this.game.width-boxMarginRight+boxMarginRight/3,
						   this.game.height-boxMarginBottom-progressHeight,bmd);
}

function getProgressHeight(p)
{
	return Math.max(1,p*(this.game.height-boxMarginTop-boxMarginBottom));
}

function updateProgress()
{
	progress = (gameLevel/10);
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
	    this.level = [[0,1,2,3,4]];
	    this.tiles = makeLevel(this.level,xOffset,this);
	    this.indexX = -1;
	    this.indexY = -1;
		
		this.tilesGroup = game.add.group();
		for (var i=0;i<this.tiles.length;i++)
			for (var j=0;j<this.tiles[i].length;j++)
				this.tilesGroup.add(this.tiles[i][j]);
		
		var tween = game.add.tween(this.tilesGroup);
		tween.to({x: -xOffset},400);
		tween.onComplete.add(this.startPlay, this);
		tween.start();
	},

	startPlay: function() {
		playable = true;
	},
	
	update: function () {
	   
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
		    var depth = this.tiles[iy][ix].height/40;
		    var newX = this.tiles[this.indexY][this.indexX].x;
		    var newY = this.tiles[this.indexY][this.indexX].y;
		    
		    var lvlTmp = this.level[this.indexY][this.indexX];
		    this.level[this.indexY][this.indexX] = this.level[iy][ix];
		    this.level[iy][ix] = lvlTmp;
		    
		    var size = getTileSize(this.tiles);
		    var originY = Math.round(boxCenterY()-(size*this.tiles.length)/2);
		    var originX = Math.round(boxCenterX()-(size*this.tiles[0].length)/2);
		    
		    var sprite = this.tiles[this.indexY][this.indexX];
		    var sprite2 = this.tiles[iy][ix];
		    this.tiles[this.indexY][this.indexX] = null;
		    this.tiles[iy][ix] = null;
		    this.tiles[this.indexY][this.indexX] = sprite2;
		    this.tiles[iy][ix] = sprite;
		    sprite = null;
		    sprite2 = null;
		    
		    this.tiles[this.indexY][this.indexX].x = this.indexX*size+originX;
		    this.tiles[this.indexY][this.indexX].y = this.indexY*size+originY;
		    this.tiles[iy][ix].x = ix*size+originX;
		    this.tiles[iy][ix].y = iy*size+originY;
		    
		    //this.tiles[this.indexY][this.indexX].x = this.tiles[iy][ix].x;
		    //this.tiles[this.indexY][this.indexX].y = this.tiles[iy][ix].y;
		    //this.tiles[iy][ix].x = newX;
		    //this.tiles[iy][ix].y = newY;
		    //console.log(this.level);
		    //hoverOverTileOut(this.tiles[this.indexY][this.indexX]);
		    //hoverOverTileOut(this.tiles[iy][ix]);
		    if (checkLevel(this.tiles))
		      this.levelComplete();
		}
		this.tiles[this.indexY][this.indexX].getChildAt(1).visible = false;
		this.tiles[iy][ix].getChildAt(1).visible = false;
		this.indexX = -1;
		this.indexY = -1;
		this.levelComplete();
	    }
	},
	
	levelComplete: function()
	{
		for (var i=0;i<this.tiles.length;i++)
			for (var j=0;j<this.tiles[i].length;j++)
				this.tiles[i][j].getChildAt(1).visible = true;
		playable = false;
		this.time.events.add(500, this.levelExitTween, this);
		
		var oldHeight = getProgressHeight(progress);
		gameLevel++;
		updateProgress();
		var tween = game.add.tween(this.progressBar);
		tween.to({
			height: progress*(this.game.height-boxMarginTop-boxMarginBottom),
			y: this.progressBar.y+oldHeight-getProgressHeight(progress)
		}, 400);
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

function checkLevel(tiles)
{
  if (tiles[0][0] == 2)
    return true;
  return false;
}


var minHeight = 300;
var minWidth = 300;

var playable = false;

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

game.state.add('preload', preloadState);
game.state.add('load', loadState);
game.state.add('main', mainState);
game.state.add('level', levelState);
game.state.add('menu', menuState);

var gameLevel = 0;
var progress = 0;
game.state.start('preload');