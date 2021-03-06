easyNutri.controller('notificacoesCtrl', function ($scope, $http, WebServiceFactory, modalFactory, $ionicPopup, $ionicModal, $filter, $rootScope, $interval, $window, $state, signalFactory) {

    if ($rootScope.loggedIn != true) {
        $state.go('easyNutri.home', {reload: true, inherit: false});
        return false;
    }


    var receiveSignal = function ($scope, msgBus) {
        msgBus.onMsg('notificationReceived', $scope, function () {
                WebServiceFactory.verificarConexao().success(function () {
                    $scope.listaNotificacoes = $rootScope.listaNotificacoes;
                }).error(function () {
                    $scope.listaNotificacoes = JSON.parse($window.localStorage.getItem('listaNotificacoes'));
                });
        });
    }

    receiveSignal($scope, signalFactory);
//            $interval(function () {
//                console.log('entrou na pagina notificacoes');
//                WebServiceFactory.verificarConexao().success(function () {
//                $scope.listaNotificacoes = $rootScope.listaNotificacoes;
//                }).error(function () {
//                    $scope.listaNotificacoes = JSON.parse($window.localStorage.getItem('listaNotificacoes'));
//                });
//
//            }, 10000);


        $ionicModal.fromTemplateUrl('templates/modal.html', function ($ionicModal) {
            $scope.modal = $ionicModal;
        }, {
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-up'
        });

        $scope.notificacao = {};

        $scope.setNotificacao = function (notificacao) {
            delete notificacao['$$hashKey'];
            if (notificacao != null) {
                var isTrue = modalFactory.setNotificacao(notificacao);
                if (isTrue) {
                    $scope.modal.show();
                    notificacao.Data = $filter('date')(notificacao.Data, 'yyyy-MM-dd HH:mm');
                    $scope.notificacao = notificacao;
                    $scope.listaNotificacoes[$scope.listaNotificacoes.indexOf(notificacao)].Lido = 1;
                    notificacao.Lido = 1;
                    WebServiceFactory.verificarConexao().success(function () {
                        WebServiceFactory.alterarEstadoNotificacao(notificacao.Id);
                    }).error(function () {
                        var listaNotificacoes = new Array();
                        if ($window.localStorage.getItem('listaNotificacoesLidas') != null) {
                            listaNotificacoes = JSON.parse($window.localStorage.getItem('listaNotificacoesLidas'));
                            listaNotificacoes.push(notificacao);
                            $window.localStorage.setItem('listaNotificacoesLidas', JSON.stringify(eval(listaNotificacoes)));
                            $window.localStorage.setItem('listaNotificacoes', JSON.stringify(eval($scope.listaNotificacoes)));

                        } else {
                            listaNotificacoes.push(notificacao);
                            $window.localStorage.setItem('listaNotificacoesLidas', JSON.stringify(eval(listaNotificacoes)));
                            $window.localStorage.setItem('listaNotificacoes', JSON.stringify(eval($scope.listaNotificacoes)));
                        }
                    });

                }

            }
        };

        $scope.hideModal = function () {
            $scope.modal.hide();
        };
        $scope.removeModal = function () {
            $scope.modal.remove();
        };
});