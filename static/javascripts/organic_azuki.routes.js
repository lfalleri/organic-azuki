(function () {
  'use strict';

  angular
    .module('organic_azuki.routes')
    .config(config);

  config.$inject = ['$routeProvider'];

  /**
  * @name config
  * @desc Define valid application routes
  */
  function config($routeProvider) {
    $routeProvider.when('/register', {
      controller: 'RegisterController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/authentication/register.html'
    }).when('/login', {
      controller: 'LoginController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/authentication/login.html'
    }).when('/monespace', {
      controller: 'RegisterController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/authentication/monespace.html'
    }).when('/settings', {
      controller: 'SettingsController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/authentication/settings.html'
    }).when('/eshop', {
      controller: 'ShopController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/shop/eshop.html'
    }).when('/panier', {
      controller: 'PanierController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/shop/panier.html'
    }).when('/presentation',{
      controller: 'LandingPageController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/general/presentation.html'
    }).when('/contact',{
      controller: 'ContactController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/general/contact.html'
    }).when('/password-forgotten', {
      controller: 'RecoveryController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/authentication/password_forgotten.html'
    }).when('/recovery/:token', {
      controller: 'RecoveryController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/authentication/update_password.html'
    }).when('/cguv',{
      controller: 'LandingPageController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/general/cguv.html'
    }).when('/mentions',{
      controller: 'LandingPageController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/general/mentions.html'
    }).when('/remerciements',{
      controller: 'LandingPageController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/general/remerciements.html'
    }).when('/livraisons',{
      controller: 'LandingPageController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/general/livraisons.html'
    }).when('/',{
      controller: 'LandingPageController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/general/landingpage.html'
    }).otherwise({
       redirectTo:"/"
    });
  }
})();