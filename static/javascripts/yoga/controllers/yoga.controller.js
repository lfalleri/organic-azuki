/**
* Register controller
* @namespace thinkster.authentication.controllers
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.yoga.controllers')
    .controller('YogaController', YogaController);

  YogaController.$inject = ['YogaService', 'Authentication', '$scope', 'moment', '$uibModal', '$location' ];

  function YogaController( YogaService, Authentication, $scope, moment, $uibModal, $location) {

     var INTENSITY_COLOR = {
          Debutant:"#0faa45",
          Basique:'#1271ba',
          Intermediaire:'#dbd40f',
          Intensif:'#d62506',
          Expert:'#1e1919'
     };
     var TYPE_COLOR = {
          Hatha:["#17822e", "#4aa55e"],
          Ashtanga:['#a07828','#c19e57'] ,
          Vinyasa:['#8028a0','#a051bc'],
          Bikram:['#1f5f7a','#488aa5'],
     };
     var EVENT_COLOR = {
          Hatha:{reservable : "#bfcb91", focused :"#fffdfa", complete:"#f8e4c8", reserved:"#54622e"},
          Ashtanga:{reservable :'#bfcb91',focused :'#fffdfa', complete:"#f8e4c8", reserved:"#54622e"},
          Vinyasa:{reservable :'#bfcb91',focused :'#fffdfa', complete:"#f8e4c8", reserved:"#54622e"},
          Bikram:{reservable :'#bfcb91',focused :'#fffdfa', complete:"#f8e4c8", reserved:"#54622e"},
     };
     var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

     Date.prototype.addDays = function(days) {
         var date = new Date(this.valueOf());
         date.setDate(date.getDate() + days);
         return date;
      }

     var vm = this;
     activate();
     $scope.account = Authentication.fullAccount;
     $scope.reservationParams = {nb_persons : 1};
     $scope.reservedLessonIdForAccount = [];
     $scope.reservedLessons = [];
     $scope.events = [];
     $scope.lesson_to_display = false;
     $scope.nb_places = 12;
     $scope.staff = {
          reservationsForLesson:[],
          addUser : {
             displaySearchUserForm:false,
             displaySearchedAccounts:false,
             displayDetailedAccount:false,
             nb_persons:0,
             searchedAccounts:[],
             selectedAccount:undefined,
          }
     };
     $scope.datepicker = { display: true,
                           display_buttons : false,
                           today : new Date(),
                           min_date : new Date(),
                           max_date : new Date().addDays(30),
                           selectedLesson : undefined,
                          };
     $scope.days_with_lessons = {};



     function activate() {
         Authentication.getFullAccount(function(value){
            $scope.account = value;
            if(angular.equals($scope.account,{})){
               /* If not logged in, just get all the lessons */
               getAllLessons();
            }else{
               /* If there is an on-going (pending) reservation, don't display calendar page, but reservation page */
               YogaService.gotoReservationIfAny($scope.account);

               /* Otherwise get reservations of  user */
               YogaService.getReservationsByAccount($scope.account.id, function(success, reservations){
               if(!success){
                  return;
               }
               reservations.forEach(function(reservation){
                   if (!$scope.reservedLessonIdForAccount.includes(reservation.lesson.id)){
                      $scope.reservedLessonIdForAccount.push(reservation.lesson.id);
                   }
               });
               getAllLessons();
            });
            }
         });
     }

     function getAllLessons(){
        /* On récupère toutes les lessons */
        var promise = YogaService.getAllLessons();
        var lessons = [];
        var closest_lesson = undefined;


        promise.then(function(value){
           /* Une fois que le promise est résolu, on parcourt chaque lesson pour le rajouter dans vm.events */
           var now = new Date();
           var diff_min = Number.MAX_SAFE_INTEGER;
           lessons = value.data;
           lessons.forEach(function (lesson) {
               lesson.reservedByAccount = false;
               lesson.cancelable = false;
               lesson.reservable = true;
               if($scope.reservedLessonIdForAccount.includes(lesson.id)){
                  lesson.reservedByAccount = true;
                  lesson.cancelable = true;
                  lesson.reservable = false;
               }

               /* ui-calendar events */
               var new_event = {};
               new_event.start = moment(lesson.date).toDate();
               new_event.end = moment(lesson.date).add(lesson.duration, 'm').toDate();

               /* Check if lesson is in the past */
               if( (new_event.start - now) <0){
                  new_event.borderColor =  "#7a552e"/*"#9a9ca0";*/
                  new_event.backgroundColor = "#f8e4c8";
                  new_event.title = lesson.type+' '+lesson.intensity;/*+'\n'+lesson.animator.prenom+' '+lesson.animator.nom;*/
                  lesson.display_title = "Cours sélectionné (Terminé):";
                  lesson.reservable = false;
                  lesson.cancelable = false;
               }
               else{
                  if (lesson.reservedByAccount){
                     /* Lesson reserved by user */
                     lesson.display_title = "Cours sélectionné (Réservé):";

                     new_event.borderColor = "#7a552e";
                     new_event.backgroundColor = EVENT_COLOR[lesson.type].reserved;
                     new_event.textColor = "#ffffff";
                     new_event.title = lesson.type + ' ' + lesson.intensity + ' (Réservé)\n' ;/*+
                                       lesson.animator.prenom + ' ' +lesson.animator.nom;*/

                     var reservedLesson = {};
                     reservedLesson.description = lesson.type+' '+lesson.intensity+' - '+
                                                  lesson.animator.prenom +' ' + lesson.animator.nom;
                     reservedLesson.day = new_event.start.toLocaleDateString('fr-FR', options);
                     reservedLesson.start = new_event.start.getHours() + ":"+
                                            (new_event.start.getMinutes() < 10 ? '0' : '') +
                                            new_event.start.getMinutes();
                     reservedLesson.duration = lesson.duration;
                     reservedLesson.nb_places = lesson.nb_places;
                     reservedLesson.id = lesson.id;
                     $scope.reservedLessons.push(reservedLesson);

                     if ((new_event.start - now) < diff_min){
                           diff_min = new_event.start - now;
                           closest_lesson = new_event;
                           $scope.previous_event = new_event;
                     }
                  }else{
                     /* Lesson not reserved by user; it's either Reservable or Complete */
                     new_event.title = lesson.type+' '+lesson.intensity+'\n';/*+lesson.animator.prenom+' '+lesson.animator.nom;*/
                     if(lesson.nb_places > 0){
                        lesson.display_title = "Cours sélectionné (Réservable):";
                        new_event.borderColor = "#3e4826";
                        new_event.backgroundColor = EVENT_COLOR[lesson.type].reservable;
                        new_event.textColor = "#3e4826";
                        lesson.reservable = true;
                        if ((new_event.start - now) < diff_min){
                           diff_min = new_event.start - now;
                           closest_lesson = new_event;
                           new_event.borderColor = "#3e4826";
                           new_event.backgroundColor = "#fffdfa";
                           new_event.textColor = "#3e4826";
                           $scope.previous_event = new_event;
                           $scope.previous_selected_background_color = EVENT_COLOR[lesson.type].reservable;
                        }
                     }else{
                        lesson.display_title = "Cours sélectionné (Complet):";
                        new_event.borderColor = "#7a552e";
                        new_event.backgroundColor = "#f8e4c8";
                        lesson.reservable = false;
                     }
                  }
               }
               new_event.allDay = false;
               new_event.stick = true;

               /* Event information not directly connected with calendar events  : used for display */
               new_event.meta = {};
               new_event.meta.panel_description = lesson.type + ' ' + lesson.intensity + ' \n ' +
                                                  lesson.animator.prenom +' ' + lesson.animator.nom;
               new_event.meta.day = new_event.start.toLocaleDateString('fr-FR', options);
               new_event.meta.start = new_event.start.getHours() + ":"+
                                     (new_event.start.getMinutes() < 10 ? '0' : '') +
                                      new_event.start.getMinutes();
               new_event.meta.duration = lesson.duration;
               new_event.meta.nb_places = lesson.nb_places;
               new_event.meta.lesson = lesson;

               /* Add newly built event to calendar events list */
               $scope.events.push(new_event);



               /* For datepicker only */
               var day = new_event.meta.day;
               if( lesson.cancelable || lesson.reservable){
                  if (!(day in $scope.days_with_lessons)){
                     $scope.days_with_lessons[day] = [];
                  }
                  $scope.days_with_lessons[day].push(Object.assign({}, new_event.meta));
               }
            });

           if(closest_lesson){
               /* Display information about closest next lesson */
               $scope.description = closest_lesson.meta.panel_description;
               $scope.day = closest_lesson.meta.day;
               $scope.start = closest_lesson.meta.start;
               $scope.duration = closest_lesson.meta.duration;
               $scope.lesson = closest_lesson.meta.lesson;
               $scope.nb_places = closest_lesson.meta.nb_places;
               $scope.lesson_to_display = true;

               if(closest_lesson.meta.lesson.reservedByAccount){
                  $scope.lesson.display_title = "Prochain Cours (Réservé):";
               }else{
                  if(closest_lesson.meta.nb_places > 0){
                     $scope.lesson.display_title = "Prochain Cours (Réservable):";
                  }else{
                     $scope.lesson.display_title = "Prochain Cours (Complet):";
                  }
               }

               $scope.datepicker.lessons_of_today = $scope.days_with_lessons[$scope.day];
               if($scope.account.is_staff){
                   /* Specific is user is in staff, get all the reservations for the closest lesson */
                   $scope.staff.reservationsForLesson = [];
                   YogaService.getReservationsByLesson($scope.lesson, function(success, reservations){
                       if(!success)return;
                       reservations.forEach(function(reservation){
                           $scope.staff.reservationsForLesson.push(reservation);
                       });
                   });
               }
           }
        });
     }

     $scope.number_of_persons = [];
     for(var i = 1 ; i <= $scope.nb_places ; i++ ){
        $scope.number_of_persons.push(i);
     }

     $scope.eventSources = [$scope.events];

     /* Calendar config object */
     $scope.uiConfig = {
         calendar:{
            timezone:'Europe/Paris',
            allDaySlot: false,
            defaultView: 'agendaWeek',
            height: 500,
            contentHeight: 530,
            firstDay: 1,
            handleWindowResize:true,
            views: {
                week: { // name of view
                timeFormat: 'HH:mm',
                columnFormat: 'ddd D/M',
                columnHeaderFormat: 'ddd',
                axisFormat: 'HH:mm',
                }
            },
            selectable: true,
            slotLabelFormat : 'HH:mm',
            timeFormat : 'HH:mm',
            axisFormat: 'HH:mm',
            minTime:"11:00:00",
            maxTime:"22:00:00",
            dayNames:["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
            monthNames:["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
            dayNamesShort:["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
            monthNamesShort :['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin','Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Déc'],
            titleFormat: {
                week:  "[Semaine du] D MMMM  YYYY",
            },
            columnFormat: 'ddd D MMM',
            titleRangeSeparator: ' au ',
            hiddenDays: [  1, 2 ],
            aspectRatio: 1,
            height: 400,
            header:{
              left: ' ',
              center: 'title',
              right: 'prev,next'
            },
            eventAfterRender :  function (event, element, view) {
                if(event.meta.lesson.id == $scope.previous_event.meta.lesson.id){
                    element.css('border-width','medium');
                    $scope.previous_selected = element;
                }
            },
            eventClick: function(calEvent, jsEvent, view) {
                   /* Lesson clicked :
                       - display its information (1)
                       - if is staff member : display users registered for this lesson (2)
                       - restore background color and border for previously selected lesson (3)
                       - change background color and border of current lesson (4) */

                   /* (1) */
                   $scope.description = calEvent.meta.panel_description;
                   $scope.day = calEvent.meta.day;
                   $scope.start = calEvent.meta.start;
                   $scope.duration = calEvent.meta.duration;
                   $scope.lesson = calEvent.meta.lesson;
                   $scope.nb_places = calEvent.meta.nb_places;
                   $scope.alert_message = undefined;
                   $scope.reservationParams.nb_persons = 1;
                   $scope.reservationParams.s = undefined;
                   /* (2) */
                   if($scope.account.is_staff){
                       $scope.staff.reservationsForLesson = [];
                       YogaService.getReservationsByLesson($scope.lesson, function(success, reservations){
                           if(!success)return;
                           reservations.forEach(function(reservation){
                               $scope.staff.reservationsForLesson.push(reservation);
                           });
                       });
                   }

                   /* (3) */
                   /* Reset previous selected event accordingly to its status (reserved or not)*/
                   if($scope.previous_selected){
                      if($scope.previous_event.meta.lesson.reservedByAccount){
                         $scope.previous_selected.css('backgroundColor', EVENT_COLOR[$scope.previous_event.meta.lesson.type].reserved);
                      }
                      else{
                         if(!$scope.previous_event.meta.lesson.reservable &&
                            !$scope.previous_event.meta.lesson.cancelable ){
                            $scope.previous_selected.css('backgroundColor', EVENT_COLOR[calEvent.meta.lesson.type].complete);
                         }else{
                            $scope.previous_selected.css('backgroundColor', EVENT_COLOR[$scope.previous_event.meta.lesson.type].reservable);
                         }
                      }
                      $scope.previous_selected.css('border-color',$scope.previous_selected_border_color);
                      $scope.previous_selected.css('border-width','thin');
                   }
                  /*if(!calEvent.meta.lesson.reservable &&
                      !calEvent.meta.lesson.cancelable){
                      $scope.previous_selected = undefined;
                      return;
                   }*/
                   if(!calEvent.meta.lesson.reservable &&
                      !calEvent.meta.lesson.cancelable){
                      $scope.previous_selected = $(this);
                      $scope.previous_event = calEvent;
                      $scope.previous_selected_border_color = $(this).css('border-color');
                      $(this).css('border-color', '#3e4826');
                      $(this).css('color', '#3e4826');
                      $(this).css('backgroundColor', '#fffdfa');
                      $(this).css('border-width','medium');
                      return;
                   }
                   if(calEvent.meta.lesson.reservedByAccount){
                      $scope.previous_selected_background_color = EVENT_COLOR[calEvent.meta.lesson.type].reserved;
                      $(this).css('backgroundColor', EVENT_COLOR[calEvent.meta.lesson.type].reserved);
                   }else{
                      if(!$scope.previous_event.meta.lesson.reservable &&
                         !$scope.previous_event.meta.lesson.cancelable ){
                         $scope.previous_selected_background_color = EVENT_COLOR[calEvent.meta.lesson.type].complete;
                      }
                      else{
                         $scope.previous_selected_background_color = EVENT_COLOR[calEvent.meta.lesson.type].reservable;
                      }
                      $(this).css('backgroundColor', EVENT_COLOR[calEvent.meta.lesson.type].focused);
                   }
                   /* (4) */
                   $scope.previous_selected = $(this);
                   $scope.previous_event = calEvent;
                   $scope.previous_selected_border_color = $(this).css('border-color');
                   $(this).css('border-color', '#3e4826');
                   $(this).css('color', '#3e4826');
                   $(this).css('border-width','medium');
            },
            eventMouseover: function(calEvent, jsEvent, view) {
                   $(this).css('cursor','pointer');
            },
         }
     };

     $scope.updateReservationParams = function(){
         if( $scope.reservationParams.nb_persons > 1 ){
            $scope.reservationParams.s = 's';
         }else{
            $scope.reservationParams.s = '';
         }
     }

     $scope.gotoLoginAndBackTo = function(lesson){
         Authentication.gotoLoginAndBackTo('/yoga/calendrier');
     };

     /* Function called when the reservation button is clicked by user */
     $scope.createReservation = function(lesson, account, reservationParams){
         $scope.alert_message = [];
         if( !lesson.reservable ){
             $scope.alert_message = ["Vous avez déjà réservé ce cours"];
             $scope.alert_message_color = "orange";
             return;
         }
         if( account.credits < (lesson.price * reservationParams.nb_persons)){
             $scope.alert_message = ["Vous n'avez pas assez de crédits pour réserver ce cours"];
             $scope.alert_message_color = "red";
         }
         else{
             if ($scope.reservationParams.nb_persons == undefined){
                $scope.alert_message = ["Veuillez sélectionner un nombre de personnes"];
                $scope.alert_message_color = "red";
                return;
             }
             if(lesson.nb_places < reservationParams.nb_persons){
                $scope.alert_message = ["Nombre de places insuffisant"];
                $scope.alert_message_color = "red";
                return;
             }
             $scope.alert_message = [];

             /*
              Store reservation parameters in YogaService and
              change location to the reservation confirmation page (managed by YogaReservationController)
              */
             YogaService.stageReservation(
                lesson,
                account,
                reservationParams.nb_persons,
                function(success, message, updated_lesson){
                   if(!success){
                      if(updated_lesson != undefined){
                         $scope.lesson.nb_places = updated_lesson.nb_places;
                      }
                      $scope.alert_message = message;
                      $scope.alert_message_color = "red";
                      return;
                   }
                }
             );
         }
     }

     /* Function called when the recredite button is clicked by user */
     $scope.recrediteAccount = function(account){
        $location.url('/yoga/recharge');
     }

     /* Function called when the cancellation button is clicked by user.
        by_staff means the staff is responsible of "live" cancellation */
     $scope.cancelReservation = function(lesson, account, by_staff){
        $scope.alert_message = [];

        YogaService.getReservation(lesson, account, function(success, reservation){
           if(!success){
              $scope.alert_message = message;
              $scope.alert_message_color = "red";
              return;
           }
           if (reservation == undefined){
                $scope.alert_message = "Impossible d'annuler cette réservation";
                $scope.alert_message_color = "red";
                return;
           }
           reservation = reservation[0];

           if(!by_staff){
              /* Delegate actual to YogaCancellationController on cancellation page */
              YogaService.stageCancellation(reservation, "calendar");
           }else{
               /* A staff member wants to cancel reservation */
               YogaService.cancelReservation(lesson, account, function(success, message){
                   if(!success){
                       $scope.alert_message = message;
                       $scope.alert_message_color = "red";
                       return;
                   }

                   /* Update local information */
                   $scope.account.credits += lesson.price * reservation.nb_personnes;
                   $scope.lesson.nb_places += reservation.nb_personnes;
                   $scope.staff.reservationsForLesson = $scope.staff.reservationsForLesson.filter(function(el){
                       return el.account.id !== reservation.account.id;
                   });
                   if($scope.staff.addUser.selectedAccount.id == reservation.account.id){
                       $scope.staff.addUser.selectedAccount.credits += (reservation.nb_personnes * reservation.lesson.price);
                   }

                   $scope.reservedLessons = $scope.reservedLessons.filter(function(el) {return el.id !== lesson.id;});
                   $scope.$apply();
               }); /* cancelReservation() */
           }/* End live case */
        }
     )};

     /* function called when a staff member check someone present */
     $scope.checkedPresent = function(reservation){
        YogaService.checkAccountPresent(reservation.lesson,
                                        reservation.account,
                                        reservation.checked_present,
                                        function(success, message){});
     }

     $scope.incrementNbPresent = function(reservation){
        reservation.nb_present++;
        YogaService.updateNbPresent(reservation.lesson,
                                    reservation.account,
                                    reservation.nb_present,
                                    function(success, message){});
        if(reservation.nb_present >= reservation.nb_personnes){
            reservation.checked_present = true;
            reservation.disableAddFriend = true;
            YogaService.checkAccountPresent(reservation.lesson,
                                            reservation.account,
                                            reservation.checked_present,
                                            function(success, message){});

        }
     }

     $scope.decrementNbPresent = function(reservation){
        reservation.nb_present--;
        YogaService.updateNbPresent(reservation.lesson,
                                    reservation.account,
                                    reservation.nb_present,
                                    function(success, message){});
        if(reservation.nb_present <= reservation.nb_personnes){
            reservation.checked_present = false;
            reservation.disableAddFriend = false;
            YogaService.checkAccountPresent(reservation.lesson,
                                            reservation.account,
                                            reservation.checked_present,
                                            function(success, message){});

        }
     }

     $scope.displaySearchForm = function(){
        $scope.staff.addUser.displaySearchUserForm = true;
        $scope.staff.addUser.searchedAccounts = [];
        $scope.staff.addUser.displaySearchedAccounts = false;
     }

     $scope.hideSearchForm = function(){
        $scope.staff.addUser.displaySearchUserForm = false;
     }

     $scope.searchUser = function(){
        if($scope.staff.addUser.last_name==undefined){$scope.staff.addUser.last_name = "";}
        if($scope.staff.addUser.first_name==undefined){$scope.staff.addUser.first_name = "";}
        if($scope.staff.addUser.email==undefined){$scope.staff.addUser.email = "";}

        Authentication.getUsers(
            $scope.staff.addUser.last_name,
            $scope.staff.addUser.first_name,
            $scope.staff.addUser.email,
            function(success, accounts){
                if(!success){
                   console.error("Impossible de trouver les utilisateurs");
                }
                if(accounts == []){
                   $scope.staff.addUser.userNotFound = "Aucun utilisateur trouvé";
                   return;
                }
                $scope.staff.addUser.searchedAccounts = accounts;
                $scope.staff.addUser.displaySearchUserForm = false;
                $scope.staff.addUser.displaySearchedAccounts = true;
                $scope.staff.addUser.displayDetailedAccount = false;
            });
     }

     $scope.hideSearchedAccounts = function(){
        $scope.staff.addUser.displaySearchUserForm = true;
        $scope.staff.addUser.displaySearchedAccounts = false;
        $scope.staff.addUser.displayDetailedAccount = false;
     }

     $scope.staff.addUser.selectSearchedAccount = function(account){
        $scope.staff.addUser.displaySearchUserForm = false;
        $scope.staff.addUser.displaySearchedAccounts = false;
        $scope.staff.addUser.displayDetailedAccount = true;
        $scope.staff.addUser.proceedBalanceError = undefined;
        $scope.staff.addUser.selectedAccount = account;
        $scope.staff.addUser.proceed_credit = 0;
        $scope.staff.addUser.proceed_debit = 0;
        $scope.staff.addUser.nb_persons = 0;
     }

     $scope.updateNbPersons = function(){
        if( $scope.staff.addUser.proceed_debit < $scope.lesson.price ){
           $scope.staff.addUser.proceedBalanceError = "Attention, le prix par personne est de "+$scope.lesson.price + " crédits";
           return;
        }
        if( ($scope.staff.addUser.proceed_debit % $scope.lesson.price) != 0 ){
           $scope.staff.addUser.proceedBalanceError = "Attention, débit n'est pas un multiple du prix/personne";
           return;
        }
        $scope.staff.addUser.nb_persons = $scope.staff.addUser.proceed_debit / $scope.lesson.price;
        $scope.staff.addUser.proceedBalanceError = undefined;
     }

     $scope.proceedBalance = function(account, credit,debit){
        if(credit==""){credit = 0;}
        if(debit==""){debit = 0;}
        $scope.staff.addUser.proceedBalanceSuccess = "";
        $scope.staff.addUser.proceedBalanceError   = "";
        if((account.credits + credit - debit) <0){
           $scope.staff.addUser.proceedBalanceError = "Pas assez de crédits";
           return;
        }
        if( (debit == 0) && (credit > 0) ){
           Authentication.crediteProfile(account,credit, function(success, message){
              if(!success){
                 $scope.staff.addUser.proceedBalanceError = "Impossible de recréditer le compte";
                return;
              }
              $scope.staff.addUser.proceedBalanceSuccess = "Compte recrédité de "+credit+" credits";
              $scope.staff.addUser.selectedAccount.credits += credit - debit;
              $scope.staff.addUser.proceed_credit = 0;
              $scope.staff.addUser.proceed_debit = 0;
              return;
           });
           return;
        }
        if( debit < $scope.lesson.price ){
           $scope.staff.addUser.proceedBalanceError = "Attention, le prix par personne est de "+$scope.lesson.price + " crédits";
           return;
        }
        if( (debit % $scope.lesson.price) != 0 ){
           $scope.staff.addUser.proceedBalanceError = "Attention, débit n'est pas un multiple du prix/personne";
           return;
        }

        var nb_persons = debit / $scope.lesson.price;
        $scope.staff.addUser.nb_persons = nb_persons;
        YogaService.createLiveReservation($scope.lesson,account, nb_persons, credit, debit, function(success, message, reservation){
            if(!success){
               $scope.staff.addUser.proceedBalanceError = message;
               return;
            }else{
                $scope.staff.reservationsForLesson.push(reservation);
                $scope.staff.addUser.nb_persons = 0;
                $scope.staff.addUser.proceedBalanceError = undefined;
                $scope.staff.addUser.selectedAccount.credits += credit - debit;
                $scope.staff.addUser.proceed_credit = 0;
                $scope.staff.addUser.proceed_debit = 0;
                $scope.lesson.nb_places -= nb_persons;
                $scope.$apply();
            }
        });
     }

     $scope.hideProceedBalanceForm = function(){
        $scope.staff.addUser.displaySearchUserForm = false;
        $scope.staff.addUser.displaySearchedAccounts = true;
        $scope.staff.addUser.displayDetailedAccount = false;
        $scope.staff.addUser.proceedBalanceError = undefined;
     }

     $scope.datepicker.filterOpenedDays = function(date){
        var day = date.toLocaleDateString('fr-FR', options);
        if((day in $scope.days_with_lessons)) return true;
        return false;
     }

     $scope.datepicker.change = function(){
        var today = $scope.datepicker.today.toLocaleDateString('fr-FR', options);
        $scope.datepicker.lessons_of_today = $scope.days_with_lessons[today];
        $scope.datepicker.selectedLesson = undefined;
     }

     $scope.selectLesson = function(today_lesson){
        $scope.description = today_lesson.panel_description;
        $scope.day = today_lesson.day;
        $scope.start = today_lesson.start;
        $scope.duration = today_lesson.duration;
        $scope.lesson = today_lesson.lesson;
        $scope.nb_places = today_lesson.nb_places;
        $scope.alert_message = undefined;
        $scope.reservationParams.nb_persons = 1;
        $scope.reservationParams.s = undefined;
        $scope.datepicker.display = false;
        $scope.datepicker.display_buttons = true;
        $scope.datepicker.selectedLesson = today_lesson;
     }

     $scope.backToDatePicker = function(){
        $scope.datepicker.display = true;
        $scope.datepicker.display_buttons = false;
        $scope.datepicker.selectedLesson = undefined;
     }

     $scope.isLessonSelected = function(lesson){
        if($scope.datepicker.selectedLesson=== undefined) return true;
        if($scope.datepicker.selectedLesson === lesson) return true;
        return false;
     }


  };

})();