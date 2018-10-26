(function () {
  'use strict';

  angular
    .module('organic_azuki.shop', [
      'organic_azuki.shop.controllers',
      'organic_azuki.shop.services',
    ]);

  angular
    .module('organic_azuki.shop.controllers', ['ngSanitize']);

  angular
    .module('organic_azuki.shop.services', ['ngCookies']);
})();