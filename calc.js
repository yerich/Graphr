/**
 * This file handles math calculations
 */

//Machine epsilon
function calcEps(){
	var temp1, temp2, mchEps
	temp1 = 1.0
	do {
		mchEps = temp1
		temp1 /= 2
		temp2 = 1.0 + temp1
	}
	while (temp2 > 1.0)
	return mchEps;
}


Math.log10 = function(arg) {
	return Math.log(arg)/Math.log(10);
}

function calc() {
	this.eqcache = new Object;
	this.replacements = {"sec" : "Calc.sec", "csc" : "Calc.csc", "cot" : "Calc.csc", "sqrt" : "Math.sqrt",
		"asin" : "Calc.asin", "acos" : "Calc.acos", "atan" : "Calc.atan",
		"sin" : "Calc.sin", "tan" : "Calc.tan", "cos" : "Calc.cos", "log" : "Math.log10", "pi" : "3.14159265358979", "e" : "2.71828183",
		"abs" : "Math.abs", "ln" : "Math.log", "zeta" : "Calc.zeta", "gamma" : "Calc.gamma", "fact" : "Calc.fact", "bellb" : "Calc.bellb", "Math.pow" : "Math.asdf", "Calc.pow" : "pow", 
		"pow" : "Calc.pow", "Math.asdf" : "Calc.pow"};
	this.angles = "radians";
	this.loopcounter = 0;
	this.eps = calcEps();	//Machine epsilon - the maximum expected floating point error

	/* Basic Math Functions (sin, cos, csc, etc.)
	 */

	//This will take a number and covert it to radians, based on the current setting
	this.convAngles = function(value) {
		if(this.angles == "degrees")
			return value*(Math.PI/180);
		if(this.angles == "gradians")
			return value*(Math.PI/200);
		return value;
	}

	//This will take a radian value and convert it to the proper unit, based on the current setting
	this.convRadians = function(value) {
		if(this.angles == "degrees")
			return (value * 180 / Math.PI);
		if(this.angles == "gradians")
			return (value * 200 / Math.PI);
		return value;
	}

	this.sin = function(value) {
		return Math.sin(Calc.convAngles(value));
	}

	this.cos = function(value) {
		return Math.cos(Calc.convAngles(value));
	}

	this.tan = function(value) {
		return Math.tan(Calc.convAngles(value));
	}

	this.asin = function(value) {
		return this.convRadians(Math.asin(value));
	}

	this.acos = function(value) {
		return this.convRadians(Math.acos(value));
	}

	this.atan = function(value) {
		return this.convRadians(Math.atan(value));
	}

	this.sec = function(value) {
		return (1 / Math.cos(Calc.convAngles(value)));
	}

	this.csc = function(value) {
		return (1 / Math.sin(Calc.convAngles(value)));
	}

	this.cot = function(value) {
		return (1 / Math.tan(Calc.convAngles(value)));
	}
	
	this.pow = function(base, exp) {
		return Math.pow(base, exp);
	}

	/* Less basic math functions
	 * Some parts were taken from the project at graph.tk
	 * Github: http://github.com/aantthony/graph.tk/
	 * Licensed under the GNU Lesser General Public License
	 */

	//Bell numbers
	this.blln = [1, 1, 2, 5, 15, 52, 203, 877, 4140, 21147, 115975, 678570, 4213597, 27644437, 190899322, 1382958545,
		10480142147, 82864869804, 682076806159, 5832742205057, 51724158235372, 474869816156751, 4506715738447323];


	//Riemann zeta function
	this.zeta = function(x) {
		pi = Math.PI;
	    if (x === 0) {
	        return -0.5;
	    } else if (x == 1) {
	        return Infinity;
	    } else if (x == 2) {
	        return pi * pi / 6;
	    } else if (x == 4) {
	        return pi * pi * pi * pi / 90;
	    } else if (x < 1) {
	        return Infinity;
	    }
	    var sum = 4.4 * Math.pow(x, -5.1);
	    for (var npw = 1; npw < 10; npw++) {
	        sum += Math.pow(npw, -x);
	    }
	    return sum;
	}

	this.gamma = function(x) {
	    if (x > 1.0) {
	        return (exp(x * (ln(x) - 1) + 0.5 * (-ln(x) + log2pi) + 1 / (12 * x) - 1 / (360 * (x * x * x)) + 1 / (1260 * pow(x, 5)) - 1 / (1680 * pow(x, 7))));
	    }
	    if (x > -0.5) {
	        return (1.0 + 0.150917639897307 * x + 0.24425221666910216 * pow(x, 2)) / (x + 0.7281333047988399 * pow(x, 2) - 0.3245138289924575 * pow(x, 3));
	    }
	    if (x < 0) {
	        if (x == ~~x) {
	            return;
	        } else {
	            return Math.PI / (Math.sin(Math.PI * x) * Gamma((1 - x)));
	        }
	    } else {
	        return pow(x - 1, x - 1) * Math.sqrt(2 * Math.PI * (x - 1)) * exp(1 - x + 1 / (12 * (x - 1) + 2 / (5 * (x - 1) + 53 / (42 * (x - 1)))));
	    }
	}
	this.fact = function(ff) {
	    if (ff === 0 || ff == 1) {
	        return 1;
	    } else if (ff > 0 && ff == ~~ff && ff < 15) {
	        var s = 1;
	        for (var nns = 1; nns <= ff; nns++) {
	            s *= nns;
	        }
	        return~~s;
	    } else if (ff != (~~ff) || ff < 0) {
	        return Gamma(ff + 1);
	    }
	}
	this.bellb = function(x) {
	    if (x == ~~x && x < blln.length) {
	        return blln[x];
	    } else {
	        var sum = 0;
	        for (var inj = 0; inj < 5; inj++) {
	            sum += pow(inj, x) / fact(inj);
	        }
	        return sum / e;
	    }
	}

	/* Algorithms
	 */
	
	
	//Terribly Inaccurate. Ah well.
	this.getVertex = function(equation, start, end, precision){
		this.loopcounter++;
		if(Math.abs(end - start) <= precision) {
			this.loopcounter = 0;
			return (end + start) / 2;
		}
		if(this.loopcounter > 200) {
			this.loopcounter = 0;
			return false;
		}

		var interval = (end-start) / 40;
		var xval = start - interval;
		var prevanswer = startanswer = Parser.evaluate(equation, {x : xval});
		for(xval = start; xval <= end; xval += interval) {
			xval = this.roundFloat(xval);
			var answer = Parser.evaluate(equation, {x : xval});
			if((prevanswer > startanswer && answer < prevanswer) || (prevanswer < startanswer && answer > prevanswer)) {
				return this.getVertex(equation, xval - 2*interval, xval, precision);
			}
			prevanswer = answer;
		}
		this.loopcounter = 0;
		return false;
	}
	
	//Uses Newton's method to find the root of the equation. Accurate enough for these purposes.
	this.getRoot = function(equation, guess, range, shifted){
		dump(equation + ", guess: "+guess);
		//Newton's method becomes very inaccurate if the root is too close to zero. Therefore we just whift everything over a few units.
		if((guess > -0.1 || guess < 0.1) && shifted != true) {
			dump(equation.replace(/x/g, "(x+5)"));
			var answer = this.getRoot(equation.replace(/x/g, "(x+5)"), (guess - 5), range, true);
			dump(answer);
			if(answer !== false)
				return answer + 5;
			return false;
		}
		
		if(!range)
			var range = 5;
		
		var center = guess;
		var prev = guess;
		var j = 0;
		while (prev > center - range && prev < center + range && j < 100) {
			var xval = prev;
			var answer = Parser.evaluate(equation, {x : xval});
			
			if (answer > -this.eps && answer < this.eps) {
				return prev;
			}
			
			var derivative = this.getDerivative(equation, xval);
			if (!isFinite(derivative)) 
				break;
			
			dump(derivative);
			prev = prev - answer / derivative;
			j++;
		}
		dump("false: center at "+center+" but guess at "+prev);
		
		return false;
	}
	
	//Uses Newton's method for finding the intersection of the two equations. Actually very simple.
	this.getIntersection = function(equation1, equation2, guess, range){
		//dump("("+equation1 + ") - (" + equation2 + "); guess at "+guess);
		return this.getRoot("("+equation1 + ") - (" + equation2 + ")", guess, range);
	}

	this.getDerivative = function(equation, xval){
		/*
		 * This is a brute force method of calculating derivatives, using
		 * Newton's difference quotient (except without a limit)
		 * 
		 * The derivative of a function f and point x can be approximated by
		 * taking the slope of the secant from x to x+h, provided that h is sufficently
		 * small. However, if h is too small, then floating point errors may result.
		 * 
		 * This algorithm is an effective 100-point stencil in one dimension for
		 * calculating the derivative of any real function y=equation.
		 */
		var ddx = 0;
	
		//The suitable value for h is given at http://www.nrbook.com/a/bookcpdf/c5-7.pdf to be sqrt(eps) * x
		var x = xval;
		if(x > 1 || x < -1)
			var h = Math.sqrt(this.eps) * x;
		else
			var h = Math.sqrt(this.eps);
		
		var answerx = Parser.evaluate(equation, {x : xval});	//Find f(x)
		
		for(var i = 1; i <= 50; i++) {
			var diff = (h * i);
			
			//h is positive
			xval = x + diff;
			var answer = Parser.evaluate(equation, {x : xval});
			ddx += ((answer - answerx) / diff);
			
			//h is negative
			xval = x - diff;
			var answer = Parser.evaluate(equation, {x : xval});
			ddx += ((answerx - answer) / diff);
		}
	
		var ddx = ddx / 100;
		return ddx;
	}

	/* Utility functions
	 */

	this.roundToSignificantFigures = function (num, n) {
	    if(num == 0) {
	        return 0;
	    }

	    d = Math.ceil(Math.log10(num < 0 ? -num: num));
	    power = n - d;

	    magnitude = Math.pow(10, power);
	    shifted = Math.round(num*magnitude);
	    return shifted/magnitude;
	}

	this.parseEquation = function(input, recur) {
		if(this.eqcache[input])
			return this.eqcache[input];
		
		var equation = input;
		var newequation = "";
		var bracketdepth = 0;	//The depth of the braket
		var bracketstart = 0;	//Where the fuirst braket started
		var lastchar = "";
		var i = 0;

		for(i; i < equation.length; i++) {
			var currchar = equation[i];
			
			if(bracketdepth != 0) {
				if (currchar == "(") {
					bracketdepth++;
				}
				else if(currchar == ")") {
					bracketdepth--;
				}
				
				if(bracketdepth != 0)
					continue;
			}
			
			var newlength = newequation.length;
			if(currchar.match(/[a-zA-Z]/)) {	//letter
				if(lastchar == ")" || lastchar.match(/[0-9]/) || lastchar == "|" || lastchar == "x")
					newequation += "*";
				newequation += currchar;
			}

			if(currchar.match(/[0-9]/)) {	//number
				newequation += currchar;
			}

			if(currchar.match(/\./)) {	//decimal
				if(!lastchar.match(/[0-9]/))
					newequation += "0";
				newequation += currchar;
			}

			if(currchar.match(/[\*\/\-\+\%\^]/)) {	//operator
				newequation += currchar;
			}
			
			if(currchar == "(") {
				bracketdepth++;
				bracketstart = i;
			}
			
			if(currchar == ")") {
				bracketend = i;
				newequation += "(" + this.parseEquation(input.substr(bracketstart + 1, bracketend - bracketstart - 1), false) + ")";
			}
			
			if(currchar != " ")
				lastchar = currchar;
		}

		if(recur === true) {
			if(newequation.match(/\(/g)) {
				if(newequation.match(/\)/g)) {
					for(i=0;i<newequation.match(/\(/g).length - newequation.match(/\)/g).length;i++)	//append unclosed brackets
						newequation += ")";
				}
				else {
					for(i=0;i<newequation.match(/\(/g).length;i++)	//append unclosed brackets
						newequation += ")";
				}
			}
			
			this.eqcache[input] = newequation;
			dump(equation+" parsed as: "+newequation);
		}
		return newequation;
	}

	this.roundFloat = function(val) {	//Stupid flaoting point inprecision...
		return (Math.round(val * 100000000000) / 100000000000);
	}
}

Calc = new calc;