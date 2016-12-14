/* MODULE DECLARATION */
var app = angular.module('petit_colis', ['pascalprecht.translate', 'ngRoute', 'ngCookies']);

/* CONTROLLER DECLARATION */
app.controller('HomeController', HomeController);
app.controller('mainController', mainController);
app.controller('profileController', function ($scope, $rootScope) {
    if ($rootScope.connectedUser != null) {
        $scope.user = $rootScope.connectedUser;
    }
});
app.controller('addColisController', function ($scope) {
});

/* CONFIG DECLARATION */
app.config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'trad/locale-',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('fr_FR');
});
app.config(function ($routeProvider, $locationProvider) {
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
            return results;
        });
    };
    obj.showComment = function () {
        return $http.get(ressourceBase + "showLastComment");
    }
    obj.addComment = function (commentaire) {
        return $http.post(ressourceBase + "addComment", commentaire).then(function (results) {
            return results;
        });
    };
    return obj;
}]);

/* FUNCTION DECLARATION */
function HomeController($window, $translate, $scope, $rootScope, ressources, $location, $cookies) {
    $rootScope.isConnected = false;
    $rootScope.connectedUser = {};
    $scope.connected = false;

    if($cookies.getObject('petit_colis.credentials')){
        var donnees = $cookies.getObject('petit_colis.credentials');
        ressources.getUser(donnees).then(function (data) {
            $rootScope.isConnected = true;
            $rootScope.$broadcast("loginState");
            $rootScope.connectedUser = data.data;
        });
    }

    $scope.$on("loginState", function () {
        if ($rootScope.isConnected) {
            $scope.connected = true;
        } else {
            $scope.connected = false;
        }
    });

    $scope.go = function (path) {
        $location.path(path);
    };
    $scope.disconnect = function () {
        $rootScope.isConnected = false;
        $rootScope.$broadcast("loginState");
        $cookies.remove('petit_colis.credentials');
        $location.path("/");
    };


    $scope.language = 'fr_FR';
    $scope.languages = ['en_US', 'fr_FR', 'es_ES'];
    $scope.updateLanguage = function () {
        $translate.use($scope.language);
    };
    $scope.connect = function () {
        var data = [
            $scope.genre,
            $scope.user_prenom,
            $scope.user_nom,
            $scope.mail,
            $scope.mdp,
            $scope.naissance,
            $scope.newsletter,
            $scope.rang
        ];
        ressources.inscription(data).then(function () {
            $(function () {
                $("#myInscription").modal('toggle');
                $("#alert_sub_success").show();
            });
        });
    };
    $scope.submit = function () {
        var donnees = [
            $scope.email,
            $scope.passwd,
        ];
        ressources.getUser(donnees).then(function (data) {
            $rootScope.isConnected = true;
            $rootScope.$broadcast("loginState");
            $(function () {
                $("#myConnexion").modal('toggle');
            });
            $rootScope.connectedUser = data.data;

            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 1);
            $cookies.putObject('petit_colis.credentials', donnees, {'expires': expireDate});
        });
    };
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
}

function mainController($scope, ressources) {
    ressources.showComment().then(function (data) {
        $scope.temoignages = data.data;
    });
}
