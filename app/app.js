/* MODULE DECLARATION */
var app = angular.module('petit_colis', ['pascalprecht.translate', 'ngRoute']);

/* CONTROLLER DECLARATION */
app.controller('HomeController', HomeController);
app.controller('mainController', function ($scope) {
    $scope.temoignages = [
        {nom : "RAMIREZ", prenom : "Sanchez", note : "5", message : "Super service ! Je recommande à tout ceux qui venlent envoyer pour pas cher et rapidement."},
        {nom : "ANDREAS", prenom : "Louuis", note : "4", message : "Excellent rapport qualité prix !"},
        {nom : "DURIFF", prenom : "Sylvain", note : "5", message : "Pour envoyer des vaisseaux de la Vierge Marie, y'a pas mieux !"},
        {nom : "PACIFIC", prenom : "Sound3003", note : "5", message : "Han C'est de la bombe cet outil, je recommande au nom du silence de la MAsterCard."},
    ]
});
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


/* FUNCTION DECLARATION */
function HomeController($window, $translate, $scope) {
    $scope.language = 'fr_FR';
    $scope.languages = ['en_US', 'fr_FR', 'es_ES'];

    $scope.updateLanguage = function () {
        $translate.use($scope.language);
    };
}
