/**
* Recovery controller
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.authentication.controllers')
    .controller('RecoveryController', RecoveryController);

  RecoveryController.$inject = ['$location','$http', '$scope', '$routeParams', 'Authentication', 'vcRecaptchaService', 'Config'];

  /**
  * @namespace RegisterController
  */
  function RecoveryController($location, $http, $scope, $routeParams, Authentication, vcRecaptchaService, Config) {
    var vm = this;

    activate();

    /**
     * @name activate
     * @desc Actions to be performed when this controller is instantiated
     * @memberOf thinkster.authentication.controllers.RegisterController
     */
    function activate() {

    }
  }
})();