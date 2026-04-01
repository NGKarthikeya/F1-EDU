// WinnersCtrl — Race winners sortable table
angular.module('f1App')
  .controller('WinnersCtrl', ['$scope', 'DataService', function($scope, DataService) {

    $scope.winners    = [];
    $scope.loading    = true;
    $scope.sortField  = 'year';
    $scope.sortReverse= true;
    $scope.searchText = '';
    $scope.selectedYear = '';
    $scope.years        = [];

    DataService.getWinners().then(function(data) {
      $scope.winners = data;
      $scope.loading = false;

      // Build unique years list
      var yearSet = {};
      data.forEach(function(w) { yearSet[w.year] = true; });
      $scope.years = Object.keys(yearSet).sort(function(a,b) { return b - a; });
    });

    $scope.setSort = function(field) {
      if ($scope.sortField === field) {
        $scope.sortReverse = !$scope.sortReverse;
      } else {
        $scope.sortField   = field;
        $scope.sortReverse = false;
      }
    };

    $scope.getSortIcon = function(field) {
      if ($scope.sortField !== field) return '⇅';
      return $scope.sortReverse ? '↓' : '↑';
    };

    // Podium positions for styling
    $scope.getRowClass = function(idx) {
      if (idx === 0) return 'podium-1';
      if (idx === 1) return 'podium-2';
      if (idx === 2) return 'podium-3';
      return '';
    };
  }]);
