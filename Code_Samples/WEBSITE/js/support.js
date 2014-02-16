/**
THIS PAGE CONTAINS CODE TO HOOK UP SOME THINGS BEHIND THE SCENES. YOU SHOULD NOT
NEED TO MODIFY IT. PLACE YOUR CODE IN MAIN.JS
**/
function onload(){
    var INIT_X_VAR = "2007";
    var INIT_Y_VAR = "kernelWidth";

    function getXAxisVal(){
    	var val = null
    	d3.selectAll('#x-axis-select option').each(function(){
    		if(this.selected){ val = this.value; }
    	});
    	return val;
    }

    function getYAxisVal(){
    	var val = null;
    	d3.selectAll('#y-axis-select option').each(function(){
    		if(this.selected){ val = this.value; }
    	});
    	return val;
    }

    function configSelects(xAxisVal, yAxisVal){
    	// Hide the selection of the opposite axis
    	d3.selectAll('#x-axis-select option').classed("hidden", function(){
    		return this.value == yAxisVal;
    	});
    	d3.selectAll('#y-axis-select option').classed("hidden", function(){
    		return this.value == xAxisVal;
    	}); 
    }
    
    // Set the initial state of the configuration dropdowns
    document.querySelector('#x-axis-select option[value="' + INIT_X_VAR + '"]').selected = true;
    configSelects(getXAxisVal(), getYAxisVal());

    // Configure the change() handler
    d3.select('#x-axis-select').on('change', function(){
    	var value = getXAxisVal();
    	configSelects(value, getYAxisVal());
    	onXAxisChange(value);
    });
    d3.select('#y-axis-select').on('change', function(){
    	var value = getYAxisVal();
		configSelects(value, getYAxisVal());
		onYAxisChange(value);
    });

    // Call the init() code
    init(getXAxisVal(), getYAxisVal());
}
