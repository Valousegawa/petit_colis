var app = angular.module('petit_colis', ['pascalprecht.translate']);
app.controller('HomeController', HomeController);
app.factory("ressources", ['$http', function($http){
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
    return obj;
}]);


app.config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'trad/locale-',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en_US');
});

function HomeController($translate, $scope, ressources){
    $scope.language = 'en_US';
    $scope.languages = ['en_US', 'fr_FR'];

    $scope.updateLanguage = function() {
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
