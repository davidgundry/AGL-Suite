/* global endFill */
/* global ctx */
if (typeof AGLBalloons === 'undefined')
	function AGLBalloons(){};

AGLBalloons.graphics = function(){};

AGLBalloons.graphics.drawPolygon = function(poly,ctx)
{
    ctx.moveTo(poly[poly.length-1].x,poly[poly.length-1].y);
    for(var i=0,len = poly.length-1; i<=len; i++)
    {
        ctx.lineTo(poly[i].x, poly[i].y);
    }
};

AGLBalloons.graphics.createBalloon = function(x,y,radius,game)
{   
    var bmd = game.add.bitmapData(radius*2, radius*6);
	var ctx = bmd.context;
    ctx.fillStyle = '#ccff44';
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2*Math.PI, true); 
    ctx.fill();
    
    ctx.beginPath();
    ctx.lineWidth = 0;
    var chute = [{x:radius*(1/6),y:radius*(9/6)},
                 {x:radius*(11/6),y:radius*(9/6)},
                 {x:radius*(4/3),y:radius*(7/3)},
                 {x:radius*(2/3),y:radius*(7/3)}];
    AGLBalloons.graphics.drawPolygon(chute,ctx);
    ctx.fill();
    
    ctx.beginPath();
    ctx.lineWidth = 0;
    ctx.fillStyle = '#aa9933';
    var basket = [{x:radius*(2/3),y:radius*(8/3)},
                 {x:radius*(4/3),y:radius*(8/3)},
                 {x:radius*(4/3),y:radius*(9/3)},
                 {x:radius*(2/3),y:radius*(9/3)}];
    AGLBalloons.graphics.drawPolygon(basket,ctx);
    ctx.fill();
    
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.lineStyle = '#aa9933';
    var ropes = [{x:radius*(2/3),y:radius*(7/3)},
                 {x:radius*(4/3),y:radius*(7/3)},
                 {x:radius*(4/3),y:radius*(8/3)},
                 {x:radius*(2/3),y:radius*(8/3)}];
    AGLBalloons.graphics.drawPolygon(ropes,ctx);
    ctx.stroke();
    
    
    var balloon = game.add.sprite(x,y,bmd);
    balloon.anchor.setTo(0.5,0.3);
    return balloon;
};

AGLBalloons.graphics.createLandscape = function(width, height, game)
{
    var layers = 3;
    var layerColours = ["#33ff33","#11cc11","#55dd55"];
    var landscape = game.add.group();
    for (var i=0;i<layers;i++)
    {
       var layer = game.add.sprite(0,0,AGLBalloons.graphics.createLandscapeLayer(width,height,game,100-i*10,layerColours[i]));  
       landscape.add(layer);
    }
    
    for (var i=0;i<landscape.children.length;i++)
    {
        landscape.children[i].x = game.camera.x*(i/10);
        landscape.children[i].y= game.camera.y*(i/10)+game.height/100;
    }
    
    return landscape;
};

AGLBalloons.graphics.createLandscapeLayer = function(width, height, game, hillSize,colour)
{
    var bmd = game.add.bitmapData(width, height);
	var ctx = bmd.context;
    
    for (var i=-hillSize/2;i<width+hillSize/2;i+=hillSize)
    {
        var radius = hillSize+Math.random()*hillSize;
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(i, height+ hillSize, radius, 0, 2*Math.PI, true); 
        ctx.fill();
    }
    
    return bmd;
};