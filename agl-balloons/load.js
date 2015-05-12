(
    function (filenames,callback)
    {
        var numloaded = 0;
        var load = function()
        {
            numloaded++;
            if (numloaded == filenames.length)
                callback();
        };
        for (var i=0;i<filenames.length;i++)
        {
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = filenames[i];
            s.addEventListener('load', load, false);
            document.getElementsByTagName("head")[0].appendChild(s);
        }
    }
)
(
	[
		"../phaser.js",
	    "../log.js",
	    "../game.js",
	    "game.js",
	    "graphics.js"
	], 
 	function ()
	{
		new AGLBalloons(true,"gameDiv");
	}
 );