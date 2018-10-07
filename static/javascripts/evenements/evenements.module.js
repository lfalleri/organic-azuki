(function () {
  'use strict';

  var yoga = angular
    .module('organic_azuki.evenements', [
      'organic_azuki.evenements.controllers',
      'organic_azuki.evenements.services'
    ]);



  angular
    .module('organic_azuki.evenements.controllers', [
      'angularMoment',
      'ui.bootstrap',
      'organic_azuki.authentication.services',
  ]);

  angular
    .module('organic_azuki.evenements.services', []);

})();