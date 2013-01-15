function JSgui() {
	this.currInput = 0;
	this.lineColors = {"#FF0000" : -1, "#0000FF" : -1, "#00FF00" : -1, "#FF00FF" : -1, "#00FFFF" : -1,
		"#000000" : -1, "#990000" : -1, "#000099" : -1, "#009900" : -1, "#999900" : -1, "#990099" : -1, "#009999" : -1};
	this.lineSettings = {0 : {color : "#FF0000"}};
	this.currtool = "pointer";
	this.currEq = 0;
	this.gridlines = "normal";
	this.settings = {};
	
	this.setQuality = function(q) {
		$("#quality_select a").removeClass("option_selected");
		q2 = String(q).replace(".", "");
		$("#quality_select_"+q2).addClass("option_selected");

		jsgcalc.quality = q;
		jsgcalc.draw();
	}

	this.setAngles = function(q) {
		$("#angle_select a").removeClass("option_selected");
		$("#angle_select_"+q).addClass("option_selected");

		Calc.angles = q;
		jsgcalc.draw();
	}

	this.selectEquation = function(x) {
		this.currEq = x;
		$("#graph_inputs div.graph_input_wrapper").removeClass("active_equation");
		$("#graph_input_wrapper_"+x).addClass("active_equation");
		jsgcalc.draw();
	}

	this.setTool = function(t) {
		$("#tool_select a").removeClass("toolbar_selected");
		$("#tool_select_"+t).addClass("toolbar_selected");
		
		//Toolbox
		$(".toolbox").hide();
		$("#toolbox_"+t).show();
		$("#toolbox_"+t).css("top", $("#tool_select_"+t).offset().top - 23);
		$("#toolbox_"+t).css("right", $(document).width() - $("#tool_select_"+t).offset().left + 5);
		
		this.currtool = t;
		jsgcalc.draw();
	}
	
	this.doTrace = function(xval) {
		jsgcalc.draw();
		jsgcalc.drawTrace(jsgcalc.getEquation(this.currEq), "#000000", xval);
	}

	this.setGridlines = function(t) {
		$("#gridlines_select a").removeClass("option_selected");
		$("#gridlines_select_"+t).addClass("option_selected");

		this.gridlines = t;
		jsgcalc.draw();
	}

	this.hideSidebar = function() {
		$("#sidewrapper").hide();
		$("#hideSidebar").hide();
		$("#showSidebar").show();
		$("#toolbar").css("right", "0px");
		jsgcalc.resizeGraph($("#wrapper").width() - widthPlusPadding("#toolbar"), $("#wrapper").height());
		
		this.setTool(this.currtool);
	}

	this.showSidebar = function() {
		$("#sidewrapper").show();
		$("#hideSidebar").show();
		$("#showSidebar").hide();
		$("#toolbar").css("right", "252px");
		jsgcalc.resizeGraph($("#wrapper").width() - $("#sidewrapper").width() - widthPlusPadding("#toolbar"), $("#wrapper").height());
		
		this.setTool(this.currtool);
	}
	
	this.updateInputData = function() {
		jsgcalc.lines = [];
		$("#graph_inputs div.graph_input_wrapper").each(function() {
			jsgcalc.lines.push({equation : $("input", this).val(), color : $(".graph_color_indicator", this).css('backgroundColor')});
		});
	}

	this.evaluate = function() {
		this.updateInputData();
		jsgcalc.draw();
		this.refreshInputs();
	}

	this.findAvailableColor = function() {
		for(var color in this.lineColors) {
			if(this.lineColors[color] == -1)
				return color;
		}
	}
	
	//Update gui values
	this.updateValues = function() {
		$("input.jsgcalc_xmin").val(Math.round(jsgcalc.currCoord.x1 * 1000) / 1000);
		$("input.jsgcalc_xmax").val(Math.round(jsgcalc.currCoord.x2 * 1000) / 1000);
		$("input.jsgcalc_ymin").val(Math.round(jsgcalc.currCoord.y1 * 1000) / 1000);
		$("input.jsgcalc_ymax").val(Math.round(jsgcalc.currCoord.y2 * 1000) / 1000);
	}

	this.addInput = function() {
		this.updateInputData();
		var newcolor = this.findAvailableColor();
		this.lineColors[newcolor] = this.currInput;
		jsgcalc.lines.push({
			equation: "",
			color: newcolor
		});
		this.currInput++;
		this.refreshInputs();
	}
	
	this.refreshInputs = function() {
		var equations = jsgcalc.lines;
		
		$("#graph_inputs").html("");
		for(i in equations) {
			$("#graph_inputs").append("<div id=\"graph_input_wrapper_"+i+"\" class=\"graph_input_wrapper\">"+
				"<div class=\"graph_color_indicator\" id=\"graph_color_indicator_"+i+"\"></div>"+
				"<div class=\"graph_equation_display\"><span>y =</span><input id=\"graph_input_"+i+"\" size=\"20\" value=\""+equations[i].equation+"\"/></div></div>");
			$("#graph_color_indicator_"+i).css("backgroundColor", equations[i].color);
			this.lineColors[equations[i].color] = i;
		}
		
		$("#graph_inputs div.graph_input_wrapper").each(function() {
			$(this).bind("click", function() {
				var id = $(this).attr("id");
				var num = String(id).replace("graph_input_wrapper_", "");
				jsgui.selectEquation(num);
			});
		});
		
		this.currInput = i + 1;
		
		$("#graph_input_wrapper_"+this.currEq).addClass("active_equation");
	}
	

}

jsgui = new JSgui;

$(document).ready(function() {
	jsgui.addInput();
	$(".toolbox_close a").click(function() {
		$(".toolbox").hide();
	})
	
	document.body.onselectstart = function () { return false; }
});
