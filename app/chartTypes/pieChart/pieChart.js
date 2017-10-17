(function() { 
"use strict";

/* FOR REFERENCE: http://www.ng-newsletter.com/posts/d3-on-angular.html */
angular.module("AnalyticsApp")
.directive("pieChart", ["$window", "d3Service", "$filter", "PieChartModule",
	function($window, d3Service, $filter, PieChartModule) { 

	function Link(scope, element, attrs) {

		d3Service.d3().then(function(d3) { 

			window.onresize = function() { scope.$apply(); };
			scope.data = [];
			scope.$watch(function() {
				return angular.element($window)[0].innerWidth;
			}, function() {
				scope.render(scope.data);
			});
			scope.$watch("data", function(newVals, oldVals) {
			  return scope.render(newVals, true);
			}, true);				

		    var margin = parseInt(attrs.margin) || 20;
		    var width = "100%";
		    var height = attrs.height || 500; 
		    var padding = "5px";
		    var backgroundColor = "#ececec";

/*
			var svg = d3.select(element[0])
						.append("svg")
						.style("width", width)
						.style("height", height + "px")
						.style("padding", "5px")
						.style("background-color", "#ececec");
*/

		    var myGraph = new PieChartModule({
		    	currentElement: element[0], 
		    	d3Lib: d3,  
		    	totalWidth: width, 
		    	totalHeight: height, 
		    	padding: padding,
		    	backgroundColor : backgroundColor
	    	});
		    myGraph.createSVG();
			
			scope.render = function(data) {
				myGraph.clearGraph();
				if(!data || data.length <= 0) { return; }

				myGraph.setDataSet(data);

				myGraph.calcSVGWidth();
				myGraph.calcSVGHeight();
				myGraph.calcRadius();
				myGraph.calcOuterRadius();

				myGraph.formatDataAndGetTotal();

				myGraph.createArcGroups();
				myGraph.createTextGroups();

				myGraph.setGraphColor();
				myGraph.setArcValue();
				myGraph.setTextArcValue();
				myGraph.setPie();

				myGraph.drawArcs();
				myGraph.drawLabels();
				myGraph.drawValues();				
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