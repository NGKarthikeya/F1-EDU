// RegulationsCtrl — Scrollytelling with Intersection Observer (NEVER window.onscroll)
angular.module('f1App')
  .controller('RegulationsCtrl', ['$scope', 'DataService', '$timeout', function($scope, DataService, $timeout) {

    $scope.regulations = [];
    $scope.activeFlag  = null;
    $scope.activeReg   = null;

    DataService.getRegulations().then(function(data) {
      $scope.regulations = data;
      if (data.length > 0) {
        $scope.activeFlag = data[0].flag_color;
        $scope.activeReg  = data[0];
      }
      // Set up Intersection Observer after DOM renders
      $timeout(function() {
        setupObserver();
      }, 150);
    });

    function setupObserver() {
      var sections = document.querySelectorAll('.flag-section');
      if (!sections.length) return;

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var color = entry.target.getAttribute('data-flag');
            $timeout(function() {
              $scope.activeFlag = color;
              $scope.activeReg  = $scope.regulations.find(function(r) {
                return r.flag_color === color;
              });
            }, 0);
          }
        });
      }, {
        threshold: 0.5,
        rootMargin: '-10% 0px -10% 0px'
      });

      sections.forEach(function(section) { observer.observe(section); });

      $scope.$on('$destroy', function() { observer.disconnect(); });
    }

    $scope.getPanelStyle = function() {
      if (!$scope.activeReg) return {};
      return {
        'background-color': $scope.activeReg.bg_color,
        'color': $scope.activeReg.text_color
      };
    };
  }]);
