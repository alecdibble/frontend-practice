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

angular.module('appLogic').directive('exampleBh', ['$log', function($log){
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var _config = {};
      var _helper = {};
      var link = {
        init: function(){}
      };
      link.init();
    }
  }
}]);

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImJlaGF2aW9ycy9leGFtcGxlQmguanMiLCJjb250cm9sbGVycy9BcHBDdHJsLmpzIiwiY29udHJvbGxlcnMvR3Vlc3RCb29rQ3RybC5qcyIsImNvbnRyb2xsZXJzL1N0YXRlc0N0cmwuanMiLCJzZXJ2aWNlcy9BdXRoU2VydmljZS5qcyIsInNlcnZpY2VzL0Jhc2VEYXRhU2VydmljZS5qcyIsInNlcnZpY2VzL0dlbmVyaWNVdGlscy5qcyIsInNlcnZpY2VzL0d1ZXN0Qm9va1NlcnZpY2UuanMiLCJzZXJ2aWNlcy9TdGF0ZVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnLCBbJ25nUm91dGUnLCAnbmdDb29raWVzJ10pXG4gIC5jb25zdGFudCgnZXhhbXBsZScsIHsgfSlcbiAgLnJ1bihbJyRsb2cnLCBmdW5jdGlvbigkbG9nKXt9XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLmNvbmZpZyhmdW5jdGlvbiAoJHJvdXRlUHJvdmlkZXIpIHtcblxuICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgLndoZW4oJy8nLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICdTdGF0ZXNDdHJsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGVzLmh0bWwnLFxuICAgIH0pXG4gICAgLndoZW4oJy9zdGF0ZXMnLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICdTdGF0ZXNDdHJsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGVzLmh0bWwnLFxuICAgIH0pXG4gICAgLndoZW4oJy9sb2dpbicsIHtcbiAgICBcdGNvbnRyb2xsZXI6ICdBcHBDdHJsJyxcbiAgICBcdHRlbXBsYXRlVXJsOiAnL2xvZ2luLmh0bWwnXG4gICAgfSlcbiAgICAud2hlbignL2d1ZXN0Ym9vaycsIHtcbiAgICBcdGNvbnRyb2xsZXI6ICdHdWVzdEJvb2tDdHJsJyxcbiAgICBcdHRlbXBsYXRlVXJsOiAnL2d1ZXN0Ym9vay5odG1sJ1xuICAgIH0pO1xuXG59KTsgICAiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLmRpcmVjdGl2ZSgnZXhhbXBsZUJoJywgWyckbG9nJywgZnVuY3Rpb24oJGxvZyl7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHZhciBfY29uZmlnID0ge307XG4gICAgICB2YXIgX2hlbHBlciA9IHt9O1xuICAgICAgdmFyIGxpbmsgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCl7fVxuICAgICAgfTtcbiAgICAgIGxpbmsuaW5pdCgpO1xuICAgIH1cbiAgfVxufV0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoJ2FwcExvZ2ljJykuY29udHJvbGxlcignQXBwQ3RybCcsIFsnJHNjb3BlJywgJyRyb3V0ZScsICckbG9nJywgJyRsb2NhdGlvbicsICdHZW5lcmljVXRpbHMnLCAnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZSwgJGxvZywgJGxvY2F0aW9uLCBHZW5lcmljVXRpbHMsIEF1dGhTZXJ2aWNlKXtcbiAgdmFyIF9jb25maWcgPSB7fTtcbiAgdmFyIF9oZWxwZXIgPSB7XG4gICAgZ2V0TG9naW5TdGF0dXM6IGZ1bmN0aW9uKCkgeyBcbiAgICAgIHZhciBzdGF0dXMgPSBBdXRoU2VydmljZS5jaGVja0xvZ2luKCk7XG4gICAgICBpZihzdGF0dXMpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBzZXRBdXRoTGFiZWw6IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgICB2YXIgdXNlciA9IEF1dGhTZXJ2aWNlLmNoZWNrTG9naW4oKTtcbiAgICAgIGlmKHVzZXIpIHtcbiAgICAgICAgJHNjb3BlLmF1dGhMYWJlbCA9IFwiTG9nb3V0LCBcIiArIHVzZXI7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgJHNjb3BlLmF1dGhMYWJlbCA9IFwiTG9naW5cIjtcbiAgICAgIH1cbiAgICB9LFxuICAgIGF1dGhDbGlja0hhbmRsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYodGhpcy5nZXRMb2dpblN0YXR1cygpKSB7XG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF9oZWxwZXIuc2V0QXV0aExhYmVsKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIEF1dGhTZXJ2aWNlLmxhc3RMb2NhdGlvbiA9ICRsb2NhdGlvbi51cmwoKTtcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbG9naW5IYW5kbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmKCRzY29wZS51c2VybmFtZSAhPSAnJyAmJiAkc2NvcGUucGFzc3dvcmQgIT0gJycpIHtcbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4oJHNjb3BlLnVzZXJuYW1lLCAkc2NvcGUucGFzc3dvcmQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIGlmKHJlc3VsdCkge1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoQXV0aFNlcnZpY2UubGFzdExvY2F0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBcIllvdXIgdXNlcm5hbWUgb3IgcGFzc3dvcmQgaXMgaW5jb3JyZWN0LlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBjb250cm9sbGVyID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBHZW5lcmljVXRpbHMuc2V0U2NvcGUoY29udHJvbGxlci5zY29wZSwgJHNjb3BlKTtcbiAgICAgICRzY29wZS4kb24oXCIkcm91dGVDaGFuZ2VTdWNjZXNzXCIsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG4gICAgICAgICAkc2NvcGUuc2V0QXV0aExhYmVsKCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNjb3BlOiB7IFxuICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgcGFzc3dvcmQ6ICcnLFxuICAgICAgZXJyb3I6ICcnLFxuICAgICAgYXV0aExhYmVsOiBfaGVscGVyLnNldEF1dGhMYWJlbCgpLFxuICAgICAgYXV0aENsaWNrSGFuZGxlcjogX2hlbHBlci5hdXRoQ2xpY2tIYW5kbGVyLFxuICAgICAgbG9naW5IYW5kbGVyOiBfaGVscGVyLmxvZ2luSGFuZGxlcixcbiAgICAgIGdldExvZ2luU3RhdHVzOiBfaGVscGVyLmdldExvZ2luU3RhdHVzLFxuICAgICAgc2V0QXV0aExhYmVsOiBfaGVscGVyLnNldEF1dGhMYWJlbCxcbiAgICAgIGxhc3RMb2NhdGlvbjogJy8nXG4gICAgfVxuICB9O1xuICBjb250cm9sbGVyLmluaXQoKTtcbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLmNvbnRyb2xsZXIoJ0d1ZXN0Qm9va0N0cmwnLCBbJyRzY29wZScsICckcm91dGUnLCAnJGxvZycsICdHZW5lcmljVXRpbHMnLCAnR3Vlc3RCb29rU2VydmljZScsICdBdXRoU2VydmljZScsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlLCAkbG9nLCBHZW5lcmljVXRpbHMsIEd1ZXN0Qm9va1NlcnZpY2UsIEF1dGhTZXJ2aWNlKXtcbiAgdmFyIF9jb25maWcgPSB7fTtcbiAgdmFyIF9oZWxwZXIgPSB7XG4gICAgZW50cnlIYW5kbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIEd1ZXN0Qm9va1NlcnZpY2UucG9zdEVudHJ5KCRzY29wZS5uZXdFbnRyeS5waG9uZSwgJHNjb3BlLm5ld0VudHJ5Lm1lc3NhZ2UpLlxuICAgICAgdGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICRzY29wZS5lbnRyaWVzID0gZGF0YVsnZGF0YSddLnJldmVyc2UoKTtcbiAgICAgICAgX2hlbHBlci5yZXNldEVudHJ5KCk7XG4gICAgICB9XG4gICAgICAsXG4gICAgICBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICRzY29wZS5lcnJvciA9IFwiQW4gZXJyb3Igb2NjdXJlZFwiO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZXNldEVudHJ5OiBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5uZXdFbnRyeSA9IHtcbiAgICAgICAgcGhvbmU6IG51bGwsXG4gICAgICAgIG1lc3NhZ2U6IG51bGxcbiAgICAgIH1cbiAgICAgICRzY29wZS5nYi5nYkZvcm0uJHNldFByaXN0aW5lKCk7XG4gICAgfVxuICB9O1xuICB2YXIgY29udHJvbGxlciA9IHtcbiAgICBpbml0OiBmdW5jdGlvbigpe1xuICAgICAgR2VuZXJpY1V0aWxzLnNldFNjb3BlKGNvbnRyb2xsZXIuc2NvcGUsICRzY29wZSk7XG4gICAgICBHdWVzdEJvb2tTZXJ2aWNlLmdldEVudHJpZXMoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZW50cmllcykge1xuICAgICAgICAkc2NvcGUuZW50cmllcyA9IGVudHJpZXMucmV2ZXJzZSgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBzY29wZTogeyBcbiAgICAgIGVudHJpZXM6IFtdLFxuICAgICAgZW50cnlIYW5kbGVyOiBfaGVscGVyLmVudHJ5SGFuZGxlcixcbiAgICAgIGxvZ2luU3RhdHVzOiBBdXRoU2VydmljZS5jaGVja0xvZ2luLFxuICAgICAgbmV3RW50cnk6IHtcbiAgICAgICAgcGhvbmU6ICcnLFxuICAgICAgICBtZXNzYWdlOiAnJ1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgY29udHJvbGxlci5pbml0KCk7XG59XSk7XG4iLCIndXNlIHN0cmljdCc7XG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnKS5jb250cm9sbGVyKCdTdGF0ZXNDdHJsJywgWyckc2NvcGUnLCAnJHJvdXRlJywgJyRsb2cnLCAnR2VuZXJpY1V0aWxzJywgJ1N0YXRlU2VydmljZScsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlLCAkbG9nLCBHZW5lcmljVXRpbHMsIFN0YXRlU2VydmljZSl7XG4gIHZhciBfY29uZmlnID0ge307XG4gIHZhciBfaGVscGVyID0ge1xuICB9O1xuICB2YXIgY29udHJvbGxlciA9IHtcbiAgICBpbml0OiBmdW5jdGlvbigpe1xuICAgICAgR2VuZXJpY1V0aWxzLnNldFNjb3BlKGNvbnRyb2xsZXIuc2NvcGUsICRzY29wZSk7XG4gICAgICBpZighJHNjb3BlLnN0YXRlcyAmJiBTdGF0ZVNlcnZpY2Uuc3RhdGVzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgU3RhdGVTZXJ2aWNlLmdldEFsbFN0YXRlcygpLlxuICAgICAgICB0aGVuKGZ1bmN0aW9uKHN0YXRlcykge1xuICAgICAgICAgICRzY29wZS5zdGF0ZXMgPSBzdGF0ZXM7XG4gICAgICAgICAgU3RhdGVTZXJ2aWNlLnN0YXRlcyA9IHN0YXRlcztcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgJHNjb3BlLnN0YXRlcyA9IFN0YXRlU2VydmljZS5zdGF0ZXM7XG4gICAgICB9XG4gICAgfSxcbiAgICBzY29wZTogeyB9XG4gIH07XG4gIGNvbnRyb2xsZXIuaW5pdCgpO1xufV0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoJ2FwcExvZ2ljJykuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBbJyRsb2cnLCAnJGNvb2tpZXMnLCAnQmFzZURhdGFTZXJ2aWNlJywgZnVuY3Rpb24oJGxvZywgJGNvb2tpZXMsIEJhc2VEYXRhU2VydmljZSl7XG4gIHJldHVybiB7XG4gICAgY2hlY2tMb2dpbjogZnVuY3Rpb24oKSB7XG4gICAgXHR2YXIgYXV0aENvb2tpZSA9ICRjb29raWVzLmdldChcImxvZ2luXCIpO1xuICAgIFx0aWYoYXV0aENvb2tpZSkge1xuICAgIFx0XHRyZXR1cm4gYXV0aENvb2tpZTtcbiAgICBcdH1cbiAgICBcdHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIGxvZ2luOiBmdW5jdGlvbih1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICBcdHJldHVybiBCYXNlRGF0YVNlcnZpY2UucG9zdCgnL2xvZ2luJywge3VzZXI6IHVzZXJuYW1lLCBwYXNzd29yZDogcGFzc3dvcmR9KS5cbiAgICBcdHRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgXHRcdHJldHVybiB0cnVlO1xuICAgIFx0fSxcbiAgICBcdGZ1bmN0aW9uKGRhdGEpe1xuICAgIFx0XHRyZXR1cm4gZmFsc2U7XG4gICAgXHR9KTtcbiAgICB9LFxuICAgIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgXHRyZXR1cm4gQmFzZURhdGFTZXJ2aWNlLmdldCgnL2xvZ291dCcpO1xuICAgIH0sXG4gICAgbGFzdExvY2F0aW9uOiAnLydcbiAgfTtcbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcExvZ2ljJykuc2VydmljZSgnQmFzZURhdGFTZXJ2aWNlJywgWyckaHR0cCcsICckcScsICckbG9nJywgZnVuY3Rpb24oJGh0dHAsICRxLCAkbG9nKXtcbiAgcmV0dXJuIHtcblxuICAgIGdldDogZnVuY3Rpb24odXJsKXtcbiAgICAgIGlmICghdXJsKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHJldHVybiAkaHR0cC5nZXQodXJsKTtcbiAgICB9LFxuXG4gICAgcG9zdDogZnVuY3Rpb24odXJsLCBwYXlsb2FkKXtcbiAgICAgIGlmICghdXJsKSByZXR1cm4gZmFsc2VcblxuICAgICAgcmV0dXJuICRodHRwLnBvc3QodXJsLCBwYXlsb2FkKTtcbiAgICB9LFxuXG4gICAgcHV0OiBmdW5jdGlvbih1cmwsIHBheWxvYWQpe1xuICAgICAgaWYgKCF1cmwpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuICRodHRwLnB1dCh1cmwsIHBheWxvYWQpO1xuICAgIH0sXG5cbiAgICBkZWxldGU6IGZ1bmN0aW9uKHVybCl7XG4gICAgICBpZiAoIXVybCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKHVybCk7XG4gICAgfVxuXG4gIH1cbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcExvZ2ljJykuc2VydmljZSgnR2VuZXJpY1V0aWxzJywgWyckbG9nJywgZnVuY3Rpb24oJGxvZyl7XG4gIHJldHVybiB7XG4gICAgc2V0U2NvcGU6IGZ1bmN0aW9uKHNjb3BlU3JjLCBzY29wZURlc3Qpe1xuICAgICAgZm9yICh2YXIga2V5IGluIHNjb3BlU3JjKXtcbiAgICAgICAgc2NvcGVEZXN0W2tleV0gPSBzY29wZVNyY1trZXldO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcbmFuZ3VsYXIubW9kdWxlKCdhcHBMb2dpYycpLnNlcnZpY2UoJ0d1ZXN0Qm9va1NlcnZpY2UnLCBbJyRsb2cnLCAnJGNvb2tpZXMnLCAnQmFzZURhdGFTZXJ2aWNlJywgJyRxJywgZnVuY3Rpb24oJGxvZywgJGNvb2tpZXMsIEJhc2VEYXRhU2VydmljZSwgJHEpe1xuICByZXR1cm4ge1xuICAgIHJldHJpZXZlZFN0YXRlczogW10sXG4gICAgZ2V0RW50cmllczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gQmFzZURhdGFTZXJ2aWNlLmdldCgnL3JlYWQnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YVsnZGF0YSddO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBwb3N0RW50cnk6IGZ1bmN0aW9uKHBob25lLCBtZXNzYWdlKSB7XG4gICAgICByZXR1cm4gQmFzZURhdGFTZXJ2aWNlLnBvc3QoJy93cml0ZScsIHtwaG9uZTogcGhvbmUsIG1lc3NhZ2U6IG1lc3NhZ2V9KTtcbiAgICB9XG4gIH07XG59XSk7XG4iLCIndXNlIHN0cmljdCc7XG5hbmd1bGFyLm1vZHVsZSgnYXBwTG9naWMnKS5zZXJ2aWNlKCdTdGF0ZVNlcnZpY2UnLCBbJyRsb2cnLCAnJGNvb2tpZXMnLCAnQmFzZURhdGFTZXJ2aWNlJywgJyRxJywgZnVuY3Rpb24oJGxvZywgJGNvb2tpZXMsIEJhc2VEYXRhU2VydmljZSwgJHEpe1xuICByZXR1cm4ge1xuICAgIHJldHJpZXZlZFN0YXRlczogW10sXG4gICAgZ2V0U3RhdGVCYXRjaDogZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcbiAgICAgIHJldHVybiBCYXNlRGF0YVNlcnZpY2UuZ2V0KCcvc3RhdGVzP29mZnNldD0nK29mZnNldClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFbJ2RhdGEnXTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0QWxsU3RhdGVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgICAgZm9yKHZhciBvZmZzZXQgPSAwOyBvZmZzZXQgPCA1OyBvZmZzZXQrKykge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuZ2V0U3RhdGVCYXRjaCggb2Zmc2V0ICogMTApKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkcS5hbGwocHJvbWlzZXMpXG4gICAgICAudGhlbihmdW5jdGlvbihwcm9taXNlUmV0dXJucykge1xuICAgICAgICB2YXIgc3RhdGVzID0gW107XG4gICAgICAgIGZvcih2YXIgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgNTsgb2Zmc2V0KyspIHtcbiAgICAgICAgICBzdGF0ZXMgPSBzdGF0ZXMuY29uY2F0KHByb21pc2VSZXR1cm5zW29mZnNldF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdGF0ZXM7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHN0YXRlczogW11cbiAgfTtcbn1dKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
