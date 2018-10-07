/**
* Register controller
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.restaurant.controllers')
    .controller('CarteController', CarteController);

  CarteController.$inject = ['RestaurantService', 'Authentication', '$scope'];

  function CarteController(RestaurantService, Authentication, $scope) {

      var vm = this;
      var boissonDisplayOrders =
      {
         "Boissons chaudes" : 0,
         "Eaux" : 20,
         "Boissons fraîches sans alcool" : 10,
         "Boissons fraîches" : 9,
         "Sans alcool" : 8,
         "Boissons sans alcool" : 8,
         "Apéritifs" : 99,
         "Boissons alcoolisées" : 100,
         "Alcools" : 101,
         "Digestifs" : 110,
      };

      activate();
      $scope.account = Authentication.fullAccount;

      /* On récupère toutes les lessons */
      RestaurantService.getCarte().then(function(value){

         var brunch_dict = {};
         var menu = value.data;

         /* Construction du dictionnaire plats_dict organisé par :
          { Categorie :
             {Specifite :
                [
                  [Plat1.denomination, Plat1.ingredients, Plat1.prix],
                  [Plat2.denomination, Plat2.ingredients, Plat2.prix]
                ]
             }
          }
          */
         var plats_dict = {};
         var plats = menu["plats"];
         for (var i = 0; i < plats.length; i++) {
            var plat = plats[i];
            if( !(plat.categorie.titre in plats_dict)){
               var new_categorie = {};
               new_categorie[plat.specificite.titre] = [[plat.denomination, plat.ingredients, plat.prix]];
               plats_dict[plat.categorie.titre] = new_categorie;
            }
            else{
               var categorie_dict = plats_dict[plat.categorie.titre];
               if( !(plat.specificite.titre in categorie_dict)){
                  categorie_dict[plat.specificite.titre] = [[plat.denomination, plat.ingredients, plat.prix]];
               }
               else{
                  categorie_dict[plat.specificite.titre].push([plat.denomination, plat.ingredients, plat.prix]);
               }
            }
         }
         $scope.menu = plats_dict;

         /* Cas special pour les desserts qui sont affichés en dernier */
         var desserts = "Desserts";
         if( desserts in plats_dict){
            $scope.desserts = {}
            $scope.desserts[desserts] = plats_dict[desserts];
            delete plats_dict[desserts];
         }

         /* Construction de la liste brunchs_list organisée par :
          [ Brunch1 :
              {"titre" : brunch1.titre,
               "didascalie" : brunch1.didascalie,
               "prix" : brunch1.prix,
               "items" : [brunch1.item1 , brunch1.item2, brunch1.item3, ...]
               "options : [ <[brunch1.option1, brunch1.prix_option1]>, <[brunch1.option2, brunch1.prix_option2]>, ... ]
              },
             Brunch2 :
               {"titre" : brunch2.titre,
                "didascalie" : brunch2.didascalie,
                "prix" : brunch2.prix,
                "items" : [brunch2.item1 , brunch2.item2, brunch2.item3, ...]
                "options : [ <[brunch2.option1, brunch2.prix_option1]>, <[brunch2.option2, brunch2.prix_option2]>, ... ]
                },
          ]
         */
         var brunchs_list = [];
         var brunchs = menu["brunchs"];
         if( brunchs != undefined){
            for (var i = 0; i < brunchs.length; i++) {
               var brunch = brunchs[i];
               var brunch_dict = {};
               brunch_dict["titre"] = brunch.titre;
               brunch_dict["didascalie"] = brunch.didascalie;
               brunch_dict["prix"] = brunch.prix;
               brunch_dict["items"] = [];
               brunch_dict["options"] = [];
               for(var j=0; j< brunch.items.length;j++){
                  var item = brunch.items[j];
                  if(!item.est_en_option){
                     brunch_dict["items"].push(item.plat);
                  }
                  else{
                     brunch_dict["options"].push([item.plat, item.prix_option])
                  }
               }
               brunchs_list.push(brunch_dict);
            }
            $scope.brunchs = brunchs_list;
         }



         var boisson_list = [];
         var categorie_dict = {};
         var boissons = menu["boissons"];
         for (var i = 0; i < boissons.length; i++) {

            var boisson = boissons[i];
            var categorie = boisson.categorie.titre;

            if( !(categorie in categorie_dict)){
               var dict = {};
               dict[categorie]  = [ [boisson.nom, boisson.prix] ];
               boisson_list[boissonDisplayOrders[categorie]] = dict;
               categorie_dict[categorie] = 1;
            }
            else{
               var dict = boisson_list[boissonDisplayOrders[categorie]];
               dict[categorie].push( [boisson.nom, boisson.prix] );
               boisson_list[boissonDisplayOrders[boisson.categorie.titre]] = dict;
            }

         }
         $scope.boissons = boisson_list;
         console.log("Boissons : ", $scope.boissons);
      });

      function activate() {
         Authentication.getFullAccount(function(value){
            Authentication.fullAccount = value;
            $scope.account = value;
         });
      }
  };



})();