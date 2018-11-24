/**
* LoginController
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.authentication.controllers')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$location',
                                '$scope',
                                '$http',
                                'Authentication',
                                'Shop',
                                'MessagingService',
                                '$mdMedia',
                                '$mdToast',
                                '$interval'];

  /**
  * @namespace LoginController
  */
  function SettingsController($location,
                              $scope,
                              $http,
                              Authentication,
                              Shop,
                              MessagingService,
                              $mdMedia,
                              $mdToast,
                              $interval) {
    var vm = this;

    $scope.account = Authentication.fullAccount;

    $scope.updateProfileFields = {first_name:"",
                            last_name:"",
                            email:"",
                            confirmation_password:"",
                            password:""};

    $scope.state = { showUpdateProfile : true,
                     showAddress : false,
                     showNewAddress : false,
                     showCommandsHistoric : false,
                     showAdminPanel : false,
                     somethingChanged:false,
                     suggestionsFocused:false,
                    };

    $scope.data = {
                    adresse_de_livraison:undefined,
                    adresse_de_facturation:undefined,
                    adresses : [],
                    commandes : [],
                    detailed_commande:undefined,
    };

    $scope.admin = {
                    commandes: [],
                    filtered_commandes:[],
                    detailed_commande:undefined,
                    selected_commande_status:"TOUTES",
                    commande_all_status:["EN COURS","EXPEDIEE","TERMINEE","RETOURNEE","REMBOURSEE","ANNULEE"],
                    commande_status:["TOUTES","EN COURS","EXPEDIEE","TERMINEE","RETOURNEE","REMBOURSEE","ANNULEE"],
    }

    $scope.$mdMedia = $mdMedia;
    $scope.success = "";
    $scope.error = "";
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};


    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    function updateAdressesLivraisonFacturation(){
        $scope.data.adresse_de_livraison = undefined;
        $scope.data.adresse_de_facturation = undefined;
        $scope.data.adresses = []
        $scope.account.adresses.forEach(function(adresse){
            if($scope.account.adresses.length == 1){
                adresse.livraison = true;
                adresse.facturation = true;
            }
            if( adresse.livraison ){
                $scope.data.adresse_de_livraison = adresse;
            }
            if( adresse.facturation ){
                $scope.data.adresse_de_facturation = adresse;
            }
            adresse.enableModifyAdresse = false;
            adresse.enableDeleteAdresse = false;
            adresse.newAdresse = false;
            $scope.data.adresses.push(adresse);
        });
    }

    function isCancellable(commande, diff){return ((commande.etat!=="ANNULEE") && (diff < 1));}

    function prepare_commandes(commandes){
        commandes.forEach(function(commande){

            // Time difference between commande date and now (in hours)
            var date = new Date(commande.date);
            date.setTime( date.getTime() + date.getTimezoneOffset()*60*1000 );

            var now = new Date();
            var diff = moment.duration(moment(now).diff(moment(date))).asHours();
            commande.cancellable = isCancellable(commande, diff);
            commande.clickCancel = false;
            commande.date_fr = date.toLocaleDateString('fr-FR', options).capitalize();

            var articles = commande.panier.articles;
            articles.forEach(function(article){
                var reference = article.reference;
                reference.images.forEach(function(image){
                    if(image.type_de_photo.type_de_photo == "Photo1"){
                        article.image = image;
                    }
                });
            });
            $scope.data.commandes.push(commande);
        });
    }

    function prepare_commandes_for_admin(commandes){
        commandes.forEach(function(commande){
            if(!$scope.admin.commande_status.includes(commande.etat)){
                $scope.admin.commande_status.push(commande.etat);
            }

            // Format Date
            var date = new Date(commande.date);
            commande.date_fr = date.toLocaleDateString('fr-FR', options).capitalize();

            var articles = commande.panier.articles;
            articles.forEach(function(article){
                var reference = article.reference;
                reference.images.forEach(function(image){
                    if(image.type_de_photo.type_de_photo == "Photo1"){
                        article.image = image;
                    }
                });
            });
            $scope.admin.commandes.push(commande);
            $scope.admin.filtered_commandes.push(commande);
        });
    }

    $scope.filterByCommandStatus = function(){
        $scope.admin.filtered_commandes = [];
        if($scope.admin.selected_commande_status==="TOUTES"){
            $scope.admin.filtered_commandes = angular.copy($scope.admin.commandes);
            return;
        }
        $scope.admin.commandes.forEach(function(_commande){
           if(_commande.etat === $scope.admin.selected_commande_status){
               $scope.admin.filtered_commandes.push(_commande);
           }
        });
    }

    $scope.changeCommandStatus = function(commande){
    }

    activate();
    function activate() {
       Authentication.getFullAccount(function(value){
          $scope.account = value;
          if(angular.equals($scope.account,{})){
             /* Non loggé -> /monespace */
             $location.url('/monespace');
          }else{
             $scope.updateProfileFields.first_name = $scope.account.first_name;
             $scope.updateProfileFields.last_name = $scope.account.last_name;
             $scope.updateProfileFields.email = $scope.account.email;

             updateAdressesLivraisonFacturation();

             Shop.getCommandesByAccount($scope.account.id, function(success, commandes){
                 if(!success) return;
                 prepare_commandes(commandes);
             });
          }
       });
       $scope.success = "";
       $scope.error = "";
    }

    $scope.showToast = function() {
        $mdToast.show(
          $mdToast.simple()
             .textContent('Votre profil a bien été mis à jour')
             .position("top right")
             .hideDelay(3000)
        );
    }

    $scope.updateProfile = function() {
       if($scope.updateProfileFields.confirmation_password !==$scope.updateProfileFields.password )
       {
          $scope.error = "Les 2 mots de passe sont différents";
          return;
       }

       Authentication.updateProfile(
          $scope.account.id,
          $scope.updateProfileFields.first_name,
          $scope.updateProfileFields.last_name,
          $scope.updateProfileFields.email,
          $scope.updateProfileFields.password,
          $scope.updateProfileFields.old_password,
          function(success, message){
             if(!success){
                 $scope.error = message;
                 $scope.success = "";
             }else{
                 $scope.error = "";
                 $scope.success = "Votre profil a bien été mis à jour";
                 $scope.updateProfileFields.confirmation_password = undefined;
                 $scope.updateProfileFields.password = undefined;
                 $scope.updateProfileFields.old_password = undefined;
                 $scope.showToast();
             }
          }
       );
    }

    $scope.changeForm = function(){
       $scope.error = "";
       $scope.success = "";
    }

    $scope.gotoCalendar = function(){
       YogaService.gotoCalendar();
    }

    $scope.selectUpdateProfile = function(){
       $scope.success = "";
       $scope.error = "";
       $scope.state.showUpdateProfile = true;
       $scope.state.showAddress = false;
       $scope.state.showNewAddress = false;
       $scope.state.showCommandsHistoric = false;
    }

    $scope.selectAddresses = function(){
       $scope.success = "";
       $scope.error = "";
       $scope.state.showUpdateProfile = false;
       $scope.state.showAddress = true;
       $scope.state.showNewAddress = false;
       $scope.state.showCommandsHistoric = false;
    }

    $scope.selectCommandsHistoric = function(){
       $scope.success = "";
       $scope.error = "";
       $scope.state.showUpdateProfile = false;
       $scope.state.showAddress = false;
       $scope.state.showNewAddress = false;
       $scope.state.showCommandsHistoric = true;
    }

    $scope.selectAdminPanel = function(){
       $scope.success = "";
       $scope.error = "";
       $scope.state.showUpdateProfile = false;
       $scope.state.showAddress = false;
       $scope.state.showNewAddress = false;
       $scope.state.showCommandsHistoric = false;
       $scope.state.showAdminPanel = true;

       Shop.getAllCommandes($scope.account.id, function(success, commandes){
            prepare_commandes_for_admin(commandes);
       });
    }

    $scope.changeAdresseLivraison = function(adresse){
        var adresseNotSaved = false;
        $scope.data.adresses.forEach(function(a){
            if( a.id != adresse.id ){
                a.livraison = false;
            }else{
                a.livraison = true;
                $scope.data.adresse_de_livraison = a;
            }
            if(a.newAdresse){
                adresseNotSaved = true;
            }
        });
        if(!adresseNotSaved){
            saveAdresses();
        }
    }

    $scope.changeAdresseFacturation = function(adresse){
        var adresseNotSaved = false;
        $scope.data.adresses.forEach(function(a){
            if( a.id != adresse.id ){
                a.facturation = false;
            }else{
                a.facturation = true;
                $scope.data.adresse_de_facturation = a;
            }
            if(a.newAdresse){
                adresseNotSaved = true;
            }
        });
        if(!adresseNotSaved){
            saveAdresses();
        }
    }

    $scope.clickModifyAdresse = function(adresse){
        $scope.error = "";
        $scope.success = "";
        $scope.data.adresses.forEach(function(a){
            if( a.id == adresse.id ){
               a.enableModifyAdresse = true;
            }
        });
    }

    $scope.clickNewAdresse = function(){
        var descriptions = ["Domicile", "Travail", "Adresse 3", "Adresse 4", "Adresse 5"];
        var description = "";
        var i = 0;

        for(i=0;i<descriptions.length;i++){
           var _found = false;
           var _descr = descriptions[i];
           for(var a=0; a<$scope.data.adresses.length;a++){
               var _adresse = $scope.data.adresses[a].description;
               if(_descr.toLowerCase()==_adresse.toLowerCase()){
                  _found = true;
                  break;
               }
           }
           if(_found) continue;
           description=_descr;
           break;
        }

        $scope.error = "";
        $scope.success = "";
        var adresse = {
           description:description,
           prenom:$scope.account.first_name,
           nom:$scope.account.last_name,
           adresse:"",
           complement_adresse:"",
           code_postal:"",
           ville:"",
           pays:"",
           livraison:false,
           facturation:false,
           newAdresse:true,
           enableModifyAdresse:true,
           enableDeleteAdresse:false,
        };

        if($scope.data.adresses.length == 0){
           adresse.livraison = true;
           adresse.facturation = true;
        }

        $scope.data.adresses.push(adresse);
    }

    $scope.clickCancelCommand = function(commande){
        commande.clickCancel = true;
    }


    $scope.clickBackCommand = function(commande){
        commande.clickCancel = false;
    }

    $scope.clickConfirmCancelCommand = function(commande){
        Shop.deleteCommande(commande.id, $scope.account.id, function(success, data){
            if(!success){
                $scope.error = "Une erreur est survenue, veuillez contacter notre équipe";
                $scope.success = "";
            }else{
                $scope.error = "";
                $scope.success = "Votre commande a bien été annulée";

                commande.etat = "ANNULEE"
                commande.cancellable = false;
                commande.clickCancel = false;
            }
            $interval(function(){$scope.success="";$scope.error="";}, 5000);
        });
    }

    $scope.clickSeeCommandDetail = function(commande){
        $scope.data.detailed_commande = commande;
    }

    $scope.clickSeeCommandDetailAdmin = function(commande){
        $scope.admin.detailed_commande = commande;
    }

    $scope.clickExitCommandDetail = function(){
        $scope.data.detailed_commande = undefined;
    }

    $scope.clickExitCommandDetailAdmin = function(){
        $scope.admin.detailed_commande = undefined;
    }

    $scope.clickSaveCommandAdmin = function(commande){
        Shop.updateCommandeStatus(commande, function(success, message){
            if(success){
                $scope.admin.error="";
                $scope.admin.success = "Sauvegarde réussie";
            } else{
                $scope.admin.error="Erreur de sauvegarde";
                $scope.admin.success = "";
            }
            $interval(function(){$scope.admin.success="";$scope.admin.error="";}, 5000);
        });
    }

    function saveAdresses(){
        //$scope.error = "";
        //$scope.success = "";
        $scope.data.adresses.forEach(function(adresse){
            if(adresse.newAdresse){
                Authentication.createAddress($scope.account.id, adresse, function(success, data){
                   if(!success){
                      // $scope.error = "Une erreur s'est produite";
                      // $scope.success = "";
                       return;
                   }else{
                      /* if($scope.error===""){
                           $scope.success = "Sauvegarde réussie";
                       }*/
                       adresse.newAdresse = false;
                       $scope.state.somethingChanged = false;
                   }
                   Authentication.requestFullAccount($scope.account.email, function(success, data){
                        $scope.account = data;
                        updateAdressesLivraisonFacturation();
                   });

            });
            }else{
                Authentication.updateAddress($scope.account.id, adresse, function(success, data){
                    if(!success){
                        //$scope.error = "Une erreur s'est produite";
                        $scope.success = "";
                        return;
                    }else{
                        /*if($scope.error===""){
                           $scope.success = "Sauvegarde réussie";
                        }*/
                        $scope.state.somethingChanged = false;
                    }
                    Authentication.requestFullAccount($scope.account.email, function(success, data){
                        $scope.account = data;
                        updateAdressesLivraisonFacturation();
                    });
                });
            }
            $interval(function(){$scope.success="";$scope.error="";}, 5000);
        });
    }

    $scope.submitModifyAdresse = function(adresse, invalid){
        if(invalid) return;
        $scope.error = "";
        $scope.success = "";
        $scope.data.adresses.forEach(function(a){
            if( a.id == adresse.id ){
               a.enableModifyAdresse = false;
            }
        });
        $scope.state.somethingChanged = true;
        saveAdresses();
    }

    $scope.clickDeleteAdresse = function(adresse){
        $scope.error = "";
        $scope.success = "";
        adresse.enableDeleteAdresse = true;
    }

    $scope.cancelDeleteAdresse = function(adresse){
        $scope.error = "";
        $scope.success = "";
        adresse.enableDeleteAdresse = false;
    }

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

    $scope.confirmDeleteAdresse = function(adresse){
        Authentication.deleteAddress(adresse, function(success, data){
            if(!success){
                $scope.error = "Une erreur s'est produite";
                return;
            }else{
                var index = $scope.data.adresses.indexOf(adresse);
                if (index > -1) {
                    $scope.data.adresses.splice(index, 1);
                }

                $scope.error = "";
                $scope.success = "Sauvegarde réussie";
                Authentication.requestFullAccount($scope.account.email, function(success, data){
                    $scope.account = data;
                    updateAdressesLivraisonFacturation();
                });
            }
            $interval(function(){$scope.success="";$scope.error="";}, 5000);
        });
    }

    $scope.codePostalChanged = function(adresse){
       $scope.data.citiesSuggestion = {};
       if(adresse.code_postal.length <= 1) return;
       var url = 'https://vicopo.selfbuild.fr/cherche/' + adresse.code_postal;

        $http.get(url).then(
         function(data, status, headers, config){
           if(data.status=="200"){
               var cities = data.data.cities;
               cities.forEach(function(_city){
                   $scope.data.citiesSuggestion[_city.code] = _city.city;
               });
           }
         },function(data, status, headers, config){});
    }

    $scope.selectCity = function(adresse, code, city){
       adresse.code_postal = code;
       adresse.ville = city;
       adresse.pays = "FRANCE";
       $scope.data.citiesSuggestion = {};
    }
  }
})();