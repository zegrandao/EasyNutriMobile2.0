easyNutri.controller('dadosNaoSincCtrl', ['$scope', 'WebServiceFactory', '$filter', '$rootScope', '$window', '$state', '$ionicPopup', '$location',
    function ($scope, WebServiceFactory, $filter, $rootScope, $window, $state, $ionicPopup, $location) {

        if ($rootScope.loggedIn != true) {
            $state.go('login', {reload: true, inherit: false});
        }

        $scope.listaRefeicoesNovas = new Array();

        if ($window.localStorage.getItem('listaRefeicoesNovas') != null) {
            $scope.listaRefeicoesNovas = JSON.parse($window.localStorage.getItem('listaRefeicoesNovas'));
        }

        if ($window.localStorage.getItem('listaRefeicoesEditadas') != null) {
            $scope.listaRefeicoesEditadas = JSON.parse($window.localStorage.getItem('listaRefeicoesEditadas'));
        }

        $scope.tiposRefeicao = WebServiceFactory.getTiposRefeicao();

        $scope.removerRefeicaoOffline = function (refeicao) {
            $ionicPopup.confirm({
                title: "Remover Refeição",
                content: "Pretende remover a refeição " + $scope.tiposRefeicao[refeicao.Tipo - 1].Descricao + ' ?'
            })
                .then(function (result) {
                    if (result) {
                        $scope.listaRefeicoesEditadas.splice($scope.listaRefeicoesEditadas.indexOf(refeicao), 1);
                    }
                });
        };

        $scope.editarRefeicaoOffline = function (refeicao) {
            $rootScope.offline = true;
            $rootScope.editar = true;
            $rootScope.refeicaoEditar = refeicao;
            $location.path('/easyNutri/editarRefeicao');
        };

        $scope.abrirRefeicao = function (refeicao) {
            if ($scope.isAberto(refeicao)) {
                $scope.aberto = null;
            } else {
                $scope.aberto = refeicao;
            }
        };


        $scope.isAberto = function (refeicao) {
            return $scope.aberto === refeicao;
        };

    }
]);