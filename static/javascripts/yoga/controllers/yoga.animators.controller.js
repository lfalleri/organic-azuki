/**
* Register controller
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.yoga.controllers')
    .controller('YogaAnimatorsController', YogaAnimatorsController);

  YogaAnimatorsController.$inject = ['YogaService', 'Authentication', '$scope', '$rootScope', 'moment', '$uibModal', '$location' ];

  function YogaAnimatorsController( YogaService, Authentication, $scope, $rootScope, moment, $location) {

      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      $scope.cancellationSuccessful = false;
      $scope.alert_message = undefined;
      activate();

      function activate() {
         Authentication.getFullAccount(function(value){
            Authentication.fullAccount = value;
            $scope.account = value;
            $scope.animators = YogaService.getAllAnimators(function(success, animators){
               if(!success){
                  YogaService.gotoCalendar();
                  return;
               }
               $scope.animators = animators;
            });
         });
     }
  }
})();