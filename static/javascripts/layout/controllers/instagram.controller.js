/**
* InstagramController
* @namespace thinkster.layout.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.layout.controllers')
    .controller('InstagramController', InstagramController);

  InstagramController.$inject = ['$scope', '$http'];

  /**
  * @namespace InstagramController
  */
  function InstagramController($scope, $http) {
    var vm = this;
    var access_token = '6086473486.1677ed0.c62f667af478418b910af0de793b2710';
    $scope.state = {instagram_loading:true};
    $scope.pictures = [];

    activate();

    function activate() {

       $http.get('https://api.instagram.com/v1/users/self/media/recent/?access_token='+access_token).then(
         function(data, status, headers, config){
           var json = data.data;

           for(var i=0;i<5;i++){
              var caption=json.data[i].caption.text;
              caption = caption.slice(0, 24) + '...';

              $scope.pictures.push({'url':json.data[i].images.low_resolution.url,'caption':caption});
           }
           $scope.state.instagram_loading = false;
         },function(data, status, headers, config){

       });

    }


  }
})();