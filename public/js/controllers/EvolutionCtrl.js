// EvolutionCtrl — Car era timeline + safety milestone + engine era theming
angular.module('f1App')
  .controller('EvolutionCtrl', ['$scope', 'DataService', '$interval', '$timeout', function($scope, DataService, $interval, $timeout) {

    $scope.cars          = [];
    $scope.selectedCar   = null;
    $scope.selectedIdx   = 0;
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

    // Auto-advance every 4 seconds
    var autoTimer = $interval(function() {
      if ($scope.cars.length === 0) return;
      var next = ($scope.selectedIdx + 1) % $scope.cars.length;
      $scope.selectCar($scope.cars[next], next);
    }, 4000);

    $scope.pauseAuto = function() { $interval.cancel(autoTimer); };

    $scope.$on('$destroy', function() { $interval.cancel(autoTimer); });

    // ─── Engine Era Classification ─────────────────────────────
    // Returns which era class applies for background tinting + badge
    var ERA_MAP = {
      'Supercharged Inline-8':    { cls: 'era-theme--classic',  label: 'Pre-War / Classic Supercharged' },
      'Naturally Aspirated V8':   { cls: 'era-theme--v8',       label: 'Naturally Aspirated V8' },
      'Turbocharged V6':          { cls: 'era-theme--turbo',    label: 'Turbo Era V6' },
      'Naturally Aspirated V10':  { cls: 'era-theme--v10',      label: 'Golden Age V10 (18,000 RPM)' },
      'Hybrid Turbocharged V6':   { cls: 'era-theme--hybrid',   label: 'Hybrid Power Unit Era' }
    };

    $scope.getEngineEraClass = function(car) {
      if (!car) return '';
      var map = ERA_MAP[car.engine_type];
      return map ? map.cls : '';
    };

    $scope.getEngineEraLabel = function(car) {
      if (!car) return '';
      var map = ERA_MAP[car.engine_type];
      return map ? map.label : car.engine_type;
    };

    // Subtle background-tint for the car display panel based on engine era
    $scope.getEraTheme = function(car) {
      if (!car) return {};
      var themes = {
        'Supercharged Inline-8':   { 'border-color': 'rgba(180,140,60,0.3)' },
        'Naturally Aspirated V8':  { 'border-color': 'rgba(180,100,40,0.3)' },
        'Turbocharged V6':         { 'border-color': 'rgba(232,0,45,0.4)' },
        'Naturally Aspirated V10': { 'border-color': 'rgba(255,180,0,0.4)' },
        'Hybrid Turbocharged V6':  { 'border-color': 'rgba(0,200,100,0.4)' }
      };
      return themes[car.engine_type] || {};
    };

    // Staggered reveal animation delay
    $scope.fieldDelay = function(idx) {
      return { 'animation-delay': (idx * 80) + 'ms' };
    };

  }]);
