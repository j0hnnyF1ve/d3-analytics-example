(function() { 
"use strict";

/* FOR REFERENCE: http://www.ng-newsletter.com/posts/d3-on-angular.html */
angular.module("AnalyticsApp")
.directive("lineChart", ["$window", "d3Service", "$filter", "LineChartModule", function($window, d3Service, $filter, LineChartModule) { 

	function Link(scope, element, attrs) {
		d3Service.d3().then(function(d3) { 

			window.onresize = function() { scope.$apply(); };
			scope.data = [];
	
			// This adjusts the width of the chart
			scope.$watch(function() {
				return angular.element($window)[0].innerWidth;
			}, function() {
				scope.render(scope.data, false);
			});
	
			// This adjusts the data in the chart, if it changes, the chart is updated
			scope.$watch("data", function(newVals, oldVals) {
			  return scope.render(newVals, true);
			}, true);				

			// This adjusts the labels on the yAxis
			scope.$watch("attrs.yLabel", function(newVals, oldVals) {
				yLabel = attrs.yLabel;
			}, true);				

		    var margin = parseInt(attrs.margin) || 40;
			var width = "100%";
		    var height = 500;
		    var yLabel = attrs.yLabel || "value";

		    var myGraph = new LineChartModule({
		    	currentElement: element[0], 
		    	d3Lib: d3,  
		    	currentMargin: margin, 
		    	totalWidth: width, 
		    	totalHeight: height, 
		    	yLabel: yLabel});
		    myGraph.createSVG();

			// The render function gets called when the data or width are changed			
			scope.render = function(data) {
				myGraph.initialize();
				myGraph.clearGraph();
				myGraph.clearXTicks();

				if(!data || data.length <= 0) { return; }
				
				myGraph.setDataSet(data);

				myGraph.setCurrentWidth();
				myGraph.setXTicks();
				myGraph.formatData();
				myGraph.setGraphDimensions();
				myGraph.setX(); myGraph.setY();
				myGraph.setXAxis(); myGraph.setYAxis();
				myGraph.setBaseline();
				myGraph.setChartLine();

				myGraph.drawXAxis();
				myGraph.drawYAxis();
				myGraph.drawLineChart();
				myGraph.drawLinePlots();
				myGraph.drawLabels();
			}

		});
	}

	return {
		restrict: "EA",
		scope: { data: "="},
		link: Link
	}
}]);

})();