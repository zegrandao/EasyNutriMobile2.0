// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
//var route = angular.module('easyNutri', ['ngRoute']);
var easyNutri = angular.module('easyNutri', ['ionic', 'pickadate']);

easyNutri.run(function ($ionicPlatform, $window, $ionicPopup, $rootScope, WebServiceFactory) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            document.addEventListener("online", function () {
                WebServiceFactory.sincronizarDados();
            }, false);

            var credencial = WebServiceFactory.checkCredencial();

            if (window.Connection) {
                if (navigator.connection.type == Connection.NONE && credencial == null) {
                    $ionicPopup.alert({
                        title: "Modo Offline",
                        content: "Não está ligado à rede!"
                    });
                    ionic.Platform.exitApp();
                } else if (navigator.connection.type == Connection.NONE && credencial != null) {
                    $ionicPopup.confirm({
                        title: "Modo Offline",
                        content: "Não está ligado à rede, deseja continuar em modo offline?"
                    })
                        .then(function (result) {
                            if (!result) {
                                ionic.Platform.exitApp();
                            } else {
                                $ionicPopup.alert({
                                    title: 'Aviso',
                                    content: 'Todos os dados que insira na aplicação só serão sincronizados quando tiver uma ' +
                                    'ligação à internet com a aplicação a correr'
                                });
                            }
                        });
                }
            }
        });
    })

   easyNutri.config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            // setup an abstract state for the tabs directive
            .state('login', {
                url: '/login',
                templateUrl: 'templates/startScreen.html'
            })
            .state('easyNutri', {
                url: "/easyNutri",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })
            .state('easyNutri.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/home.html',
                        controller: 'MainCtrl'
                    }
                }
            })
            // Each tab has its own nav history stack:
            .state('easyNutri.consultaDiario', {
                url: '/consultaDiario',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/consultaDiario.html',
                        controller: 'diarioCtrl'
                    }
                }
            })

            .state('easyNutri.novaRefeicao', {
                url: '/novaRefeicao',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/novaRefeicao.html',
                        controller: 'refeicaoCtrl'
                    }
                }

            }).state('easyNutri.editarRefeicao', {
                url: '/editarRefeicao',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/novaRefeicao.html',
                        controller: 'refeicaoCtrl'
                    }
                }

            }).state('easyNutri.notificacoes', {
                url: '/notificacoes',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/notificacoes.html',
                        controller: 'notificacoesCtrl'
                    }
                }
            }).state('easyNutri.planoAlimentar', {
                url: '/planoAlimentar',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/planoAlimentar.html',
                        controller: 'planoAlimentarCtrl'
                    }
                }
            }).state('easyNutri.tabelaEquivalencias', {
                url: '/tabelaEquivalencias',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tabelaEquivalencias.html'
                    }
                }
            }).state('easyNutri.definicoes', {
                url: '/definicoes',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/definicoes.html',
                        controller: 'definicoesCtrl'
                    }
                }
            }).state('easyNutri.peso', {
                url: '/peso',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/peso.html',
                        controller: 'pesoCtrl'
                    }
                }
            }).state('easyNutri.dadosNaoSincronizados', {
                url: '/dadosNaoSincronizados',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dadosNaoSincronizados.html',
                        controller: 'dadosNaoSincCtrl'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        //$urlRouterProvider.when('/login');
        $urlRouterProvider.otherwise('/login');

    });