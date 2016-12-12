'use strict';
angular.module('appLogic').service('GuestBookService', ['$log', '$cookies', 'BaseDataService', '$q', function($log, $cookies, BaseDataService, $q){
  return {
    retrievedStates: [],
    getEntries: function() {
      return BaseDataService.get('/read')
      .then(function(data) {
        return data['data'];
      });
    },
    postEntry: function(phone, message) {
      return BaseDataService.post('/write', {phone: phone, message: message});
    }
  };
}]);
