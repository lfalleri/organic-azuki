(function () {
  'use strict';

  angular
    .module('organic_azuki.layout', [
      'organic_azuki.layout.controllers',
      'organic_azuki.layout.services'
    ]);

  angular
    .module('organic_azuki.layout.controllers', []);

  angular
    .module('organic_azuki.layout.services', ['ngCookies']);
})();