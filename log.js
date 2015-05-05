if (typeof AGLSuite === 'undefined')
	function AGLSuite(){};

AGLSuite.log = function(){};

AGLSuite.log.Log = function(target)
{
	var events = [];
	if(localStorage)
		if (localStorage.events)
			events = JSON.parse(localStorage.events); 
	var html = "";
	for (var i=0;i<events.length;i++)
	{
		html += "<div class='record'>";
		var keys = Object.keys(events[i]);
		for (var j=0;j<keys.length;j++)
		{
			var value = events[i][keys[j]];
			if (typeof value === 'date')
				value = new Date(value).toString();
			html += "<span class='value' class='" + keys[j] + "'>"+value+"</span>";
		}
		html += "</div>";
	}
	
	document.getElementById(target).innerHTML = html;
};

AGLSuite.log.log = function(message)
{
	console.log(message);	
};

AGLSuite.log.recordEvent = function(description,logObject)
{
	var events = [];
	if (localStorage.events)
		events = JSON.parse(localStorage.events); 

	if (typeof logObject === 'undefined')
		logObject = {};
	
	var time = Date.now();
	logObject.time = time;
	logObject.description = description;
	events.push(logObject);
	localStorage.events = JSON.stringify(events);
	AGLSuite.log.log(time + ": " + description);
};