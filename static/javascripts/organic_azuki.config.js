(function () {
  'use strict';

  angular
    .module('organic_azuki.config')
    .config(config);

  config.$inject = ['$locationProvider', '$httpProvider'];

  /**
  * @name config
  * @desc Enable HTML5 routing
  */
  function config($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    window.Stripe.setPublishableKey('pk_test_aMOG9eZFc1KMrvBtFdhNKeOf');

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }

    /*angular
    .module('organic_azuki.config').all('/*', function (request, response, next) {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Headers", "X-Requested-With");
        response.header("Access-Control-Allow-Methods", "GET, POST", "PUT", "DELETE");
        next();
  });*/

  angular.module('organic_azuki.config').config(function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
       return moment(date).format('YYYY-MM-DD');
    };

    // Example of a French localization.
    $mdDateLocaleProvider.months = ['janvier',
                                    'février',
                                    'mars',
                                    'avril',
                                    'mai',
                                    'juin',
                                    'juillet',
                                    'aout',
                                    'septembre',
                                    'octobre',
                                    'novembre',
                                    'décembre'];
    $mdDateLocaleProvider.shortMonths = ['janv',
                                         'févr',
                                         'mars',
                                         'avr',
                                         'mai',
                                         'juin',
                                         'juil',
                                         'aout',
                                         'sept',
                                         'oct',
                                         'nov',
                                         'déc'];

    $mdDateLocaleProvider.days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    $mdDateLocaleProvider.shortDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    // Can change week display to start on Monday.
    $mdDateLocaleProvider.firstDayOfWeek = 1;
        $mdDateLocaleProvider.monthHeaderFormatter = function(date) {
      return $mdDateLocaleProvider.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
    };

    // In addition to date display, date components also need localized messages
    // for aria-labels for screen-reader users.

    $mdDateLocaleProvider.weekNumberFormatter = function(weekNumber) {
      return 'Semaine ' + weekNumber;
    };

    $mdDateLocaleProvider.msgCalendar = 'Calendrier';
    $mdDateLocaleProvider.msgOpenCalendar = 'Ouvrir le calendrier';


  });

  angular.module('organic_azuki.config').config(function($mdThemingProvider) {
//137b72 106860
// a87e43 cda772
// 355609 567c22 vert foncé
// 739A3D 97BA65 vert
// 768a40;


    $mdThemingProvider.definePalette('palette', {
      '50': '87102b',
      '100': '87102b',
      '200': '87102b',
      '300': '87102b',
      '400': '87102b',
      '500': '87102b',
      '600': 'a52441',
      '700': 'a52441',
      '800': 'a52441',
      '900': 'a52441',
      'A100': 'a52441',
      'A200': 'a52441',
      'A400': 'a52441',
      'A700': 'a52441',
      'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                        // on this palette should be dark or light

      'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
      '200', '300', '400', 'A100'],
     'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });

    $mdThemingProvider.theme('default')
      .primaryPalette('palette')
      .accentPalette('palette');
  });

})();