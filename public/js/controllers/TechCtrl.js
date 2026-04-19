// TechCtrl — Car & Tech page controller
// Loads pit rules from the DB (the only data-driven section on this page)
angular.module('f1App')
  .controller('TechCtrl', ['$scope', 'DataService', function($scope, DataService) {

    $scope.pitRules = [];

    DataService.getPitRules().then(function(data) {
      $scope.pitRules = data;
    });

  }]);
