(function() {
"use strict";

function serviceAPI(rootUrl, currentServices, http, promise) {
	function isValidParam(name, value) {
		if(["start", "end", "orgs", "frequency", "source", "stations", "aliases", "sortBy", "csv"].indexOf(name) < 0) { return false; }

		switch(name) {
			case "frequency":
				return (["daily", "hourly", "minutes"].indexOf(value) >= 0)
			default:
				return true;
		}
	}

	return {
		callService : function(theService, params) {
			var deferred = promise.defer();
            var url = this.genURL(theService,params);

			var dataType = "xml";

			http({ url: url,
				method: "GET",
				dataType: dataType,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'} })
				.success( function(response) {
					if(dataType == 'xml');
					{ response = $.parseXML(response); }

					deferred.resolve(response);
				})
				.error( function() {
					deferred.reject("An error occurred while calling the Analytics API");
				});
			return deferred.promise;
		},
		list : function() {
//			return Object.keys(currentServices);
			return currentServices;
		},
        genURL : function (theService,params) {
			var url = rootUrl + theService;
			var queryString = "";

			for(var index in params) {
				if(queryString.length > 0) { queryString += "&"; }

				// ONLY ADD VALID PARAMETERS
				var param = params[index];
				if(isValidParam(index, param) ) {
					queryString += index + "=" + param;
				}
			}
			if(queryString.length > 0) { url = url + "?" + queryString; }
            return url;
        },
        downloadCSV : function(theService, params) {
            var url = this.genURL(theService,params);
            window.location = url;
        }
	};
};

var app = angular.module("AnalyticsApp");
app.service('ExampleAPI', ["$http", "$q", function($http, $q) {

	// mocking the url service to an xml file
	// should call an actual REST service via AJAX on a live site
	var rootUrl = "data/example.xml";
	var services = [];
	services.push({ name: "Users", value: "users" });
	services.push({ name: "Events By User", value: "events_by_user" });
	services.push({ name: "Number of Visitors", value: "num_visitors" });
	services.push({ name: "Number of Sessions", value: "num_sessions" });

	return new serviceAPI(rootUrl, services, $http, $q);
}])


})();
