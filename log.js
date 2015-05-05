if (typeof AGLSuite === 'undefined')
	function AGLSuite(){};

AGLSuite.log = function(){};

AGLSuite.log.log = function(message)
{
	console.log(message);	
}

AGLSuite.log.recordEvent = function(description,logObject)
{
	var events = [];
	if (localStorage.events)
		events = JSON.parse(localStorage.events); 

	if (typeof logObject === 'undefined')
		logObject = {};
	
	var time = Date.now();
	logObject.t = time;
	logObject.d = description;
	events.push(logObject);
	localStorage.events = JSON.stringify(events);
	AGLSuite.log.log(time + ": " + description);
};