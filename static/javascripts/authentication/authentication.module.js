(function () {
  'use strict';

  angular
    .module('organic_azuki.authentication', [
      'organic_azuki.authentication.controllers',
      'organic_azuki.authentication.services',
      'vcRecaptcha'
    ]);

  angular
    .module('organic_azuki.authentication.controllers', []);

  angular
    .module('organic_azuki.authentication.services', ['ngCookies']);
})();