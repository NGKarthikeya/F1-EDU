// AngularJS 1.x App — F1 Educational Platform
// N.B. AngularJS 1.x only. NO TypeScript. NO @Component decorators.

angular.module('f1App', ['ngRoute', 'ngAnimate'])

  // ─── Route Config ──────────────────────────────────────────────────────────
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller:  'HomeCtrl'
      })
      .when('/evolution', {
        templateUrl: 'views/evolution.html',
        controller:  'EvolutionCtrl'
      })
      .when('/regulations', {
        templateUrl: 'views/regulations.html',
        controller:  'RegulationsCtrl'
      })
      .when('/drivers', {
        templateUrl: 'views/drivers.html',
        controller:  'DriversCtrl'
      })
      .when('/tech', {
        templateUrl: 'views/tech.html',
        controller:  'TechCtrl'
      })
      .otherwise({ redirectTo: '/' });
  }])

  // ─── Root App Controller ────────────────────────────────────────────────────
  .controller('AppCtrl', ['$scope', '$location', '$timeout', function($scope, $location, $timeout) {
    $scope.isLoading = true;
    $scope.scrolled  = false;
    $scope.menuOpen  = false;

    // Dismiss loading screen after full red-to-green start sequence
    $timeout(function() {
      $scope.isLoading = false;
    }, 3300);

    // Track current route for nav active states
    $scope.$on('$routeChangeSuccess', function() {
      $scope.currentRoute = $location.path();
      $scope.menuOpen = false;
      window.scrollTo(0, 0);
    });

    // Scroll progress bar — use $timeout(fn, 0) to safely update scope outside digest
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function() {
          var scrollTop  = window.scrollY || document.documentElement.scrollTop;
          var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
          var pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          var bar        = document.getElementById('scroll-progress');
          if (bar) bar.style.width = pct + '%';

          var shouldBeScrolled = scrollTop > 60;
          if ($scope.scrolled !== shouldBeScrolled) {
            $timeout(function() {
              $scope.scrolled = shouldBeScrolled;
            }, 0);
          }
          ticking = false;
        });
      }
    });
  }]);
