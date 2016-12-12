'use strict';
angular.module('appLogic').service('GuestBookService', ['$log', '$cookies', '$sanitize', 'BaseDataService', '$q', function($log, $cookies, $sanitize, BaseDataService, $q){
  return {
    retrievedStates: [],
    getEntries: function() {
      return BaseDataService.get('/read')
      .then(function(data) {
        return data['data'];
      });
    },
    postEntry: function(phone, message) {
      return BaseDataService.post('/write', {phone: $sanitize(phone), message: $sanitize(message)});
    }
  };
}]);
