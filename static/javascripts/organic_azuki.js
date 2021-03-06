(function () {
  'use strict';

  var app = angular
    .module('organic_azuki', [
      'ngMaterial',
      'ngMessages',
      'angularPayments',
      'organic_azuki.config',
      'organic_azuki.routes',
      'organic_azuki.authentication',
      'organic_azuki.shop',
      'organic_azuki.layout',
      'organic_azuki.utils',
    ]);

  angular
    .module('organic_azuki.routes', ['ngRoute']);

  angular
    .module( 'organic_azuki.config',[]);

  angular
    .module('organic_azuki')
    .run(run);

   run.$inject = ['$http', '$location', '$rootScope'];

   /**
   * @name run
   * @desc Update xsrf $http headers to align with Django's defaults
   */
   function run($http, $location, $rootScope) {
     $http.defaults.xsrfHeaderName = 'X-CSRFToken';
     $http.defaults.xsrfCookieName = 'csrftoken';

     var history = [];
     $rootScope.$on('$routeChangeSuccess', function() {
        history.push($location.$$path);
     });
     $rootScope.back = function () {
        var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
        $location.path(prevUrl);
     };

   }

  app.filter('isEmpty', [function() {
    return function(object) {
       return angular.equals({}, object);
    }
  }]);
  app.filter('isEmptyArray', [function() {
    return function(object) {
       return angular.equals([], object);
    }
  }]);

  app.filter('linebreaks', [function() {
    return function(text) {
       var rich_text = text.replace("\n","<br>");
       return rich_text;
    }
  }]);

  app.filter('format', [function() {
    return function(text) {
       var rich_text = str.match(/<b>(.*?)<\/b>/g).map(function(val){
                      return val.replace(/<\/?b>/g,'');
                      });
       return rich_text;
    }
  }]);

})();