'use strict';
angular.module('appLogic').service('AuthService', ['$log', '$cookies', 'BaseDataService', function($log, $cookies, BaseDataService){
  return {
    checkLogin: function() {
    	var authCookie = $cookies.get("login");
    	if(authCookie) {
    		return authCookie;
    	}
    	return false;
    },
    login: function(username, password) {
    	return BaseDataService.post('/login', {user: username, password: password}).
    	then(function(data){
    		return true;
    	},
    	function(data){
    		return false;
    	});
    },
    logout: function() {
    	return BaseDataService.get('/logout');
    },
    lastLocation: '/'
  };
}]);
