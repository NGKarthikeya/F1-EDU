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

    function getWinners() {
      return $http.get('/api/winners').then(function(res) { return res.data; });
    }

    function getRegulations() {
      return $http.get('/api/regulations').then(function(res) { return res.data; });
    }

    function subscribe(name, email) {
      var data = 'name=' + encodeURIComponent(name) + '&email=' + encodeURIComponent(email);
      return $http.post('/subscribe', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function(res) { return res.data; });
    }

    return { getCars, getDrivers, getWinners, getRegulations, subscribe };
  }]);
