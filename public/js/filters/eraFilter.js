// eraFilter — custom AngularJS filter for driver era filtering
angular.module('f1App')
  .filter('eraFilter', function() {
    return function(drivers, selectedEra) {
      if (!selectedEra || selectedEra === 'all') return drivers;

      var eraMap = {
        'championships': null,  // handled separately
        '1950s-60s':  ['1950s', '1960s'],
        '1970s-80s':  ['1970s', '1980s'],
        '1990s-2000s':['1990s', '2000s'],
        'modern':     ['2010s', 'modern']
      };

      if (selectedEra === 'championships') {
        return drivers.filter(function(d) { return d.championships >= 2; });
      }

      var allowedEras = eraMap[selectedEra];
      if (!allowedEras) return drivers;

      return drivers.filter(function(d) {
        return allowedEras.indexOf(d.era) !== -1;
      });
    };
  });
