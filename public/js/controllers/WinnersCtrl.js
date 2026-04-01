// WinnersCtrl — Race table + Modern Points Leaderboard sidebar
angular.module('f1App')
  .controller('WinnersCtrl', ['$scope', 'DataService', function($scope, DataService) {

    $scope.winners           = [];
    $scope.years             = [];
    $scope.searchText        = '';
    $scope.selectedYear      = '';
    $scope.sortField         = 'year';
    $scope.sortReverse       = true;
    $scope.loading           = true;
    $scope.showModernPoints  = false;
    $scope.pointsSystems     = [];
    $scope.modernLeaderboard = [];

    // Modern 25-pt distribution (always used for recalculation)
    var MODERN_DIST = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

    // Load points systems first to allow points calculation
    DataService.getPointsSystems().then(function(pData) {
      $scope.pointsSystems = pData;

      DataService.getWinners().then(function(wData) {
        $scope.winners = wData;
        $scope.loading = false;

        // Group winners by decade -> year
        var decadesMap = {};
        
        wData.forEach(function(w) {
          var decadeStart = Math.floor(w.year / 10) * 10;
          var decadeKey = decadeStart + 's';
          
          if (!decadesMap[decadeKey]) {
            decadesMap[decadeKey] = {
              decade: decadeKey,
              sortVal: decadeStart,
              yearsMap: {}
            };
          }
          
          var curDecade = decadesMap[decadeKey];
          if (!curDecade.yearsMap[w.year]) {
            curDecade.yearsMap[w.year] = {
              year: w.year,
              races: []
            };
          }
          
          w.points = getPointsForYear(w.year);
          curDecade.yearsMap[w.year].races.push(w);
        });

        // Convert the maps to sorted arrays
        $scope.decadesList = Object.values(decadesMap).map(function(d) {
          d.years = Object.values(d.yearsMap).sort(function(a, b) {
            return b.year - a.year;
          });
          d.totalRaces = d.years.reduce(function(sum, yr) { return sum + yr.races.length; }, 0);
          return d;
        }).sort(function(a, b) {
          return b.sortVal - a.sortVal; // Newest decade first
        });

        // Extract a flat array of year labels for any generic <select> filter elements
        var yrSet = {};
        wData.forEach(function(w) { yrSet[w.year] = true; });
        $scope.years = Object.keys(yrSet).sort(function(a, b) { return b - a; });

        // Pre-compute leaderboard
        buildModernLeaderboard(wData);
      });
    });

    // Helper: Finds the active points system for a given year and returns the 1st place points
    function getPointsForYear(year) {
      var system = $scope.pointsSystems.find(function(s) {
        var start = s.year_start;
        var end = s.year_end || 9999;
        return year >= start && year <= end;
      });
      if (system && system.distribution) {
        try {
          var dist = JSON.parse(system.distribution);
          return dist[0] || 0; // Winner gets 1st place points
        } catch (e) { return 0; }
      }
      return 0; // fallback
    }

    // Modern Leaderboard recalculation Logic
    function buildModernLeaderboard(winners) {
      var tally = {};
      winners.forEach(function(w) {
        var driver = w.driver_name;
        if (!tally[driver]) { tally[driver] = { driver: driver, modernPts: 0, wins: 0 }; }
        tally[driver].modernPts += MODERN_DIST[0]; // 25
        tally[driver].wins++;
      });

      $scope.modernLeaderboard = Object.values(tally).sort(function(a, b) {
        return b.modernPts - a.modernPts || b.wins - a.wins;
      });
    }

    $scope.toggleModernPoints = function() {
      $scope.showModernPoints = !$scope.showModernPoints;
    };

    // Drill-Down View State
    $scope.viewLevel = 'decades'; // 'decades', 'years', 'races'
    $scope.selectedDecade = null;
    $scope.selectedYearGroup = null;

    $scope.selectDecade = function(decadeObj) {
      $scope.selectedDecade = decadeObj;
      $scope.viewLevel = 'years';
    };

    $scope.selectYear = function(yearGroupObj) {
      $scope.selectedYearGroup = yearGroupObj;
      $scope.viewLevel = 'races';
    };

    $scope.goBack = function() {
      if ($scope.viewLevel === 'races') {
        $scope.viewLevel = 'years';
      } else if ($scope.viewLevel === 'years') {
        $scope.viewLevel = 'decades';
      }
    };

    // ─── Table Sorting ────────────────────────────────────────
    $scope.setSort = function(field) {
      if ($scope.sortField === field) {
        $scope.sortReverse = !$scope.sortReverse;
      } else {
        $scope.sortField   = field;
        $scope.sortReverse = (field === 'year');
      }
    };

    $scope.getSortIcon = function(field) {
      if ($scope.sortField !== field) return '↕';
      return $scope.sortReverse ? '↓' : '↑';
    };

    // First 3 rows get podium colours
    $scope.getRowClass = function(idx) {
      if (idx === 0) return 'row--gold';
      if (idx === 1) return 'row--silver';
      if (idx === 2) return 'row--bronze';
      return '';
    };
  }]);
