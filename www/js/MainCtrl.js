easyNutri.controller('MainCtrl', function ($scope, $ionicSideMenuDelegate, WebServiceFactory, $interval, $rootScope, $ionicPopup, $window, $location, $ionicModal, $state, $filter, signalFactory) {

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
    };


    if ($window.localStorage.getItem('credencial') != null) {
        console.log(JSON.stringify($window.localStorage.getItem('credencial')));
        $rootScope.loggedIn = true;
        $rootScope.guardarCredenciais = true;

    } else if ($rootScope.loggedIn != true) {
        if ($scope.loginModal != undefined) {
            $scope.openLoginModal();
        }
    }


    var toast = function (texto, caso) {
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-bottom-center",
            "preventDuplicates": true,
            "onclick": function () {
                $state.go('easyNutri.notificacoes');
            },
            "showDuration": "300",
            "hideDuration": "300",
            "timeOut": "5000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };
        switch (caso) {
            case 1:
                toastr.success(texto);
                break;
            case 2:
                toastr.error(texto);
                break;
            case 3:
                toastr.info(texto);
                break;
        }

    };


    var emitSignal = function ($scope, msgBus) {
        $scope.sendmsg = function () {
            msgBus.emitMsg('notificationReceived')
        }
    }

    $scope.toggleLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }




    var getNotificacoesOffline = function () {
        if (JSON.parse($window.localStorage.getItem('listaNotificacoes')) != null) {
            $rootScope.listaNotificacoes = JSON.parse($window.localStorage.getItem('listaNotificacoes'));
            var contNaoLidas = 0;
            for ($i = 0; $i < $rootScope.listaNotificacoes.length; $i++) {
                if ($rootScope.listaNotificacoes[$i].Lido === 0) {
                    contNaoLidas++;
                }
            }

            emitSignal($scope, signalFactory);

            if (contNaoLidas == 0) {
                document.getElementById("badgeNot").style.display = 'none';
            } else {
                document.getElementById("badgeNot").style.display = 'inline';
                $scope.numeroNot = contNaoLidas;
            }
        } else {
            toast('Não existem notificações!', 3);
        }
    };


    var getNotificacoes = function () {
        if($rootScope.loggedIn != false){
            WebServiceFactory.verificarConexao().success(function () {
                WebServiceFactory.getNotificacoes().success(function (lista) {
                    $rootScope.listaNotificacoes = lista;
                    $window.localStorage.setItem('listaNotificacoes', JSON.stringify(eval(lista)));
                    if ($scope.numeroNotificacoes == undefined) {
                        $scope.numeroNotificacoes = $rootScope.listaNotificacoes.length;
                    } else {
                        if ($rootScope.listaNotificacoes.length - $scope.numeroNotificacoes == 1) {
                            $scope.numeroNotificacoes = $rootScope.listaNotificacoes.length;
                            //toast('Recebeu uma nova notificação!', 3);
                            toastr.info('Recebeu uma notificação', '', {
                                positionClass: "toast-bottom-center", onclick: function () {
                                    $state.go('easyNutri.notificacoes');
                                }
                            })

                        } else if ((total = $rootScope.listaNotificacoes.length - $scope.numeroNotificacoes) > 1) {
                            toast('Recebeu ' + total + ' novas notificações!', 3);
                            $scope.numeroNotificacoes = $rootScope.listaNotificacoes.length;
                        }
                    }
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

                    }

                    emitSignal($scope, signalFactory);

                }).error(function (data, status, headers) {
                    toast('Erro a processar pedido de notificações!', 2);
                });
            }).error(function () {
                getNotificacoesOffline();
            });
        }
    };

        if($rootScope.loggedIn){
            WebServiceFactory.verificarConexao().success(function () {
                WebServiceFactory.sincronizarDados();
                getNotificacoes();

                var data = new Date();
                data = $filter('date')(data, 'yyyy-MM-dd');
                WebServiceFactory.getNotificacoes().success(function (notificacoes) {
                    $window.localStorage.setItem('listaNotificacoes', JSON.stringify(eval(notificacoes)));
                });

                WebServiceFactory.getPlanoAlimentar().success(function (planoAlimentar) {
                    $window.localStorage.setItem('planoAlimentar', JSON.stringify(eval(planoAlimentar)));
                });

                WebServiceFactory.getDiarioAlimentar(data).success(function (diarioAlimentar) {
                    $window.localStorage.setItem('diarioAlimentar', JSON.stringify(eval(diarioAlimentar)));
                });

                WebServiceFactory.getAlimentos().success(function (alimentos) {
                    $window.localStorage.setItem('listaAlimentos', JSON.stringify(eval(alimentos)));
                });

                WebServiceFactory.getRegistosPeso().success(function (pesos) {
                    $window.localStorage.setItem('listaPesos', JSON.stringify(eval(pesos)));
                });

            });


            $interval(function () {
                getNotificacoes();
            }, 10000);
        }

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
        $state.go('easyNutri.home', {}, {reload: true, inherit: false});
        $scope.openLoginModal();
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

