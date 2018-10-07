(function () {
  'use strict';

  var yoga = angular
    .module('organic_azuki.boutique', [
      'organic_azuki.boutique.controllers',
      'organic_azuki.boutique.services'
    ]);



  angular
    .module('organic_azuki.boutique.controllers', [
      'angularMoment',
      'ui.bootstrap',
      'organic_azuki.authentication.services',
  ]);

  angular
    .module('organic_azuki.boutique.services', []);

})();