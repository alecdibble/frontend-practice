'use strict';

angular.module('appLogic', ['ngRoute', 'ngCookies'])
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
            $location.path(AuthService.lastLocation);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnRyb2xsZXJzL0FwcEN0cmwuanMiLCJjb250cm9sbGVycy9HdWVzdEJvb2tDdHJsLmpzIiwiY29udHJvbGxlcnMvU3RhdGVzQ3RybC5qcyIsInNlcnZpY2VzL0F1dGhTZXJ2aWNlLmpzIiwic2VydmljZXMvQmFzZURhdGFTZXJ2aWNlLmpzIiwic2VydmljZXMvR2VuZXJpY1V0aWxzLmpzIiwic2VydmljZXMvR3Vlc3RCb29rU2VydmljZS5qcyIsInNlcnZpY2VzL1N0YXRlU2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnLCBbJ25nUm91dGUnLCAnbmdDb29raWVzJ10pXG4gIC5jb25zdGFudCgnZXhhbXBsZScsIHsgfSlcbiAgLnJ1bihbJyRsb2cnLCBmdW5jdGlvbigkbG9nKXt9XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLmNvbmZpZyhmdW5jdGlvbiAoJHJvdXRlUHJvdmlkZXIpIHtcblxuICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgLndoZW4oJy8nLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICdTdGF0ZXNDdHJsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGVzLmh0bWwnLFxuICAgIH0pXG4gICAgLndoZW4oJy9zdGF0ZXMnLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICdTdGF0ZXNDdHJsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGVzLmh0bWwnLFxuICAgIH0pXG4gICAgLndoZW4oJy9sb2dpbicsIHtcbiAgICBcdGNvbnRyb2xsZXI6ICdBcHBDdHJsJyxcbiAgICBcdHRlbXBsYXRlVXJsOiAnL2xvZ2luLmh0bWwnXG4gICAgfSlcbiAgICAud2hlbignL2d1ZXN0Ym9vaycsIHtcbiAgICBcdGNvbnRyb2xsZXI6ICdHdWVzdEJvb2tDdHJsJyxcbiAgICBcdHRlbXBsYXRlVXJsOiAnL2d1ZXN0Ym9vay5odG1sJ1xuICAgIH0pO1xuXG59KTsgICAiLCIndXNlIHN0cmljdCc7XG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnKS5jb250cm9sbGVyKCdBcHBDdHJsJywgWyckc2NvcGUnLCAnJHJvdXRlJywgJyRsb2cnLCAnJGxvY2F0aW9uJywgJ0dlbmVyaWNVdGlscycsICdBdXRoU2VydmljZScsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlLCAkbG9nLCAkbG9jYXRpb24sIEdlbmVyaWNVdGlscywgQXV0aFNlcnZpY2Upe1xuICB2YXIgX2NvbmZpZyA9IHt9O1xuICB2YXIgX2hlbHBlciA9IHtcbiAgICBnZXRMb2dpblN0YXR1czogZnVuY3Rpb24oKSB7IFxuICAgICAgdmFyIHN0YXR1cyA9IEF1dGhTZXJ2aWNlLmNoZWNrTG9naW4oKTtcbiAgICAgIGlmKHN0YXR1cykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIHNldEF1dGhMYWJlbDogZnVuY3Rpb24oc2NvcGUpIHtcbiAgICAgIHZhciB1c2VyID0gQXV0aFNlcnZpY2UuY2hlY2tMb2dpbigpO1xuICAgICAgaWYodXNlcikge1xuICAgICAgICAkc2NvcGUuYXV0aExhYmVsID0gXCJMb2dvdXQsIFwiICsgdXNlcjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkc2NvcGUuYXV0aExhYmVsID0gXCJMb2dpblwiO1xuICAgICAgfVxuICAgIH0sXG4gICAgYXV0aENsaWNrSGFuZGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICBpZih0aGlzLmdldExvZ2luU3RhdHVzKCkpIHtcbiAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX2hlbHBlci5zZXRBdXRoTGFiZWwoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgQXV0aFNlcnZpY2UubGFzdExvY2F0aW9uID0gJGxvY2F0aW9uLnVybCgpO1xuICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2xvZ2luJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBsb2dpbkhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYoJHNjb3BlLnVzZXJuYW1lICE9ICcnICYmICRzY29wZS5wYXNzd29yZCAhPSAnJykge1xuICAgICAgICBBdXRoU2VydmljZS5sb2dpbigkc2NvcGUudXNlcm5hbWUsICRzY29wZS5wYXNzd29yZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgaWYocmVzdWx0KSB7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aChBdXRoU2VydmljZS5sYXN0TG9jYXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9IFwiWW91ciB1c2VybmFtZSBvciBwYXNzd29yZCBpcyBpbmNvcnJlY3QuXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIGNvbnRyb2xsZXIgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oKXtcbiAgICAgIEdlbmVyaWNVdGlscy5zZXRTY29wZShjb250cm9sbGVyLnNjb3BlLCAkc2NvcGUpO1xuICAgICAgJHNjb3BlLiRvbihcIiRyb3V0ZUNoYW5nZVN1Y2Nlc3NcIiwgZnVuY3Rpb24oZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcbiAgICAgICAgICRzY29wZS5zZXRBdXRoTGFiZWwoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgc2NvcGU6IHsgXG4gICAgICB1c2VybmFtZTogJycsXG4gICAgICBwYXNzd29yZDogJycsXG4gICAgICBlcnJvcjogJycsXG4gICAgICBhdXRoTGFiZWw6IF9oZWxwZXIuc2V0QXV0aExhYmVsKCksXG4gICAgICBhdXRoQ2xpY2tIYW5kbGVyOiBfaGVscGVyLmF1dGhDbGlja0hhbmRsZXIsXG4gICAgICBsb2dpbkhhbmRsZXI6IF9oZWxwZXIubG9naW5IYW5kbGVyLFxuICAgICAgZ2V0TG9naW5TdGF0dXM6IF9oZWxwZXIuZ2V0TG9naW5TdGF0dXMsXG4gICAgICBzZXRBdXRoTGFiZWw6IF9oZWxwZXIuc2V0QXV0aExhYmVsLFxuICAgICAgbGFzdExvY2F0aW9uOiAnLydcbiAgICB9XG4gIH07XG4gIGNvbnRyb2xsZXIuaW5pdCgpO1xufV0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoJ2FwcExvZ2ljJykuY29udHJvbGxlcignR3Vlc3RCb29rQ3RybCcsIFsnJHNjb3BlJywgJyRyb3V0ZScsICckbG9nJywgJ0dlbmVyaWNVdGlscycsICdHdWVzdEJvb2tTZXJ2aWNlJywgJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGUsICRsb2csIEdlbmVyaWNVdGlscywgR3Vlc3RCb29rU2VydmljZSwgQXV0aFNlcnZpY2Upe1xuICB2YXIgX2NvbmZpZyA9IHt9O1xuICB2YXIgX2hlbHBlciA9IHtcbiAgICBlbnRyeUhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgR3Vlc3RCb29rU2VydmljZS5wb3N0RW50cnkoJHNjb3BlLm5ld0VudHJ5LnBob25lLCAkc2NvcGUubmV3RW50cnkubWVzc2FnZSkuXG4gICAgICB0aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgJHNjb3BlLmVudHJpZXMgPSBkYXRhWydkYXRhJ10ucmV2ZXJzZSgpO1xuICAgICAgICBfaGVscGVyLnJlc2V0RW50cnkoKTtcbiAgICAgIH1cbiAgICAgICxcbiAgICAgIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgJHNjb3BlLmVycm9yID0gXCJBbiBlcnJvciBvY2N1cmVkXCI7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc2V0RW50cnk6IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm5ld0VudHJ5ID0ge1xuICAgICAgICBwaG9uZTogbnVsbCxcbiAgICAgICAgbWVzc2FnZTogbnVsbFxuICAgICAgfVxuICAgICAgJHNjb3BlLmdiLmdiRm9ybS4kc2V0UHJpc3RpbmUoKTtcbiAgICB9XG4gIH07XG4gIHZhciBjb250cm9sbGVyID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBHZW5lcmljVXRpbHMuc2V0U2NvcGUoY29udHJvbGxlci5zY29wZSwgJHNjb3BlKTtcbiAgICAgIEd1ZXN0Qm9va1NlcnZpY2UuZ2V0RW50cmllcygpXG4gICAgICAudGhlbihmdW5jdGlvbihlbnRyaWVzKSB7XG4gICAgICAgICRzY29wZS5lbnRyaWVzID0gZW50cmllcy5yZXZlcnNlKCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNjb3BlOiB7IFxuICAgICAgZW50cmllczogW10sXG4gICAgICBlbnRyeUhhbmRsZXI6IF9oZWxwZXIuZW50cnlIYW5kbGVyLFxuICAgICAgbG9naW5TdGF0dXM6IEF1dGhTZXJ2aWNlLmNoZWNrTG9naW4sXG4gICAgICBuZXdFbnRyeToge1xuICAgICAgICBwaG9uZTogJycsXG4gICAgICAgIG1lc3NhZ2U6ICcnXG4gICAgICB9XG4gICAgfVxuICB9O1xuICBjb250cm9sbGVyLmluaXQoKTtcbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLmNvbnRyb2xsZXIoJ1N0YXRlc0N0cmwnLCBbJyRzY29wZScsICckcm91dGUnLCAnJGxvZycsICdHZW5lcmljVXRpbHMnLCAnU3RhdGVTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGUsICRsb2csIEdlbmVyaWNVdGlscywgU3RhdGVTZXJ2aWNlKXtcbiAgdmFyIF9jb25maWcgPSB7fTtcbiAgdmFyIF9oZWxwZXIgPSB7XG4gIH07XG4gIHZhciBjb250cm9sbGVyID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBHZW5lcmljVXRpbHMuc2V0U2NvcGUoY29udHJvbGxlci5zY29wZSwgJHNjb3BlKTtcbiAgICAgIGlmKCEkc2NvcGUuc3RhdGVzICYmIFN0YXRlU2VydmljZS5zdGF0ZXMubGVuZ3RoIDwgMSkge1xuICAgICAgICBTdGF0ZVNlcnZpY2UuZ2V0QWxsU3RhdGVzKCkuXG4gICAgICAgIHRoZW4oZnVuY3Rpb24oc3RhdGVzKSB7XG4gICAgICAgICAgJHNjb3BlLnN0YXRlcyA9IHN0YXRlcztcbiAgICAgICAgICBTdGF0ZVNlcnZpY2Uuc3RhdGVzID0gc3RhdGVzO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkc2NvcGUuc3RhdGVzID0gU3RhdGVTZXJ2aWNlLnN0YXRlcztcbiAgICAgIH1cbiAgICB9LFxuICAgIHNjb3BlOiB7IH1cbiAgfTtcbiAgY29udHJvbGxlci5pbml0KCk7XG59XSk7XG4iLCIndXNlIHN0cmljdCc7XG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnKS5zZXJ2aWNlKCdBdXRoU2VydmljZScsIFsnJGxvZycsICckY29va2llcycsICdCYXNlRGF0YVNlcnZpY2UnLCBmdW5jdGlvbigkbG9nLCAkY29va2llcywgQmFzZURhdGFTZXJ2aWNlKXtcbiAgcmV0dXJuIHtcbiAgICBjaGVja0xvZ2luOiBmdW5jdGlvbigpIHtcbiAgICBcdHZhciBhdXRoQ29va2llID0gJGNvb2tpZXMuZ2V0KFwibG9naW5cIik7XG4gICAgXHRpZihhdXRoQ29va2llKSB7XG4gICAgXHRcdHJldHVybiBhdXRoQ29va2llO1xuICAgIFx0fVxuICAgIFx0cmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgbG9naW46IGZ1bmN0aW9uKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgIFx0cmV0dXJuIEJhc2VEYXRhU2VydmljZS5wb3N0KCcvbG9naW4nLCB7dXNlcjogdXNlcm5hbWUsIHBhc3N3b3JkOiBwYXNzd29yZH0pLlxuICAgIFx0dGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICBcdFx0cmV0dXJuIHRydWU7XG4gICAgXHR9LFxuICAgIFx0ZnVuY3Rpb24oZGF0YSl7XG4gICAgXHRcdHJldHVybiBmYWxzZTtcbiAgICBcdH0pO1xuICAgIH0sXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICBcdHJldHVybiBCYXNlRGF0YVNlcnZpY2UuZ2V0KCcvbG9nb3V0Jyk7XG4gICAgfSxcbiAgICBsYXN0TG9jYXRpb246ICcvJ1xuICB9O1xufV0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnKS5zZXJ2aWNlKCdCYXNlRGF0YVNlcnZpY2UnLCBbJyRodHRwJywgJyRxJywgJyRsb2cnLCBmdW5jdGlvbigkaHR0cCwgJHEsICRsb2cpe1xuICByZXR1cm4ge1xuXG4gICAgZ2V0OiBmdW5jdGlvbih1cmwpe1xuICAgICAgaWYgKCF1cmwpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuICRodHRwLmdldCh1cmwpO1xuICAgIH0sXG5cbiAgICBwb3N0OiBmdW5jdGlvbih1cmwsIHBheWxvYWQpe1xuICAgICAgaWYgKCF1cmwpIHJldHVybiBmYWxzZVxuXG4gICAgICByZXR1cm4gJGh0dHAucG9zdCh1cmwsIHBheWxvYWQpO1xuICAgIH0sXG5cbiAgICBwdXQ6IGZ1bmN0aW9uKHVybCwgcGF5bG9hZCl7XG4gICAgICBpZiAoIXVybCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4gJGh0dHAucHV0KHVybCwgcGF5bG9hZCk7XG4gICAgfSxcblxuICAgIGRlbGV0ZTogZnVuY3Rpb24odXJsKXtcbiAgICAgIGlmICghdXJsKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHJldHVybiAkaHR0cC5kZWxldGUodXJsKTtcbiAgICB9XG5cbiAgfVxufV0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnKS5zZXJ2aWNlKCdHZW5lcmljVXRpbHMnLCBbJyRsb2cnLCBmdW5jdGlvbigkbG9nKXtcbiAgcmV0dXJuIHtcbiAgICBzZXRTY29wZTogZnVuY3Rpb24oc2NvcGVTcmMsIHNjb3BlRGVzdCl7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gc2NvcGVTcmMpe1xuICAgICAgICBzY29wZURlc3Rba2V5XSA9IHNjb3BlU3JjW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9O1xufV0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoJ2FwcExvZ2ljJykuc2VydmljZSgnR3Vlc3RCb29rU2VydmljZScsIFsnJGxvZycsICckY29va2llcycsICdCYXNlRGF0YVNlcnZpY2UnLCAnJHEnLCBmdW5jdGlvbigkbG9nLCAkY29va2llcywgQmFzZURhdGFTZXJ2aWNlLCAkcSl7XG4gIHJldHVybiB7XG4gICAgcmV0cmlldmVkU3RhdGVzOiBbXSxcbiAgICBnZXRFbnRyaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBCYXNlRGF0YVNlcnZpY2UuZ2V0KCcvcmVhZCcpXG4gICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhWydkYXRhJ107XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHBvc3RFbnRyeTogZnVuY3Rpb24ocGhvbmUsIG1lc3NhZ2UpIHtcbiAgICAgIHJldHVybiBCYXNlRGF0YVNlcnZpY2UucG9zdCgnL3dyaXRlJywge3Bob25lOiBwaG9uZSwgbWVzc2FnZTogbWVzc2FnZX0pO1xuICAgIH1cbiAgfTtcbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLnNlcnZpY2UoJ1N0YXRlU2VydmljZScsIFsnJGxvZycsICckY29va2llcycsICdCYXNlRGF0YVNlcnZpY2UnLCAnJHEnLCBmdW5jdGlvbigkbG9nLCAkY29va2llcywgQmFzZURhdGFTZXJ2aWNlLCAkcSl7XG4gIHJldHVybiB7XG4gICAgcmV0cmlldmVkU3RhdGVzOiBbXSxcbiAgICBnZXRTdGF0ZUJhdGNoOiBmdW5jdGlvbihvZmZzZXQpIHtcbiAgICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuICAgICAgcmV0dXJuIEJhc2VEYXRhU2VydmljZS5nZXQoJy9zdGF0ZXM/b2Zmc2V0PScrb2Zmc2V0KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YVsnZGF0YSddO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRBbGxTdGF0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICBmb3IodmFyIG9mZnNldCA9IDA7IG9mZnNldCA8IDU7IG9mZnNldCsrKSB7XG4gICAgICAgIHByb21pc2VzLnB1c2godGhpcy5nZXRTdGF0ZUJhdGNoKCBvZmZzZXQgKiAxMCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuICRxLmFsbChwcm9taXNlcylcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHByb21pc2VSZXR1cm5zKSB7XG4gICAgICAgIHZhciBzdGF0ZXMgPSBbXTtcbiAgICAgICAgZm9yKHZhciBvZmZzZXQgPSAwOyBvZmZzZXQgPCA1OyBvZmZzZXQrKykge1xuICAgICAgICAgIHN0YXRlcyA9IHN0YXRlcy5jb25jYXQocHJvbWlzZVJldHVybnNbb2Zmc2V0XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXRlcztcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgc3RhdGVzOiBbXVxuICB9O1xufV0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
