'use strict';
angular.module('appLogic').service('StateService', ['$log', '$cookies', 'BaseDataService', '$q', function($log, $cookies, BaseDataService, $q){
  return {
    retrievedStates: [],
    getStateBatch: function(offset) {
      offset = offset || 0;
      return BaseDataService.get('/states?offset='+offset)
      .then(function(data) {
        return data['data'];
      });
    },
    getAllStates: function() {
      var promises = [];
      for(var offset = 0; offset < 5; offset++) {
        promises.push(this.getStateBatch( offset * 10));
      }
      return $q.all(promises)
      .then(function(promiseReturns) {
        var states = [];
        for(var offset = 0; offset < 5; offset++) {
          states = states.concat(promiseReturns[offset]);
        }
        return states;
      });
    },
    states: []
  };
}]);
