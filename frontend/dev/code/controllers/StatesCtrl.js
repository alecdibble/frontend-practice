'use strict';
angular.module('appLogic').controller('StatesCtrl', ['$scope', '$route', '$log', 'GenericUtils', 'StateService', function($scope, $route, $log, GenericUtils, StateService){
  var _config = {};
  var _helper = {
  };
  var controller = {
    init: function(){
      GenericUtils.setScope(controller.scope, $scope);
      if(!$scope.states && StateService.states.length < 1) {
        StateService.getAllStates().
        then(function(states) {
          $scope.states = states;
          StateService.states = states;
        });
      }
      else {
        $scope.states = StateService.states;
      }
    },
    scope: { }
  };
  controller.init();
}]);
