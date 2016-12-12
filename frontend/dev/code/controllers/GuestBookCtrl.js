'use strict';
angular.module('appLogic').controller('GuestBookCtrl', ['$scope', '$route', '$log', 'GenericUtils', 'GuestBookService', 'AuthService', function($scope, $route, $log, GenericUtils, GuestBookService, AuthService){
  var _config = {};
  var _helper = {
    entryHandler: function() {
      GuestBookService.postEntry($scope.newEntry.phone, $scope.newEntry.message).
      then(function(data) {
        $scope.entries = data['data'].reverse();
        _helper.resetEntry();
      }
      ,
      function(data) {
        $scope.error = "An error occured";
      });
    },
    resetEntry: function() {
      $scope.newEntry = {
        phone: null,
        message: null
      }
      $scope.gb.gbForm.$setPristine();
    }
  };
  var controller = {
    init: function(){
      GenericUtils.setScope(controller.scope, $scope);
      GuestBookService.getEntries()
      .then(function(entries) {
        $scope.entries = entries.reverse();
      });
    },
    scope: { 
      entries: [],
      entryHandler: _helper.entryHandler,
      loginStatus: AuthService.checkLogin,
      newEntry: {
        phone: '',
        message: ''
      }
    }
  };
  controller.init();
}]);
