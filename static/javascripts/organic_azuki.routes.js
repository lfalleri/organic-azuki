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
    }).when('/boutique', {
      controller: 'BoutiqueController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/boutique/boutique.html'
    }).when('/yoga/recharge', {
      controller: 'RechargeController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/yoga/recharge.html'
    }).when('/yoga/calendrier', {
      controller: 'YogaController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/yoga/calendar.html'
    }).when('/yoga/reservation', {
      controller: 'YogaReservationController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/yoga/reservation.html'
    }).when('/yoga/annulation', {
      controller: 'YogaCancellationController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/yoga/cancellation.html'
    }).when('/yoga/professeurs', {
      controller: 'YogaAnimatorsController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/yoga/animateurs.html'
    }).when('/presentation',{
      controller: 'LandingPageController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/general/presentation.html'
    }).when('/restaurant',{
      controller: 'RestaurantController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/restaurant/nosproduits.html'
    }).when('/restaurant/nosproduits',{
      controller: 'NosProduitsController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/restaurant/nosproduits.html'
    }).when('/restaurant/notrecharte',{
      controller: 'RestaurantController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/restaurant/notrecharte.html'
    }).when('/restaurant/carte',{
      controller: 'CarteController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/restaurant/carte.html'
    }).when('/restaurant/reservation',{
      controller: 'RestaurantController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/restaurant/reservation.html'
    }).when('/contact',{
      controller: 'ContactController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/general/contact.html'
    }).when('/',{
      controller: 'LandingPageController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/general/landingpage.html'
    })/*.when('/boutique/createurs',{
      controller: 'BoutiqueController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/boutique/boutique.html'
    }).when('/boutique/expositions',{
      controller: 'BoutiqueController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/boutique/expositions.html'
    })*/.when('/evenements',{
      controller: 'EvenementsController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/evenements/evenements.html'
    }).otherwise({
       redirectTo:"/"
    });
  }
})();