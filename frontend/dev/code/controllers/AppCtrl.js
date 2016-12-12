'use strict';
angular.module('appLogic').controller('AppCtrl', ['$scope', '$route', '$log', '$location', 'GenericUtils', 'AuthService', function($scope, $route, $log, $location, GenericUtils, AuthService){
  var _config = {};
  var _helper = {
    getLoginStatus: function() { 
      var status = AuthService.checkLogin();
      if(status) {
        return true;
      }
      return false;
    },
    setAuthLabel: function(scope) {
      var user = AuthService.checkLogin();
      if(user) {
        $scope.authLabel = "Logout, " + user;
      }
      else {
        $scope.authLabel = "Login";
      }
    },
    authClickHandler: function() {
      if(this.getLoginStatus()) {
        AuthService.logout()
        .then(function() {
          _helper.setAuthLabel();
        });
      }
      else {
        AuthService.lastLocation = $location.url();
        $location.path('/login');
      }
    },
    loginHandler: function() {
      if($scope.username != '' && $scope.password != '') {
        AuthService.login($scope.username, $scope.password)
        .then(function(result) {
          if(result) {
            var lastLocation = AuthService.lastLocation;
            if(lastLocation.includes('/login'))  {
              $location.path('/');
            }
            else {
              $location.path(lastLocation);
            }
          }
          else {
            $scope.error = "Your username or password is incorrect.";
          }
        });
      }
    }
  };

  var controller = {
    init: function(){
      GenericUtils.setScope(controller.scope, $scope);
      $scope.$on("$routeChangeSuccess", function(event, next, current) {
         $scope.setAuthLabel();
      });
    },
    scope: { 
      username: '',
      password: '',
      error: '',
      authLabel: _helper.setAuthLabel(),
      authClickHandler: _helper.authClickHandler,
      loginHandler: _helper.loginHandler,
      getLoginStatus: _helper.getLoginStatus,
      setAuthLabel: _helper.setAuthLabel,
      lastLocation: '/'
    }
  };
  controller.init();
}]);
