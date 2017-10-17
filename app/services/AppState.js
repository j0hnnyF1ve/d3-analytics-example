(function() {
"use strict";

angular.module("AnalyticsApp").service('AppState', AppState);
AppState.$inject = ['$rootScope', '$log', '$timeout'];
function AppState($rootScope, $log, $timeout) {

	function appState() {
		var self = this;
		var state = {};
		var subscribeList = [];
		self.get = getter;
		self.set = setter;
		self.subscribe = subscribe;
		self.reset = resetter; // reset sets the property to its default value
		self.initialize = initialize;

		function getter(property) {
			return (state[property] !== null ? state[property] : null);
		}
		function setter(property, value) {
			state[property] = value;
			$log.log("AppState." + property + "::updated", value);
			$rootScope.$emit("AppState." + property + "::updated", value);
		}
		function subscribe(valueToWatch, model, modelProperty, callback) {
			$rootScope.$on("AppState."+valueToWatch+"::updated",
				function() { $timeout(function() {
					model[modelProperty] = self.get(valueToWatch);
					if(callback) { callback.call(); }
			}); }, 5000);
		}
		function resetter(property) {
			switch(property) {
				case "showApp":  			self.set(property, false );
				case "stations":  	self.set(property, []);
				default: 					self.set(property, "");
			}
		}
		function initialize(params) {
			params = params || {};

			self.set("showApp", 		params.showApp || true );
			self.set("stations", 	params.activeStations || false );
		}
	}
	return new appState();
}

})();
