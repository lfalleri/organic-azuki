/**
* ShopController
* @namespace organic_azuki.shop.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.shop.controllers')
    .controller('SideNavController', SideNavController);

  SideNavController.$inject = ['$scope', '$http', '$mdToast', '$interval','$mdSidenav', 'Shop'];

  /**
  * @namespace ShopController
  */
  function SideNavController($scope, $http, $mdToast, $interval, $mdSidenav, Shop) {
    var vm = this;

    $scope.data = {
        articles:[],
    }

    $scope.state = {
        loading:true,
    }

    activate();

    function activate() {
        Shop.getArticlesInPanierFromController(function(success, articles){
           if(success){
              $scope.data.articles = articles;
              $scope.state.loading = false;
           }
        });
    }
  }
})();