// DriversCtrl — Hall of Fame driver grid with filters
angular.module('f1App')
  .controller('DriversCtrl', ['$scope', 'DataService', function($scope, DataService) {

    $scope.drivers      = [];
    $scope.selectedEra  = 'all';
    $scope.loading      = true;

    $scope.eras = [
      { key: 'all',          label: 'All Drivers' },
      { key: 'championships',label: '2+ Championships' },
      { key: '1950s-60s',    label: '1950s – 60s' },
      { key: '1970s-80s',    label: '1970s – 80s' },
      { key: '1990s-2000s',  label: '1990s – 2000s' },
      { key: 'modern',       label: 'Modern Era' }
    ];

    DataService.getDrivers().then(function(data) {
      $scope.drivers = data;
      $scope.loading = false;
    });

    $scope.setEra = function(era) {
      $scope.selectedEra = era;
    };

    // Championship dots (filled vs empty)
    $scope.getChampDots = function(count) {
      var dots = [];
      for (var i = 0; i < Math.min(count, 7); i++) {
        dots.push({ filled: true });
      }
      return dots;
    };

    // Flagcdn URL for nationality icons
    $scope.getFlagUrl = function(flagCode) {
      if (!flagCode) return '';
      return 'https://flagcdn.com/24x18/' + flagCode.toLowerCase() + '.png';
    };

    // Image error fallback
    $scope.onImgError = function(driver) {
      driver.imgFailed = true;
    };
  }]);
