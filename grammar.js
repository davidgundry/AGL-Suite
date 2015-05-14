if (typeof AGLSuite === 'undefined')
	function AGLSuite(){};

AGLSuite.grammar = function(){};

AGLSuite.grammar.Grammar = function(name,alphabet)
{
    this.name = name;
    this.alphabet = alphabet
};

AGLSuite.grammar.Grammar.prototype.next = function(){};

AGLSuite.grammar.RG = function(alphabet)
{
    AGLSuite.grammar.Grammar.call(this,"RG",alphabet);
};

AGLSuite.grammar.RG.prototype = new AGLSuite.grammar.Grammar();
AGLSuite.grammar.RG.prototype.constructor = AGLSuite.grammar.RG;

AGLSuite.grammar.RG.prototype.next = function()
{
    var r = Math.floor(Math.random()*this.alphabet.length);
    if (r == this.alphabet.length)
        r--;
    return this.alphabet[r];
};

AGLSuite.grammar.Node = function()
{
    this.directedEdges = [];
    this.transitionSymbols = [];
};

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



AGLSuite.grammar.FSG = function(alphabet,start,transition)
{
    AGLSuite.grammar.Grammar.call(this,"FSG",alphabet);
	this.current = start;
	this.transition = transition;
};

AGLSuite.grammar.FSG.prototype = new AGLSuite.grammar.Grammar();
AGLSuite.grammar.FSG.prototype.constructor = AGLSuite.grammar.FSG;

AGLSuite.grammar.FSG.prototype.next = function()
{
	var n = this.transition(this.current);
	this.current = n.s;
	return n.o;
};

/**
* A really simple finite state grammar with an alphabet of two symbols: a, b
*/
function fsg1(s) {
	switch (s) {
		case 0:
			return { s: 1, o: "a" };
		case 1:
			if (Math.round(Math.random()) == 0)
				return { s: 1, o: "b" };
			else
			    return { s: 2, o: "a" };
	    case 2:
	        return { s: 0, o: " " };
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
function fsg2(s) { 
    switch (s) {
        case 0:
            if (Math.round(Math.random()) == 0)
                return { s: 1, o: "M" };
            else
                return { s: 2, o: "V" };
        case 1:
            if (Math.round(Math.random()) == 0)
                return { s: 1, o: "S" };
            else
                return { s: 3, o: "V" };
        case 2:
            if (Math.round(Math.random()) == 0)
                return { s: 1, o: "X" };
            else
                return { s: 4, o: "X" };
        case 3:
            var p = Math.round(Math.random() * 2);
            if (p == 0)
                return { s: 5, o: "S" };
            else if (p==1)
                return { s: 2, o: "R" };
            else
                return { s: 0, o: " " };
        case 4:
            var p = Math.round(Math.random()*2);
            if (p==0)
                return { s: 4, o: "R" };
            else if (p==1)
                return { s: 5, o: "M" };
            else
                return { s: 0, o: " " };
        case 5:
            return { s: 0, o: " " };
    }
};