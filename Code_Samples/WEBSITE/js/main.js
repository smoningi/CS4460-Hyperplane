/**
THIS FUNCTION IS CALLED WHEN THE WEB PAGE LOADS. PLACE YOUR CODE TO LOAD THE 
DATA AND DRAW YOUR VISUALIZATION HERE. THE VIS SHOULD BE DRAWN INTO THE "VIS" 
DIV ON THE PAGE.

This function is passed the variables to initially draw on the x and y axes.
**/
var margin = {top: 40, right: 20, bottom: 30, left: 40}; //this is an object aht has been created
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height,0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    
var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');
    
//http://bl.ocks.org/weiglemc/6185069

var circle;
var svg;

var xLabel = "kernelLength";
var yLabel = "kernelWidth";

var populationData = null;
var bingeData = null;
var liquorData = null;

var realData = {};

var selectedYear = 2007;

function init(){
    d3.csv('data/test.csv', convertPopulationToNum, function(err,data){        
        populationData = data;
        /*
        var state = d3.selectAll('path')
                    .attr('fill', function(d) {
                        return "steelblue";
                    });
        */
        if (isDataOkay()) {
            draw();
        }
    });
    
    d3.csv('data/liquor.csv', convertLiquorToNum, function(err,data){        
        liquorData = data;
        if (isDataOkay()) {
            draw();
        }
    });
    
    d3.csv('data/binge.csv', convertBingeToNum, function(err,data){        
        bingeData = data;
        if (isDataOkay()) {
            draw();
        }
    });
}

function isDataOkay() {
    return (populationData != null && liquorData != null && bingeData != null);
}

function draw() {
    d3.xml("data/custom.svg", "image/svg+xml", function(xml) {
        document.getElementById('vis').appendChild(xml.documentElement);

        //liquor data represents liquor stores per 10000 people
        //first loop through all of our states and init the data
        for (var i = 0; i < populationData.length; i++) {
            realData[populationData[i].State] = {
                name: populationData[i].State,
                2007: {
                    population: populationData[i].population2007,
                    liquor: "",
                    liquorCount: "",
                    binge: ""
                },
                2008: {
                    population: populationData[i].population2008,
                    liquor: "",
                    liquorCount: "",
                    binge: ""
                },
                2009: {
                    population: populationData[i].population2009,
                    liquor: "",
                    liquorCount: "",
                    binge: ""
                }, 
                2010: {
                    population: populationData[i].population2010,
                    liquor: "",
                    liquorCount: "",
                    binge: ""
                },
                2011: {
                    population: populationData[i].population2011,
                    liquor: "",
                    liquorCount: "",
                    binge: ""
                }
            };
            
            realData[populationData[i].State][2007].population = populationData[i].population2007;
            realData[populationData[i].State][2008].population = populationData[i].population2008;
            realData[populationData[i].State][2009].population = populationData[i].population2009;
            realData[populationData[i].State][2010].population = populationData[i].population2010;
            realData[populationData[i].State][2011].population = populationData[i].population2011;
        }
        
        //loop through our liquor store data and save it
        for (var i = 0; i < liquorData.length; i++) {
            var temp = 0;
            if (+liquorData[i].Year >= 2007 && +liquorData[i].Year <= 2011) {
                realData[liquorData[i].State][+liquorData[i].Year].liquor = liquorData[i].LiquorRatio;
                realData[liquorData[i].State][+liquorData[i].Year].liquorCount = liquorData[i].LiquorRatio * realData[liquorData[i].State][+liquorData[i].Year].population;
            }
        }
        
        //loop through our binge data and save it
        for (var i = 0; i < bingeData.length; i++) {
            var temp = 0;
            if (+bingeData[i].Year >= 2007 && +liquorData[i].Year <= 2011) {
                realData[bingeData[i].State][+bingeData[i].Year].binge = bingeData[i].ExcessiveDrinkingPercent;
            }
        }
        
        //find the maximum value for pop
        var maxPopulation = realData['AL'][selectedYear].population;
        for (var x in realData) {
            //console.log("LOOP 1: ", realData[x]);
            if (realData[x][selectedYear].population > maxPopulation) 
                maxPopulation = realData[x][selectedYear].population;
        }
        
        //find the maximum value for the liquor 
        var maxLiquor = realData['AL'][selectedYear].liquor;
        for (var x in realData) {
            if (realData[x][selectedYear].liquor > maxLiquor) 
                maxLiquor = realData[x][selectedYear].liquor;
        }
        
        //find the maximum value for the binge 2007
        var maxBinge = realData['AL'][selectedYear].binge;
        for (var x in realData) {
            if (realData[x][selectedYear].binge > maxBinge) 
                maxBinge = realData[x][selectedYear].binge;
        }
        
        //find the maximum value for the liquor stores- CALCULATED
        var maxLiquorCount = realData['AL'][selectedYear].liquorCount;
        for (var x in realData) {
            if (realData[x][selectedYear].liquorCount > maxLiquorCount) 
                maxLiquorCount = realData[x][selectedYear].liquorCount;
        }
        
        console.log(realData);

        for (var i = 0; i < 8; i++) {
            //put in a scale for the base color
            d3.select('#map')
            .append("rect")
                .attr('x',560+16*i)
                .attr('y',516)
                .attr('width', 16)
                .attr('height', 16)
                .style('fill', colorCalc(maxPopulation/8 * i, maxPopulation, 1, 0, 0));
            
            //put in a scale for the hatches
            var crossHatchVal = +widthCalc(maxBinge/8 * i, maxBinge, 50);
            var crossHatchG = d3.select('#map')
                .append('defs')
                .append('pattern')
                    .attr('id', 'hatchScale' + i)
                    .attr('patternUnits', 'userSpaceOnUse')
                    .attr('x', 0)
                    .attr('y',0)
                    .attr('width', crossHatchVal)
                    .attr('height', crossHatchVal)
                .append('g')
                    .style('fill', 'green')
                    .style('stroke', colorCalcLines(maxBinge/8 * i, maxBinge))
                    .style('stroke-width', +widthCalc(maxBinge/8 * i, maxBinge, 4));
                      
            crossHatchG.append('path')
                .attr('d',"M0,0 l" + crossHatchVal +","+crossHatchVal)
            crossHatchG.append('path')
                .attr('d', "M"+crossHatchVal+",0 l-"+crossHatchVal+","+crossHatchVal);
            
            
            //add bg for hatch scale
            d3.select('#map')
            .append("rect")
                .attr('x', 560+16*i)
                .attr('y', 550)
                .attr('width', 16)
                .attr('height', 16)
                .style('fill', 'rgb(200,200,200)');
            
            //add in hatch scale
            d3.select('#map')
            .append("rect")
                .attr('x', 560+16*i)
                .attr('y', 550)
                .attr('width', 16)
                .attr('height', 16)
                .style('fill', 'url(#hatchScale' + i + ')');
        }

        //add text labels for scale
        //scale 1 text
        var svgMap = document.getElementsByTagName('svg')[0];
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
        newElement.setAttribute("y", 516); 
        newElement.setAttribute("x", 560); 
        newElement.setAttribute("fill", "blue"); 
        newElement.textContent = '0';
        svgMap.appendChild(newElement);
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
        newElement.setAttribute("y", 516); 
        newElement.setAttribute("x", 560+16*8); 
        newElement.setAttribute("fill", "blue"); 
        newElement.setAttribute("text-anchor", "end");
        newElement.textContent = maxPopulation;
        svgMap.appendChild(newElement);
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
        newElement.setAttribute("y", 528); 
        newElement.setAttribute("x", 560); 
        newElement.setAttribute("fill", "blue"); 
        newElement.setAttribute("text-anchor", "end");
        newElement.textContent = "Population: ";
        svgMap.appendChild(newElement);
        //scale 2 text
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
        newElement.setAttribute("y", 550); 
        newElement.setAttribute("x", 560); 
        newElement.setAttribute("fill", "blue"); 
        newElement.textContent = '0';
        svgMap.appendChild(newElement);
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
        newElement.setAttribute("y", 550); 
        newElement.setAttribute("x", 560+16*8); 
        newElement.setAttribute("fill", "blue"); 
        newElement.setAttribute("text-anchor", "end");
        newElement.textContent = maxBinge.toFixed(2)*100 + "%";
        svgMap.appendChild(newElement);
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
        newElement.setAttribute("y", 558); 
        newElement.setAttribute("x", 558); 
        newElement.setAttribute("fill", "blue"); 
        newElement.setAttribute("text-anchor", "end");
        newElement.textContent = "Excessive Drinking ";
        svgMap.appendChild(newElement);
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
        newElement.setAttribute("y", 568); 
        newElement.setAttribute("x", 560); 
        newElement.setAttribute("fill", "blue"); 
        newElement.setAttribute("text-anchor", "end");
        newElement.textContent = "Percentage: ";
        svgMap.appendChild(newElement);
        
        for (var x in realData) {
            d3.selectAll('#' + realData[x].name)
                .attr('fill', function() {
                    return (colorCalc(realData[x][selectedYear].liquorCount, maxLiquorCount,1,0,0));
                })
                //HERE IS THE CODE FOR HATCH: 
                /*<defs>
                <pattern id="hatch00" patternUnits="userSpaceOnUse"
                              x="0" y="0" width="10" height="10">
                  <g style="fill:none; stroke:black; stroke-width:1">
                    <path d="M0,0 l10,10"/>
                    <path d="M10,0 l-10,10"/>
                  </g>
                </pattern>
                </defs>*/
                //END CODE FOR HATCH
                //.style('fill', 'url(#hatch00)')
                .attr('stroke', function() {
                    return (colorCalcLines(realData[x][selectedYear].binge, maxBinge));
                })
                .attr('stroke-width', function() {
                    //console.log(realData[x][2007].binge/maxBinge2007 * 10);
                    return ((realData[x][selectedYear].binge/maxBinge) * 10);
                });
            
            var crossHatchVal = +widthCalc(realData[x][selectedYear].binge, maxBinge, 50);
            
            var crossHatchG = d3.select('#map')
                .append('defs')
                .append('pattern')
                    .attr('id', 'hatch' + realData[x].name)
                    .attr('patternUnits', 'userSpaceOnUse')
                    .attr('x', 0)
                    .attr('y',0)
                    .attr('width', crossHatchVal)
                    .attr('height', crossHatchVal)
                .append('g')
                    .style('fill', 'green')
                    .style('stroke', colorCalcLines(realData[x][selectedYear].binge, maxBinge))
                    .style('stroke-width', +widthCalc(realData[x][selectedYear].binge, maxBinge, 4));
                    
            crossHatchG.append('path')
                .attr('d',"M0,0 l" + crossHatchVal +","+crossHatchVal)
            crossHatchG.append('path')
                .attr('d', "M"+crossHatchVal+",0 l-"+crossHatchVal+","+crossHatchVal);
            
            //TODO: BEGIN TO BUILD THE HEX PATTERN HERE:
            /*
            
                        <pattern id="hatch00" patternUnits="userSpaceOnUse"
                              x="0" y="0" width="10" height="10">
                  <g style="fill:none; stroke:green; stroke-width:1">
                    <path d="M0,0 l10,10"/>
                    <path d="M10,0 l-10,10"/>
                  </g>
                </pattern>
            */
            
            var d = realData[x].name;
            
            d3.selectAll('#overlay_' + realData[x].name)
                .attr('fill', 'url(#hatch' + realData[x].name + ')')
                .on('mouseover', function(d) {
                        var trueID = (this.id).replace("overlay_", "");
                        console.log('test ' + trueID);
                        var returnStr = "";
                        returnStr += "State: " + realData[trueID].name + "<br/>";
                        returnStr += selectedYear + " Population: " + realData[realData[trueID].name][selectedYear].population + "<br/>";
                        returnStr += selectedYear + " Liquor stores per X: " + realData[realData[trueID].name][selectedYear].liquor + "<br/>";
                        returnStr += selectedYear + " Liquor store total: " + realData[realData[trueID].name][selectedYear].liquorCount.toFixed(2) + "<br/>";
                        returnStr += selectedYear + " Excessive Drinkning Percentage: " + realData[realData[trueID].name][selectedYear].binge + "<br/>";
                        showDetails(returnStr);
                    });
                
            var statePath = document.getElementById(realData[x].name)
            if (statePath != null) {
                var stateBBox = statePath.getBBox()

                var svgMap = document.getElementsByTagName('svg')[0];
                
                var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
                newElement.setAttribute("y", stateBBox.y + stateBBox.height/2); 
                newElement.setAttribute("x", stateBBox.x + stateBBox.width/2); 
                newElement.setAttribute("fill", "blue"); 
                newElement.textContent = realData[x].name;
                svgMap.appendChild(newElement);
            }
        }
        
    });
}


function colorCalc(value, max, r, g , b) {
    var r  = Math.round(256 * (value / max)) * r;
    var g = Math.round(256 * (value / max)) * g;
    var b = Math.round(256 * (value / max)) * b;
    return "rgb(" + r + "," + g + "," + b + ")";
}

function colorCalcLines(value, max) {
    var r = Math.round(256 * (value / max));
    var g = 256 - Math.round(256 * (value / max));
    var b = 0;
    
    return "rgb(" + r + "," + g + "," + b + ")";

}

function widthCalc(value, max, maxDimension) {
    var width = Math.round(maxDimension * (value / max));
    return width;
}

/**
## onXAxisChange(value)
This function is called whenever the menu for the variable to display on the
x axis changes. It is passed the variable name that has been selected, such as
"compactness". Populate this function to update the scatterplot accordingly.
**/
function onXAxisChange(value){
    d3.select("svg").remove();
    selectedYear = value;
    draw();
}


/**
## onYAxisChange(value)
This function is called whenever the menu for the variable to display on the
y axis changes. It is passed the variable name that has been selected, such as
"Asymmetry Coefficient". Populate this function to update the scatterplot 
accordingly.
**/
function onYAxisChange(value){

}

/**
## showDetails(string)
This function will display details in the "details" box on the page. Pass in 
a string and it will be displayed. For example, 
    showDetails("Variety: " + item.variety);
**/
function showDetails(string){
    d3.select('#details').html(string);
}

function candidate_id_decoder(president){	
	// Decode president name based on codes
	// because our data doesn't just give us their names
	if(president == '1701'){
		return 'McCain';
	}
	else if(president == '1918') {
		return 'Obama';
	}
	else {
		return false;
	}
}

function convertPopulationToNum(d) {
    d.population2007 = Number(d.population2007);
    d.population2008 = Number(d.population2008);
    d.population2009 = Number(d.population2009);
    d.population2010 = Number(d.population2010);
    d.population2011 = Number(d.population2011);
    return d;
}

function convertLiquorToNum(d) {
    d.LiquorRatio = parseFloat(d.LiquorRatio);
    return d;
}

function convertBingeToNum(d) {
    d.ExcessiveDrinkingPercent = parseFloat(d.ExcessiveDrinkingPercent);
    return d;
}

