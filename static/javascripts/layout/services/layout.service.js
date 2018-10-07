/**
* Layout
* @namespace thinkster.authentication.services
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.layout.services')
    .factory('Layout', Layout);

  Layout.$inject = ['$cookies','$mdMedia'];

  /**
  * @namespace Authentication
  * @returns {Factory}
  */
  function Layout($cookies, $mdMedia) {

    var Layout = {
      detectScreenOrientation: detectScreenOrientation,
      detectMdScreen: detectMdScreen,
      setUserAcceptedCookies:setUserAcceptedCookies,
      getUserAcceptedCookies:getUserAcceptedCookies,
      cookiesAcceptedForSession:false,
      toastShown: false,
      isToastShown:isToastShown,
      toastShow : toastShow,
      toastHide : toastHide,
    };

    return Layout;

    function detectScreenOrientation() {
       return $mdMedia('portrait');
    }

    function detectMdScreen(){
       return $mdMedia('md');
    }

    function setUserAcceptedCookies(){
       $cookies.userAcceptedCookies = 'true';
       window.localStorage.setItem('userAcceptedCookies','true');
       Layout.cookiesAcceptedForSession = true;
    }

    function getUserAcceptedCookies(){
       var storage = window.localStorage.getItem('userAcceptedCookies');
       if (Layout.cookiesAcceptedForSession || storage || $cookies.userAcceptedCookies) {
          return true;
       }
       return false;
    }

    function isToastShown(){
       return Layout.toastShown;
    }

    function toastShow(){
      Layout.toastShown = true;
    }

    function toastHide(){
      Layout.toastShown = false;
    }
  }
})();