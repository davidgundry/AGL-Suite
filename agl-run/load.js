(
    function (filenames,callback)
    {
        var numloaded = 0;
        var loader = function()
        {
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = filenames[numloaded];
            s.addEventListener('load', load, false);
            document.getElementsByTagName("head")[0].appendChild(s);
        };
        var load = function()
        {
            numloaded++;
            if (numloaded == filenames.length)
                callback();
            else
                loader();
        };
        loader();
    }
)
(
	[
		"../phaser.js",
	    "../log.js",
	    "../game.js",
        "../grammar.js",
	    "game.js"
	], 
 	function ()
	{
		new AGLRun(false,"gameDiv","gameOutput");
	}
 );