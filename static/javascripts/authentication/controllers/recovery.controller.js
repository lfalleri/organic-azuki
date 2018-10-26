/**
* Recovery controller
* @namespace cafeyoga.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.authentication.controllers')
    .controller('RecoveryController', RecoveryController);

  RecoveryController.$inject = ['$location','$http', '$scope', '$routeParams', 'Authentication', 'MessagingService'];

  /**
  * @namespace RegisterController
  */
  function RecoveryController($location, $http, $scope, $routeParams, Authentication, MessagingService) {
    var vm = this;

    activate();

    $scope.login = {};
    $scope.disableButton = false;
    $scope.account = undefined;
    $scope.state = {
        loaded:false,
        token_invalid:undefined,
        password_invalidated:false,
        password_updated_by_user:false,
    }

    /**
     * @name activate
     * @desc Actions to be performed when this controller is instantiated
     */
    function activate() {
        var path = $location.url().split('/');
        if( path[1] == "recovery" ){
           Authentication.getPasswordRecoveryInformation(path[2], function(success, data){
               $scope.email = data.email;
               if( success ){
                  $scope.state.token_invalid = false;
               }else{
                  $scope.state.token_invalid = "Le lien n'est pas valide ou a expiré. Veuillez effectuer une nouvelle demande de mot de passe";
               }
               $scope.state.loaded = true;
           })
        }
    }

    $scope.changeForm = function(){
       $scope.password_invalid = undefined;
    }

    $scope.changePassword = function(){
       if ($scope.login.password !== $scope.login.password2){
          $scope.password_invalid = "Mots de passes différents";
          return;
       }

       Authentication.updatePassword($scope.email,$scope.login.password,  function(success, data){
          if(success){
             Authentication.login($scope.email, $scope.login.password, false, function(success, data){
                $scope.state.password_updated_by_user = true;
                //$location.url('/');
             });
          }
       });
    }

    $scope.login.checkLoginEmail = function(){
        $scope.login_error = "";
        $scope.disableButton = false;
    }

    $scope.newRecovery = function(){
        $location.url('/password-forgotten');
    }

    $scope.backToLandingpage = function(){
        $location.url('/');
    }

    $scope.processRecovery = function(){
        Authentication.checkAccountByEmail($scope.login.email, function(success, account){
           if(success){
              if( account.length == 1 ){
                 //$scope.disableButton = false;
                 $scope.account = account[0];
                 Authentication.generatePasswordRecovery($scope.account, function(success, data){
                     $scope.state.password_invalidated = true;
                     if(success){
                         MessagingService.sendPasswordRecoveryEmail(data.email, data.token, function(success,data){
                            $scope.state.password_invalidated = true;
                            if(success){

                            }
                         })
                         //$location.url('/');
                     }
                 });
              }else{
                 $scope.state.password_invalidated = true;
              }
           }else{
              $scope.state.password_invalidated = true;
           }
        });
    }

    $scope.cancelRecovery = function(){
       $location.url('/');
    }
  }
})();