/**
* Register controller
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.boutique.controllers')
    .controller('BoutiqueController', BoutiqueController);


  BoutiqueController.$inject = ['BoutiqueService', 'Authentication', '$scope', '$location' ];

  function BoutiqueController( BoutiqueService, Authentication, $scope, $location) {


     activate();
     $scope.expos = [];
     $scope.all_expos = [];
     $scope.showExpoEnCours = true;
     $scope.showExpoPassees = false;

     function activate() {
         BoutiqueService.getAllCreateurs(function(success, createurs){
            if(!success) return;

            $scope.createurs = createurs;
         });

         BoutiqueService.getAllExpos(function(success, expos){
            if(!success) return;

            $scope.all_expos = expos;
            expos.forEach(function(e){
               if(e.en_cours){
                  $scope.currentExposition = e;
               }else{
                  $scope.expos.push(e);
               }
            })
         });

         $scope.$watch(function() { return BoutiqueService.getDisplayStates(); }, function (newValue) {
            $scope.showExpoEnCours = newValue['en_cours'];
            $scope.showExpoPassees = newValue['passees'];
         }, true);
     }

  };

})();