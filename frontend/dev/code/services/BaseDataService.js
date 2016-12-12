'use strict';

angular.module('appLogic').service('BaseDataService', ['$http', '$q', '$log', function($http, $q, $log){
  return {

    get: function(url){
      if (!url) return false;

      return $http.get(url);
    },

    post: function(url, payload){
      if (!url) return false

      return $http.post(url, payload);
    },

    put: function(url, payload){
      if (!url) return false;

      return $http.put(url, payload);
    },

    delete: function(url){
      if (!url) return false;

      return $http.delete(url);
    }

  }
}]);
