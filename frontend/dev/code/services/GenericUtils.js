'use strict';

angular.module('appLogic').service('GenericUtils', ['$log', function($log){
  return {
    setScope: function(scopeSrc, scopeDest){
      for (var key in scopeSrc){
        scopeDest[key] = scopeSrc[key];
      }
    }
  };
}]);
