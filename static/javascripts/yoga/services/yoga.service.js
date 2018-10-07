/**
* Authentication
* @namespace thinkster.authentication.services
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.yoga.services')
    .factory('YogaService', YogaService);

  YogaService.$inject = ['$http','$q', '$location'];

  /**
  * @namespace Reservations
  * @returns {Factory}
  */
  function YogaService($http, $q, $location) {
    /**
    * @name Reservations
    * @desc The Factory to be returned
    */
    var YogaService = {
       /* Lesson API */
       getAllLessons: getAllLessons,
       getLesson: getLesson,

       /* Pre-confirmation reservation API */
       stageReservation: stageReservation,
       stagedReservationExit: stagedReservationExit,
       getPendingReservationsByLesson : getPendingReservationsByLesson,
       getPendingReservationsByAccount : getPendingReservationsByAccount,
       createPendingReservation : createPendingReservation,
       deletePendingReservation : deletePendingReservation,
       storeLocalePendingReservationByAccount: storeLocalePendingReservationByAccount,
       getLocalePendingReservationByAccount: getLocalePendingReservationByAccount,
       gotoReservationIfAny : gotoReservationIfAny,
       pendingReservationByAccount: {},
      /* storeAnonymousPreReservation: storeAnonymousPreReservation,
       getAnonymousPreReservation:AnonymousPreReservation,
       anonymousPreReservation: undefined;*/

       /* Pre-confirmation cancel API */
       stageCancellation: stageCancellation,
       stagedCancellationExit: stagedCancellationExit,
       storePendingCancellationByAccount: storePendingCancellationByAccount,
       getPendingCancellationByAccount: getPendingCancellationByAccount,
       gotoCalendar : gotoCalendar,
       stagedCancellationByAccount: {},


       /* Confirmed reservation API */
       createReservation : createReservation,
       createLiveReservation : createLiveReservation,
       cancelReservation : cancelReservation,
       checkAccountPresent: checkAccountPresent,
       updateNbPresent : updateNbPresent,
       allReservations : allReservations,
       getReservation: getReservation,
       getReservationsByAccount : getReservationsByAccount,
       getReservationsByLesson : getReservationsByLesson,

       /* Animators API */
       getAllAnimators: getAllAnimators,

       /* Transactions API */
       getAllFormulas : getAllFormulas,
       tryReductionCode : tryReductionCode,
       getTransactionsByAccount : getTransactionsByAccount,
       proceedTransaction: proceedTransaction,

       /* General */
       locations : {"calendar":"/yoga/calendrier",
                    "settings":"/settings",
                    "cancellation":"/yoga/annulation",
                    "reservation" : "/yoga/reservation"},
    }

    return YogaService;

    ////////////////////

    /************************
     *      Lesson API      *
     ************************/
    /**
    * @name getAllLessons
    * @desc Return the events
    * @returns {object|undefined} Events
    * @memberOf thinkster.reservations.services.Reservations
    */
    function getAllLessons() {
       var promise = $http.get('/api/v1/yoga/lessons/');
       promise.then(getLessonsSuccessFn, getLessonsErrorFn);
       return promise;
        /**
        * @name registerSuccessFn
        * @desc Log the new user in
       */
       function getLessonsSuccessFn(data, status, headers, config) {
           return data.data;
       }

       /**
       * @name registerErrorFn
       * @desc Log "Epic failure!" to the console
       */
       function getLessonsErrorFn(data, status, headers, config) {
       }
    }

    function getLesson(lesson, callback){
      return $http.get('api/v1/yoga/lessons/',{
          params: {lesson_id:lesson.id}}
      ).then(
        function(data, status, headers, config){
          var lessons = data.data;
          callback(true, lessons[0]);
      },function(data, status, headers, config){
          callback(false, undefined);
      });
    }

    /*************************************
     *  Pre-confirmation reservation API *
     *************************************/
    function getPendingReservationsByLesson(lesson, callback){
      return $http.get('api/v1/yoga/pendingreservation/',{
          params: {lesson_id:lesson.id}}
      ).then(
        function(data, status, headers, config){
          callback(true, data.data);
      },function(data, status, headers, config){
          callback(false, undefined);
      });
    }

    function getPendingReservationsByAccount(account, callback){
      return $http.get('api/v1/yoga/pendingreservation/',{
          params: {account_id:account.id}}
      ).then(
        function(data, status, headers, config){
          callback(true, data.data);
      },function(data, status, headers, config){
          callback(false, undefined);
      });
    }

    function createPendingReservation(lesson, account, nb_persons, callback) {
      return $http.post('api/v1/yoga/pendingreservation/', {
        lesson: lesson,
        account: account,
        nb_pending_reservations: nb_persons,
      }).then(
        function(data, status, headers, config){
          callback(true, "OK");
      },function(data, status, headers, config){
          callback(false, ["Une erreur est survenue lors de la réservation"]);
      });
    }

    function deletePendingReservation(lesson, account,nb_persons, callback) {
      return $http.delete('api/v1/yoga/pendingreservation/',{
          params: {lesson_id:lesson.id, account_id:account.id,nb_pending_reservations: nb_persons}
      }).then(
        function(data, status, headers, config){
          callback(true,"OK");
      },function(data, status, headers, config){
          callback(false,"Une erreur est survenue lors de l'annulation");
      });
    }

    /**
    * @name stageReservation
    * @desc
    * @returns {object|undefined} Events
    * @memberOf thinkster.reservations.services.Reservations
    */
    function stageReservation(lesson, account, nb_persons, callback) {
        var account_id = account.id;
        var lesson_id = lesson.id;

        /* Before creating a pending reservation,
           make sure that there's still places available :  get the lesson and check nb_places remaining with
           nb_persons of the current request */
        YogaService.getLesson(lesson, function(success, updated_lesson){
           if(!success){
              /* Shouldn't occur */
              var message = ["Une erreur est survenue lors de la réservation, veuillez réessayer plus tard "];
              callback(false, message, undefined);
              return;
           }
           if( (updated_lesson.nb_places - nb_persons) < 0 ){
              /* Not enough places remaining */
              var message;
              if(updated_lesson.nb_places > 0){
                 message = ["Désolé d'autres réservations ont été effectuées entre temps, il ne reste que "+
                                updated_lesson.nb_places+" place(s)"];
              }else{
                 message = ["Désolé d'autres réservations ont été effectuées entre temps, il n'y a plus de place disponible"];
              }
              callback(false, message, updated_lesson);
              return;
           }

           /* Really create the pendingReservation */
           YogaService.createPendingReservation(lesson, account, nb_persons, function(success, message){
              if(!success){
                 /* Shouldn't occur */
                 var message = ["Une erreur est survenue lors de la réservation, veuillez réessayer plus tard "];
                 callback(false, message, updated_lesson);
                 return;
              }

              YogaService.pendingReservationByAccount[account_id] = {lesson : lesson,
                                                                     account: account,
                                                                     nb_persons : nb_persons,
                                                                     created : new Date()};
              /* Go to reservation page */
              $location.url(YogaService.locations["reservation"]);
           });
        });
    }

    function stagedReservationExit(logged_in, account, clean_pending_reservation){
       if(logged_in){
          var account_id = account.id;
          var reservation_for_account = YogaService.pendingReservationByAccount[account_id];
          if(clean_pending_reservation){
             YogaService.deletePendingReservation(
                 reservation_for_account.lesson,
                 account,
                 reservation_for_account.nb_persons,
                 function(success, message){})
          }
          YogaService.pendingReservationByAccount[account_id] = {};
       }
       $location.url(YogaService.locations["calendar"]);
    }

    /**
    * @name storeReservationInfo
    * @desc
    * @returns {object|undefined} Events
    * @memberOf thinkster.reservations.services.Reservations
    */
    function storeLocalePendingReservationByAccount(lesson, account, nb_persons, created) {
        YogaService.pendingReservationByAccount[account.id] = {lesson : lesson,
                                                               account: account,
                                                               nb_persons : nb_persons,
                                                               created : created};
    }

    /**
    * @name getPendingReservationInfo
    * @desc
    * @returns {object|undefined} Events
    * @memberOf thinkster.reservations.services.Reservations
    */
    function getLocalePendingReservationByAccount(account_id, callback) {
        callback(true, YogaService.pendingReservationByAccount[account_id]);
    }

    function gotoReservationIfAny(account) {
       YogaService.getPendingReservationsByAccount(account, function(success,pendingReservation){
          if(success && (pendingReservation!=undefined) && (pendingReservation.length > 0) ){
             /* Go to reservation page */
             pendingReservation = pendingReservation[0];
             YogaService.storeLocalePendingReservationByAccount(pendingReservation.lesson,
                                                                account,
                                                                pendingReservation.nb_personnes,
                                                                moment(pendingReservation.created).toDate());
             $location.url(YogaService.locations["reservation"]);
          }
       });
    }

  /*  function storeAnonymousPreReservation(lesson){
       YogaService.anonymousPreReservation = lesson;
    }

    function getAnonymousPreReservation(){
       var lesson = YogaService.anonymousPreReservation;
       YogaService.anonymousPreReservation = undefined;
       return lesson;
    }*/

    /*************************************
     *   Confirmed reservations API      *
     *************************************/
    /**
    * @name allReservations
    * @desc Get all Reservations
    * @returns {Promise}
    * @memberOf thinkster.reservations.ReservationService
    */
    function allReservations() {
      return $http.get('api/v1/yoga/reservation/');
    }


    /**
    * @name createReservation
    * @desc Create a new Reservation
    */
    function createReservation(lesson, account, nb_persons, callback) {
      return $http.post('api/v1/yoga/reservation/', {
        lesson: lesson,
        account: account,
        nb_persons: nb_persons,
      }).then(
        function(data, status, headers, config){
          var start = new Date(lesson.date);
          var message = ["Votre réservation a bien été prise en compte pour le cours : ",
                         lesson.type + " " + lesson.intensity,
                         lesson.animator,
                         start.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                          + " " +start.getHours() + ":"+(start.getMinutes() < 10 ? '0' : '')+start.getMinutes(),
                         lesson.duration + " minutes"];
          callback(true, message);
      },function(data, status, headers, config){
          callback(false, ["Une erreur est survenue lors de la réservation"]);
      });
    }

    /**
    * @name createReservation
    * @desc Create a new Reservation
    */
    function createLiveReservation(lesson, account, nb_persons, credit, debit, callback) {
      return $http.post('api/v1/yoga/reservation/', {
        lesson: lesson,
        account: account,
        nb_persons: nb_persons,
        credit : credit,
        debit: debit
      }).then(
        function(data, status, headers, config){
          var start = new Date(lesson.date);
          var message = ["Votre réservation a bien été prise en compte pour le cours : ",
                         lesson.type + " " + lesson.intensity,
                         lesson.animator,
                         start.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                          + " " +start.getHours() + ":"+(start.getMinutes() < 10 ? '0' : '')+start.getMinutes(),
                         lesson.duration + " minutes"];
          callback(true, message, data.data);
      },function(data, status, headers, config){
          callback(false, data.data["message"], undefined);
      });
    }

    /**
    * @name checkAccountPresent
    * @desc Create a new Reservation
    */
    function checkAccountPresent(lesson, account, present, callback) {
      return $http.post('api/v1/yoga/reservation/', {
        lesson: lesson,
        account: account,
        present: present,
      }).then(
        function(data, status, headers, config){
          callback(true, []);
      },function(data, status, headers, config){
          alert("Impossible de cocher : ",account.email);
          callback(false, ["Une erreur est survenue lors de la réservation"]);
      });
    }

    /**
    * @name updateNbPresent
    * @desc Create a new Reservation
    */
    function updateNbPresent(lesson, account, nb_present, callback) {
      return $http.post('api/v1/yoga/reservation/', {
        lesson: lesson,
        account: account,
        nb_present: nb_present,
      }).then(
        function(data, status, headers, config){
          callback(true, []);
      },function(data, status, headers, config){
          callback(false, ["Une erreur est survenue lors de la réservation"]);
      });
    }


    /**
    * @name cancelReservation
    * @desc Cancel a Reservation
    */
    function cancelReservation(lesson, account, callback) {
      return $http.delete('api/v1/yoga/reservation/',{
          params: {account_id: account.id, lesson_id:lesson.id}}
      ).then(
        function(data, status, headers, config){
          var start = new Date(lesson.date);
          var message = ["Votre réservation a bien été annulée: ",
                         lesson.type + " " + lesson.intensity+ " - " + lesson.animator,
                         start.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                          + " " +start.getHours() + ":"+(start.getMinutes() < 10 ? '0' : '')+start.getMinutes(),
                         lesson.duration + " minutes"];
          callback(true,message);
      },function(data, status, headers, config){
          callback(false,["Une erreur est survenue lors de l'annulation"]);
      });
    }

    /**
    * @name getReservation
    * @desc Get a Reservation with account_id and lesson_id
    */
    function getReservation(lesson, account, callback) {
      return $http.get('api/v1/yoga/reservation/',{
          params: {account_id: account.id, lesson_id:lesson.id}}
      ).then(
        function(data, status, headers, config){
          callback(true, data.data);
      },function(data, status, headers, config){
          callback(false, undefined);
      });
    }

    /**
     * @name getReservationsByAccount
     * @desc Get the all the Reservations of a given user
     */
    function getReservationsByAccount(account_id, callback) {
      return $http.get('api/v1/yoga/reservation/',{
         params: {account_id: account_id}
      }).then(
        function(data, status, headers, config){
          var reservations = data.data;
          callback(true, reservations);
      },function(data, status, headers, config){
          callback(false, []);
      });;
    }

    function getReservationsByLesson(lesson, callback) {
      if(lesson == undefined){
         return;
      }
      return $http.get('api/v1/yoga/reservation/',{
         params:{lesson_id: lesson.id}
      }).then(
        function(data, status, headers, config){
          var reservations = data.data;
          callback(true, reservations);
      },function(data, status, headers, config){
          callback(false, []);
      });
    }

    /*************************************
     * Pre-confirmation cancellation API *
     *************************************/
     function stageCancellation(reservation, from){
        var account_id = reservation.account.id;
        YogaService.stagedCancellationByAccount[account_id] = {reservation : reservation, from:from};
        $location.url(YogaService.locations["cancellation"]);
     }

     function stagedCancellationExit(logged_in, account_id){
        var from = "calendar";
        if(logged_in){
            if( account_id in YogaService.stagedCancellationByAccount){
               from = YogaService.stagedCancellationByAccount[account_id].from;
               delete YogaService.stagedCancellationByAccount[account_id];
            }
        }
        $location.url(YogaService.locations[from]);
     }

     function storePendingCancellationByAccount(reservation){
        var account_id = reservation.account.id;
        if( !(account_id in YogaService.stagedCancellationByAccount)){
           YogaService.stagedCancellationByAccount[account_id] = {};
        }
        YogaService.stagedCancellationByAccount[account_id].reservation = reservation;
     }

     function getPendingCancellationByAccount(account_id){
        if( !(account_id in YogaService.stagedCancellationByAccount)){
            return undefined;
        }
        return YogaService.stagedCancellationByAccount[account_id].reservation;
     }

     function gotoCalendar(){
        $location.url(YogaService.locations["calendar"]);
     }

     /**********************
      *   Animator API     *
      **********************/
     function getAllAnimators(callback){
        return $http.get('api/v1/yoga/animators/').then(
          function(data, status, headers, config){
            callback(true, data.data);
        },function(data, status, headers, config){
            callback(false, []);
        });
     }

     /**********************
      * Transactions API   *
      **********************/
     function getAllFormulas(callback){
        return $http.get('api/v1/yoga/formule/').then(
          function(data, status, headers, config){
            callback(true, data.data);
        },function(data, status, headers, config){
            callback(false, []);
        });
     }

     function tryReductionCode(code, callback){
        return $http.post('api/v1/yoga/code-reduction/',{
           code: code
        }).then(
          function(data, status, headers, config){
            callback(true, data.data);
        },function(data, status, headers, config){
            callback(false, data.message);
        });
     }

     function proceedTransaction(account_id, montant, token, callback){
        return $http.post('api/v1/yoga/transaction/', {
            account_id: account_id,
            montant: montant,
            token : token
        }).then(
           function(data, status, headers, config){
              callback(true, []);
           },
           function(data, status, headers, config){
              callback(false, "Une erreur est survenue lors de la transaction. Votre compte n'a pas été débité.");
        });
     }

     function getTransactionsByAccount(account_id, callback){
        return $http.get('api/v1/yoga/transaction/', {
            params:{account_id: account_id}
        }).then(
           function(data, status, headers, config){
              callback(true, data.data);
           },
           function(data, status, headers, config){
              callback(false, ["Une erreur est survenue lors de la transaction"]);
        });
     }
  }
})();

