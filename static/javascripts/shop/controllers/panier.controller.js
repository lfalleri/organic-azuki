/**
* ShopController
* @namespace organic_azuki.shop.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.shop.controllers')
    .controller('PanierController', PanierController);

  PanierController.$inject = ['$scope', '$location', '$http', '$mdMedia', '$routeParams', '$interval', 'Authentication', 'Shop'];

  /**
  * @namespace ShopController
  */
  function PanierController($scope, $location, $http, $mdMedia, $routeParams, $interval, Authentication, Shop) {
    var vm = this;

    $scope.data = {
        sous_total:0,
        frais_de_livraison:0,
        reduction: 0,
        total:0,

        cout_total:0,
        articles:[],
        adresse_de_livraison:undefined,
        adresse_de_facturation:undefined,
        selected_mode_livraison:undefined,
        modesDeLivraison:[],
        personnal_information:{},
        adresse : {
           description:"",
           prenom:"",
           nom:"",
           adresse:"",
           complement_adresse:"",
           code_postal:"",
           ville:"",
           pays:"",
           livraison:true,
           facturation:true,
        },
        adresse2 : {
           description:"",
           prenom:"",
           nom:"",
           adresse:"",
           complement_adresse:"",
           code_postal:"",
           ville:"",
           pays:"",
           livraison:false,
           facturation:true,
        },
        code_de_reduction:{id:-1},
    }

    $scope.state = {
        loading:true,
        displayCodeReduction: false,
        displayAddComment: false,
        differentAdresseFacturation:false,
        newAdresse:true,
        onlyOneAdresse:true,

        /* Steps */
        stepSummary: true,
        stepInformation:false,
        stepModeLivraison:false,
        stepPaiement:false,
        stepPaiementInformation : false,
        stepPaiementInProgress:false,
        stepPaiementSuccess: false,
        stepPaiementError: false,
    }

    $scope.$mdMedia = $mdMedia;

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

    $scope.gotoShop = function(){
        $location.url('/eshop');
    }

    $scope.backToChart = function(){
       $scope.error = "";
       $scope.success = "";
       $scope.state.stepSummary = true;
       $scope.state.stepInformation = false;
       $scope.modifyInformation = false;
       $scope.state.stepPaiement = false;
    }

    $scope.clickValidateChart = function(){
        $scope.error = "";
        $scope.success = "";
        Authentication.setBackToAfterLogin("/panier?stepInformation");
        $scope.state.stepSummary = false;
        $scope.state.stepInformation = true;
        $scope.state.stepModeLivraison = false;
        $scope.state.stepPaiement = false;
    }

    $scope.clickValidateInformation = function(invalid){
        $scope.submitted = true;
        if(invalid) return;

        submitAccount();
        submitAdresses();

        Shop.getAllModeDeLivraison(function(success, modesDeLivraison){
            $scope.data.modesDeLivraison = modesDeLivraison;
        });
        $scope.error = "";
        $scope.success = "";
        $scope.state.stepSummary = false;
        $scope.state.stepInformation = false;
        $scope.state.stepModeLivraison = true;
        $scope.state.stepPaiement = false;
    }

    $scope.clickValidateModeLivraison = function(){
        $scope.error = "";
        $scope.success = "";
        $scope.state.stepSummary = false;
        $scope.state.stepInformation = false;
        $scope.state.stepModeLivraison = false;
        $scope.state.stepPaiement = true;
        $scope.state.stepPaiementInformation = true;
    }

    $scope.clickBackToModeLivraison = function(){
        $scope.error = "";
        $scope.success = "";
        $scope.state.stepSummary = false;
        $scope.state.stepInformation = false;
        $scope.state.stepModeLivraison = true;
        $scope.state.stepPaiement = false;
        $scope.state.stepPaiementInformation = false;
    }

    $scope.clickRemoveFromPanier = function(article){
        Shop.removeArticleFromPanierFromController(
            article,
            function(success, reference){
                if(success){
                    var index = $scope.data.articles.indexOf(article);
                    if (index > -1) {
                       $scope.data.articles.splice(index, 1);
                       $scope.data.sous_total -= article.quantite * article.reference.prix;
                       $scope.data.total =  $scope.data.sous_total -  $scope.data.reduction + $scope.data.frais_de_livraison;
                    }
                }
            }
        );
    }

    $scope.clickCodeReduction = function(){
        $scope.state.displayCodeReduction = !$scope.state.displayCodeReduction;
    }

    $scope.enterCodeReduction = function(){
        Shop.getCodeReduction($scope.data.codeReduction, function(success, code){
            if(!success){
                $scope.error = "Code de réduction non valide";
                $scope.success = "";
                $scope.data.reduction = 0;
                $scope.data.total =  $scope.data.sous_total + $scope.data.frais_de_livraison;
                $interval(function(){$scope.success="";$scope.error="";}, 3000);
                return;
            }
            $scope.data.reduction = code.reduction;
            $scope.data.total -= $scope.data.reduction;
            $scope.data.code_de_reduction = code;
        });
        $scope.state.displayCodeReduction = false;
    }

    $scope.clickAddComment = function(){
        $scope.state.displayAddComment = !$scope.state.displayAddComment;
    }

    $scope.enterAddComment = function(){
        $scope.state.displayAddComment = false;
    }

    $scope.clickDifferentAdresses = function(){
        $scope.submitted=false;
        if($scope.state.differentAdresseFacturation){

               var descriptions = ["Domicile", "Travail"];
               var description = "";
               for(var i=0;i<descriptions.length;i++){
                   var _found = false;
                   var _descr = descriptions[i];
                   if(_descr.toLowerCase()==$scope.data.adresse.description.toLowerCase()) continue;
                   for(var a=0; a<$scope.account.adresses.length;a++){
                       var _adresse = $scope.account.adresses[a].description;
                       if(_descr.toLowerCase()==_adresse.toLowerCase()){
                           _found = true;
                           break;
                       }
                   }
                   if(_found) continue;
                   description=_descr;
                   break;
               }

               $scope.data.adresse2 = {
                   description:description,
                   prenom:$scope.account.first_name,
                   nom:$scope.account.last_name,
                   adresse:"",
                   complement_adresse:"",
                   code_postal:"",
                   ville:"",
                   pays:"",
                   livraison:false,
                   facturation:true,
               };
               $scope.data.adresse.facturation = false;
        }else if(!$scope.state.differentAdresseFacturation){
            $scope.data.adresse2 = {};
            $scope.account.adresses.forEach(function(_adresse){
                _adresse.facturation = false;
            });
            $scope.data.adresse.facturation = true;
        }
    }


    function submitAdresses(){
        var func = $scope.state.newAdresse ? Authentication.createAddress : Authentication.updateAddress;
        if($scope.state.differentAdresseFacturation){
            $scope.data.adresse.facturation = false;
            var func2 = $scope.state.newAdresse ? Authentication.createAddress : Authentication.updateAddress;
            if($scope.state.onlyOneAdresse) func2 = Authentication.createAddress;

            func2($scope.account.id, $scope.data.adresse2, function(success, data){
                if(!success){
                    $scope.error = "Une erreur s'est produite";
                    return;
                }else{
                    $scope.error = "";
                    $scope.success = "Sauvegarde réussie";
                }
                Authentication.requestFullAccount($scope.account.email, function(success, data){
                    $scope.account = data;
                });
            });
        }
        func($scope.account.id, $scope.data.adresse, function(success, data){
            if(!success){
                $scope.error = "Une erreur s'est produite";
                return;
            }else{
                $scope.error = "";
                $scope.success = "Sauvegarde réussie";
            }
            Authentication.requestFullAccount($scope.account.email, function(success, data){
                $scope.account = data;
            });
        });

        $scope.account.adresses.forEach(function(_adresse){
            if((_adresse.id != $scope.data.adresse.id) &&
               (_adresse.id != $scope.data.adresse2.id)){
                  Authentication.updateAddress($scope.account.id, _adresse, function(success, data){
                      Authentication.requestFullAccount($scope.account.email, function(success, data){
                          $scope.account = data;
                      });
                  });
               }
        });
    }

    function submitAccount(){
        if( ($scope.account.first_name !== $scope.data.personnal_information.prenom) ||
            ($scope.account.last_name !== $scope.data.personnal_information.nom) ||
            ($scope.account.email !== $scope.data.personnal_information.email) ){
             Authentication.updateProfile(
                 $scope.account.id,
                 $scope.data.personnal_information.prenom,
                 $scope.data.personnal_information.nom,
                 $scope.data.personnal_information.email,
                 '','',
                 function(success, message){
                     if(!success){
                         $scope.error = message;
                         $scope.success = "";
                     }else{
                         $scope.error = "";
                         $scope.success = "Votre profil a bien été mis à jour";
                         Authentication.requestFullAccount($scope.account.email, function(success, value){
                             $scope.account = value;
                         });
                     }
                 }
             );
        }
    }

    activate();

    function activate() {
        window.Stripe.setPublishableKey('pk_test_MgLjBLy0Z9k53NghgBtaZPQb');
        Shop.getArticlesInPanierFromController(
            function(success, articles){
                articles.forEach(function(article){
                    $scope.data.sous_total += article.quantite * article.reference.prix;
                    $scope.data.total =  $scope.data.sous_total -  $scope.data.reduction + $scope.data.frais_de_livraison;
                    $scope.data.articles.push(prepare_article(article));
                });
                $scope.state.loading = false;

                if(articles.length == 0) return;

                if($routeParams.stepInformation){
                    $scope.state.stepInformation = true;
                    $scope.state.stepSummary = false;
                    $scope.state.stepModeLivraison = false;
                    var step_details_livraison = angular.element( document.querySelector( '#details_livraison' ) );
                    step_details_livraison.addClass('current-step');
                }
            }
        );

        Authentication.getFullAccount(function(value){
            $scope.account = value;
            $scope.data.personnal_information.prenom = $scope.account.first_name;
            $scope.data.personnal_information.nom = $scope.account.last_name;
            $scope.data.personnal_information.email = $scope.account.email;

            if(! angular.equals($scope.account,{})){
                $scope.data.adresse.description = "Domicile";
                $scope.data.adresse.prenom = $scope.account.first_name;
                $scope.data.adresse.nom = $scope.account.last_name;
                $scope.data.adresse2.description = "Travail";
                $scope.data.adresse2.prenom = $scope.account.first_name;
                $scope.data.adresse2.nom = $scope.account.last_name;

                $scope.account.adresses.forEach(function(adresse){
                    $scope.state.newAdresse = false;
                    if( adresse.livraison ){
                        $scope.data.adresse_de_livraison = adresse;
                        $scope.data.adresse = angular.copy(adresse);
                    }
                    if( adresse.facturation ){
                        $scope.data.adresse_de_facturation = adresse;
                        $scope.data.adresse2 = adresse;
                        $scope.data.adresse2 = angular.copy(adresse);
                    }
                });
                if($scope.data.adresse_de_livraison != undefined &&
                  ($scope.data.adresse_de_livraison!==$scope.data.adresse_de_facturation)){
                    $scope.state.differentAdresseFacturation = true;
                    $scope.state.onlyOneAdresse = false;
                }
            }
        });
    }

    // Stripe Response Handler
    $scope.stripeCallback = function (code, result) {
        if (result.error) {
            $scope.error = "Une erreur est survenue lors de la transaction. Votre compte n'a pas été débité.";
        } else {
            $scope.token = result.id;
            $scope.data.total = $scope.data.sous_total -  $scope.data.reduction + $scope.data.frais_de_livraison;
            if($scope.data.total == 0){
               $scope.error = "Vous devez choisir une formule";
               return;
            }
            $scope.state.stepPaiementInProgress = true;
            $scope.state.stepPaiementInformation = false;

            Shop.createOrGetPanier($scope.account, function(success, panier){
                if(!success){
                     $scope.error = "Une erreur est survenue lors de la transaction. Votre compte n'a pas été débité.";
                     $scope.success = undefined;
                     $scope.state.stepPaiementError = true;
                     $scope.state.stepPaiementSuccess = false;
                     return;
                }

                Shop.proceedTransaction(
                   $scope.account.id,
                   panier.uuid,
                   $scope.data.total,
                   $scope.token,
                   function(success, transaction){
                       $scope.state.stepPaiementInProgress = false;
                       if(!success){
                           $scope.error = transaction;
                           $scope.success = undefined;
                           $scope.state.stepPaiementError = true;
                           $scope.state.stepPaiementSuccess = false;
                       }else{

                           $scope.success = "Votre commande a bien été reçue, un mail de confirmation vous a été envoyé";
                           $scope.error = undefined;
                           $scope.state.stepPaiementError = false;
                           $scope.state.stepPaiementSuccess = true;
                           Shop.getCommandeByTransaction(transaction.id,function(success, commande){
                              if(!success) return;
                              var adresse_livraison_id = undefined;
                              var adresse_facturation_id = undefined;
                              $scope.account.adresses.forEach(function(_adresse){
                                  if(_adresse.livraison) adresse_livraison_id=_adresse.id;
                                  if(_adresse.facturation) adresse_facturation_id=_adresse.id;
                              });
                              Shop.addInfoToCommande(commande.id,
                                                     adresse_livraison_id,
                                                     adresse_facturation_id,
                                                     $scope.data.code_de_reduction.id,
                                                     $scope.data.selected_mode_livraison.id,
                                                     $scope.data.addComment,
                                                     function(success, message){});

                           });
                           Shop.deletePanierInCache(panier.uuid);
                       }
                   }
                );
            });
        }
    };

    $scope.citySuggestionsFocused = function(){
       $scope.state.suggestionsFocused = true;
    }

    $scope.citySuggestionsUnfocused = function(){
       $scope.state.suggestionsFocused = false;
    }

    $scope.zipCodeUnfocus = function(){
        if( !$scope.state.suggestionsFocused ){
           $scope.data.citiesSuggestion = {};
           return;
        }
    }

    $scope.codePostalChanged = function(){
       $scope.data.citiesSuggestion = {};
       if($scope.data.adresse.code_postal.length <= 1) return;
       var url = 'https://vicopo.selfbuild.fr/cherche/' + $scope.data.adresse.code_postal;

        $http.get(url).then(
         function(data, status, headers, config){
            console.log(data.status, typeof(data.status));
           if(data.status=="200"){
               var cities = data.data.cities;
               cities.forEach(function(_city){
                   $scope.data.citiesSuggestion[_city.code] = _city.city;
               });
           }
         },function(data, status, headers, config){});
    }


    $scope.codePostalChanged2 = function(){
       $scope.data.citiesSuggestion2 = {};
       if($scope.data.adresse2.code_postal.length <= 1) return;
       var url = 'https://vicopo.selfbuild.fr/cherche/' + $scope.data.adresse2.code_postal;

        $http.get(url).then(
         function(data, status, headers, config){
            console.log(data.status, typeof(data.status));
           if(data.status=="200"){
               var cities = data.data.cities;
               cities.forEach(function(_city){
                   $scope.data.citiesSuggestion2[_city.code] = _city.city;
               });
           }
         },function(data, status, headers, config){});
    }

    $scope.selectCity = function(code, city){
       $scope.data.adresse.code_postal = code;
       $scope.data.adresse.ville = city;
       $scope.data.adresse.pays = "FRANCE";
       $scope.data.citiesSuggestion = {};
    }

    $scope.selectCity2 = function(code, city){
       $scope.data.adresse2.code_postal = code;
       $scope.data.adresse2.ville = city;
       $scope.data.adresse2.pays = "FRANCE";
       $scope.data.citiesSuggestion2 = {};
    }


    $scope.$watch(function() { return Authentication.fullAccount; }, function (newValue) {
        $scope.account = newValue;
    }, true);

  }
})();