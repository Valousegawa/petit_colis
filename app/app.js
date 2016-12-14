/* MODULE DECLARATION */
var app = angular.module('petit_colis', ['pascalprecht.translate', 'ngRoute']);

/* CONTROLLER DECLARATION */
app.controller('HomeController', HomeController);
app.controller('mainController', mainController);
app.controller('profileController', function ($scope) {
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
app.factory("ressources", ['$http', function($http, $rootScope){
    var ressourceBase = "ressources/"
    var obj = {};
    obj.getUser = function(user){
        return $http.post(ressourceBase + "login", user).then(function(results){
            return results;
        });
    };
    obj.inscription = function(users){
        return $http.post(ressourceBase + "inscription", users).then(function(results){
            return results;
        });
    };
    obj.showComment = function(){
        return $http.get(ressourceBase + "showLastComment");
    }
    return obj;
}]);

/* FUNCTION DECLARATION */
function HomeController($window, $translate, $scope, $rootScope, ressources) {
    $rootScope.isConnected = false;

    $scope.language = 'fr_FR';
    $scope.languages = ['en_US', 'fr_FR', 'es_ES'];
    $scope.updateLanguage = function () {
        $translate.use($scope.language);
    };
    $scope.connect = function(){
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
        ressources.inscription(data);
    };
    $scope.submit = function(){
        var donnees = [
            $scope.email,
            $scope.passwd,
        ];
        ressources.getUser(donnees);
    };
}

function mainController($scope, ressources){
    ressources.showComment().then(function(data){
        console.log(data.data);
        $scope.temoignages = data.data;
    });
}
