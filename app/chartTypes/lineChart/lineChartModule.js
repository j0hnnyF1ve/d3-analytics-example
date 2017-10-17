(function() { 
"use strict";

angular.module("AnalyticsApp").factory('LineChartModule', [function() {
	return LineChartModule;
}]);

function LineChartModule(params) {
	var self = this;

	this.currentElement = params.currentElement;
	this.d3 = params.d3Lib
	this.dataSet = params.dataSet;

	// SVG Properties
	this.svg = null;
	this.width = params.totalWidth;
	this.height = params.totalHeight;
	this.margin = params.currentMargin;

	this.initialize = function() { 
		this.XOFFSET = 80;
		this.YOFFSET = 25;
		this.MINTICKWIDTH = 75;
		this.CHARSIZE = 10;

		this.xTicks = [];
		this.currentWidth = 0; 
		this.xLength = 0;
		this.yLabel = params.yLabel;
		this.graphWidth = 0;
		this.graphHeight = 0;
		this.x = 0;
		this.y = 0;

		this.startLine = null;
		this.chartLine = null;
	}

	this.setDataSet = setDataSet;
	this.createSVG = createSVG;
	this.clearGraph = clearGraph;
	this.setXTicks = setXTicks;
	this.clearXTicks = clearXTicks;

	this.setCurrentWidth = setCurrentWidth;
	this.formatData = formatData;

	this.setGraphDimensions = setGraphDimensions;
	this.setX = setX;
	this.setY = setY;
	this.setXAxis = setXAxis;
	this.setYAxis = setYAxis;

	this.setBaseline = setBaseline;
	this.setChartLine = setChartLine;



	function setDataSet(data) { self.dataSet = data; }
	function createSVG() { 
	    // Set up the SVG drawing element upon which D3 draws upon
		self.svg = self.d3.select(self.currentElement)
					.append("svg")
					.style("width", self.width)
					.style("height", self.height + "px")
//						.style("padding", "25px 0px 25px 45px")
					.style("background-color", "#ececec");

	}
	function clearGraph() { self.svg.selectAll("*").remove(); }
	
	// Populate the x-tick values that will be sitting on the x-axis
	// This ensures that the ticks on the x-axis don't get bunched together
	// by specifying a minimum width for the ticks
	function setXTicks() { 
		var xLength = self.currentWidth / self.dataSet.length;
		var curLength = 0;
		if(self.currentWidth / self.dataSet.length < self.MINTICKWIDTH) {

			for(var i=0; i < self.dataSet.length; i++) { 
				curLength += xLength;
				if(curLength >= self.MINTICKWIDTH) {
					if(self.dataSet[i].time) { self.xTicks.push(new Date(self.dataSet[i].time) ); }
					else if(self.dataSet[i].name) { self.xTicks.push(self.dataSet[i].name); }
					curLength = 0;
				}
			}
		}
		else {
			for(var i=0; i < self.dataSet.length; i++) { 
				if(self.dataSet[i].time) { self.xTicks.push(new Date(self.dataSet[i].time) ); }
				else if(self.dataSet[i].name) { self.xTicks.push(self.dataSet[i].name); }
			}
		}
	}
	function clearXTicks() { self.xTicks = []; }
	function setCurrentWidth() { self.currentWidth = self.d3.select(self.currentElement).node().offsetWidth - self.margin; }

	// data formatting function
	function formatData() { 
		var largestValue = 0;
		self.dataSet.forEach(function(d) {
			if(d.time) { 
				d.dataTime = new Date(d.time);
			}
			d.value = +d.value;
			if(d.value > largestValue) { largestValue = d.value; }
		});
		self.XOFFSET = (largestValue.toString().length * self.CHARSIZE) + 10;
	}

	// Width & Height of the graph
	function setGraphDimensions() {
		self.graphWidth = self.currentWidth - self.margin;
		self.graphHeight = self.height - 50;
	}

	// Setup the scale that is used to draw the graph, elements will be graphed 
	// in proportion to their placement on the range of the scale
	// X is always based on time
	// Y is always based on numeric values
	function setX() { 
		self.x = self.d3.time.scale().range([self.XOFFSET, self.graphWidth]); 
		
		// Set the domain of the x-axis to values in d.dataTime or d.name
		self.x.domain(self.d3.extent(self.dataSet, function(d) { 
			return (d.dataTime) ? d.dataTime : d.name; 
		}));
	}
	function setY() { 
		self.y = self.d3.scale.linear().range([self.graphHeight, self.YOFFSET]); 

		// Set the domain of the y-axis to the d.value
		self.y.domain(self.d3.extent(self.dataSet, function(d) { return d.value; }));
	}

	// Set the x-axis by using the values in xTicks
	function setXAxis() { 
		self.xAxis = self.d3.svg.axis()
		    .scale(self.x)
		    //.ticks(10)
		    .tickValues(self.xTicks)
		    .orient("bottom");

		// If data consists of dates, format values on the xAxis as dates
		if(self.dataSet[0].time) {
			self.xAxis.ticks(self.d3.time.day)
			.tickFormat(self.d3.time.format("%b %d"));
		}
	}

	// Set the y-axis using the values of the dataset
	function setYAxis() { 
		self.yAxis = self.d3.svg.axis()
		    .scale(self.y)
		    .orient("left");
	}

	// Set the baseline of the line chart
	function setBaseline() { 
		self.startLine = self.d3.svg.line()
		    .x(function(d) { return 0; })
		    .y(function(d) { return self.graphHeight; });
	}
	// Set up the line that will be drawn on the chart
	function setChartLine() { 
		self.chartLine = self.d3.svg.line()
		    .x(function(d) { return (d.dataTime) ? self.x(d.dataTime) : self.x(d.name); })
		    .y(function(d) { return self.y(d.value); });
	}



	this.drawXAxis = drawXAxis;
	this.drawYAxis = drawYAxis;
	this.drawLineChart = drawLineChart;
	this.drawLinePlots = drawLinePlots;
	this.drawLabels = drawLabels;

	// Draw the x-axis by using the values in xTicks
	function drawXAxis() { 
		self.svg.append("g")
	        .attr("class", "x axis")
	        .attr("transform", "translate(0," + (self.height - 50) + ")")
	        .call(self.xAxis)
	}

	// Draw the y-axis using the values of the dataset
	function drawYAxis() { 
		self.svg.append("g")
		    .attr("class", "y axis")
	        .attr("transform", "translate("+self.XOFFSET+",0)")
		    .call(self.yAxis)
/*
// optional y-axis label
// TODO: position it properly
		.append("text")
//					.attr("transform", "translate("+(self.yLabel.length*self.CHARSIZE)+",0)")
		    .attr("transform", "rotate(-90)")
		    .attr("y", 6)
		    .attr("dy", ".71em")
		    .style("text-anchor", "end")
		    .text(self.yLabel);
*/
	}

	// Draw the line chart
	function drawLineChart() { 
		self.svg.append("path")
		    .datum(self.dataSet)
		    .attr("class", "line")
			.attr("d", self.chartLine);
	}

	// Draw the line plots on the chart
	function drawLinePlots() { 
		self.svg.selectAll("circle")
			.data(self.dataSet)
			.enter()
			.append("circle")
			.attr({
				"cx": function(d) { return (d.dataTime) ? self.x(d.dataTime) : self.x(d.name); },
				"cy": function(d) { return self.y(d.value); },
				"r": 3
			});

	}

	// Draw the text labels of the line plots
	function drawLabels() { 
		self.svg.selectAll("text.value")
			.data(self.dataSet)
			.enter()
			.append("text")
			.attr({
				"x": function(d) { return (d.dataTime) ? self.x(d.dataTime) + 8 : self.x(d.name); },
				"y": function(d) { return self.y(d.value) - 2; },
			})
			.text(function(d) { return self.d3.format('0,000')(d.value); } );
	}
}

})();