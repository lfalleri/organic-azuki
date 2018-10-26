/**
* Authentication
* @namespace thinkster.authentication.services
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.utils.services')
    .factory('MessagingService', MessagingService);

  MessagingService.$inject = ['$http','$q'];

  /**
  * @namespace Reservations
  * @returns {Factory}
  */
  function MessagingService($http, $q) {
    /**
    * @name Reservations
    * @desc The Factory to be returned
    */
    var MessagingService = {
       /* Accounts related messages */
       sendAccountCreationEmail:sendAccountCreationEmail,
       sendAccountDeletionToStaffEmail:sendAccountDeletionToStaffEmail,
       sendAccountDeletionToCustomerEmail:sendAccountDeletionToCustomerEmail,
       sendPasswordRecoveryEmail:sendPasswordRecoveryEmail,

       /* Shop related messages */
       sendCommandConfirmationToStaffEmail:sendCommandConfirmationToStaffEmail,
       sendCommandConfirmationToCustomerEmail:sendCommandConfirmationToCustomerEmail,
       sendCommandCancellationToCustomerEmail:sendCommandCancellationToCustomerEmail,
       sendCommandCancellationToStaffEmail:sendCommandCancellationToStaffEmail,

       /* Yoga related messages */
       sendYogaConfirmationToStaffEmail:sendYogaConfirmationToStaffEmail,
       sendYogaConfirmationToCustomerEmail:sendYogaConfirmationToCustomerEmail,
       sendYogaCancellationToCustomerEmail: sendYogaCancellationToCustomerEmail,
       sendYogaCancellationToStaffEmail: sendYogaCancellationToStaffEmail,

       /* Restaurant */
       sendRestaurantReservationToStaffEmail: sendRestaurantReservationToStaffEmail,
       sendRestaurantReservationToCustomerEmail: sendRestaurantReservationToCustomerEmail,
       sendEmailFromContactPage:sendEmailFromContactPage,

    }

    return MessagingService;

    ////////////////////
    function sendAccountCreationEmail(email,  callback) {
       return $http.post('api/v1/messaging/account_creation_email/', {
         email: email,
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }

    function sendAccountDeletionToStaffEmail(first_name, last_name, email, account_id, callback) {
       return $http.post('api/v1/messaging/account_deletion_to_staff_email/', {
         first_name:first_name,
         last_name:last_name,
         email: email,
         account_id:account_id
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }

    function sendAccountDeletionToCustomerEmail(first_name, last_name, email,  callback) {
       return $http.post('api/v1/messaging/account_deletion_to_customer_email/', {
          first_name:first_name,
         last_name:last_name,
         email: email,
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }




    /*-------------------------------------------------*
     *               Commandes messages                *
     *-------------------------------------------------*/
    function sendCommandConfirmationToStaffEmail(account, commande, callback){
        return $http.post('api/v1/messaging/command_confirmation_to_staff_email/', {
             commande: commande,
             account: account,
        }).then(
            function(data, status, headers, config){
               callback(true, "OK");
            },
            function(data, status, headers, config){
              callback(false, ["Une erreur est survenue lors de la réservation"]);
            }
        );
    }

    function sendCommandConfirmationToCustomerEmail(account, commande, callback){
        return $http.post('api/v1/messaging/command_confirmation_to_customer_email/', {
             commande: commande,
             account: account,
        }).then(
            function(data, status, headers, config){
               callback(true, "OK");
            },
            function(data, status, headers, config){
               callback(false, ["Une erreur est survenue lors de la réservation"]);
            }
        );
    }

    function sendCommandCancellationToStaffEmail(account, commande, callback){
        return $http.post('api/v1/messaging/command_cancellation_to_staff_email/', {
             commande: commande,
             account: account,
        }).then(
            function(data, status, headers, config){
               callback(true, "OK");
            },
            function(data, status, headers, config){
              callback(false, ["Une erreur est survenue lors de la réservation"]);
            }
        );
    }

    function sendCommandCancellationToCustomerEmail(account, commande, callback){
        return $http.post('api/v1/messaging/command_cancellation_to_customer_email/', {
             commande: commande,
             account: account,
        }).then(
            function(data, status, headers, config){
               callback(true, "OK");
            },
            function(data, status, headers, config){
               callback(false, ["Une erreur est survenue lors de la réservation"]);
            }
        );
    }





    function sendYogaConfirmationToCustomerEmail(lesson, account, nb_persons, reservation_id, callback) {
       return $http.post('api/v1/messaging/yoga_confirmation_to_customer_email/', {
         lesson: lesson,
         account: account,
         nb_persons:nb_persons,
         reservation_id: reservation_id,
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }

    function sendYogaConfirmationToStaffEmail(lesson, account, nb_persons, reservation_id, callback) {
       return $http.post('api/v1/messaging/yoga_confirmation_to_staff_email/', {
         lesson: lesson,
         account: account,
         nb_persons:nb_persons,
         reservation_id: reservation_id,
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }

    function sendYogaCancellationToCustomerEmail(lesson, account, nb_persons, reservation_id, callback) {
       return $http.post('api/v1/messaging/yoga_cancellation_to_customer_email/', {
         lesson: lesson,
         account: account,
         nb_persons:nb_persons,
         reservation_id: reservation_id,
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }

    function sendYogaCancellationToStaffEmail(lesson, account, nb_persons, reservation_id, callback) {
       return $http.post('api/v1/messaging/yoga_cancellation_to_staff_email/', {
         lesson: lesson,
         account: account,
         nb_persons:nb_persons,
         reservation_id: reservation_id,
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }

    function sendRestaurantReservationToStaffEmail(reservation_information,personal_information, callback) {
       console.log("sendRestaurantReservationToStaffEmail : ",reservation_information);
       return $http.post('api/v1/messaging/restaurant_reservation_to_staff_email/', {
         reservation_information: reservation_information,
         personal_information: personal_information,
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }

    function sendRestaurantReservationToCustomerEmail(reservation_information,personal_information, callback) {
       console.log("sendRestaurantReservationToCustomerEmail : ",reservation_information);
       return $http.post('api/v1/messaging/restaurant_reservation_to_customer_email/', {
         reservation_information: reservation_information,
         personal_information: personal_information,
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }

    function sendEmailFromContactPage(type, prenom, nom, email, tel, sujet, message, callback) {
       return $http.post('api/v1/messaging/contact/', {
         question:type,
         prenom:prenom,
         nom: nom,
         email: email,
         tel: tel,
         sujet:sujet,
         message: message,
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }

    function sendPasswordRecoveryEmail(email, token, callback) {
       return $http.post('api/v1/messaging/recovery/', {
         email: email,
         token: token,
       }).then(
         function(data, status, headers, config){
           callback(true, "OK");
       },function(data, status, headers, config){
           callback(false, ["Une erreur est survenue lors de la réservation"]);
       });
    }

  }
})();

