/**
* Register controller
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.authentication.controllers')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$location','$http', '$scope', 'Authentication', 'vcRecaptchaService', 'Config'];

  /**
  * @namespace RegisterController
  */
  function RegisterController($location, $http, $scope, Authentication, vcRecaptchaService, Config) {
    var vm = this;

    $scope.register = {};
    $scope.login = {};
    $scope.response = null;
    $scope.widgetId = null;
    $scope.cguvChecked = false;
    $scope.model = {
       /*key: '6LcqC1MUAAAAANRMW5g0oN7tufDBTLUI2Lg9lCQ-'*/
    };

    activate();

    /**
     * @name activate
     * @desc Actions to be performed when this controller is instantiated
     * @memberOf thinkster.authentication.controllers.RegisterController
     */
    function activate() {
       // If the user is authenticated, they should not be here.
       /*

       if (Authentication.isAuthenticated()) {
         $location.url('/settings');
       }*/

       Authentication.getFullAccount(function(value){
         $scope.account = value;
         if(angular.equals($scope.account,{})){
         }else{
           /* Loggé -> /settings */
           $location.url('/settings');
         }
       });

       Config.getConfig(function(config){
          if(config['local_dev']==='False'){
             $scope.model.key = '6LfOCVMUAAAAAIKY9r3qW0vTcKo0G3kRVv5cZcDk';
          }else{
             $scope.model.key = '6LcqC1MUAAAAANRMW5g0oN7tufDBTLUI2Lg9lCQ-';
          }
          //$scope.$apply();
       });

       $scope.register = Authentication.getRegistrationInfo();
    }

    $scope.saveRegistrationInfo = function(){
        Authentication.saveRegistrationInfo($scope.register);
    }

    /**
    * @name register
    * @desc Register a new user
    * @memberOf thinkster.authentication.controllers.RegisterController
    */
    $scope.registerUser = function() {

       /*var valid = false;
       if($scope.response){
          valid = true;
       }

       if (valid) {

       } else {
          // In case of a failed validation you need to reload the captcha
          // because each response can be checked just once
          vcRecaptchaService.reload($scope.widgetId);
          $scope.register_error = "Veuillez prouver que vous n'êtes pas un robot";
          return;
       }*/

       if ($scope.register.password === $scope.register.confirm_password){
          Authentication.register($scope.register.email,
                                  $scope.register.password,
                                  $scope.register.last_name,
                                  $scope.register.first_name,
                                  function(success,message){
              if(!success){
                 $scope.register_error = "Votre email est déjà utilisé";
              }

          });
          $scope.message = "Votre profil a bien été créé";
       }
       else{
          $scope.register_error = "Vos deux mots de passes sont différents";
       }
    }

    $scope.loginUser = function() {
       Authentication.login($scope.login.email, $scope.login.password, true, function(success, message){
          if(!success){
             $scope.login_error = "Identifiant ou mot de passe invalide";
          }
       });
    }

    $scope.setResponse = function (response) {
       $scope.response = response;
    };

    $scope.setWidgetId = function (widgetId) {
       $scope.widgetId = widgetId;
    };

    $scope.cbExpiration = function() {
       vcRecaptchaService.reload($scope.widgetId);
       $scope.response = null;
    };
  }
})();