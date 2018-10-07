/**
* Register controller
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.yoga.controllers')
    .controller('YogaCancellationController', YogaCancellationController);

  YogaCancellationController.$inject = ['YogaService', 'Authentication', '$scope', '$rootScope', 'moment', '$uibModal', '$location' ];

  function YogaCancellationController( YogaService, Authentication, $scope, $rootScope, moment, $location) {

      console.log("YogaCancellationController");
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      $scope.cancellationSuccessful = false;
      $scope.alert_message = undefined;
      activate();

      function activate() {
         Authentication.getFullAccount(function(value){
            Authentication.fullAccount = value;
            $scope.account = value;
            if(angular.equals($scope.account,{})){
               YogaService.stagedReservationExit(false, undefined, false);
            }else{
               var pendingCancellation = YogaService.getPendingCancellationByAccount($scope.account.id);
               if(pendingCancellation == undefined){
                  YogaService.stagedCancellationExit(true, $scope.account.id, false);
                  return;
               }
               var start = new Date(pendingCancellation.lesson.date);
               $scope.lesson = pendingCancellation.lesson;
               $scope.reservation = pendingCancellation;
               $scope.nb_persons = pendingCancellation.nb_personnes;

               $scope.meta = {};
               $scope.meta.day = start.toLocaleDateString('fr-FR', options);
               $scope.meta.start = start.getHours() + ":"+(start.getMinutes() < 10 ? '0' : '') +  start.getMinutes();
               $scope.meta.duration = $scope.lesson.duration;
               $scope.meta.nb_places = $scope.lesson.nb_places;
               $scope.meta.total_price = $scope.nb_persons * $scope.lesson.price;
               $scope.meta.next_credits = $scope.account.credits + ($scope.nb_persons * $scope.lesson.price);
            }
         });
     }

     $scope.processCancellation = function(){
        YogaService.cancelReservation($scope.lesson, $scope.account, function(success, message){
           if(!success){
              $scope.alert_message = message;
              $scope.alert_message_color = "red";
              return;
           }else{
              $scope.cancellationSuccessful = true;
              $scope.alert_message = message;
              $scope.alert_message_color = "green";
           }
        });
     }

     $scope.exitCancellation = function(lesson, account, nb_persons){
        if($scope.reservationSuccessful){
           /* Reservation has been successful : pending reservation has already been cleaned */
           YogaService.stagedCancellationExit(false, undefined, false);
        }else{
           /* exit on Failure or Cancelation : pending reservation must be cleaned */
           YogaService.stagedCancellationExit(true, $scope.account.id, true);
        }
     }

     $scope.gotoCalendar = function(){YogaService.gotoCalendar();}
  }
})();