/**
* Config
* @namespace thinkster.utils.services
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.utils.services')
    .factory('Config', Config);

  Config.$inject = ['$http'];

  /**
  * @namespace Snackbar
  */
  function Config($http) {
    /**
    * @name Snackbar
    * @desc The factory to be returned
    */
    var Config = {
      getConfig: getConfig,
    };

    return Config;

    ////////////////////

    /**
    * @name getConfig
    */
    function getConfig(callback) {
       return $http.get('/api/v1/config/').then(function(data){
          callback(JSON.parse(data.data));
          return data.data;
       });
    }
  }
})();