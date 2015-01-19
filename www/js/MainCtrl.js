easyNutri.controller('MainCtrl', function ($scope, $ionicSideMenuDelegate, WebServiceFactory, $interval,
                                           $rootScope, $ionicPopup, $window, $location, $ionicModal, $state, $filter) {

    if($rootScope.loggedIn != true){
        $state.go('login', {reload: true, inherit: false});
    }

    $scope.toggleLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }

    $ionicModal.fromTemplateUrl('templates/login.html', function ($ionicModal) {
        },
        {
            scope: $scope,
            animation: 'slide-in-up',
            focusFirstInput: true

        }).then(function ($ionicModal) {
            $scope.loginModal = $ionicModal;
        });

    $scope.openLoginModal = function () {
        $scope.loginModal.show();
    }

    $scope.numeroNot = 0;
    console.log('inicializou a 0');
    var getNotificacoes = function () {
        if($rootScope.loggedIn != false){
            if($rootScope.offline == false){
                WebServiceFactory.getNotificacoes().
                    success(function (lista) {
                        $rootScope.listaNotificacoes = lista;
                        var contNaoLidas = 0;
                        for ($i = 0; $i < $rootScope.listaNotificacoes.length; $i++) {
                            if ($rootScope.listaNotificacoes[$i].Lido == 0) {
                                contNaoLidas++;
                            }
                        }

                        if (contNaoLidas == 0) {
                            document.getElementById("badgeNot").style.display = 'none';
                        } else {
                            document.getElementById("badgeNot").style.display = 'inline';
                            $scope.numeroNot = contNaoLidas;
                        }

                    }).error(function (data, status, headers) {
                        console.log(data + status + headers);
                        $ionicPopup.alert({
                            title: 'Erro',
                            template: 'Erro a processar pedido de notificações!'
                        });
                    });
            }else{
                if(JSON.parse($window.localStorage.getItem('listaNotificacoes')) != null){
                    $rootScope.listaNotificacoes = JSON.parse($window.localStorage.getItem('listaNotificacoes'));
                    var contNaoLidas = 0;
                    for ($i = 0; $i < $rootScope.listaNotificacoes.length; $i++) {
                        if ($rootScope.listaNotificacoes[$i].Lido === 0) {
                            contNaoLidas++;
                        }
                    }

                    if (contNaoLidas === 0) {
                        document.getElementById("badgeNot").style.display = 'none';
                    } else {
                        document.getElementById("badgeNot").style.display = 'inline';
                        $scope.numeroNot = contNaoLidas;
                    }
                }else{
                    $ionicPopup.alert({
                        title: 'Aviso',
                        template: 'Não existem notificações!'
                    });
                }
            }
        }
    };

    var checkConnection = function(){
        if(!$rootScope.offline){
            if (window.Connection) {
                if (navigator.connection.type == Connection.NONE && $window.localStorage.getItem('credencial') == null) {
                    alert("Não está ligado à rede");
                    ionic.Platform.exitApp();
                } else if (navigator.connection.type == Connection.NONE && $window.localStorage.getItem('credencial') != null) {
                    $ionicPopup.confirm({
                        title: "Modo Offline",
                        content: "Não está ligado à rede, deseja continuar em modo offline?"
                    })
                        .then(function (result) {
                            if (!result) {
                                ionic.Platform.exitApp();
                            } else {
                                $rootScope.offline = true;
                            }
                        });
                } else {
                    $rootScope.offline = false;
                }
            }else{
                $rootScope.offline = false;
            }
        }
    };

    if(!$rootScope.offline){
        if($rootScope.loggedIn){

            WebServiceFactory.sincronizarDados();
            getNotificacoes();

            var data = new Date();
            data = $filter('date')(data, 'yyyy-MM-dd');
            WebServiceFactory.getNotificacoes().success(function(notificacoes){
                $window.localStorage.setItem('listaNotificacoes', JSON.stringify(eval(notificacoes)));
            });

            WebServiceFactory.getPlanoAlimentar().success(function(planoAlimentar){
                $window.localStorage.setItem('planoAlimentar', JSON.stringify(eval(planoAlimentar)));
            });

            WebServiceFactory.getDiarioAlimentar(data).success(function(diarioAlimentar){
                $window.localStorage.setItem('diarioAlimentar', JSON.stringify(eval(diarioAlimentar)));
            });

            WebServiceFactory.getAlimentos().success(function (alimentos) {
                $window.localStorage.setItem('listaAlimentos', JSON.stringify(eval(alimentos)));
            });

            WebServiceFactory.getRegistosPeso().success(function(pesos){
                $window.localStorage.setItem('listaPesos', JSON.stringify(eval(pesos)));
            });

            $interval(function () {
                getNotificacoes();
                checkConnection();
            }, 10000);
        }
    }

    var checkConnection = function(){
        if(!$rootScope.offline){
            if (window.Connection) {
                if (navigator.connection.type == Connection.NONE && $window.localStorage.getItem('credencial') == null) {
                    alert("Não está ligado à rede");
                    ionic.Platform.exitApp();
                } else if (navigator.connection.type == Connection.NONE && $window.localStorage.getItem('credencial') != null) {
                    $ionicPopup.confirm({
                        title: "Modo Offline",
                        content: "Não está ligado à rede, deseja continuar em modo offline?"
                    })
                        .then(function (result) {
                            if (!result) {
                                ionic.Platform.exitApp();
                            } else {
                                $rootScope.offline = true;
                            }
                        });
                } else if($rootScope.offline == true && navigator.connection.type === Connection.NONE){
                    $rootScope.offline = false;
                    WebServiceFactory.sincronizarDados();
                }
            }else{
                $rootScope.offline = false;
            }
        }
    };
    var logout = function () {
        if ($rootScope.guardarCredenciais) {
            $window.localStorage.removeItem('credencial');
        } else {
            $rootScope.credencial = "";
        }

        $window.localStorage.removeItem('pagina');
        $window.localStorage.removeItem('numeroPesquisa');
        $window.localStorage.removeItem('listaNotificacoes');
        $window.localStorage.removeItem('diarioAlimentar');
        $window.localStorage.removeItem('listaRefeicoesNovas');
        $window.localStorage.removeItem('listaRefeicoesEditadas');
        $window.localStorage.removeItem('listaRefeicoesRemovidas');
        $window.localStorage.removeItem('listaPesos');
        $window.localStorage.removeItem('listaAlimentos');
        $window.localStorage.removeItem('planoAlimentar');
        $window.localStorage.removeItem('listaNotificacoesLidas');
        $rootScope.guardarCredenciais = false;
        $rootScope.loggedIn = false;
        $rootScope.offline = false;
        $state.go('login', {}, {reload: true, inherit: false});
    };

    $scope.mostrarConfirmacao = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Logout',
            template: 'Tem a certeza que pretende sair?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                logout();
            }
        });
    };
});

