/**
* Register controller
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.restaurant.controllers')
    .controller('RestaurantController', RestaurantController);

  RestaurantController.$inject = ['RestaurantService', 'Authentication', 'MessagingService', '$scope','Layout'];

  function RestaurantController(RestaurantService, Authentication, MessagingService, $scope, Layout) {

      var vm = this;

      activate();
      $scope.account = Authentication.fullAccount;
      $scope.reservation_comment = "";
      $scope.reservation_tel = "";

      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

      Date.prototype.addDays = function(days) {
         var date = new Date(this.valueOf());
         date.setDate(date.getDate() + days);
         return date;
      }

      Date.prototype.addMinutes = function(minutes) {
         var date = new Date(this.valueOf());
         date.setDate(date.getMinutes() + minutes);
         return date;
      }

      /* On récupère toutes les lessons */
      RestaurantService.getConfig().then(function(value){

         var config = value.data;

         $scope.all_days_hours = [];
         $scope.select_day_list = [];
         $scope.select_day_dict = {};
         $scope.fermetures_days = [];
         $scope.number_of_persons = [];

         var fermetures = config["fermetures"];
         var jours = config["jours"];
         var index = 0;

         /* A partir d'aujourdhui, jusque dans 30 jours, on cherche à construire :
              la liste des jours d'ouvertures ->
                  [{index:index1, locale: date1.locale(fr)}, {index:index2, locale: date2.locale(fr)},...] (n elements)
                  (ex : [{index:0,date:20180323T12:00:00,locale:"vendredi 23 mars 2018"},
                         {index:1,date:20180522T12:00:00,locale:"vendredi 22 mai 2018"},
                         ....]

            + la liste correspondantes des slots d'ouverture ->
                  [[11:30,12:00,12:30,...], [10:30,11:00,...], ...] (n elements)
         */
         for(var jour = 0; jour < 30 ; jour++){
           /* date sera le jour courant */
           var date = new Date().addDays(jour);
           var closure_day = false;

            /* Les jours de fermeture exceptionnelle ne sont pas rajoutés dans la liste à afficher */
            for (var fermeture = 0; fermeture<fermetures.length; fermeture++){
               var fermeture_start = new Date(fermetures[fermeture]["debut"]);
               var fermeture_end = new Date(fermetures[fermeture]["fin"]);

               if( (date >= fermeture_start) && (date<=fermeture_end)){
                  /* On met les jours de fermetures dans une liste spéciale pour pouvoir les afficher */
                  if(!(fermeture_start in $scope.fermetures_days)){
                     $scope.fermetures_days.push(fermeture_start.toLocaleDateString('fr-FR', options));
                     if(fermeture_end.getDate() != fermeture_start.getDate()){
                        $scope.fermetures_days.push(fermeture_end.toLocaleDateString('fr-FR', options));
                     }
                  }
                  closure_day = true;
                  break;
               }
            }
            if(closure_day) continue;

            /* date n'est pas un jour de fermeture exceptionnelle */
            for(var j=0;j<jours.length;j++){
               /* On regarde si le jour courant est un jour d'ouverture normale */
               if( jours[j]["weekday"] == date.getDay()){
                  var year = date.getFullYear();
                  var month = date.getMonth();
                  var day = date.getDate();
                  var slots_for_day = [];
                  $scope.slots_dict = {};
                  $scope.slots_dict[date] = [];

                  /* slots est la liste de slots d'ouverture défini dans la config */
                  var slots = jours[j]["slots"];

                  /* Pour chaque slot dans la config, on va le découper en tranche de 30 min */
                  for (var slot = 0; slot < slots.length ; slot++){
                     var from = slots[slot]["from_hour"];
                     var to   = slots[slot]["to_hour"];
                     var tmp_start_date = moment(new Date(year, month,day,from.split(":")[0],from.split(":")[1]));
                     var tmp_end_date = moment(new Date(year, month,day,to.split(":")[0],to.split(":")[1]));

                     while(tmp_start_date < tmp_end_date){
                        slots_for_day.push(tmp_start_date.format("HH:mm"));
                        tmp_start_date = moment(tmp_start_date).add(30, 'minutes');
                     }
                  }
                  $scope.all_days_hours.push(slots_for_day);
                  $scope.select_day_list.push({index:index, date : date, locale : date.toLocaleDateString('fr-FR', options)});
                  $scope.select_day_dict[date.toLocaleDateString('fr-FR', options)] = {
                                                                                      index:index,
                                                                                      date : date,
                                                                                      locale : date.toLocaleDateString('fr-FR', options)
                                                                                      };
                  index++;
               }
            }
         }

         for(var i = 1 ; i <= 30 ; i++ ){
             $scope.number_of_persons.push(i);
         }
         $scope.selected_day_hours = [];
         $scope.restaurant_config = config;
      });

      $scope.changeDay = function(){
         /* Lorsqu'un jour est sélectionné, on affiche la liste des slots lui correspondant */
         var index = $scope.select_day_dict[$scope.selectedDate]["index"];
         $scope.selected_day_hours = $scope.all_days_hours[index];
         $scope.error = undefined;
         $scope.success = undefined;
         $scope.reservation_comment = "";
         $scope.reservation_tel = "";
      }

      $scope.changeHour = function(){
         $scope.error = undefined;
         $scope.success = undefined;
         $scope.reservation_comment = "";
         $scope.reservation_tel = "";
      }

      $scope.changeNbPersons = function(){
         $scope.error = undefined;
         $scope.success = undefined;
         $scope.reservation_comment = "";
         $scope.reservation_tel = "";
      }

      $scope.changeForm = function(){
         $scope.error = undefined;
         $scope.success = undefined;
      }

      function activate() {
         Authentication.getFullAccount(function(value){
            Authentication.fullAccount = value;
            $scope.account = value;
         });
      }

      $scope.reservation = function(){

         var base_message = "Merci de choisir ";
         var error = false;
         if( $scope.selectedDate == undefined ){
            error = true;
            base_message += "un jour";
            if( $scope.selectedHour == undefined || $scope.selectedNumberOfPersons == undefined){
               base_message += ", ";
            }
         }
         if ( $scope.selectedHour == undefined ){
           error = true;
           base_message += "une heure ";
           if( $scope.selectedNumberOfPersons == undefined ){
              base_message += "et ";
           }
         } if ( $scope.selectedNumberOfPersons == undefined ){
           base_message += "un nombre de personnes";
           error = true;
         }

         if ( $scope.reservation_nom == undefined || $scope.reservation_email == undefined)
         {
            error = true;
            base_message = "Merci de renseigner votre nom et votre email";
         }

         if(error){
            $scope.error = base_message;
            return;
         }

         var reservation_information = {};
         var date = $scope.select_day_dict[$scope.selectedDate]["date"];
         reservation_information["date"] = new Date(moment(new Date(date.getFullYear(),
                                                           date.getMonth(),
                                                           date.getDate(),
                                                           $scope.selectedHour.split(":")[0],
                                                           $scope.selectedHour.split(":")[1])));
         reservation_information["hour"] = $scope.selectedHour;
         reservation_information["nb_persons"] = $scope.selectedNumberOfPersons;
         reservation_information["human_date"] = date.toLocaleDateString('fr-FR', options);

         var personal_information = {};
         personal_information["name"] = $scope.reservation_nom;
         personal_information["email"] = $scope.reservation_email;
         personal_information["tel"] = $scope.reservation_tel;
         personal_information["comment"] = $scope.reservation_comment;

         if( ($scope.error != undefined) || ($scope.success != undefined)){
            $scope.error = "Vous souhaitez faire une réservation alors que vous n'avez rien modifié.";
            $scope.success = undefined;
            return;
         }

         RestaurantService.createReservation(reservation_information, personal_information).then(
            function(data, status, headers, config){
               var message = data.data["message"];//"Votre réservation a bien été prise en compte";
               $scope.success = data.data["message"];
               $scope.error = undefined;
            },
            function(data, status, headers, config){
               $scope.error = data.data["message"];//"Une erreur est survenue lors de la réservation";
               $scope.success = undefined;
            });

         MessagingService.sendRestaurantReservationEmail(reservation_information,personal_information, function(status, message){
            if(!status){
                $scope.error = "Une erreur est survenue lors de la réservation, veuillez contacter notre équipe directement par téléphone";
                $scope.success = undefined;
            }

         });

      }

      this.$doCheck = function(){
         $scope.portrait = Layout.detectScreenOrientation();
         var view = angular.element( document.querySelector( '.reservation-input' ) );
         if($scope.portrait){
            view.removeClass('reservation-input-landscape');
            view.addClass('reservation-input-portrait');
         }else{
            view.addClass('reservation-input-landscape');
            view.removeClass('reservation-input-portrait');
         }
      }
  };
})();