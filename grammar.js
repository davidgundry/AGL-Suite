if (typeof AGLSuite === 'undefined')
	function AGLSuite(){};

AGLSuite.grammar = function(){};

AGLSuite.grammar.Grammar = function(name,alphabet)
{
    this.name = name;
    this.alphabet = alphabet
};

AGLSuite.grammar.Grammar.prototype.next = function(){};

AGLSuite.grammar.Random = function(alphabet)
{
    AGLSuite.grammar.Grammar.call(this,"Random",alphabet);
};

AGLSuite.grammar.Random.prototype = new AGLSuite.grammar.Grammar();
AGLSuite.grammar.Random.prototype.constructor = AGLSuite.grammar.Random;

AGLSuite.grammar.Random.prototype.next = function()
{
    var r = Math.floor(Math.random()*this.alphabet.length);
    if (r == this.alphabet.length)
        r--;
    return this.alphabet[r];
};

/*AGLSuite.grammar.Node = function()
{
    this.directedEdges = [];
    this.transitionSymbols = [];
};*/
/*
AGLSuite.grammar.FiniteState = function(alphabet,numNodes)
{
    this.nodes = Array(numNodes);
    this.transitionSymbols = Array(numNodes);
    for (var i=0;i<numNodes;i++)
        this.nodes[i] = new AGLSuite.grammar.Node();
    for (var i=0;i<numNodes;i++)
        this.transitionSymbols[i] = null;
    this.setPosition(0);
};

AGLSuite.grammar.FiniteState.prototype.addEdge = function(start,end,symbol)
{
    this.directedEdges[start].edges.push(end);
    this.transitionSymbols[start].edges.push(symbol);
};

AGLSuite.grammar.FiniteState.prototype.setPosition = function(position)
{
    this.currentNode = position;
};

AGLSuite.grammar.FiniteState.prototype.step = function()
{
    var edgeNumber = Math.round(Math.random()*this.nodes[this.currentNode].edges.length);
    var symbol = this.nodes[this.currentNode].transitionSymbols[edgeNumber];
    this.currentNode = this.nodes[this.currentNode].edges[edgeNumber];
    return symbol;
};

AGLSuite.grammar.FiniteState.prototype.generateString = function()
{
    this.setPosition(0);
	var string = "";
	terminalSymbol = false;
	while (!terminalSymbol)
	{
		var newCharacter = this.step();
		if (newCharacter != '')
			string += newCharacter;
		else
			terminalSymbol = true;
	}
	return string;
}*/

AGLSuite.grammar.FSG = function(alphabet,startStateID,transitionFunction)
{
    AGLSuite.grammar.Grammar.call(this,"FSG",alphabet);
	this.currentStateID = startStateID;
	this.startStateID = startStateID;
	this.transitionFunction = transitionFunction;
};

AGLSuite.grammar.FSG.prototype = new AGLSuite.grammar.Grammar();
AGLSuite.grammar.FSG.prototype.constructor = AGLSuite.grammar.FSG;

AGLSuite.grammar.FSG.prototype.next = function()
{
	var n = this.transitionFunction(this.currentStateID);
	this.currentStateID = n.state;
	return this.alphabet[n.output];
};

AGLSuite.grammar.FSG.prototype.generateString = function()
{
    this.currentStateID = this.startStateID;
	var string = "";
	terminalSymbol = false;
	while (!terminalSymbol)
	{
		var newCharacter = this.next();
		if (newCharacter != 0)
			string += this.alphabet[newCharacter];
		else
			terminalSymbol = true;
	}
	return string;
}

AGLSuite.grammar.Transition = function(state,output)
{
	this.output = output;
	this.state = state;
}

/**
* A really simple finite state grammar with an alphabet of two symbols: a, b
*/
AGLSuite.grammar.FSG.Example = {};
AGLSuite.grammar.FSG.Example.Simple = function(s) {
	switch (s) {
		case 0:
			return new AGLSuite.grammar.Transition(state = 1, output = 1);
		case 1:
			if (Math.round(Math.random()) == 0)
				return new AGLSuite.grammar.Transition(state = 1, output = 2);
			else
			    return new AGLSuite.grammar.Transition(state = 2, output = 1);
	    case 2:
	        return new AGLSuite.grammar.Transition(state = 0, output = 0);
	}
};
/**
* 
* Alphabet: M, V, X, R, S
* 
* Taken from page 124 of:
* Redington, M. & Chater, N., 1996. Transfer in artificial grammar learning: A reevaluation.
* Journal of experimental psychology: …, 125(2), pp.123–138.
* Available at: http://psycnet.apa.org/psycinfo/1996-04201-001 [Accessed February 23, 2015].
*/
AGLSuite.grammar.FSG.Example.Redington = function(s) { 
    switch (s) {
        case 0:
            if (Math.round(Math.random()) == 0)
                return new AGLSuite.grammar.Transition(state = 1, output = 1)
            else
                return new AGLSuite.grammar.Transition(state = 2, output = 2);
        case 1:
            if (Math.round(Math.random()) == 0)
                return new AGLSuite.grammar.Transition(state = 1, output = 3);
            else
                return new AGLSuite.grammar.Transition(state = 3, output = 2);
        case 2:
            if (Math.round(Math.random()) == 0)
                return new AGLSuite.grammar.Transition(state = 1, output = 4);
            else
                return new AGLSuite.grammar.Transition(state = 4, output = 4);
        case 3:
            var p = Math.round(Math.random() * 2);
            if (p == 0)
                return new AGLSuite.grammar.Transition(state = 5, output = 3);
            else if (p==1)
                return new AGLSuite.grammar.Transition(state = 2, output = 5);
            else
                return new AGLSuite.grammar.Transition(state = 0, output = 0);
        case 4:
            var p = Math.round(Math.random()*2);
            if (p==0)
                return new AGLSuite.grammar.Transition(state = 4, output = 5);
            else if (p==1)
                return new AGLSuite.grammar.Transition(state = 5, output = 1);
            else
                return new AGLSuite.grammar.Transition(state = 0, output = 0);
        case 5:
            return new AGLSuite.grammar.Transition(state = 0, output = 0);
    }
};