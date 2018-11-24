/**
* ShopController
* @namespace organic_azuki.shop.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.shop.controllers')
    .controller('ShopController', ShopController);

  ShopController.$inject = ['$scope', '$http', '$location', '$mdMedia','$mdToast', '$interval','$document', '$mdSidenav', 'Shop'];

  /**
  * @namespace ShopController
  */
  function ShopController($scope, $http, $location, $mdMedia, $mdToast, $interval, $document, $mdSidenav, Shop) {
    var vm = this;

    $scope.data = {
        collection:undefined,
        categories:[],
        references:[],
        detailed_reference:undefined,
        quantites:[],
        cout_total:0,
        articles:[],
        tailles:[],
        selected_quantite:undefined,
        selected_taille:undefined,
    }

    $scope.state = {
        loading:true,
        allCategoriesSelected:true,
    }

    $scope.$mdMedia = $mdMedia;

    var canvas, ctx, iw, ih, detailed_img;

    function doCanvas() {
        ctx.drawImage(detailed_img, 0, 0, iw / 2, ih / 2);
    }

    function move(e) {
        var pos = getMousePos(canvas, e);
        var x = pos.x;
        var y = pos.y;
        ctx.drawImage(detailed_img, -x, -y, iw, ih);
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function drawCanvasOnLoad(){
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        iw = detailed_img.width;
        ih = detailed_img.height;
        canvas.width = (iw / 2 - 1.5)|0; //compensate for rounding errors
        canvas.height = (ih / 2 - 1.5)|0;
        doCanvas();
        canvas.addEventListener('mouseout', doCanvas, false);
        canvas.addEventListener('mousemove', move, false);
    }

    $scope.selectCategorie = function(categorie){
       $scope.state.allCategoriesSelected = false;
       $scope.data.categories.forEach(function(categorie){
           categorie.selected = false;
       });
       $scope.data.detailed_reference = undefined;
       categorie.selected = true;
       $scope.state.loading = true;
       $scope.data.references = [];

       categorie.references.forEach(function(reference){
           reference.details_photo = [];
           reference.images.forEach(function(image){
               if(image.type_de_photo.type_de_photo == "Plan Large"){
                   reference.primary_photo = image;
               }else if(image.type_de_photo.type_de_photo == "Photo2"){
                   reference.secondary_photo = image;
               }

               reference.details_photo.push(image);

           });
           $scope.data.references.push(reference);
       });
       $scope.state.loading = false;
    }

    $scope.selectAllCategories = function(){
        $scope.state.allCategoriesSelected = true;
        $scope.data.detailed_reference = undefined;
        $scope.state.loading = true;
        $scope.data.references = [];

        $scope.data.categories.forEach(function(categorie){
           categorie.selected = false;
           categorie.references.forEach(function(reference){
               $scope.data.references.push(prepare_reference(reference));
           });
        });
        $scope.state.loading = false;
    }

    function prepare_reference(reference){
        reference.details_photo = [];
        reference.images.forEach(function(image){
            if(image.type_de_photo.type_de_photo == "Photo1"){
                reference.primary_photo = image;
            }else if(image.type_de_photo.type_de_photo == "Photo2"){
                reference.secondary_photo = image;
            }
            reference.details_photo.push(image);
        });
        return reference;
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



    activate();

    function activate() {
        Shop.getCollection(function(success, collection){
           if(success){
              $scope.data.collection = collection;

              $scope.data.categories = collection.categories;
              $scope.data.categories.forEach(function(categorie){
                  categorie.selected = false;
                  categorie.references.forEach(function(reference){
                      $scope.data.references.push(prepare_reference(reference));
                  });
              });
              $scope.state.loading = false;
           }
        });
    }


    $scope.showToast = function() {
        $mdToast.show(
          $mdToast.simple()
             .textContent('Article ajouté au panier')
             .position("top right")
             .hideDelay(3000)
        );
    }

    function buildTaillesAdultes(reference) {
        if(reference.xxs_restants > 0){
            $scope.data.tailles.push('XXS');
        }
        if(reference.xs_restants > 0){
            $scope.data.tailles.push('XS');
        }
        if(reference.s_restants > 0){
            $scope.data.tailles.push('S');
        }
        if(reference.m_restants > 0){
            $scope.data.tailles.push('M');
        }
        if(reference.l_restants > 0){
            $scope.data.tailles.push('L');
        }
        if(reference.xl_restants > 0){
            $scope.data.tailles.push('XL');
        }
        if(reference.xxl_restants > 0){
            $scope.data.tailles.push('XXL');
        }
    }

    function buildTaillesEnfants(reference) {
        if(reference.un_an_restants > 0){
            $scope.data.tailles.push('1 an');
        }
        if(reference.deux_ans_restants > 0){
            $scope.data.tailles.push('2 ans');
        }
        if(reference.trois_ans_restants > 0){
            $scope.data.tailles.push('3 ans');
        }
        if(reference.quatre_ans_restants > 0){
            $scope.data.tailles.push('4 ans');
        }
        if(reference.cinq_6ans_restants > 0){
            $scope.data.tailles.push('5-6 ans');
        }
        if(reference.sept_8ans_restants > 0){
            $scope.data.tailles.push('7-8 ans');
        }
    }

    $scope.clickSeeReferenceDetail = function(reference) {
        $scope.data.detailed_reference = reference;
        detailed_img = document.createElement('img');

        detailed_img.src = reference.primary_photo.main_image;
        detailed_img.onload = drawCanvasOnLoad;

        $scope.data.tailles = [];

        if(reference.type_de_reference === 'ADULTE'){
            buildTaillesAdultes(reference);
        }
        else if(reference.type_de_reference === 'ENFANT'){
            buildTaillesEnfants(reference);
        }else if(reference.type_de_reference === 'TAILLE_UNIQUE'){
            $scope.data.selected_taille = undefined;
            var min = Math.min($scope.data.detailed_reference.restants, 10);
            $scope.data.quantites = [];
            for(var i=1;i<=min;i++){
                $scope.data.quantites.push(i);
            }
            $scope.data.selected_quantite = 1;
        }
    }

    $scope.selectedTailleChanged = function(){
        var min;
        if($scope.data.selected_taille === 'XXS'){
            min = $scope.data.detailed_reference.xxs_restants;
        }else if($scope.data.selected_taille === 'XS'){
            min = $scope.data.detailed_reference.xs_restants;
        }else if($scope.data.selected_taille === 'S'){
            min = $scope.data.detailed_reference.s_restants;
        }else if($scope.data.selected_taille === 'M'){
            min = $scope.data.detailed_reference.m_restants;
        }else if($scope.data.selected_taille === 'L'){
            min = $scope.data.detailed_reference.l_restants;
        }else if($scope.data.selected_taille === 'XL'){
            min = $scope.data.detailed_reference.xl_restants;
        }else if($scope.data.selected_taille === 'XXL'){
            min = $scope.data.detailed_reference.xxl_restants;
        }else if($scope.data.selected_taille === '1 an'){
            min = $scope.data.detailed_reference.un_an_restants;
        }else if($scope.data.selected_taille === '2 ans'){
            min = $scope.data.detailed_reference.deux_ans_restants;
        }else if($scope.data.selected_taille === '3 ans'){
            min = $scope.data.detailed_reference.trois_ans_restants;
        }else if($scope.data.selected_taille === '4 ans'){
            min = $scope.data.detailed_reference.quatre_ans_restants;
        }else if($scope.data.selected_taille === '5-6 ans'){
            min = $scope.data.detailed_reference.cinq_6ans_restants;
        }else if($scope.data.selected_taille === '7-8 ans'){
            min = $scope.data.detailed_reference.sept_8ans_restants;
        }

        min = Math.min(min, 10);
        $scope.data.quantites = [];
        for(var i=1;i<=min;i++){
            $scope.data.quantites.push(i);
        }
        $scope.data.selected_quantite = 1;
        $scope.error = "";
    }

    $scope.changeDetailedImage = function(image){
        detailed_img.src = image.main_image;
        detailed_img.onload = drawCanvasOnLoad;
    }

    $scope.clickBackToCollection = function(){
        $scope.data.detailed_reference = undefined;
        $mdSidenav('right').close();
    }

    $scope.clickAddToPanier = function(){
        if( $scope.data.detailed_reference.type_de_reference === "TAILLE_UNIQUE" ){
            $scope.data.selected_taille = 'Taille unique';
        }else if( !$scope.data.selected_taille){
           $scope.error = "Veuillez sélectionner une taille";
           return;
        }
        Shop.addArticleToPanierFromController(
            $scope.data.detailed_reference,
            $scope.data.selected_quantite,
            $scope.data.selected_taille,
            function(success, reference){

                if(success){
                    reference = prepare_reference(reference);
                    var index = $scope.data.references.indexOf($scope.data.detailed_reference);
                    $scope.data.references[index] = reference;
                    $scope.clickSeeReferenceDetail(reference);
                    $scope.selectedTailleChanged();
                    $scope.success = "Article ajouté au panier";
                    $scope.error = "";
                    $interval(function(){$scope.success="";}, 3000);

                    $scope.data.articles = [];
                    $scope.data.cout_total = 0;
                    Shop.getArticlesInPanierFromController(function(success, articles){
                        articles.forEach(function(article){
                            $scope.data.cout_total += article.quantite * article.reference.prix;
                            $scope.data.articles.push(prepare_article(article));
                        });
                        $mdSidenav('right').open();
                    });
                }else{
                    $scope.success = "";
                    $scope.error = "Une erreur est survenue";
                }
            }
        );

    }

    $scope.clickRemoveFromPanier = function(article){
        var old_reference = prepare_reference(article.reference);
        Shop.removeArticleFromPanierFromController(
            article,
            function(success, reference){
                if(success){
                    reference = prepare_reference(reference);
                    var index = $scope.data.references.map(function(e) { return e.id; }).indexOf(old_reference.id);
                    //var index = $scope.data.references.indexOf(old_reference);
                    if(index > -1){
                        $scope.data.references[index] = reference;
                    }

                    index = $scope.data.articles.indexOf(article);
                    if (index > -1) {
                       $scope.data.articles.splice(index, 1);
                       $scope.data.cout_total -= article.quantite * article.reference.prix;
                    }
                }
            }
        );
    }

    $scope.closeSideNav = function(){
        $mdSidenav('right').close();
    }

    $scope.gotoChart = function() {
        $location.url('/panier');
    }


    $scope.hoverArticleIn = function(article){
       article.displayDeleteButton = true;
    };

    $scope.hoverArticleOut = function(article){
       article.displayDeleteButton = false;
    };

  }
})();