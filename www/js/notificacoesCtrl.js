easyNutri.controller('notificacoesCtrl', ['$scope', '$http', 'WebServiceFactory', 'modalFactory', '$ionicPopup', '$ionicModal', '$filter', '$rootScope', '$interval', '$window', '$state',
    function ($scope, $http, WebServiceFactory, modalFactory, $ionicPopup, $ionicModal, $filter, $rootScope, $interval, $window, $state) {

        if($rootScope.loggedIn != true){
            $state.go('login', {reload: true, inherit: false});
        }

        if (!$rootScope.offline) {
            $interval(function () {
                $scope.listaNotificacoes = $rootScope.listaNotificacoes;
            }, 10000);
        } else {
            $scope.listaNotificacoes = JSON.parse($window.localStorage.getItem('listaNotificacoes'));
        }



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
                notificacao.Data = $filter('date')(notificacao.Data, 'dd-MM-yyyy H:mm');
                $scope.notificacao = notificacao;
                $scope.notificacao.Lido = 1;
                if($rootScope.offline != true){
                    WebServiceFactory.alterarEstadoNotificacao(notificacao.Id);
                }else{
                    var listaNotificacoes = new Array();
                    if($window.localStorage.getItem('listaNotificacoesLidas') != null){
                        listaNotificacoes = JSON.parse($window.localStorage.getItem('listaNotificacoesLidas'));
                        listaNotificacoes.push(notificacao);
                        $window.localStorage.setItem('listaNotificacoesLidas', JSON.stringify(eval(listaNotificacoes)));
                    }else{
                        listaNotificacoes.push(notificacao);
                        $window.localStorage.setItem('listaNotificacoesLidas', JSON.stringify(eval(listaNotificacoes)));
                    }
                }


            }
        }
    };

    $scope.hideModal = function () {
        $scope.modal.hide();
    };
    $scope.removeModal = function () {
        $scope.modal.remove();
    };
}]);