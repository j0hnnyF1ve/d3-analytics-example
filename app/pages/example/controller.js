(function() {
"use strict";

angular.module("AnalyticsApp").controller("ExampleCtrl", ExampleCtrl);
ExampleCtrl.$inject = ["$scope", "$timeout", "$filter", "ExampleAPI", "AppState"];
function ExampleCtrl($scope, $timeout, $filter, ExampleAPI, AppState) {
  var self = this;
  this.$timeout = $timeout;
  this.$filter = $filter;
  this.AnalyticsAPI = ExampleAPI;
  this.AppState = AppState;

  var serviceList = this.AnalyticsAPI.list();
  var services = [];
  for(var i=0; i < serviceList.length; i++) {
    if(["users", "events_by_user", "searches"].indexOf(serviceList[i].value) >= 0) { continue; }

    services.push(serviceList[i]);
  }

  var model = {};
  model.stations = [];

  model.loadingService = false;

  model.start = new Date().setDate(new Date().getDate() - 7);
  model.end = new Date().setDate(new Date().getDate());
  model.dateMax = new Date("YYYY-mm-dd");

  model.services = services;
  model.currentService = model.services[0];

  model.barChart = true;
  model.lineChart = false;

  model.results = [];
  model.message = "";

  this.model = model;
  $scope.model = model;

  $scope.showBarChart       = function() { self.showBarChart(); }
  $scope.showLineChart      = function() { self.showLineChart(); }
  $scope.isLineChartVisible = function() { return self.isLineChartVisible(); }
  $scope.isBarChartVisible  = function() { return self.isBarChartVisible(); }
  $scope.clearStations      = function() { self.clearStations(); }
  $scope.selectAllStations  = function() { self.selectAllStations(); }
  $scope.isServiceDropdownDisabled = function() { return self.isServiceDropdownDisabled(); }
  $scope.loadService        = function(serviceName) { self.loadService(serviceName); }
  $scope.downloadAsCSV      = function(serviceName) { self.downloadAsCSV(serviceName); }

  self.model.stations = AppState.get("stations");
  for(var index in self.model.stations) { self.model.stations[index].value = true; }
  AppState.subscribe("stations", model, "stations", function() {
      for(var index in self.model.stations) {
        self.model.stations[index].value = true;
      }
  });
}


ExampleCtrl.prototype.showBarChart = function() {
  this.model.barChart = true;
  this.model.lineChart = false;
}

ExampleCtrl.prototype.showLineChart = function() {
  this.model.barChart = false;
  this.model.lineChart = true;
}

ExampleCtrl.prototype.downloadAsCSV = function (service) {
    var params = this.getParams(service);
    params.csv = 1;
    this.AnalyticsAPI.downloadCSV("",params);
    this.model.loadingService = false;
}

ExampleCtrl.prototype.getParams = function(service) {
  var self = this;
  var params = {};
  params.start = self.$filter("date")(self.model.start, "yyyyMMdd");
  params.end = self.$filter("date")(self.model.end, "yyyyMMdd");
  params.sortBy = service;

  return params;
}

ExampleCtrl.prototype.isLineChartVisible  = function() { return (this.model.chartResults && this.model.chartResults.length > 1) && this.model.lineChart; }
ExampleCtrl.prototype.isBarChartVisible   = function() { return (this.model.chartResults && this.model.chartResults.length > 0) && this.model.barChart; }
ExampleCtrl.prototype.clearStations       = function() { for(var index in this.model.stations) { this.model.stations[index].value = false; } }
ExampleCtrl.prototype.selectAllStations   = function() { for(var index in this.model.stations) { this.model.stations[index].value = true; } }

ExampleCtrl.prototype.isServiceDropdownDisabled = function() {
  return (this.model.start == "" || this.model.end == "" || this.model.loadingService === true)
}

ExampleCtrl.prototype.loadService = function(service) {
  if(!service || service.length <= 0) { return; }
  var self = this;
  self.model.message = "";
  self.model.results = [];
  self.model.chartResults = [];

  self.model.loadingService = true;

  var params = self.getParams(service);

  self.AnalyticsAPI.callService("", params)
    .then(function(response) {

      response.data = {
        "kabc" : { orgAlias: "KABC", channelName: "kabc",
          num_visitors : 35,
          num_sessions : 37,
          users: 55,
          events_by_user: 11
        },
        "ktvi" : { orgAlias: "KTVI", channelName: "ktvi",
          num_visitors : 75,
          num_sessions : 78,
          users: 100,
          events_by_user: 5
        },
        "kxyz" : { orgAlias: "KXYZ", channelName: "kxyz",
          num_visitors : 55,
          num_sessions : 55,
          users: 67,
          events_by_user: 8
        }
      }
      response.result = true;

      // load and format results, date/value pairs
      if(response.data && response.data.length < 1) {
        self.model.message = "No results for your request.";
      }
      else if(response.result === true) {
        var results = [];
        var chartResults = [];

        for(var index in response.data) {
          var entry = response.data[index];
          var chartResult = {};
          var result = {};

          chartResult.value = (self.model.currentService.value === "popularity") ?
            entry["popScore"] :
            entry[self.model.currentService.value];
          // if floating point number
          if(chartResult.value % 1 > 0) { chartResult.value = (Math.floor(chartResult.value * 100) / 100 ).toFixed(2); }

          chartResult.name = ((entry.orgAlias) ? entry.orgAlias.toUpperCase() + ' - ' : "") + entry.channelName;
          chartResults.push(chartResult);

          result.org = ((entry.orgAlias) ? entry.orgAlias.toUpperCase() : "No Station Specified");
          result.name = entry.channelName;

          result.value = (self.model.currentService.value === "popularity") ?
            entry["popScore"] :
            entry[self.model.currentService.value];

          // if floating point number
          if(result.value % 1 > 0) { result.value = (Math.floor(result.value * 100) / 100 ).toFixed(2); }

          results.push(result);
        }

        self.model.results = results;
        self.model.chartResults = chartResults;
      }

      self.model.loadingService = false;
  });
}


})();
