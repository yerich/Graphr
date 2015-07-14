/**
 * This file handles math calculations
 */

//Machine epsilon
function calcEps(){
	var temp1, temp2, mchEps;
	temp1 = 1.0;
	do {
		mchEps = temp1;
		temp1 /= 2;
		temp2 = 1.0 + temp1;
	}
	while (temp2 > 1.0);
	return mchEps;
}

var Calc = {};

function calc() {
	this.eqcache = new Object;
	this.angles = 'radians';
	this.loopcounter = 0;
	this.eps = calcEps();	//Machine epsilon - the maximum expected floating point error

	/* Basic Math Functions (sin, cos, csc, etc.)
	 */

	//This will take a number and covert it to radians, based on the current setting
	this.convAngles = function(value) {
		if(this.angles === 'degrees')
			return value*(Math.PI/180);
		if(this.angles === 'gradians')
			return value*(Math.PI/200);
		return value;
	};

	//This will take a radian value and convert it to the proper unit, based on the current setting
	this.convRadians = function(value) {
		if(this.angles === 'degrees')
			return (value * 180 / Math.PI);
		if(this.angles === 'gradians')
			return (value * 200 / Math.PI);
		return value;
	};

    var replacements = {};
    _(['sin', 'cos', 'tan', 'sec', 'cot', 'csc']).each(function(name) {
        var fn = math[name]; // the original function
        replacements[name] = function replacement(x) {
            return fn(Calc.convAngles(x));
        };
    });

    _(['asin', 'acos', 'atan', 'atan2']).each(function(name) {
        var fn = math[name]; // the original function
        replacements[name] = function replacement(x) {
            return Calc.convertRadians(fn(x));
        };
    });

    // import all replacements into math.js, override existing trigonometric functions
    math.import(replacements, {override: true});

	/* Algorithms
	 */

    //Terribly Inaccurate. Ah well.
	this.getVertex = function(f, start, end, precision){
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
		var prevanswer = startanswer = f(xval);
		for(xval = start; xval <= end; xval += interval) {
			xval = this.roundFloat(xval);
			var answer = f(xval);
			if((prevanswer > startanswer && answer < prevanswer) || (prevanswer < startanswer && answer > prevanswer)) {
				return this.getVertex(f, xval - 2*interval, xval, precision);
			}
			prevanswer = answer;
		}
		this.loopcounter = 0;
		return false;
	};

	//Uses Newton's method to find the root of the equation. Accurate enough for these purposes.
	this.getRoot = function(equation, guess, range, shifted){
        var expr = math.parse(equation);
        var variables = this.variablesInExpression(expr);

		dump(equation + ', guess: ' + guess);
		//Newton's method becomes very inaccurate if the root is too close to zero. Therefore we just whift everything over a few units.
		if((guess > -0.1 && guess < 0.1) && shifted != true) {
            var replacedEquation = equation;

            if (variables.length > 0) {
              var v = variables[0];
              replacedEquation = replacedEquation.replace(new RegExp('\\b' + v + '\\b', 'g'), '(' + v + '+5)');
            }

			dump('Replaced equation = ' + replacedEquation);
			var answer = this.getRoot(replacedEquation, (guess - 5), range, true);
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

        var code = expr.compile(math);
        var variables = this.variablesInExpression(expr);

        var f = function (x) {
            var scope = {};

            _(variables).each(function (name) {
               scope[name] = x;
            });

           return code.eval(scope);
        };

		while (prev > center - range && prev < center + range && j < 100) {
			var xval = prev;
			var answer = f(xval);

			if (answer > -this.eps && answer < this.eps) {
				return prev;
			}

			var derivative = this.getDerivative(f, xval);
			if (!isFinite(derivative))
				break;

			//dump('d/dx = ' + derivative);
			prev = prev - answer / derivative;
			j++;
		}

		if (j >= 100) {
            dump('Convergence failed, best root = ' + prev);
            return prev;
		}

		dump('false: center at ' + center + ' but guess at ' + prev);

		return false;
	};

	//Uses Newton's method for finding the intersection of the two equations. Actually very simple.
	this.getIntersection = function(equation1, equation2, guess, range){
		//dump("("+equation1 + ") - (" + equation2 + "); guess at "+guess);
		return this.getRoot('(' + equation1 + ') - (' + equation2 + ')', guess, range);
	}

	this.getDerivative = function(f, xval){
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

		var answerx = f(x);
		for(var i = 1; i <= 50; i++) {
			var diff = (h * i);
            var inverseDiff = 1 / diff;

			//h is positive
			xval = x + diff;
			var answer =  f(xval);
			ddx += (answer - answerx) * inverseDiff;

			//h is negative
			xval = x - diff;
			answer = f(xval);
			ddx += (answerx - answer) * inverseDiff;
		}

		return ddx / 100;
	};

	/* Utility functions
	 */
	this.variablesInExpression = function (expr) {
      var obj = {};

      expr.traverse(function (node) {
        if ((node.type === 'SymbolNode') && (math[node.name] === undefined)) {
          obj[node.name] = true;
        }
      });

      return Object.keys(obj).sort();
    };

    this.makeFunction = function (equation) {
       var expr = math.parse(equation);
       var code = expr.compile(math);
       var variables = Calc.variablesInExpression(expr);

       return function (x) {
         var scope = {};

         _(variables).each(function (name) {
            scope[name] = x;
         });

         return code.eval(scope);
       };
    };

	this.roundToSignificantFigures = function (num, n) {
	    if(num === 0) {
	        return 0;
	    }

	    d = Math.ceil(math.log10(num < 0 ? -num: num));
	    power = n - d;

	    magnitude = Math.pow(10, power);
	    shifted = Math.round(num*magnitude);
	    return shifted/magnitude;
	};

	this.roundFloat = function(val) {	//Stupid flaoting point inprecision...
		return (Math.round(val * 100000000000) / 100000000000);
	};
}

Calc = new calc();
