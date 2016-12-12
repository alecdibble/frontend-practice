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