(function() {
"use strict";

angular.module("AnalyticsApp").factory('BarChartModule', BarChartModule);
BarChartModule.$inject = ["$filter"];

function BarChartModule($filter){

	return function(params) {
		var self = this;

		this.currentElement = params.currentElement;
		this.d3 = params.d3Lib
		this.dataSet = params.dataSet;

		// SVG Properties
		this.svg = null;
		this.svgWidth = params.totalWidth;
		this.svgHeight = params.totalHeight;
		this.margin = params.currentMargin;

		// drawing properties
		this.rangeWidth = 0;
		this.barHeight = params.barHeight;
		this.barPadding = params.barPadding;

		this.color = null;
		this.rectangles = null;
		this.text1 = null;
		this.text2 = null;

		this.initialize = function(hasTransition) {
			this.hasTransition = hasTransition;
		}

		// methods
		this.clearGraph = clearGraph;
		this.createSVG = createSVG;
		this.setDataSet = setDataSet;
		this.setRangeWidth = setRangeWidth;
		this.setCurrentHeight = setCurrentHeight;
		this.setColor = setColor;

		this.setXScale = setXScale;
		this.setSVGHeight = setSVGHeight;

		this.setRectangles = setRectangles;
		this.setText = setText;

		this.drawText = drawText;
		this.drawRectangles = drawRectangles;

		function clearGraph() { self.svg.selectAll("*").remove(); }
		function createSVG() {
		    // Set up the SVG drawing element upon which D3 draws upon
			self.svg = self.d3.select(self.currentElement)
						.append("svg")
						.style("width", self.svgWidth)
						.style("height", self.svgHeight + "px")
						.style("padding", "5px")
						.style("background-color", "#ececec");

		}
		function setDataSet(data) { self.dataSet = data; }

		function setRangeWidth() {
			self.rangeWidth = self.d3.select(self.currentElement).node().offsetWidth - self.margin;
		}
		function setCurrentHeight() { self.currentHeight = self.dataSet.length * (self.barHeight + self.barPadding); }
		function setColor() { self.color = self.d3.scale.category20(); }


		function setXScale() {
			self.xScale = self.d3.scale.linear()
					      .domain([0, self.d3.max(self.dataSet, function(d) { return parseFloat(d.value); })])
					      .range([0, self.rangeWidth]);
		}

		function setSVGHeight() {
			self.svg.style('height', (self.currentHeight + 20) + "px");
		}

		function setRectangles() {
			self.rectangles = self.svg.selectAll("rect").data(self.dataSet).enter().append("rect");
		}
		function setText() {
			self.text1 = self.svg.selectAll("text.date").data(self.dataSet).enter().append("text");
			self.text2 = self.svg.selectAll("text.value").data(self.dataSet).enter().append("text");
		}

		function drawText() {
			// Add text in for the left heading
			self.text1.attr({
					"x" : 5,
					"y" : function(d,i) { return (i * (self.barHeight + self.barPadding)) + (self.barHeight / 1.3); },
					"fill": "#000"
				})
				.text(function(d) {
					return (d.time) ? $filter("date")(d.time, "MM/dd/yyyy") : d.name;
				})
				.style({ "font-weight": "600"});

			// Add text in for the data on the right side of the bar
			self.text2.attr({
					"x" : function(d) {
						// return (self.xScale(d.value) * 0.8) + 85;
						var length = (d.value + '').replace('.', '').length || 0;
						return self.rangeWidth - (length * 10);
					},
					"y" : function(d,i) { return (i * (self.barHeight + self.barPadding)) + (self.barHeight / 1.3); },
					"fill": "#000",
				})
			.style({ "font-weight": "800" });

			if(self.hasTransition === true) {
				self.text2
					.transition()
					.delay(1000)
					.text(function(d) { return d.value; })
			}
			else {
				self.text2.text(function(d) { return d.value; })
			}
		}

		function drawRectangles() {
			if(self.hasTransition === true) {
				self.rectangles.attr({
						"height": self.barHeight,
						"width" : 2,
						"x" : 0,
						"y" : function(d,i) { return i * (self.barHeight + self.barPadding); },
						"fill": function(d) { return self.color(d.value); }
					})
				    .transition()
				      .duration(1000)
				      .attr('width', function(d) {
				        return (self.xScale(d.value) * 0.8) + 2;
				      });
			}
			else {
				self.rectangles.attr({
						"height": self.barHeight,
						"width" : function(d) { return (self.xScale(d.value) * 0.8) + 2; },
						"x" : 80,
						"y" : function(d,i) { return i * (self.barHeight + self.barPadding); },
						"fill": function(d) { return self.color(d.value); }
					});
			}
		}
	}
}

})();
