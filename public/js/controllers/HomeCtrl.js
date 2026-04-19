// HomeCtrl — Home page hero, era cards, stat counters, newsletter
angular.module('f1App')
  .controller('HomeCtrl', ['$scope', 'DataService', '$timeout', function($scope, DataService, $timeout) {

    $scope.cars = [];
    $scope.teams = [
      {
        slug: 'ferrari',
        name: 'Scuderia Ferrari',
        base: 'Maranello, Italy',
        founded: 'Founded 1929',
        titles: 16,
        wins: 248,
        peakEra: '2000-2004',
        heritage: 'Formula 1\'s most historic constructor, defined by iconic red cars, long-term continuity, and championship eras led by legends.'
      },
      {
        slug: 'mercedes',
        name: 'Mercedes-AMG',
        base: 'Brackley, UK',
        founded: 'Founded 1954 (modern era 2010)',
        titles: 8,
        wins: 125,
        peakEra: '2014-2021',
        heritage: 'A benchmark hybrid-era team known for engineering efficiency, relentless race pace, and one of the longest title streaks in F1 history.'
      },
      {
        slug: 'red-bull',
        name: 'Red Bull Racing',
        base: 'Milton Keynes, UK',
        founded: 'Founded 2005',
        titles: 6,
        wins: 120,
        peakEra: '2010-2013, 2021-present',
        heritage: 'Aggressive design philosophy and aerodynamic excellence made Red Bull a modern dominant force across multiple regulation eras.'
      },
      {
        slug: 'mclaren',
        name: 'McLaren',
        base: 'Woking, UK',
        founded: 'Founded 1963',
        titles: 8,
        wins: 183,
        peakEra: '1984-1991, 1998-1999',
        heritage: 'A legacy constructor with deep motorsport roots, famous for technical innovation and title-winning partnerships across decades.'
      },
      {
        slug: 'williams',
        name: 'Williams Racing',
        base: 'Grove, UK',
        founded: 'Founded 1977',
        titles: 9,
        wins: 114,
        peakEra: '1980s-1990s',
        heritage: 'An independent giant of the sport whose engineering-led rise produced multiple championship-winning golden eras.'
      },
      {
        slug: 'aston-martin',
        name: 'Aston Martin Aramco',
        base: 'Silverstone, UK',
        founded: 'Founded 2021 (as Aston Martin)',
        titles: 0,
        wins: 0,
        peakEra: 'Modern rebuild era',
        heritage: 'A rapidly evolving team investing in infrastructure and talent to establish itself among Formula 1\'s leading constructors.'
      }
    ];
    $scope.selectedTeam = $scope.teams[0];

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

    $scope.selectTeam = function(team) {
      $scope.selectedTeam = team;
    };

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

  }]);
