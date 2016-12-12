var app = angular.module('petit_colis', ['pascalprecht.translate']);
app.controller('HomeController', HomeController);

app.config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'trad/locale-',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en_US');
});

function HomeController($translate, $scope){
    $scope.language = 'en_US';
    $scope.languages = ['en_US', 'fr_FR'];

    $scope.updateLanguage = function() {
        $translate.use($scope.language);
    };
}
