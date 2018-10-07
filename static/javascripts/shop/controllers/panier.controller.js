/**
* ShopController
* @namespace organic_azuki.shop.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.shop.controllers')
    .controller('PanierController', PanierController);

  PanierController.$inject = ['$scope', '$http', 'Shop'];

  /**
  * @namespace ShopController
  */
  function PanierController($scope, $http, Shop) {
    var vm = this;

    $scope.data = {
        cout_total:0,
        articles:[],
    }

    $scope.state = {
        loading:true,
    }

    function prepare_article(article){
       var reference = article.reference;
       reference.images.forEach(function(image){
            if(image.type_de_photo.type_de_photo == "Photo1"){
                article.image = image;
            }
       });
       return article;
    }

    $scope.hoverArticleIn = function(article){
       article.displayDeleteButton = true;
    };

    $scope.hoverArticleOut = function(article){
       article.displayDeleteButton = false;
    };

    activate();

    function activate() {
        Shop.getArticlesInPanierFromController(
            function(success, articles){
                articles.forEach(function(article){
                    $scope.data.cout_total += article.quantite * article.reference.prix;
                    $scope.data.articles.push(prepare_article(article));
                });
                $scope.state.loading = false;
            }
        );
    }

  }
})();