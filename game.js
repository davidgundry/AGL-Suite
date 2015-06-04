if (typeof AGLSuite === 'undefined')
	function AGLSuite(){};

AGLSuite.createGame = function(full,target,minWidth,minHeight)
{
	var game = null;
	if (!full)
	{
		var container = document.getElementById(target);
		if (container != null)
			game = new Phaser.Game(container.clientWidth, container.clientHeight, Phaser.CANVAS, container);
		else
		{
			AGLSuite.log("Invalid target container");
			return null;
		}
	}
	else
	{	
		game = new Phaser.Game(Math.max(minWidth,window.innerWidth), Math.max(minHeight,window.innerHeight), Phaser.CANVAS);
	}
	
	return game;
};