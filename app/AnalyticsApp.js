(function() {
"use strict";

angular.module("AnalyticsApp", ["ngRoute", "D3Module", "ui.bootstrap"])
.run(["$window", "$http", "$q", "AppState", function($window, $http, $q, AppState) {
	AppState.initialize();
}])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/example', 		{ templateUrl: "app/pages/example/template.html", 		controller: "ExampleCtrl"})
		.otherwise({redirectTo: "/example"})
}]);


})();
