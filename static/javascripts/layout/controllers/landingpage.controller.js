/**
* LandingPageController
* @namespace thinkster.layout.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.layout.controllers')
    .controller('LandingPageController', LandingPageController);

  LandingPageController.$inject = ['$scope', 'Authentication', 'Layout', '$mdMedia', '$mdToast'];

  /**
  * @namespace NavbarController
  */
  function LandingPageController($scope, Authentication, Layout, $mdMedia, $mdToast) {
    var vm = this;

    vm.logout = logout;


    /**
    * @name logout
    * @desc Log the user out
    * @memberOf thinkster.layout.controllers.NavbarController
    */
    function logout() {
      Authentication.logout();
    }

    $scope.portrait = $mdMedia('portrait');
    $scope.landscape = $mdMedia('landscape');

    this.$doCheck = function(){
       $scope.portrait = Layout.detectScreenOrientation();
       var view = angular.element( document.querySelector( '#view' ) );
       if($scope.portrait){
          view.removeClass('cy-view-landscape');
          view.addClass('cy-view-portrait');
       }else{
          view.addClass('cy-view-landscape');
          view.removeClass('cy-view-portrait');
       }
    }

    $scope.showToast = function() {
        $mdToast.show(
          $mdToast.simple()
             .textContent('Votre profil a bien été mis à jour')
             .position("top right")
             .hideDelay(3000)
        );
    }

    activate();

    function activate() {
       if(!Layout.getUserAcceptedCookies() && !Layout.isToastShown()){
          Layout.toastShow();
          var toast = $mdToast.simple()
                   .textContent('En poursuivant votre navigation sur ce site, vous acceptez l’utilisation de cookies pour vous proposer une meilleure qualité de service')
                   .action('J\'accepte')
                   .highlightAction(true)
                   .position('top')
                   .hideDelay(0)
                   .theme("toast");

          $mdToast.show(toast).then(function(response) {
             if ( response == 'ok' ) {
                Layout.setUserAcceptedCookies();
                Layout.toastHide();
             }
          });
       }

    }
  }
})();