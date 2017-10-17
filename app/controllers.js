(function() {
"use strict";

angular.module("AnalyticsApp").controller("NavCtrl", NavCtrl);
NavCtrl.$inject = ["$timeout", "$filter"];
function NavCtrl($timeout, $filter) {
	var self = this;
	this.items = [
	    { name: "Example", 		link: "example"}
  	];
}

angular.module('AnalyticsApp').controller('MainCtrl', MainCtrl);
MainCtrl.$inject = ['$rootScope', '$timeout', 'AppState'];
function MainCtrl($rootScope, $timeout, AppState) {
	var self = this;
	AppState.subscribe("showApp", self, "showApp");
}

})();
