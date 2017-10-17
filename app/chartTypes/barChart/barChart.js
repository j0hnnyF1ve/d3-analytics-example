(function() { 
"use strict";

/* FOR REFERENCE: http://www.ng-newsletter.com/posts/d3-on-angular.html */
angular.module("AnalyticsApp")
.directive("barChart", ["$window", "d3Service", "$filter", "BarChartModule",
	function($window, d3Service, $filter, BarChartModule) { 
	
	function Link(scope, element, attrs) {

		d3Service.d3().then(function(d3) { 

			window.onresize = function() { scope.$apply(); };
			scope.data = [];
			scope.$watch(function() {
				return angular.element($window)[0].innerWidth;
			}, function() {
				scope.render(scope.data, false);
			});
			scope.$watch("data", function(newVals, oldVals) {
			  return scope.render(newVals, true);
			}, true);				

		    var margin = parseInt(attrs.margin) || 20,
		        barHeight = parseInt(attrs.barHeight) || 20,
		        barPadding = parseInt(attrs.barPadding) || 5;

		    var myGraph = new BarChartModule({
		    	currentElement: element[0], 
		    	d3Lib: d3,  
		    	currentMargin: margin, 
		    	totalWidth: "100%", 
		    	totalHeight: "250px", 
		    	barHeight : barHeight,
		    	barPadding : barPadding
	    	});
		    myGraph.createSVG();
			
			scope.render = function(data, hasTransition) {
				myGraph.initialize(hasTransition);
				myGraph.clearGraph();

				if(!data || data.length <= 0) { return; }

				myGraph.setDataSet(data);

				myGraph.setRangeWidth();
				myGraph.setCurrentHeight();
				myGraph.setColor();
				myGraph.setXScale(); 

				myGraph.setSVGHeight();
				myGraph.setRectangles();
				myGraph.setText();

				myGraph.drawText();
				myGraph.drawRectangles();
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