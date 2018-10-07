/**
* LoginController
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.authentication.controllers')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$location', '$scope', 'Authentication', 'YogaService', '$mdToast'];

  /**
  * @namespace LoginController
  */
  function SettingsController($location, $scope, Authentication, YogaService, $mdToast) {
    var vm = this;

    $scope.account = Authentication.fullAccount;

    $scope.updateProfileFields = {first_name:"",
                            last_name:"",
                            email:"",
                            confirmation_password:"",
                            password:""};

    $scope.updateAddresseLivraisonFields =
                           {first_name:"",
                            last_name:"",
                            address:"",
                            address_complement:"",
                            postal_code:"",
                            city:"",
                            country:""};

    $scope.updateAddresseFacturationFields =
                           {first_name:"",
                            last_name:"",
                            address:"",
                            address_complement:"",
                            postal_code:"",
                            city:"",
                            country:""};
    $scope.differentAdresses = false;
    $scope.state = { showUpdateProfile : true,
                     showAddress : false,
                     showNewAddress : false,
                     showCommandsHistoric : false,
                     somethingChanged:false,

                   };

    $scope.data = {
                    adresse_de_livraison:undefined,
                    adresse_de_facturation:undefined,
                    adresses : [],
    };

    activate();
    function activate() {
       Authentication.getFullAccount(function(value){
          $scope.account = value;
          if(angular.equals($scope.account,{})){
             /* Non loggé -> /monespace */
             $location.url('/monespace');
          }else{
             console.log("account : ", $scope.account);
             console.log("update : ", $scope.updateProfileFields);
             $scope.updateProfileFields.first_name = $scope.account.first_name;
             $scope.updateProfileFields.last_name = $scope.account.last_name;
             $scope.updateProfileFields.email = $scope.account.email;


             $scope.account.adresses.forEach(function(adresse){
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
       });
    }

    $scope.showToast = function() {
        $mdToast.show(
          $mdToast.simple()
             .textContent('Votre profil a bien été mis à jour')
             .position("top right")
             .hideDelay(3000)
        );
    }

    $scope.changeDifferentAddresses = function(){
        console.log("changeDifferentAddresses");
        if($scope.differentAdresses){
            $scope.updateAddresseFacturationFields =
                {first_name:"",
                 last_name:"",
                 address:"",
                 address_complement:"",
                 postal_code:"",
                 city:"",
                 country:""};

        }else{
            $scope.updateAddresseFacturationFields = $scope.updateAddresseLivraisonFields;
        }
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
    


      //Authentication.register(vm.email, vm.password, vm.last_name, vm.first_name);
    }

    $scope.changeForm = function(){
       $scope.error = "";
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

    $scope.updateAddresses = function(){
       Authentication.updateAddresses(
          $scope.account.id,
          $scope.updateAddresseLivraisonFields,
          $scope.updateAddresseFacturationFields,
          function(success, data){
             if(success){
                 $scope.success = "Vos adresses ont bien été mises à jour";
                 $scope.error = "";
             }else{
                 $scope.success = "";
                 $scope.error = "Une erreur s'est produite lors de la mise à jour";
             }

          }
       )


    }

    $scope.changeAdresseLivraison = function(adresse){
        console.log("changeAdresseLivraison");
        $scope.data.adresses.forEach(function(a){
            if( a.id != adresse.id ){
                 console.log("changeAdresseLivraison to false :",a);
                 if(a.livraison==true){
                    $scope.state.somethingChanged = true;
                 }
                a.livraison = false;
            }else{
                console.log("changeAdresseLivraison to true :",a);
                a.livraison = true;
                $scope.data.adresse_de_livraison = a;
                if(a.livraison==false){
                    $scope.state.somethingChanged = true;
                }
            }
        });
    }

    $scope.changeAdresseFacturation = function(adresse){
        $scope.data.adresses.forEach(function(a){
            if( a.id != adresse.id ){
                if(a.facturation==true){
                    $scope.state.somethingChanged = true;
                }
                a.facturation = false;
            }else{
                if(a.facturation==false){
                    $scope.state.somethingChanged = true;
                }
                a.facturation = true;
                $scope.data.adresse_de_facturation = a;
            }
        });
    }

    $scope.clickModifyAdresse = function(adresse){
        $scope.data.adresses.forEach(function(a){
            if( a.id == adresse.id ){
               a.enableModifyAdresse = true;
            }
        });
    }

    $scope.clickNewAdresse = function(adresse){
        $scope.data.adresses.push(
        {
           description:"",
           prenom:"",
           nom:"",
           adresse:"",
           complement_adresse:"",
           code_postal:"",
           ville:"",
           pays:"",
           livraison:"",
           facturation:"",
           newAdresse:true,
           enableModifyAdresse:true,
           enableDeleteAdresse:false,
        });
    }

    $scope.submitModifyAdresse = function(adresse){
        $scope.data.adresses.forEach(function(a){
            if( a.id == adresse.id ){
               a.enableModifyAdresse = false;
            }
        });
        $scope.state.somethingChanged = true;
    }

    $scope.clickSaveAdresses = function(){
        $scope.data.adresses.forEach(function(adresse){
            console.log("Sauvegarde de l'adresse : ", adresse);
            if(adresse.newAdresse){
                Authentication.createAddress($scope.account.id, adresse, function(success, data){
                   if(!success){
                       $scope.error = "Une erreur s'est produite";
                       return;
                   }else{
                       $scope.error = "";
                       $scope.success = "Sauvegarde réussie";
                       adresse.newAdresse = false;
                       $scope.state.somethingChanged = false;
                   }
            });
            }else{
                Authentication.updateAddress($scope.account.id, adresse, function(success, data){
                    if(!success){
                        $scope.error = "Une erreur s'est produite";
                        return;
                    }else{
                        $scope.error = "";
                        $scope.success = "Sauvegarde réussie";
                        $scope.state.somethingChanged = false;
                    }
                });
            }
        });
    }


    $scope.clickDeleteAdresse = function(adresse){
        adresse.enableDeleteAdresse = true;
    }

    $scope.cancelDeleteAdresse = function(adresse){
        adresse.enableDeleteAdresse = false;
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
                console.log("Adresses apres deletion");
                /*$scope.data.adresses.forEach(function(a){
                    if(a.id == adresse.id){


                    }

                });*/

                $scope.error = "";
               $scope.success = "Sauvegarde réussie";
            }
        });
    }

  }

})();