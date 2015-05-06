if (typeof AGLSuite === 'undefined')
	function AGLSuite(){};

AGLSuite.log = function(){};

AGLSuite.log.Log = function(target)
{
	var events = [];
	if(localStorage)
		if (localStorage.events)
			events = JSON.parse(localStorage.events); 
	var html = "Total records: "+events.length;
	for (var i=0;i<events.length;i++)
	{
		html += "<div class='record'>";
		var keys = Object.keys(events[i]);
		//console.log("...");
		//console.log(keys);
		//console.log(keys.indexOf("time"));
		//console.log(keys.indexOf("description"));
		//keys = keys.splice(keys.indexOf("time"),1);
		//console.log(keys);
		//keys = keys.splice(keys.indexOf("description"),1);
		//console.log(keys);
		//keys = ["time","description"].concat(keys);
		console.log(keys);
		for (var j=0;j<keys.length;j++)
		{
			var value = events[i][keys[j]];
			if (keys[j] == 'time')
				value = new Date(value).toString();
			html += "<span class='value'><span class='" + keys[j] + "'>"+value+"</span>,</span>";
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
	logObject["time"] = time;
	logObject["description"] = description;
	events.push(logObject);
	localStorage.events = JSON.stringify(events);
	AGLSuite.log.log(time + ": " + description);
};
