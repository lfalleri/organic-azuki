/**
* LandingPageController
* @namespace thinkster.layout.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.layout.controllers')
    .controller('ContactController', ContactController);

  ContactController.$inject = ['$scope', 'Authentication', 'MessagingService'];

  /**
  * @namespace NavbarController
  */
  function ContactController($scope, Authentication, MessagingService) {
    var vm = this;

    $scope.questions = ["Réserver une table", "Contacter notre équipe"];
    $scope.button_text = ["Réserver", "Envoyer"];
    $scope.submit_button = "Réserver";
    $scope.sendingMessage = false;
    $scope.success = undefined;
    $scope.selectedQuestion = $scope.questions[0];

    $scope.initialize = function() {
       var loc = {lat: 48.822224, lng:2.266625};
       var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          center: loc
       });
       var marker = new google.maps.Marker({
          position: loc,
          map: map
       });

       var map2 = new google.maps.Map(document.getElementById('map2'), {
          zoom: 16,
          center: loc
       });
       var marker = new google.maps.Marker({
          position: loc,
          map: map2
       });
    }

    $(document).ready( function () {
        $scope.initialize();
    });

    $scope.changeQuestion = function(){
       $scope.success = undefined;
       $scope.questions.forEach(function(question, i){
          if(question === $scope.selectedQuestion){
             $scope.submit_button = $scope.button_text[i];
          }
       });
    }

    $scope.changeForm = function(){
       $scope.success = undefined;
    }

    $scope.sendMessage = function(){

       $scope.sendingMessage = true;
       $scope.success = undefined;
       $scope.error = undefined;

       if($scope.contact_tel === undefined){
          $scope.contact_tel = '';
       }

       console.log("Try to send mail from contact page");

       MessagingService.sendEmailFromContactPage(
          $scope.selectedQuestion,
          $scope.contact_nom,
          $scope.contact_email,
          $scope.contact_tel,
          $scope.contact_comment,
          function(success, message){
             if(success){
                $scope.success = "Votre message a été bien envoyé, notre équipe vous répondra dans les plus brefs délais."
             }else{
                $scope.error = "Une erreur est survenue lors de l'envoi du message. Merci de réessayer plus tard ou de contacter notre équipe par télephone."
             }
             $scope.sendingMessage = false;
          });
    }
  }
})();