/**
* LoginController
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.authentication.controllers')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$location', '$scope', '$rootScope', '$mdMedia', 'Authentication'];

  /**
  * @namespace LoginController
  */
  function LoginController($location, $scope, $rootScope, $mdMedia, Authentication) {
    var vm = this;

    vm.login = login;
    $scope.$mdMedia = $mdMedia;

    activate();

    /**
    * @name activate
    * @desc Actions to be performed when this controller is instantiated
    * @memberOf thinkster.authentication.controllers.LoginController
    */
    function activate() {
      // If the user is authenticated, they should not be here.
      if (Authentication.isAuthenticated()) {
        //$location.url('/');

        $rootScope.back();
      }
    }

    /**
    * @name login
    * @desc Log the user in
    * @memberOf thinkster.authentication.controllers.LoginController
    */
    function login() {
      Authentication.login(vm.email, vm.password, true);
    }
  }
})();