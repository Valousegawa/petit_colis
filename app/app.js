/* MODULE DECLARATION */
var app = angular.module('petit_colis', ['pascalprecht.translate', 'ngRoute', 'ngCookies', 'flow', 'angular-md5', 'ngAnimate']);

/* CONTROLLER DECLARATION */
app.controller('HomeController', HomeController);
app.controller('mainController', mainController);
app.controller('profileController', function ($scope, $rootScope) {
    if ($rootScope.connectedUser != null) {
        $scope.user = $rootScope.connectedUser;
    }
});
app.controller('annonceController', annonceController);
app.controller('detailAnnonceController', detailAnnonceController);
app.controller('chatController', chatController);

/* CONFIG DECLARATION */
app.config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'trad/locale-',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('fr_FR');
});
app.config(function ($routeProvider, $locationProvider) {
    //Initialisation des routes
    $routeProvider
        .when('/', {
            templateUrl: 'pages/home.html',
            controller: 'mainController'
        })
        .when('/profile', {
            templateUrl: 'pages/profile.html',
            controller: 'profileController'
        })
        .when('/ajouter_colis', {
            templateUrl: 'pages/add_colis.html',
            controller: 'addColisController'
        })
        .when('/annonce', {
            templateUrl: 'pages/annonce.html',
            controller: 'annonceController'
        })
        .when('/detail_annonce/:id', {
            templateUrl: 'pages/detail_annonce.html',
            controller: 'detailAnnonceController'
        })
        .when('/search_result', {
            templateUrl: 'pages/search_result.html',
            controller: 'HomeController'
        })
        .when('/message/:id_annonce/:id_user/:id_voyageur', {
            templateUrl: 'pages/chat.html',
            controller: 'chatController'
        });
    $locationProvider.html5Mode(true);
});

/* FACTORY DECLARATION */
app.factory("ressources", ['$http', function ($http, $rootScope) {
    var ressourceBase = "ressources/"
    var obj = {};

    obj.getUser = function (user, $rootScope) {
        return $http.post(ressourceBase + "login", user).then(function (results) {
            return results;
        });
    };
    obj.inscription = function (users) {
        return $http.post(ressourceBase + "inscription", users).then(function (results) {
            return results.data;
        });
    };
    obj.showComment = function () {
        return $http.get(ressourceBase + "showLastComment");
    };
    obj.addComment = function (commentaire) {
        return $http.post(ressourceBase + "addComment", commentaire).then(function (results) {
            return results;
        });
    };
    obj.showAdvert = function () {
        return $http.get(ressourceBase + "showLastAdvert");
    };
    obj.upload_avatar = function (pic_info) {
        return $http.post(ressourceBase + "upload_avatar", pic_info);
    };
    obj.toggle_newsletter = function (state) {
        return $http.post(ressourceBase + "toggle_newsletter", state);
    };
    obj.getDelai = function () {
        return $http.post(ressourceBase + "getDelai").then(function (results) {
            return results;
        });
    };
    obj.getTransport = function () {
        return $http.post(ressourceBase + "getTransport").then(function (results) {
            return results;
        });
    };
    obj.getType = function () {
        return $http.post(ressourceBase + "getType").then(function (results) {
            return results;
        });
    };
    obj.addAdvert = function (advert) {
        return $http.post(ressourceBase + "addAdvert", advert).then(function (results) {
            return results;
        });
    };
    obj.showAdverts = function(adverts) {
        return $http.post(ressourceBase+ "showAdverts", adverts).then(function(results){
            return results;
        });
    };
    obj.showDetail = function(id) {
        return $http.post(ressourceBase+ "showDetail", id).then(function(results){
            return results;
        });
    };
    obj.showMessages = function(infos) {
        return $http.post(ressourceBase+ "getMessages", infos).then(function(results){
            return results;
        });
    };
    obj.addMessage = function (infos) {
        return $http.post(ressourceBase + "addMessage", infos);
    };
    obj.getVoyageurClients = function(infos) {
        return $http.post(ressourceBase+ "getVoyageurClients", infos).then(function(results){
            return results;
        });
    };
    obj.getVoyageurs = function(infos) {
        return $http.post(ressourceBase+ "getVoyageurs", infos).then(function(results){
            return results;
        });
    };
    obj.getAnnonceAnswers = function(infos) {
        return $http.post(ressourceBase+ "getAnnonceAnswers", infos).then(function(results){
            return results;
        });
    };
    return obj;
}]);

/* FUNCTION DECLARATION */
function HomeController($window, $translate, $scope, $rootScope, ressources, $location, $cookies, md5) {
    $rootScope.isConnected = false;
    $rootScope.connectedUser = {};
    $scope.connected = false;

    $(function () {
        $("#alert_sub_success").hide();
    });

    //Vérification des cookies
    if ($cookies.getObject('petit_colis.credentials')) {
        var donnees = $cookies.getObject('petit_colis.credentials');
        ressources.getUser(donnees).then(function (data) {
            $rootScope.isConnected = true;
            $rootScope.$broadcast("loginState");
            $rootScope.connectedUser = data.data;
        });
    }

    //Evènement de connexion
    $scope.$on("loginState", function () {
        if ($rootScope.isConnected) {
            $scope.connected = true;
        } else {
            $scope.connected = false;
        }
    });

    //Méthode simulant un changement de route
    $scope.go = function (path) {
        $location.path(path);
    };

    //Traitement de la déconnexion : changement d'état général, redirection vers l'accueil et suppression du cookie
    $scope.disconnect = function () {
        $rootScope.isConnected = false;
        $rootScope.$broadcast("loginState");
        $cookies.remove('petit_colis.credentials');
        $location.path("/");
    };

    //Système de gestion d'internalisation
    $scope.language = 'fr_FR';
    $scope.languages = ['en_US', 'fr_FR', 'es_ES', 'de_DE', 'ch_CH'];
    $scope.updateLanguage = function () {
        $translate.use($scope.language);
    };

    //Gère l'inscription 
    $scope.connect = function () {
        var data = [
            $scope.genre,
            $scope.user_prenom,
            $scope.user_nom,
            $scope.mail,
            md5.createHash($scope.mdp || ''),
            $scope.naissance,
            $scope.newsletter,
            $scope.rang
        ];
        ressources.inscription(data).then(function (state) {
            if (state == 1) {
                $(function () {
                    $("#myInscription").modal('toggle');
                    $("#alert_sub_success").show();
                    $("#alert_sub_error").addClass("hide");
                });
            } else {
                $(function () {
                    $("#alert_sub_error").removeClass("hide");
                });
            }

        });
    };

    //Gère la connexion
    $scope.submit = function () {
        var donnees = [
            $scope.email,
            md5.createHash($scope.passwd || ''),
        ];
        ressources.getUser(donnees).then(function (data) {
            if (data.data == 0) {
                $("#alert_conn_error").removeClass("hide");
            } else {
                $rootScope.isConnected = true;
                $rootScope.$broadcast("loginState");
                $(function () {
                    $("#myConnexion").modal('toggle');
                });
                $rootScope.connectedUser = data.data;
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + 1);
                $cookies.putObject('petit_colis.credentials', donnees, {'expires': expireDate});
            }
        });
    };

    //Gère l'ajout de commentaire
    $scope.comment = function () {
        var com = [
            $scope.id_user = $rootScope.connectedUser.idUsers,
            $scope.note,
            $scope.textarea
        ];
        ressources.addComment(com).then(function () {
            ressources.showComment().then(function (data) {
                $scope.temoignages = data.data;
                $("#addComment").modal('toggle');
            });
        });
    }

    //Gère l'upload d'image
    $scope.processFiles = function (files) {
        angular.forEach(files, function (flowFile, i) {
            var fileReader = new FileReader();
            fileReader.onload = function (event) {
                var uri = event.target.result;
                $rootScope.connectedUser.pic = uri;
                var pic_info = [
                    $rootScope.connectedUser.idUsers,
                    uri
                ];
                ressources.upload_avatar(pic_info)
            };
            fileReader.readAsDataURL(flowFile.file);
        });

    };

    //Gère le changement d'inscription à la newsletter
    $scope.toggle_newsletter = function (state_n) {
        if (state_n == 1) {
            state_n = 0;
        } else if (state_n == 0) {
            state_n = 1;
        }
        var state = [
            $rootScope.connectedUser.idUsers,
            state_n
        ];
        ressources.toggle_newsletter(state);
        $rootScope.connectedUser.newsletter = state_n;
    }

    //Affiche les résultats de la recherche
    $scope.showAdverts = function(){
        var ad = [
            $scope.ville_d,
            $scope.ville_a,
            $scope.date_d
        ];
        ressources.showAdverts(ad).then(function(data){
            console.log(data);
            $scope.advertsall = data.data;
        });
    };
}

function mainController($scope, ressources) {
    ressources.showComment().then(function (data) {
        $scope.temoignages = data.data;
    });
    ressources.showAdvert().then(function (data) {
        $scope.annonces = data.data;
    });
}

function annonceController($scope, ressources, $rootScope, $location) {
    ressources.getType().then(function (data) {
        $scope.types = data.data;
    });
    ressources.getTransport().then(function (data) {
        $scope.transports = data.data;
    });
    ressources.getDelai().then(function (data) {
        $scope.delais = data.data;
    });
    var annonce = {};
    $scope.advert_one = function () {
        annonce['ville_dep'] = $scope.ville_dep;
        annonce['ville_arr'] = $scope.ville_arr;
        annonce['a_r'] = $scope.ar;
        annonce['date_debut'] = $scope.date_dep;
        annonce['date_fin'] = $scope.date_arr;
        console.log(annonce);
    }
    $scope.advert_two = function () {
        annonce['id_voyageur'] = $rootScope.connectedUser.idUsers;
        annonce['prix'] = $scope.prix;
        annonce['nbr_kilos'] = $scope.kilos;
        annonce['commentaire'] = $scope.commentary;
        annonce['id_type_colis'] = $scope.colis;
        annonce['id_moyen_transport'] = $scope.transport;
        annonce['id_delai'] = $scope.delai;
        console.log(annonce);

        ressources.addAdvert(annonce);
        $location.path("/");
    }

}

function detailAnnonceController($scope, ressources, $routeParams, $rootScope){
    ressources.showDetail($routeParams.id).then(function(data){
        $scope.advertsdetail = data.data;
        if(data.data[0].id_voyageur == $rootScope.connectedUser.idUsers){
            ressources.getAnnonceAnswers($routeParams.id).then(function(data){
                if(data.data.cpt == 0){
                    $scope.nope = true;
                } else {
                    $scope.nope = false;
                }
            });
        } else {
            $scope.nope = false;
        }
    });

}

function chatController($scope, ressources, $routeParams, $rootScope){
    var id_user = $routeParams.id_user;
    var id_voyageur = $routeParams.id_voyageur;
    var id_annonce = $routeParams.id_annonce;
    
    $scope.user = id_user;

    if(id_voyageur == $rootScope.connectedUser.idUsers){
        var infos = [
            id_annonce,
            id_user,
        ];

        ressources.getVoyageurClients(infos).then(function(data){
            $scope.recipients = data.data;
        });

    } else {
        ressources.getVoyageurs(id_user).then(function(data){
            $scope.recipients = data.data;
        });
    }

    var show = [];
    $scope.showMessage = function(id_dest){
        show = [
            id_annonce,
            id_user,
            id_dest
        ];
        ressources.showMessages(show).then(function(data){
            $scope.chat_activated = true;
            $scope.dest_id = id_dest;
            $scope.messages = data.data;
        });
    }

    $scope.newMessage = function(){
        var infos_message = [
            id_annonce,
            id_user,
            $scope.dest_id,
            $scope.to_send
        ];
        ressources.addMessage(infos_message);
        ressources.showMessages(show).then(function(data){
            $scope.messages = data.data;
        });
        $scope.to_send = "";
    }
}
