// RegulationsCtrl — Race Guide: Flag scrollytelling + Qualifying era slider
angular.module('f1App')
  .controller('RegulationsCtrl', ['$scope', 'DataService', '$timeout', function($scope, DataService, $timeout) {

    $scope.regulations     = [];
    $scope.activeFlag      = null;
    $scope.activeReg       = null;
    $scope.qualifyingRules = [];
    $scope.activeQual      = null;
    $scope.activeQualIdx   = 0;

    // Load all data in parallel
    DataService.getRegulations().then(function(data) {
      $scope.regulations = data;
      if (data.length > 0) {
        $scope.activeFlag = data[0].flag_color;
        $scope.activeReg  = data[0];
      }
      $timeout(function() { setupFlagObserver(); }, 150);
    });

    DataService.getQualifying().then(function(data) {
      $scope.qualifyingRules = data;
      if (data.length > 0) {
        $scope.activeQual    = data[0];
        $scope.activeQualIdx = 0;
      }
    });



    // ─── Flag Scrollytelling ───────────────────
    function setupFlagObserver() {
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

      sections.forEach(function(s) { observer.observe(s); });
      $scope.$on('$destroy', function() { observer.disconnect(); });
    }

    $scope.getPanelStyle = function() {
      if (!$scope.activeReg) return {};
      return {
        'background-color': $scope.activeReg.bg_color,
        'color': $scope.activeReg.text_color
      };
    };

    // ─── Qualifying Slider ─────────────────────
    $scope.setQual = function(rule) {
      $scope.activeQual    = rule;
      $scope.activeQualIdx = $scope.qualifyingRules.indexOf(rule);
    };

    $scope.setQualByIdx = function(idx) {
      var i = parseInt(idx, 10);
      if ($scope.qualifyingRules[i]) {
        $scope.activeQual = $scope.qualifyingRules[i];
      }
    };

  }]);
