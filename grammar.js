if (typeof AGLSuite === 'undefined')
	function AGLSuite(){}

AGLSuite.grammar = function(){}

AGLSuite.grammar.RandomGrammar = function() {
    this.name = "Random";
};

/**
 * Returns a random character fromn the alphabet M, V, X, R, S
 */
AGLSuite.grammar.RandomGrammar.prototype.next = function()
{
    /*var p = Math.round(Math.random()*5);
    if (p == 0)
        return "M";
    else if (p == 1)
        return "V";
    else if (p == 2)
        return "X";
    else if (p == 3)
        return "R";
    else
        return "S";*/

    if (Math.round(Math.random() * 5) == 1)
        return " ";

    var p = Math.round(Math.random());
    if (p == 0)
        return "a";
    else
        return "b";
};

AGLSuite.grammar.FiniteStateGrammar = function(start,transition)
{
	this.current = start;
	this.transition = transition;
	this.name = "FSG";
};

AGLSuite.grammar.FiniteStateGrammar.prototype.next = function()
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