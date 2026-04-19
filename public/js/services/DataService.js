// DataService — $http wrappers for all F1 API endpoints
// AngularJS 1.x service using factory pattern

angular.module('f1App')
  .factory('DataService', ['$http', '$q', function($http, $q) {

    function getCars() {
      return $http.get('/api/cars').then(function(res) { return res.data; });
    }

    function getDrivers() {
      return $http.get('/api/drivers').then(function(res) { return res.data; });
    }


    function getRegulations() {
      return $http.get('/api/regulations').then(function(res) { return res.data; });
    }


    function getQualifying() {
      return $http.get('/api/qualifying').then(function(res) { return res.data; });
    }

    function getPitRules() {
      return $http.get('/api/pit-rules').then(function(res) { return res.data; });
    }


    return { getCars, getDrivers, getRegulations, getQualifying, getPitRules };
  }]);
