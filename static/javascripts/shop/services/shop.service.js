/**
* Layout
* @namespace thinkster.authentication.services
*/
(function () {
  'use strict';

  angular
    .module('organic_azuki.shop.services')
    .factory('Shop', Shop);

  Shop.$inject = ['$http', '$cookies', 'Authentication'];

  /**
  * @namespace Authentication
  * @returns {Factory}
  */
  function Shop($http, $cookies, Authentication) {

    var Shop = {
       getCollection: getCollection,
       getAllReferences: getAllReferences,
       getReference: getReference,

       getPanierFromDB: getPanierFromDB,
       createOrGetPanier: createOrGetPanier,
       deletePanier:deletePanier,
       associatePanierAndAccount: associatePanierAndAccount,
       addArticleToPanier: addArticleToPanier,
       removeArticleFromPanier: removeArticleFromPanier,
       getArticlesCountInPanier: getArticlesCountInPanier,
       getArticlesInPanier: getArticlesInPanier,

       /* High Level API */
       getArticlesInPanierFromController: getArticlesInPanierFromController,
       getArticlesCountInPanierFromController: getArticlesCountInPanierFromController,
       addArticleToPanierFromController: addArticleToPanierFromController,
       removeArticleFromPanierFromController: removeArticleFromPanierFromController,

    };

    return Shop;

    function getCollection(callback){
       return $http.get('api/v1/shop/collection/')
           .then(
               function(data, status, headers, config){
                   console.log("OK : ",data.data);
                   callback(true, data.data);
               },
               function(data, status, headers, config){
                   console.log("KO :", data.data);
                  callback(false, undefined);
               }
           );
    }

    function getAllReferences(callback) {
        return $http.get('api/v1/shop/allReferences/')
           .then(
               function(data, status, headers, config){
                   console.log("OK : ",data.data);
                   callback(true, data.data);
               },
               function(data, status, headers, config){
                   console.log("KO :", data.data);
                  callback(false, undefined);
               }
           );
    }

    function getReference(reference, callback){
        return $http.get('api/v1/shop/reference/',{
          params: {id:reference.id}})
           .then(
               function(data, status, headers, config){
                   callback(true, data.data);
               },
               function(data, status, headers, config){
                  callback(false, undefined);
               }
           );
    }

    function  getPanierFromDB(uuid, callback){
        return $http.get('api/v1/shop/panier/',{
          params: {command:"panier", uuid:uuid}})
           .then(
               function(data, status, headers, config){
                   //Shop.panier = data.data;
                   callback(true, data.data);
               },
               function(data, status, headers, config){
                  callback(false, undefined);
               }
           );
    }

    function createOrGetPanier(account, callback){
       var storageUuid = window.localStorage.getItem('panier');
       if (!storageUuid) {
          var account_id = -1;
          if(!angular.equals(account,{})){
              account_id = account.id;
          }

          console.log("createOrGetPanier ==> account_id : ", account_id);

          // Create Panier
          return $http.post('/api/v1/shop/panier/', {
              command:'create',
              account_id: account_id,
          })
          .then(
              function(data, status, headers, config){
                  var panier = data.data;
                  // Create cookie
                  $cookies.panier = JSON.stringify(panier.uuid);
                  window.localStorage.setItem('panier', JSON.stringify(panier.uuid));
                  callback(true,data.data);
              },
              function(data, status, headers, config){
                 callback(false, "Une erreur est survenue");
              }
          );
       }else{
          // Get from DB
          var uuid = JSON.parse(storageUuid);
          console.log("createOrGetPanier ==> Panier exists : ", uuid);
          Shop.getPanierFromDB(uuid, callback);
       }
    }

    function deletePanier(uuid, callback){
        return $http.delete('api/v1/yoga/pendingreservation/',{
            params: {uuid:uuid}
        })
        .then(
           function(data, status, headers, config){
              delete $cookies.panier;
              callback(true,"OK");
           },
           function(data, status, headers, config){
              callback(false,"Une erreur est survenue lors de l'annulation");
           }
        );
    }

    function associatePanierAndAccount(uuid, account, callback){
          return $http.post('/api/v1/shop/panier/', {
              command:'associate',
              uuid:uuid,
              account_id: account.id,
          })
          .then(
              function(data, status, headers, config){
                  callback(true,data.data);
              },
              function(data, status, headers, config){
                 callback(false, "Une erreur est survenue");
              }
          );
    }

    function addArticleToPanier(uuid, reference, quantite, taille, callback){
        return $http.post('/api/v1/shop/panier/', {
            command:'add',
            uuid:uuid,
            reference: reference,
            quantite: quantite,
            taille: taille
        })
        .then(
            function(data, status, headers, config){
               callback(true,data.data);
            },
            function(data, status, headers, config){
               callback(false, "Une erreur est survenue");
            }
        );
    }

    function removeArticleFromPanier(uuid, article, callback){
        return $http.post('/api/v1/shop/panier/', {
            command:'remove',
            uuid:uuid,
            article: article,
        })
        .then(
            function(data, status, headers, config){
               callback(true,data.data);
            },
            function(data, status, headers, config){
               callback(false, "Une erreur est survenue");
            }
        );
    }

    function getArticlesCountInPanier(uuid, callback){
        return $http.get('api/v1/shop/panier/',{
          params: {command:"articles_count", uuid:uuid}
          })
           .then(
               function(data, status, headers, config){
                   callback(true, data.data);
               },
               function(data, status, headers, config){
                  callback(false, undefined);
               }
           );
    }

    function getArticlesInPanier(uuid, callback){
        return $http.get('api/v1/shop/panier/',{
          params: {command:"articles", uuid:uuid}
          })
           .then(
               function(data, status, headers, config){
                   callback(true, data.data);
               },
               function(data, status, headers, config){
                  callback(false, undefined);
               }
           );
    }

    function getArticlesCountInPanierFromController(callback){
        var account;
        Authentication.getFullAccount(function(value){
           account = value;
           Shop.createOrGetPanier(account, function(success, panier){
               if(success){
                   Shop.getArticlesCountInPanier(panier.uuid, function(success, count){
                       callback(success, count);
                   });
               }else{
                   callback(success, 0);
               }
           });
        });
    }

    function getArticlesInPanierFromController(callback){
        var account;
        Authentication.getFullAccount(function(value){
           account = value;
           Shop.createOrGetPanier(account, function(success, panier){
               if(success){
                   Shop.getArticlesInPanier(panier.uuid, function(success, articles){
                       callback(success, articles);
                   });
               }else{
                   callback(success, 0);
               }
           });
        });
    }

    function addArticleToPanierFromController(reference, quantite, taille, callback){
        console.log("addArticleToPanierFromController ==> reference=",reference,
                                                          "quantite=",quantite,
                                                          "taille=", taille);
        var account;
        Authentication.getFullAccount(function(value){
           account = value;
           Shop.createOrGetPanier(account, function(success, panier){
              if(!success){
                  callback(success, "Impossible d'ajouter cet article dans le panier");
                  return;
              }else{
                  Shop.addArticleToPanier(
                      panier.uuid,
                      reference,
                      quantite,
                      taille,
                      function(success, data){
                          if(!success){
                              callback(success, "Impossible d'ajouter cet article dans le panier");
                              return;
                          }
                          callback(success, data);
                  });
              }
           });
        });
    }

    function removeArticleFromPanierFromController(article, callback){
        console.log("removeArticleToPanierFromController ==> article=",article);
        var account;
        Authentication.getFullAccount(function(value){
           account = value;
           Shop.createOrGetPanier(account, function(success, panier){
              if(!success){
                  callback(success, "Impossible d'ajouter cet article dans le panier");
                  return;
              }else{
                  Shop.removeArticleFromPanier(
                      panier.uuid,
                      article,
                      function(success, data){
                          if(!success){
                              callback(success, "Impossible de supprimer cet article du panier");
                              return;
                          }
                          callback(success, data);
                  });
              }
           });
        });
    }

  }
})();