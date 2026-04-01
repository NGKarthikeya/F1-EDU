// HomeCtrl — Home page hero, era cards, stat counters, newsletter
angular.module('f1App')
  .controller('HomeCtrl', ['$scope', 'DataService', '$timeout', function($scope, DataService, $timeout) {

    $scope.cars = [];
    $scope.subscribeForm = { name: '', email: '' };
    $scope.subscribed    = false;
    $scope.submitError   = '';

    // Stats for animated counters
    $scope.stats = [
      { label: 'F1 Seasons',      target: 74,   current: 0, suffix: '' },
      { label: 'Race Winners',    target: 110,  current: 0, suffix: '+' },
      { label: 'Constructors',    target: 46,   current: 0, suffix: '' },
      { label: 'Fastest Laps Set',target: 500,  current: 0, suffix: '+' }
    ];

    // Load cars from API
    DataService.getCars().then(function(data) {
      $scope.cars = data;
    });

    // Count-up animation triggered by Intersection Observer
    function animateCounter(stat) {
      var duration = 1800;
      var start    = performance.now();

      function step(timestamp) {
        var elapsed  = timestamp - start;
        var progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        var eased    = 1 - Math.pow(1 - progress, 4);
        stat.current = Math.floor(eased * stat.target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          stat.current = stat.target;
        }
        $scope.$apply();
      }
      requestAnimationFrame(step);
    }

    // Observe the stats section
    $timeout(function() {
      var statsEl = document.querySelector('.stats-section');
      if (!statsEl) return;

      var animated = false;
      var observer = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting && !animated) {
          animated = true;
          $scope.stats.forEach(function(s) { animateCounter(s); });
          observer.disconnect();
        }
      }, { threshold: 0.3 });
      observer.observe(statsEl);
    }, 100);

    // Newsletter submission
    $scope.subscribe = function() {
      $scope.submitError = '';
      DataService.subscribe($scope.subscribeForm.name, $scope.subscribeForm.email)
        .then(function() {
          $scope.subscribed = true;
        })
        .catch(function(err) {
          $scope.submitError = 'Something went wrong. Please try again.';
        });
    };
  }]);
