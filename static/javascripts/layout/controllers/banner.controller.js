/**
* NavbarController
* @namespace thinkster.layout.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.layout.controllers')
    .controller('BannerController', BannerController);

  BannerController.$inject = ['$scope', 'Authentication', '$location', '$window'];

  /**
  * @namespace NavbarController
  */
  function BannerController($scope, Authentication, $location, $window) {
    var vm = this;

    $scope.account = {};

    activate();

    function activate() {
         Authentication.getFullAccount(function(value){
            $scope.account = value;
         });
    }

    /**
    * @name logout
    * @desc Log the user out
    * @memberOf thinkster.layout.controllers.NavbarController
    */
    $scope.logout = function() {
      Authentication.logout(false);
      $scope.account = {};
    }

    $scope.goto_chart = function() {
        $location.url('/panier');
    }
  }
})();