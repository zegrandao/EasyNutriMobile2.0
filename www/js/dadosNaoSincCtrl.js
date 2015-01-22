easyNutri.controller('dadosNaoSincCtrl', ['$scope', 'WebServiceFactory', '$filter', '$rootScope', '$window', '$state', '$ionicPopup', '$location',
    function ($scope, WebServiceFactory, $filter, $rootScope, $window, $state, $ionicPopup, $location) {

        if ($rootScope.loggedIn != true) {
            $state.go('login', {reload: true, inherit: false});
        }


        console.log($window.localStorage.getItem('listaRefeicoesNovas'));
        console.log($window.localStorage.getItem('listaRefeicoesEditadas'));
        if ($window.localStorage.getItem('listaRefeicoesNovas') != null) {
            $scope.listaRefeicoesNovas = new Array();
            $scope.listaRefeicoesNovas = JSON.parse($window.localStorage.getItem('listaRefeicoesNovas'));
            document.getElementById('divLista').style.display = 'inline';
        }

        if ($window.localStorage.getItem('diarioAlimentar') != null) {
            $scope.listaRefeicoesDiario = new Array();
            $scope.listaRefeicoesDiario = JSON.parse($window.localStorage.getItem('diarioAlimentar'));
        }


        if ($window.localStorage.getItem('listaRefeicoesEditadas') != null) {
            $scope.listaRefeicoesEditadas = new Array();
            $scope.listaRefeicoesEditadas = JSON.parse($window.localStorage.getItem('listaRefeicoesEditadas'));
            document.getElementById('divLista').style.display = 'inline';
        }

        if ($scope.listaRefeicoesEditadas == undefined && $scope.listaRefeicoesNovas == undefined) {
            $ionicPopup.alert({
                title: "Aviso",
                content: "Não existem dados"
            });

            $state.go('easyNutri.home', {reload: true, inherit: false});
        }

        $scope.findUnidade = function (linhaRefeicao) {
            var tipoUnidade;
            if (linhaRefeicao.PorcaoId == null) {
                tipoUnidade = linhaRefeicao.Unidade;
                return tipoUnidade;
            } else {
                for ($f = 0; $f < linhaRefeicao.Porcoes.length; $f++) {
                    if (linhaRefeicao.Porcoes[$f].Id == linhaRefeicao.PorcaoId) {
                        tipoUnidade = linhaRefeicao.Porcoes[$f].Descricao;
                        return tipoUnidade;
                    }
                }
            }
        };

        $scope.tiposRefeicao = WebServiceFactory.getTiposRefeicao();

        $scope.removerRefeicaoEditadaOffline = function (refeicao) {
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

        $scope.removerRefeicaoNovaOffline = function (refeicao) {
            $ionicPopup.confirm({
                title: "Remover Refeição",
                content: "Pretende remover a refeição " + $scope.tiposRefeicao[refeicao.Tipo - 1].Descricao + ' ?'
            })
                .then(function (result) {
                    if (result) {
                        $scope.listaRefeicoesNovas.splice($scope.listaRefeicoesNovas.indexOf(refeicao), 1);
                    }
                });
        };

        $scope.editarRefeicaoNovaOffline = function (refeicao) {
            $rootScope.offline = true;
            $rootScope.editar = true;
            $rootScope.editadaOffline = true;
            $rootScope.refeicaoEditar = refeicao;
            $scope.listaRefeicoesNovas.splice($scope.listaRefeicoesNovas.indexOf(refeicao), 1);
            $window.localStorage.setItem('listaRefeicoesNovas', JSON.stringify(eval($scope.listaRefeicoesNovas)));
            $location.path('/easyNutri/editarRefeicao');
        };

        $scope.editarRefeicaoOffline = function (refeicao) {
            $rootScope.offline = true;
            $rootScope.editar = true;
            $rootScope.refeicaoEditar = refeicao;
            $scope.listaRefeicoesDiario.splice($scope.listaRefeicoesDiario.indexOf(refeicao), 1);
            $window.localStorage.setItem('diarioAlimentar', JSON.stringify(eval($scope.listaRefeicoesDiario)));
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