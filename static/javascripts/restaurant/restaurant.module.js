(function () {
  'use strict';

  var restaurant = angular
    .module('organic_azuki.restaurant', [
        'organic_azuki.restaurant.controllers',
        'organic_azuki.restaurant.services'
    ]);

  angular
    .module('organic_azuki.restaurant.controllers', ['organic_azuki.authentication.services']);

  /* Service */
  angular
    .module('organic_azuki.restaurant.services', []);

})();