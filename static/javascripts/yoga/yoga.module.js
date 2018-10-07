(function () {
  'use strict';

  var yoga = angular
    .module('organic_azuki.yoga', [
      'organic_azuki.yoga.controllers',
      'organic_azuki.yoga.services'
    ]);



  angular
    .module('organic_azuki.yoga.controllers', [
      'angularMoment',
      'ui.bootstrap',
      'organic_azuki.authentication.services',
      'ui.calendar',
  ]);

  angular
    .module('organic_azuki.yoga.services', []);

})();