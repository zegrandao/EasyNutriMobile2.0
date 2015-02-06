easyNutri.controller('dadosNaoSincCtrl', ['$scope', 'WebServiceFactory', '$filter', '$rootScope', '$window', '$state', '$ionicPopup', '$location',
    function ($scope, WebServiceFactory, $filter, $rootScope, $window, $state, $ionicPopup, $location) {

        if ($rootScope.loggedIn != true) {
            $state.go('easyNutri.home', {reload: true, inherit: false});
        }

        if ($window.localStorage.getItem('listaRefeicoesNovas') != null || $window.localStorage.getItem('listaRefeicoesRemovidas') != null ||
            $window.localStorage.getItem('listaRefeicoesEditadas') != null || $window.localStorage.getItem('listaPesosNovos') != null) {
            document.getElementById('botaoSincronizar').style.display = 'inline';
        }

        $scope.listaRefeicoesNovas = new Array();
        if ($window.localStorage.getItem('listaRefeicoesNovas') != null) {
            $scope.listaRefeicoesNovas = JSON.parse($window.localStorage.getItem('listaRefeicoesNovas'));
            document.getElementById('divLista').style.display = 'inline';
        }

        $scope.listaRefeicoesRemovidas = new Array();
        if ($window.localStorage.getItem('listaRefeicoesRemovidas') != null) {
            $scope.listaRefeicoesRemovidas = JSON.parse($window.localStorage.getItem('listaRefeicoesRemovidas'));
        }

        $scope.listaRefeicoesDiario = new Array();
        if ($window.localStorage.getItem('diarioAlimentar') != null) {
            $scope.listaRefeicoesDiario = JSON.parse($window.localStorage.getItem('diarioAlimentar'));
        }

        $scope.listaRefeicoesEditadas = new Array();
        if ($window.localStorage.getItem('listaRefeicoesEditadas') != null) {
            $scope.listaRefeicoesEditadas = JSON.parse($window.localStorage.getItem('listaRefeicoesEditadas'));
            document.getElementById('divLista').style.display = 'inline';
        }

        $scope.listaPesosNovos = new Array();
        if ($window.localStorage.getItem('listaPesosNovos') != null) {
            var lista = JSON.parse($window.localStorage.getItem('listaPesosNovos'));
            for (item in lista) {
                lista[item].DataMed = $filter('date')(lista[item].DataMed, 'yyyy-MM-dd HH:mm');
                lista[item].tipoRegisto = (lista[item].EmCasa == "0") ? "Consulta" : "Casa";
            }
            $scope.listaPesosNovos = lista;
            document.getElementById('divLista').style.display = 'inline';
        }

        if ($scope.listaRefeicoesEditadas == null && $scope.listaRefeicoesNovas == null) {
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
                        $scope.listaRefeicoesRemovidas.push(refeicao);
                        $window.localStorage.setItem('listaRefeicoesEditadas', JSON.stringify(eval($scope.listaRefeicoesEditadas)));
                        $window.localStorage.setItem('listaRefeicoesRemovidas', JSON.stringify(eval($scope.listaRefeicoesRemovidas)));
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

        $scope.acaoBotao = function () {
            WebServiceFactory.verificarConexao().success(function () {
                WebServiceFactory.sincronizarDados();
                $state.go($state.current, {}, {reload: true});
            }).error(function () {
                toastr.info('Não tem ligação à internet');
            });

        };

        $scope.editarRefeicaoNovaOffline = function (refeicao) {
            $rootScope.offline = true;
            $rootScope.editar = true;
            $rootScope.editadaOffline = true;
            $rootScope.refeicaoEditar = refeicao;
            console.log('JSON enviado para a página editar nova refeição: ' + JSON.stringify(refeicao));
            $location.path('/easyNutri/editarRefeicao');
        };

        $scope.editarRefeicaoOffline = function (refeicao) {
            $rootScope.offline = true;
            $rootScope.editar = true;
            $rootScope.editadaVelhaOffline = true;
            $rootScope.refeicaoEditar = refeicao;
            console.log('JSON enviado para a pagina editar: ' + JSON.stringify(refeicao));
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