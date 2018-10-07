/**
* Authentication
* @namespace thinkster.authentication.services
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.boutique.services')
    .factory('BoutiqueService', BoutiqueService);

  BoutiqueService.$inject = ['$http','$q', '$location'];

  /**
  * @namespace Reservations
  * @returns {Factory}
  */
  function BoutiqueService($http, $q, $location) {
    /**
    * @name Reservations
    * @desc The Factory to be returned
    */
    var BoutiqueService = {
       getAllCreateurs: getAllCreateurs,
       getAllExpos: getAllExpos,

       displayText : displayText,
       getDisplayStates : getDisplayStates,
       displayStates : {'en_cours' : true,
                        'passees' : false }
    }

    return BoutiqueService;

    ////////////////////

    function getAllCreateurs(callback) {
        return $http.get('api/v1/boutique/createurs/')
           .then(
               function(data, status, headers, config){
                   callback(true, data.data);
               },
               function(data, status, headers, config){
                  callback(false, undefined);
               }
           );
    }

    function getAllExpos(callback) {
        return $http.get('api/v1/boutique/expos/')
           .then(
               function(data, status, headers, config){
                   callback(true, data.data);
               },
               function(data, status, headers, config){
                  callback(false, undefined);
               }
           );
    }

    function displayText(section){
       Object.keys(BoutiqueService.displayStates).forEach(function(key) {
           if(key === section){
              BoutiqueService.displayStates[key] = true;
           }else{
              BoutiqueService.displayStates[key] = false;
           }
       });
    }

    function getDisplayStates(){
       return BoutiqueService.displayStates;
    }

  }
})();

