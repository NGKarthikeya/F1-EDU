// EvolutionCtrl — Car era timeline with auto-advance
angular.module('f1App')
  .controller('EvolutionCtrl', ['$scope', 'DataService', '$interval', '$timeout', function($scope, DataService, $interval, $timeout) {

    $scope.cars       = [];
    $scope.selectedCar = null;
    $scope.selectedIdx = 0;
    $scope.transitioning = false;

    DataService.getCars().then(function(data) {
      $scope.cars = data;
      if (data.length > 0) {
        $scope.selectCar(data[0], 0);
      }
    });

    $scope.selectCar = function(car, idx) {
      if ($scope.transitioning) return;
      $scope.transitioning = true;
      $timeout(function() {
        $scope.selectedCar = car;
        $scope.selectedIdx = idx;
        $scope.transitioning = false;
      }, 300);
    };

    // Auto-advance every 3 seconds
    var autoTimer = $interval(function() {
      if ($scope.cars.length === 0) return;
      var next = ($scope.selectedIdx + 1) % $scope.cars.length;
      $scope.selectCar($scope.cars[next], next);
    }, 3000);

    // Pause on user interaction
    $scope.pauseAuto = function() {
      $interval.cancel(autoTimer);
    };

    // Clean up on destroy
    $scope.$on('$destroy', function() {
      $interval.cancel(autoTimer);
    });


    // Staggered field animation delay
    $scope.fieldDelay = function(idx) {
      return { 'animation-delay': (idx * 80) + 'ms' };
    };
  }]);
