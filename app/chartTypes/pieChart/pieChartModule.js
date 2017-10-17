(function() { 
"use strict";

angular.module("AnalyticsApp").factory('PieChartModule', PieChartModule);
//PieChartModule.$inject = ["$http", "$q"];

function PieChartModule() {
	return function(params) {
		var self = this;

		this.currentElement = params.currentElement;
		this.d3 = params.d3Lib
		this.dataSet = params.dataSet;

		// SVG Properties
		this.svg = null;
		this.totalWidth = params.totalWidth;
		this.totalHeight = params.totalHeight;
		this.padding = params.padding;
		this.backgroundColor = params.backgroundColor;
		this.svgWidth = 0;		// the pixel width of the SVG
		this.svgHeight = 0;		// the pixel height of the SVG
		this.radius = 0;
		this.outerRadius = 0;

		// drawing properties
		this.arcGroup = null;
		this.textGroup = null;
		this.total = 0;
		this.color = null;
		this.arc = null;
		this.textArc = null;
		this.pie = null;

		this.createSVG = createSVG;
		this.clearGraph = clearGraph;

		this.setDataSet = setDataSet;

		this.calcSVGWidth 		= calcSVGWidth;
		this.calcSVGHeight 		= calcSVGHeight;
		this.calcRadius 		= calcRadius;
		this.calcOuterRadius 	= calcOuterRadius;

		this.formatDataAndGetTotal = formatDataAndGetTotal;

		this.createArcGroups 	= createArcGroups;
		this.createTextGroups 	= createTextGroups;

		this.setGraphColor 		= setGraphColor;
		this.setArcValue 		= setArcValue;
		this.setTextArcValue 	= setTextArcValue;
		this.setPie				= setPie;

		this.drawArcs 			= drawArcs;
		this.drawLabels 		= drawLabels;
		this.drawValues			= drawValues;


		function createSVG() { 
		    // Set up the SVG drawing element upon which D3 draws upon
			self.svg = self.d3.select(self.currentElement)
						.append("svg")
						.style("width", self.totalWidth)
						.style("height", self.totalHeight + "px")
						.style("padding", self.padding)
						.style("background-color", self.backgroundColor);

		}

		function clearGraph() 		{ self.svg.selectAll("*").remove(); }

		function setDataSet(data) 	{ self.dataSet = data; }
		function formatDataAndGetTotal() 		{ 
		    self.total = 0;
		    for(var index in self.dataSet) {
		    	if(isNaN(self.dataSet[index].value) ) { continue; }
		    	self.total += self.dataSet[index].value; 
		    }
		}

		function calcSVGWidth() 	{ self.svgWidth = parseInt(self.svg.style("width"), 0); }
		function calcSVGHeight() 	{ self.svgHeight = parseInt(self.svg.style("height"), 0); }
		function calcRadius() 		{ self.radius = (self.svgHeight < self.svgWidth) ? (self.svgHeight * .38) : (self.svgWidth * .38); }
		function calcOuterRadius() 	{ self.outerRadius = self.radius * 1.3; }

		function createArcGroups() 	{ 
			self.arcGroup = self.svg.data([self.dataSet])
    			.append("g")                
        		.attr("transform", "translate(" + (self.svgWidth / 2) + "," + (self.svgHeight / 2) + ")") ;
        }
		function createTextGroups() { 
	    	self.textGroup = self.svg.data([self.dataSet])
				.append("g")                
	    		.attr("transform", "translate(" + (self.svgWidth / 2) + "," + (self.svgHeight / 2) + ")") ;
	   	}

		function setGraphColor() 		{ self.color 	= self.d3.scale.category20(); }
		function setArcValue() 			{ self.arc 		= self.d3.svg.arc().outerRadius(self.radius); }
		function setTextArcValue() 		{ self.textArc 	= self.d3.svg.arc().outerRadius(self.outerRadius); }
		function setPie() 				{ self.pie 		= self.d3.layout.pie().value(function(d) { return d.value; }); }

		function drawArcs() 			{ 
		    var arcs = self.arcGroup.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
		        .data(self.pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
		        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
		        .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
		        .attr("class", "slice");    //allow us to style things in the slices (like text)

		        arcs.append("svg:path")
		            .attr("fill", function(d, i) { return self.color(i); } ) //set the color for each slice to be chosen from the color function defined above
		            .attr("d", self.arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function
		        
		        if(self.radius > 85) {
			        arcs.append("svg:text")
			        	.attr("class", "percentage")
			        	.attr("class", "bold")
		                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
			                //we have to make sure to set these before calling arc.centroid
			                d.innerRadius = 20;
			                d.outerRadius = self.radius;
			                return "translate(" + self.arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
			            })
			            .attr("text-anchor", "middle")                          //center the text on it's origin
			            .text(function(d, i) { 
			            	var percentage = Math.round((self.dataSet[i].value / self.total) * 100); 
			            	return (percentage > 2) ? percentage + "%" : ""; 
			            });        //get the label from our original data array
		        }	
		}

		function drawLabels() { 
	        self.textGroup.selectAll("text.label")
	        	.data(self.pie(self.dataSet))
	        	.enter()
	        	.append("svg:text")                                 // add a label to each slice
	        	.attr("class", "label")
                .attr("transform", function(d) {                    // set the label's origin to the center of the arc
	                // we have to make sure to set these before calling arc.centroid
	                d.innerRadius = self.radius;
	                d.outerRadius = self.outerRadius;
	                return "translate(" + self.textArc.centroid(d) + ")";        // this gives us a pair of coordinates like [50, 50]
	            })
	            .attr("text-anchor", "middle")                      // center the text on it's origin
	            .text(function(d, i) { 
	            	var percentage = Math.round((self.dataSet[i].value / self.total) * 100); 
	            	return (percentage > 2) ? self.dataSet[i].label : ""; 
	            });        // get the label from our original data array
		}

		function drawValues() { 
	        self.textGroup.selectAll("text.value")
	        	.data(self.pie(self.dataSet))
	        	.enter()
	        	.append("svg:text")                                 //add a label to each slice
	        	.attr("class", "value")
	        	.attr("class", "bold")
	        	.attr("dy", 16)
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
	                //we have to make sure to set these before calling arc.centroid
	                d.innerRadius = self.radius;
	                d.outerRadius = self.outerRadius;
	                return "translate(" + self.textArc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
	            })
	            .attr("text-anchor", "middle")                          //center the text on it's origin
	            .text(function(d, i) { 
	            	var percentage = Math.round((self.dataSet[i].value / self.total) * 100); 
	            	return (percentage > 2) ? self.dataSet[i].value : ""; 
	            });        //get the label from our original data array
		}

	}
}

})();