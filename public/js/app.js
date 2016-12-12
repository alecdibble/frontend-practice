'use strict';

angular.module('appLogic', ['ngRoute', 'ngCookies', 'ngSanitize'])
  .constant('example', { })
  .run(['$log', function($log){}]);

angular.module('appLogic').config(function ($routeProvider) {

    $routeProvider
    .when('/', {
        controller: 'StatesCtrl',
        templateUrl: '/states.html',
    })
    .when('/states', {
        controller: 'StatesCtrl',
        templateUrl: '/states.html',
    })
    .when('/login', {
    	controller: 'AppCtrl',
    	templateUrl: '/login.html'
    })
    .when('/guestbook', {
    	controller: 'GuestBookCtrl',
    	templateUrl: '/guestbook.html'
    });

});   
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnRyb2xsZXJzL0FwcEN0cmwuanMiLCJjb250cm9sbGVycy9HdWVzdEJvb2tDdHJsLmpzIiwiY29udHJvbGxlcnMvU3RhdGVzQ3RybC5qcyIsInNlcnZpY2VzL0F1dGhTZXJ2aWNlLmpzIiwic2VydmljZXMvQmFzZURhdGFTZXJ2aWNlLmpzIiwic2VydmljZXMvR2VuZXJpY1V0aWxzLmpzIiwic2VydmljZXMvR3Vlc3RCb29rU2VydmljZS5qcyIsInNlcnZpY2VzL1N0YXRlU2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnLCBbJ25nUm91dGUnLCAnbmdDb29raWVzJywgJ25nU2FuaXRpemUnXSlcbiAgLmNvbnN0YW50KCdleGFtcGxlJywgeyB9KVxuICAucnVuKFsnJGxvZycsIGZ1bmN0aW9uKCRsb2cpe31dKTtcblxuYW5ndWxhci5tb2R1bGUoJ2FwcExvZ2ljJykuY29uZmlnKGZ1bmN0aW9uICgkcm91dGVQcm92aWRlcikge1xuXG4gICAgJHJvdXRlUHJvdmlkZXJcbiAgICAud2hlbignLycsIHtcbiAgICAgICAgY29udHJvbGxlcjogJ1N0YXRlc0N0cmwnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0ZXMuaHRtbCcsXG4gICAgfSlcbiAgICAud2hlbignL3N0YXRlcycsIHtcbiAgICAgICAgY29udHJvbGxlcjogJ1N0YXRlc0N0cmwnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0ZXMuaHRtbCcsXG4gICAgfSlcbiAgICAud2hlbignL2xvZ2luJywge1xuICAgIFx0Y29udHJvbGxlcjogJ0FwcEN0cmwnLFxuICAgIFx0dGVtcGxhdGVVcmw6ICcvbG9naW4uaHRtbCdcbiAgICB9KVxuICAgIC53aGVuKCcvZ3Vlc3Rib29rJywge1xuICAgIFx0Y29udHJvbGxlcjogJ0d1ZXN0Qm9va0N0cmwnLFxuICAgIFx0dGVtcGxhdGVVcmw6ICcvZ3Vlc3Rib29rLmh0bWwnXG4gICAgfSk7XG5cbn0pOyAgICIsIid1c2Ugc3RyaWN0JztcbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLmNvbnRyb2xsZXIoJ0FwcEN0cmwnLCBbJyRzY29wZScsICckcm91dGUnLCAnJGxvZycsICckbG9jYXRpb24nLCAnR2VuZXJpY1V0aWxzJywgJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGUsICRsb2csICRsb2NhdGlvbiwgR2VuZXJpY1V0aWxzLCBBdXRoU2VydmljZSl7XG4gIHZhciBfY29uZmlnID0ge307XG4gIHZhciBfaGVscGVyID0ge1xuICAgIGdldExvZ2luU3RhdHVzOiBmdW5jdGlvbigpIHsgXG4gICAgICB2YXIgc3RhdHVzID0gQXV0aFNlcnZpY2UuY2hlY2tMb2dpbigpO1xuICAgICAgaWYoc3RhdHVzKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgc2V0QXV0aExhYmVsOiBmdW5jdGlvbihzY29wZSkge1xuICAgICAgdmFyIHVzZXIgPSBBdXRoU2VydmljZS5jaGVja0xvZ2luKCk7XG4gICAgICBpZih1c2VyKSB7XG4gICAgICAgICRzY29wZS5hdXRoTGFiZWwgPSBcIkxvZ291dCwgXCIgKyB1c2VyO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRzY29wZS5hdXRoTGFiZWwgPSBcIkxvZ2luXCI7XG4gICAgICB9XG4gICAgfSxcbiAgICBhdXRoQ2xpY2tIYW5kbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmKHRoaXMuZ2V0TG9naW5TdGF0dXMoKSkge1xuICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKVxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBfaGVscGVyLnNldEF1dGhMYWJlbCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBBdXRoU2VydmljZS5sYXN0TG9jYXRpb24gPSAkbG9jYXRpb24udXJsKCk7XG4gICAgICAgICRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxvZ2luSGFuZGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICBpZigkc2NvcGUudXNlcm5hbWUgIT0gJycgJiYgJHNjb3BlLnBhc3N3b3JkICE9ICcnKSB7XG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKCRzY29wZS51c2VybmFtZSwgJHNjb3BlLnBhc3N3b3JkKVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICBpZihyZXN1bHQpIHtcbiAgICAgICAgICAgIHZhciBsYXN0TG9jYXRpb24gPSBBdXRoU2VydmljZS5sYXN0TG9jYXRpb247XG4gICAgICAgICAgICBpZihsYXN0TG9jYXRpb24uaW5jbHVkZXMoJy9sb2dpbicpKSAge1xuICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKGxhc3RMb2NhdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gXCJZb3VyIHVzZXJuYW1lIG9yIHBhc3N3b3JkIGlzIGluY29ycmVjdC5cIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgY29udHJvbGxlciA9IHtcbiAgICBpbml0OiBmdW5jdGlvbigpe1xuICAgICAgR2VuZXJpY1V0aWxzLnNldFNjb3BlKGNvbnRyb2xsZXIuc2NvcGUsICRzY29wZSk7XG4gICAgICAkc2NvcGUuJG9uKFwiJHJvdXRlQ2hhbmdlU3VjY2Vzc1wiLCBmdW5jdGlvbihldmVudCwgbmV4dCwgY3VycmVudCkge1xuICAgICAgICAgJHNjb3BlLnNldEF1dGhMYWJlbCgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBzY29wZTogeyBcbiAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgIHBhc3N3b3JkOiAnJyxcbiAgICAgIGVycm9yOiAnJyxcbiAgICAgIGF1dGhMYWJlbDogX2hlbHBlci5zZXRBdXRoTGFiZWwoKSxcbiAgICAgIGF1dGhDbGlja0hhbmRsZXI6IF9oZWxwZXIuYXV0aENsaWNrSGFuZGxlcixcbiAgICAgIGxvZ2luSGFuZGxlcjogX2hlbHBlci5sb2dpbkhhbmRsZXIsXG4gICAgICBnZXRMb2dpblN0YXR1czogX2hlbHBlci5nZXRMb2dpblN0YXR1cyxcbiAgICAgIHNldEF1dGhMYWJlbDogX2hlbHBlci5zZXRBdXRoTGFiZWwsXG4gICAgICBsYXN0TG9jYXRpb246ICcvJ1xuICAgIH1cbiAgfTtcbiAgY29udHJvbGxlci5pbml0KCk7XG59XSk7XG4iLCIndXNlIHN0cmljdCc7XG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnKS5jb250cm9sbGVyKCdHdWVzdEJvb2tDdHJsJywgWyckc2NvcGUnLCAnJHJvdXRlJywgJyRsb2cnLCAnR2VuZXJpY1V0aWxzJywgJ0d1ZXN0Qm9va1NlcnZpY2UnLCAnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZSwgJGxvZywgR2VuZXJpY1V0aWxzLCBHdWVzdEJvb2tTZXJ2aWNlLCBBdXRoU2VydmljZSl7XG4gIHZhciBfY29uZmlnID0ge307XG4gIHZhciBfaGVscGVyID0ge1xuICAgIGVudHJ5SGFuZGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICBHdWVzdEJvb2tTZXJ2aWNlLnBvc3RFbnRyeSgkc2NvcGUubmV3RW50cnkucGhvbmUsICRzY29wZS5uZXdFbnRyeS5tZXNzYWdlKS5cbiAgICAgIHRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAkc2NvcGUuZW50cmllcyA9IGRhdGFbJ2RhdGEnXS5yZXZlcnNlKCk7XG4gICAgICAgIF9oZWxwZXIucmVzZXRFbnRyeSgpO1xuICAgICAgfVxuICAgICAgLFxuICAgICAgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAkc2NvcGUuZXJyb3IgPSBcIkFuIGVycm9yIG9jY3VyZWRcIjtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVzZXRFbnRyeTogZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUubmV3RW50cnkgPSB7XG4gICAgICAgIHBob25lOiBudWxsLFxuICAgICAgICBtZXNzYWdlOiBudWxsXG4gICAgICB9XG4gICAgICAkc2NvcGUuZ2IuZ2JGb3JtLiRzZXRQcmlzdGluZSgpO1xuICAgIH1cbiAgfTtcbiAgdmFyIGNvbnRyb2xsZXIgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oKXtcbiAgICAgIEdlbmVyaWNVdGlscy5zZXRTY29wZShjb250cm9sbGVyLnNjb3BlLCAkc2NvcGUpO1xuICAgICAgR3Vlc3RCb29rU2VydmljZS5nZXRFbnRyaWVzKClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKGVudHJpZXMpIHtcbiAgICAgICAgJHNjb3BlLmVudHJpZXMgPSBlbnRyaWVzLnJldmVyc2UoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgc2NvcGU6IHsgXG4gICAgICBlbnRyaWVzOiBbXSxcbiAgICAgIGVudHJ5SGFuZGxlcjogX2hlbHBlci5lbnRyeUhhbmRsZXIsXG4gICAgICBsb2dpblN0YXR1czogQXV0aFNlcnZpY2UuY2hlY2tMb2dpbixcbiAgICAgIG5ld0VudHJ5OiB7XG4gICAgICAgIHBob25lOiAnJyxcbiAgICAgICAgbWVzc2FnZTogJydcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGNvbnRyb2xsZXIuaW5pdCgpO1xufV0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoJ2FwcExvZ2ljJykuY29udHJvbGxlcignU3RhdGVzQ3RybCcsIFsnJHNjb3BlJywgJyRyb3V0ZScsICckbG9nJywgJ0dlbmVyaWNVdGlscycsICdTdGF0ZVNlcnZpY2UnLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZSwgJGxvZywgR2VuZXJpY1V0aWxzLCBTdGF0ZVNlcnZpY2Upe1xuICB2YXIgX2NvbmZpZyA9IHt9O1xuICB2YXIgX2hlbHBlciA9IHtcbiAgfTtcbiAgdmFyIGNvbnRyb2xsZXIgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oKXtcbiAgICAgIEdlbmVyaWNVdGlscy5zZXRTY29wZShjb250cm9sbGVyLnNjb3BlLCAkc2NvcGUpO1xuICAgICAgaWYoISRzY29wZS5zdGF0ZXMgJiYgU3RhdGVTZXJ2aWNlLnN0YXRlcy5sZW5ndGggPCAxKSB7XG4gICAgICAgIFN0YXRlU2VydmljZS5nZXRBbGxTdGF0ZXMoKS5cbiAgICAgICAgdGhlbihmdW5jdGlvbihzdGF0ZXMpIHtcbiAgICAgICAgICAkc2NvcGUuc3RhdGVzID0gc3RhdGVzO1xuICAgICAgICAgIFN0YXRlU2VydmljZS5zdGF0ZXMgPSBzdGF0ZXM7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRzY29wZS5zdGF0ZXMgPSBTdGF0ZVNlcnZpY2Uuc3RhdGVzO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2NvcGU6IHsgfVxuICB9O1xuICBjb250cm9sbGVyLmluaXQoKTtcbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgWyckbG9nJywgJyRjb29raWVzJywgJ0Jhc2VEYXRhU2VydmljZScsIGZ1bmN0aW9uKCRsb2csICRjb29raWVzLCBCYXNlRGF0YVNlcnZpY2Upe1xuICByZXR1cm4ge1xuICAgIGNoZWNrTG9naW46IGZ1bmN0aW9uKCkge1xuICAgIFx0dmFyIGF1dGhDb29raWUgPSAkY29va2llcy5nZXQoXCJsb2dpblwiKTtcbiAgICBcdGlmKGF1dGhDb29raWUpIHtcbiAgICBcdFx0cmV0dXJuIGF1dGhDb29raWU7XG4gICAgXHR9XG4gICAgXHRyZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBsb2dpbjogZnVuY3Rpb24odXNlcm5hbWUsIHBhc3N3b3JkKSB7XG4gICAgXHRyZXR1cm4gQmFzZURhdGFTZXJ2aWNlLnBvc3QoJy9sb2dpbicsIHt1c2VyOiB1c2VybmFtZSwgcGFzc3dvcmQ6IHBhc3N3b3JkfSkuXG4gICAgXHR0aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgIFx0XHRyZXR1cm4gdHJ1ZTtcbiAgICBcdH0sXG4gICAgXHRmdW5jdGlvbihkYXRhKXtcbiAgICBcdFx0cmV0dXJuIGZhbHNlO1xuICAgIFx0fSk7XG4gICAgfSxcbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgIFx0cmV0dXJuIEJhc2VEYXRhU2VydmljZS5nZXQoJy9sb2dvdXQnKTtcbiAgICB9LFxuICAgIGxhc3RMb2NhdGlvbjogJy8nXG4gIH07XG59XSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLnNlcnZpY2UoJ0Jhc2VEYXRhU2VydmljZScsIFsnJGh0dHAnLCAnJHEnLCAnJGxvZycsIGZ1bmN0aW9uKCRodHRwLCAkcSwgJGxvZyl7XG4gIHJldHVybiB7XG5cbiAgICBnZXQ6IGZ1bmN0aW9uKHVybCl7XG4gICAgICBpZiAoIXVybCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KHVybCk7XG4gICAgfSxcblxuICAgIHBvc3Q6IGZ1bmN0aW9uKHVybCwgcGF5bG9hZCl7XG4gICAgICBpZiAoIXVybCkgcmV0dXJuIGZhbHNlXG5cbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KHVybCwgcGF5bG9hZCk7XG4gICAgfSxcblxuICAgIHB1dDogZnVuY3Rpb24odXJsLCBwYXlsb2FkKXtcbiAgICAgIGlmICghdXJsKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHJldHVybiAkaHR0cC5wdXQodXJsLCBwYXlsb2FkKTtcbiAgICB9LFxuXG4gICAgZGVsZXRlOiBmdW5jdGlvbih1cmwpe1xuICAgICAgaWYgKCF1cmwpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZSh1cmwpO1xuICAgIH1cblxuICB9XG59XSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLnNlcnZpY2UoJ0dlbmVyaWNVdGlscycsIFsnJGxvZycsIGZ1bmN0aW9uKCRsb2cpe1xuICByZXR1cm4ge1xuICAgIHNldFNjb3BlOiBmdW5jdGlvbihzY29wZVNyYywgc2NvcGVEZXN0KXtcbiAgICAgIGZvciAodmFyIGtleSBpbiBzY29wZVNyYyl7XG4gICAgICAgIHNjb3BlRGVzdFtrZXldID0gc2NvcGVTcmNba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XSk7XG4iLCIndXNlIHN0cmljdCc7XG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnKS5zZXJ2aWNlKCdHdWVzdEJvb2tTZXJ2aWNlJywgWyckbG9nJywgJyRjb29raWVzJywgJyRzYW5pdGl6ZScsICdCYXNlRGF0YVNlcnZpY2UnLCAnJHEnLCBmdW5jdGlvbigkbG9nLCAkY29va2llcywgJHNhbml0aXplLCBCYXNlRGF0YVNlcnZpY2UsICRxKXtcbiAgcmV0dXJuIHtcbiAgICByZXRyaWV2ZWRTdGF0ZXM6IFtdLFxuICAgIGdldEVudHJpZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEJhc2VEYXRhU2VydmljZS5nZXQoJy9yZWFkJylcbiAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFbJ2RhdGEnXTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcG9zdEVudHJ5OiBmdW5jdGlvbihwaG9uZSwgbWVzc2FnZSkge1xuICAgICAgcmV0dXJuIEJhc2VEYXRhU2VydmljZS5wb3N0KCcvd3JpdGUnLCB7cGhvbmU6ICRzYW5pdGl6ZShwaG9uZSksIG1lc3NhZ2U6ICRzYW5pdGl6ZShtZXNzYWdlKX0pO1xuICAgIH1cbiAgfTtcbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLnNlcnZpY2UoJ1N0YXRlU2VydmljZScsIFsnJGxvZycsICckY29va2llcycsICdCYXNlRGF0YVNlcnZpY2UnLCAnJHEnLCBmdW5jdGlvbigkbG9nLCAkY29va2llcywgQmFzZURhdGFTZXJ2aWNlLCAkcSl7XG4gIHJldHVybiB7XG4gICAgcmV0cmlldmVkU3RhdGVzOiBbXSxcbiAgICBnZXRTdGF0ZUJhdGNoOiBmdW5jdGlvbihvZmZzZXQpIHtcbiAgICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuICAgICAgcmV0dXJuIEJhc2VEYXRhU2VydmljZS5nZXQoJy9zdGF0ZXM/b2Zmc2V0PScrb2Zmc2V0KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YVsnZGF0YSddO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRBbGxTdGF0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICBmb3IodmFyIG9mZnNldCA9IDA7IG9mZnNldCA8IDU7IG9mZnNldCsrKSB7XG4gICAgICAgIHByb21pc2VzLnB1c2godGhpcy5nZXRTdGF0ZUJhdGNoKCBvZmZzZXQgKiAxMCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuICRxLmFsbChwcm9taXNlcylcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHByb21pc2VSZXR1cm5zKSB7XG4gICAgICAgIHZhciBzdGF0ZXMgPSBbXTtcbiAgICAgICAgZm9yKHZhciBvZmZzZXQgPSAwOyBvZmZzZXQgPCA1OyBvZmZzZXQrKykge1xuICAgICAgICAgIHN0YXRlcyA9IHN0YXRlcy5jb25jYXQocHJvbWlzZVJldHVybnNbb2Zmc2V0XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXRlcztcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgc3RhdGVzOiBbXVxuICB9O1xufV0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
