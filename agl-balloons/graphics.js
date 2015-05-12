if (typeof AGLBalloons === 'undefined')
	console.log("AGLBalloons is not defined. Load game.js first");
else
{

AGLBalloons.graphics = function(){};

AGLBalloons.graphics.drawPolygon = function(poly,ctx)
{
    ctx.moveTo(poly[poly.length-1].x,poly[poly.length-1].y);
    for(var i=0,len = poly.length-1; i<=len; i++)
    {
        ctx.lineTo(poly[i].x, poly[i].y);
    }
};

AGLBalloons.graphics.Balloon = function(x,y,radius,game)
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
    balloon.anchor.setTo(0.5,0.2);
    
    return balloon;
};

AGLBalloons.graphics.Landscape = function(width, height, game)
{
    var layers = 3;
    var layerColours = ["#33ff33","#11cc11","#55dd55"];
    var landscape = game.add.group();
    for (var i=0;i<layers;i++)
    {
       var layer = game.add.sprite(0,0,AGLBalloons.graphics.Landscape._createLayer(width,height,game,100-i*10,layerColours[i]));  
       landscape.add(layer);
    }
    
    for (var i=0;i<landscape.children.length;i++)
    {
        landscape.children[i].x = game.camera.x*(i/10);
        landscape.children[i].y= game.camera.y*(i/10)+game.height/100;
    }
    
    return landscape;
};

AGLBalloons.graphics.Landscape._createLayer = function(width, height, game, hillSize, colour)
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

AGLBalloons.graphics.Cloud = function(radius,game)
{   
    var game = game;
    var width = 10;
    var height = 10;
    var bmd = game.add.bitmapData((width+1)*radius, (height+1)*radius);
	var ctx = bmd.context;
    
    var latice = AGLBalloons.graphics.Cloud._createLatice(width-1,height-1,2);
    for (var i=0;i<latice.length;i++)
        for (var j=0;j<latice[0].length;j++)
        {
            if (latice[i][j])
            {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(radius+i*radius, radius+j*radius, radius+Math.random()*(radius/19), 0, 2*Math.PI, true); 
                ctx.fill();
            }
        }
    
    return bmd;
};

AGLBalloons.graphics.Cloud._createLatice = function(width,height,steps)
{
    var laticeArray = [];
    for (var i=0;i<width;i++)
    {
        laticeArray.push([]);
        for (var j=0;j<height;j++)
        {
            if ((i == Math.round(width/2)) && (j == Math.round(height/2)))
                laticeArray[i].push(true);
            else
                laticeArray[i].push(false);
        }
    }
    
    for (var s=0;s<steps;s++)
        laticeArray = AGLBalloons.graphics.Cloud._CAStep(laticeArray);
        
    var nodeArray = [];
    for (var i=0;i<width+1;i++)
    {
        nodeArray.push([]);
        for (var j=0;j<height+1;j++)
        {
            nodeArray[i][j] = false;
            for (var n=-1;n<1;n++)
                for (var m=-1;m<1;m++)
                    if ((i+n >= 0) && (i+n < laticeArray.length) && (j+m >= 0) && (j+m < laticeArray[0].length))
                        nodeArray[i][j] = nodeArray[i][j] || laticeArray[i+n][j+m];
        }
    }
    
    return nodeArray;
};

AGLBalloons.graphics.Cloud._CAStep = function(laticeArray)
{
    var newArray = []
    for (var i=0;i<laticeArray.length;i++)
    {
        newArray.push([]);
        for (var j=0;j<laticeArray[0].length;j++)
        {
            if (laticeArray[i][j])
            {
                var neighbours = AGLBalloons.graphics.Cloud._countNeighbours(laticeArray,i,j);
                if (neighbours < 3)
                    if (Math.random()>0.8)
                        newArray[i].push(false);
                else
                 newArray[i].push(true);
            }
            else
            {
                var neighbours = AGLBalloons.graphics.Cloud._countNeighbours(laticeArray,i,j);
                if ((neighbours > 0) && (Math.random() > 0.8))
                    newArray[i].push(true);
                else
                    newArray[i].push(false);
            }
        }
    }
    return newArray;
};

AGLBalloons.graphics.Cloud._countNeighbours = function(laticeArray,x,y)
{
    var count = 0;
    for (var i=-1;i<2;i++)
        for (var j=-1;j<2;j++)
        {
           if (Math.abs(i) + Math.abs(j) != 0)
               if ((x+i >= 0) && (x+i < laticeArray.length) && (y+j >= 0) && (y+j < laticeArray[0].length))
                    if (laticeArray[x+i][y+j])
                        count++; 
        }
    return count;
};

};
