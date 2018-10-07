/**
* Authentication
* @namespace thinkster.authentication.services
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.authentication.services')
    .factory('Authentication', Authentication);

  Authentication.$inject = ['$cookies', '$http', '$rootScope', '$location', '$timeout','MessagingService'];

  /**
  * @namespace Authentication
  * @returns {Factory}
  */
  function Authentication($cookies, $http, $rootScope, $location, $timeout, MessagingService) {
    /**
    * @name Authentication
    * @desc The Factory to be returned
    */
    var Authentication = {
      getAuthenticatedAccount: getAuthenticatedAccount,
      isAuthenticated: isAuthenticated,
      isStored:isStored,
      login: login,
      logout: logout,
      register: register,
      checkPassword: checkPassword,
      updateProfile : updateProfile,
      deleteProfile: deleteProfile,
      crediteProfile: crediteProfile,
      setAuthenticatedAccount: setAuthenticatedAccount,
      unauthenticate: unauthenticate,
      requestFullAccount: requestFullAccount,
      getFullAccount: getFullAccount,
      isStaff: isStaff,
      fullAccount : {},
      getUsers: getUsers,

      checkAccountByEmail: checkAccountByEmail,
      generatePasswordRecovery:generatePasswordRecovery,
      getPasswordRecoveryInformation: getPasswordRecoveryInformation,
      updatePassword: updatePassword,

      createAddress: createAddress,
      updateAddress: updateAddress,
      deleteAddress:deleteAddress,

      gotoLoginAndBackTo : gotoLoginAndBackTo,
      backTo: undefined,

      getSettingsDisplay: getSettingsDisplay,
      settingsDisplay : settingsDisplay,
      displayStates : {'profile' : true,
                       'lessons' : false,
                        'historic' : false,
                        'recharge' : false}
    };

    return Authentication;

    ////////////////////

    /**
    * @name register
    * @desc Try to register a new user
    * @param {string} username The username entered by the user
    * @param {string} password The password entered by the user
    * @param {string} email The email entered by the user
    * @returns {Promise}
    * @memberOf thinkster.authentication.services.Authentication
    */
    function register(email, password,last_name, first_name, callback) {
      return $http.post('/api/v1/accounts/', {
        password: password,
        email: email,
        last_name: last_name,
        first_name: first_name,
      }).then(registerSuccessFn, registerErrorFn);

      /**
      * @name registerSuccessFn
      * @desc Log the new user in
      */
      function registerSuccessFn(data, status, headers, config) {
        Authentication.login(email, password, false, function(success, message){
           if(success){
              MessagingService.sendAccountCreationEmail(email, function(){});
              $location.url("/settings");
           }
        });

      }

      /**
      * @name registerErrorFn
      * @desc Log "Epic failure!" to the console
      */
      function registerErrorFn(data, status, headers, config) {
        callback(false,"");
      }
    }

    /**
    * @name login
    * @desc Try to log in with email `email` and password `password`
    * @param {string} email The email entered by the user
    * @param {string} password The password entered by the user
    * @returns {Promise}
    * @memberOf thinkster.authentication.services.Authentication
    */
    function login(email, password, back, callback) {
       return $http.post('/api/v1/auth/login/', {
          email: email, password: password
       }).then(loginSuccessFn, loginErrorFn);

      /**
       * @name loginSuccessFn
       * @desc Set the authenticated account and redirect to index
       */
      function loginSuccessFn(data, status, headers, config) {

        Authentication.setAuthenticatedAccount(data.data);
        Authentication.getFullAccount(function(fullAccount){
            window.localStorage.setItem('fullAccount', JSON.stringify(fullAccount));
            Authentication.fullAccount = fullAccount;
        });
        if(Authentication.backTo !== undefined){
           var to = Authentication.backTo;
           Authentication.backTo = undefined;
           $location.url(to);
        }else if(back){
            $rootScope.back();
        }
        callback(true,"Connection réussie");
      }

      /**
       * @name loginErrorFn
       * @desc Log "Epic failure!" to the console
       */
      function loginErrorFn(data, status, headers, config) {
        callback(false,"Email ou mot de passe invalide");
      }
    }

    /**
     * @name logout
     * @desc Try to log the user out
     * @returns {Promise}
     * @memberOf thinkster.authentication.services.Authentication
     */
    function logout(back) {
       return $http.post('/api/v1/auth/logout/')
          .then(logoutSuccessFn, logoutErrorFn);

        /**
        * @name logoutSuccessFn
        * @desc Unauthenticate and redirect to index with page reload
        */
       function logoutSuccessFn(data, status, headers, config) {
         Authentication.unauthenticate();
         Authentication.fullAccount = {};
         window.localStorage.removeItem('fullAccount');
         //window.location = '/';
         if(back){
            $rootScope.back();
         }
       }

       /**
        * @name logoutErrorFn
        * @desc Log "Epic failure!" to the console
        */
       function logoutErrorFn(data, status, headers, config) {
          Authentication.unauthenticate();
          Authentication.fullAccount = {};
          window.localStorage.removeItem('fullAccount');
          console.error('Logout failure!');
       }
    }

    function checkPassword(account_id, password, callback){
       console.log("checkPassword : ",password);
       return $http.post('/api/v1/auth/check-password/', {
          account_id: account_id,
          password:password,
       }).then(function(data, status, headers, config){
          callback(true,"Mot de passe valide");
       }, function(data, status, headers, config){
          callback(false, data.data.message);
       });
    }

    /**
    * @name login
    * @desc Try to log in with email `email` and password `password`
    * @param {string} email The email entered by the user
    * @param {string} password The password entered by the user
    * @returns {Promise}
    * @memberOf thinkster.authentication.services.Authentication
    */
    function updateProfile(account_id, first_name, last_name, email, password, old_password, callback) {
       return $http.post('/api/v1/auth/update-profile/', {
          account_id: account_id,
          first_name:first_name,
          last_name:last_name,
          email: email,
          password: password,
          old_password: old_password,
       }).then(function(data, status, headers, config){
          callback(true,"Profil mis à jour");
       }, function(data, status, headers, config){
          callback(false, data.data.message);
       });
    }

    function deleteProfile(account_id, password, callback) {
       return $http.delete('/api/v1/auth/accounts/', {
          params: {account_id: account_id, password: password}
       }).then(function(data, status, headers, config){
          callback(true,"Profil mis à jour");
       }, function(data, status, headers, config){
          callback(false, data.data.message);
       });
    }

    /**
    * @name login
    * @desc Try to log in with email `email` and password `password`
    * @param {string} email The email entered by the user
    * @param {string} password The password entered by the user
    * @returns {Promise}
    * @memberOf thinkster.authentication.services.Authentication
    */
    function crediteProfile(account, credit, callback) {
       return $http.post('/api/v1/auth/update-profile/', {
          account_id: account.id,
          credit:credit,
       }).then(function(data, status, headers, config){
          callback(true,"Compte rechargé");
       }, function(data, status, headers, config){
          callback(false, "Une erreur est survenue lors de la mise à jour de votre profil");
       });
    }

    /**
    * @name getAuthenticatedAccount
    * @desc Return the currently authenticated account
    * @returns {object|undefined} Account if authenticated, else `undefined`
    * @memberOf thinkster.authentication.services.Authentication
    */
    function getAuthenticatedAccount() {
       if (!$cookies.authenticatedAccount) {
          return;
       }
       return JSON.parse($cookies.authenticatedAccount);
    }

    /**
     * @name isAuthenticated
     * @desc Check if the current user is authenticated
     * @returns {boolean} True is user is authenticated, else false.
     * @memberOf thinkster.authentication.services.Authentication
     */
    function isAuthenticated() {
        return !!$cookies.authenticatedAccount;
    }

    function isStored() {
        return !!window.localStorage.getItem('fullAccount');
    }

    /**
     * @name setAuthenticatedAccount
     * @desc Stringify the account object and store it in a cookie
     * @param {Object} user The account object to be stored
     * @returns {undefined}
     * @memberOf thinkster.authentication.services.Authentication
     */
    function setAuthenticatedAccount(account) {
       $cookies.authenticatedAccount = JSON.stringify(account);
    }

    /**
     * @name unauthenticate
     * @desc Delete the cookie where the user object is stored
     * @returns {undefined}
     * @memberOf thinkster.authentication.services.Authentication
     */
    function unauthenticate() {
       delete $cookies.authenticatedAccount;
    }

    function checkAccountByEmail(email, callback){
       return $http.get('api/v1/auth/accounts/',{
           params: {email:email, exact:1}}
       ).then(
         function(data, status, headers, config){
           callback(true, data.data);
         },function(data, status, headers, config){
           callback(false, []);
       });
    }

    function generatePasswordRecovery(account, callback){
        return $http.post('/api/v1/auth/password-recovery/', {
          account_id: account.id,
       }).then(function(data, status, headers, config){
          callback(true,data.data);
       }, function(data, status, headers, config){
          callback(false, "Une erreur est survenue lors de la mise à jour de votre profil");
       });
    }

    function getPasswordRecoveryInformation(token, callback){
       return $http.get('/api/v1/auth/password-recovery/', {
          params: {token: token}
       }).then(function(data, status, headers, config){
          callback(true,data.data);
       }, function(data, status, headers, config){
          callback(false, "Une erreur est survenue lors de la mise à jour de votre profil");
       });
    }

    function updatePassword(email, password, callback){
        return $http.post('/api/v1/auth/update-password/', {
          email: email,
          password: password
       }).then(function(data, status, headers, config){
          callback(true,data.data);
       }, function(data, status, headers, config){
          callback(false, "Une erreur est survenue lors de la mise à jour de votre profil");
       });
    }

    function requestFullAccount(email, callback){
       return $http.post('/api/v1/auth/fullaccount/', {
          email: email
       }).then(function(data, status, headers, config){
          Authentication.fullAccount = data.data;
          window.localStorage.setItem('fullAccount', JSON.stringify(Authentication.fullAccount));
          callback(data.data);
          return Authentication.fullAccount;
       }, function(data, status, headers, config) {
       });
    }

    function getFullAccount(callback) {
       var timer = $timeout(function(){
           Authentication.fullAccount = {};
           delete $cookies.authenticatedAccount;
           window.localStorage.removeItem('fullAccount');
           $timeout.cancel(timer);
       }, 3000);
       if(!angular.equals(Authentication.fullAccount,{})){
          $timeout.cancel(timer);
          callback(Authentication.fullAccount);
          return;
       }
       var storageUser = window.localStorage.getItem('fullAccount');
       if(storageUser){
          $timeout.cancel(timer);
          Authentication.fullAccount = JSON.parse(storageUser);
          callback(Authentication.fullAccount);
          return;
       }
       var account =  Authentication.getAuthenticatedAccount();
       if( !account )
       {
          callback({});
          $timeout.cancel(timer);
          return {};
       }
       return $http.post('/api/v1/auth/fullaccount/', {
          email: account.email
       }).then(function(data, status, headers, config){
          $timeout.cancel(timer);
          Authentication.fullAccount = data.data;
          callback(data.data);
          return Authentication.fullAccount;
       }, function(data, status, headers, config) {
           $timeout.cancel(timer);
           Authentication.fullAccount = {};
           delete $cookies.authenticatedAccount;
           window.localStorage.removeItem('fullAccount');
           callback({});
       });
    }

    function isStaff() {
      var account = Authentication.getFullAccount(function(account){
         if(!account){
           return false;
         }
         return account.is_staff;
      });
    }

    function getUsers(last_name, first_name, email, callback){
       return $http.get('api/v1/auth/accounts/',{
           params: {first_name: first_name, last_name:last_name, email:email}}
       ).then(
         function(data, status, headers, config){
           callback(true, data.data);
         },function(data, status, headers, config){
           callback(false, []);
       });
    }

    function gotoLoginAndBackTo(back){
        Authentication.backTo = back;
        $location.url('/monespace');
    }

    function settingsDisplay(section){
       Object.keys(Authentication.displayStates).forEach(function(key) {
           if(key === section){
              Authentication.displayStates[key] = true;
           }else{
              Authentication.displayStates[key] = false;
           }
       });
    }

    function getSettingsDisplay(){
       return Authentication.displayStates;
    }

    function createAddress(account_id, adresse, callback){
        return $http.post('/api/v1/auth/addresses/', {
          command:"create",
          account_id: account_id,
          adresse: adresse,
       }).then(function(data, status, headers, config){
          callback(true,data.data);
       }, function(data, status, headers, config){
          callback(false, "Une erreur est survenue lors de la mise à jour de votre profil");
       });
    }

    function updateAddress(account_id, adresse, callback){
        return $http.post('/api/v1/auth/addresses/', {
          command:"update",
          account_id: account_id,
          adresse: adresse,
       }).then(function(data, status, headers, config){
          callback(true,data.data);
       }, function(data, status, headers, config){
          callback(false, "Une erreur est survenue lors de la mise à jour de votre profil");
       });
    }

    function deleteAddress(adresse,  callback){
        return $http.delete('/api/v1/auth/addresses/', {
          params: {adresse_id: adresse.id},
       }).then(function(data, status, headers, config){
          callback(true,data.data);
       }, function(data, status, headers, config){
          callback(false, "Une erreur est survenue lors de la mise à jour de votre profil");
       });
    }
  }
})();