/**
* Authentication
* @namespace thinkster.authentication.services
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.restaurant.services')
    .factory('RestaurantService', RestaurantService);

  RestaurantService.$inject = ['$http','$q'];

  /**
  * @namespace Reservations
  * @returns {Factory}
  */
  function RestaurantService($http, $q) {
    /**
    * @name Reservations
    * @desc The Factory to be returned
    */
    var RestaurantService = {
       getCarte: getCarte,
       getConfig: getConfig,
       allReservations : allReservations,
       createReservation : createReservation,
       displayText : displayText,
       getDisplayStates : getDisplayStates,
       displayStates : {'nosproducteurs' : true,
                     'notrecharte' : false }
    }

    return RestaurantService;

    ////////////////////

    /**
    * @name allReservations
    * @desc Get all Reservations
    * @returns {Promise}
    * @memberOf thinkster.reservations.ReservationService
    */
    function allReservations() {
      return $http.get('api/v1/restaurant/reservation/');
    }

    /**
    * @name createReservation
    * @desc Create a new Reservation
    * @param {string} content The content of the new Post
    * @returns {Promise}
    * @memberOf thinkster.reservations.ReservationService
    */
    //function createReservation(date, hour, number_of_persons, name, email, tel, callback) {
    function createReservation(reservation_info, personal_info) {
      return $http.post('api/v1/restaurant/reservation/', {
        reservation_info: reservation_info,
        personal_info: personal_info
      });
    }


    /**
    * @name getMenu
    * @desc Return the menu
    * @returns {object|undefined} Events
    * @memberOf thinkster.reservations.services.Reservations
    */
    function getCarte() {
       return $http.get('/api/v1/restaurant/menu/');
    }

    function getConfig(){
       return $http.get('/api/v1/restaurant/config/');
    }

    function displayText(section){
       Object.keys(RestaurantService.displayStates).forEach(function(key) {
           if(key === section){
              RestaurantService.displayStates[key] = true;
           }else{
              RestaurantService.displayStates[key] = false;
           }
       });
    }

    function getDisplayStates(){
       return RestaurantService.displayStates;
    }
  }
})();

