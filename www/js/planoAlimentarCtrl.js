easyNutri.controller('planoAlimentarCtrl',
    ['$scope', '$http', 'WebServiceFactory', '$filter', '$ionicModal', 'TiposRefeicaoFactory', '$ionicPopup', '$state', '$rootScope', '$ionicLoading', '$window',
        function ($scope, $http, WebServiceFactory, $filter, $ionicModal, TiposRefeicaoFactory, $ionicPopup, $state, $rootScope, $ionicLoading, $window) {

            if($rootScope.loggedIn != true){
                $state.go('login', {reload: true, inherit: false});
            }

            $scope.recomendacoes = "";
            $scope.planoAlimentar = "";

            var toast = function (texto, caso) {
                toastr.options = {
                    "closeButton": false,
                    "debug": false,
                    "newestOnTop": false,
                    "progressBar": false,
                    "positionClass": "toast-bottom-center",
                    "preventDuplicates": false,
                    "onclick": null,
                    "showDuration": "300",
                    "hideDuration": "100",
                    "timeOut": "3000",
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

            document.getElementById('btn_Equiv').onclick = function () {
                $state.go('easyNutri.tabelaEquivalencias');
                document.getElementById('btn_Equiv').style.display = 'none';
                $rootScope.isTabela = true;
                $rootScope.isPlano = false;
            }

            var mostrarSpinner = function () {
                $ionicLoading.show({
                    content: '<i class="icon ion-load-a"></i>',
                    animation: 'fade-in',
                    showBackdrop: false,
                    maxWidth: 50,
                    showDelay: 0
                });
            };

            var esconderSpinner = function () {
                $ionicLoading.hide();
            };

            var getPlanoAlimentarOffline = function () {
                if ($window.localStorage.getItem('planoAlimentar') != null) {
                    esconderSpinner();
                    $scope.planoAlimentar = JSON.parse($window.localStorage.getItem('planoAlimentar'));
                    $scope.recomendacoes = $scope.planoAlimentar.Recomendacoes;
                    var mostrarTabela = $scope.planoAlimentar.TabelaEqui;
                    if (mostrarTabela == 1) {
                        document.getElementById("btn_Equiv").style.display = "inline";
                    } else {
                        document.getElementById("btn_Equiv").style.display = "none";
                    }
                } else {
                    esconderSpinner();
                    $scope.planoAlimentar = "";
                    document.getElementById('recomendacoes').style.display = 'none';
                    toast('Não existe plano alimentar', 3);
                }
            };


            var getPlanoAlimentar = function () {
                if($rootScope.loggedIn != false){
                    mostrarSpinner();
                    WebServiceFactory.verificarConexao().success(function () {
                        WebServiceFactory.getPlanoAlimentar()
                            .success(function (data) {
                                if (data != "null") {
                                    esconderSpinner()
                                    $scope.planoAlimentar = data;
                                    console.log(data);
                                    $window.localStorage.setItem('planoAlimentar', JSON.stringify(eval(data)));
                                    console.log(JSON.parse($window.localStorage.getItem('planoAlimentar')));
                                    $scope.recomendacoes = $scope.planoAlimentar.Recomendacoes;
                                    var mostrarTabela = $scope.planoAlimentar.TabelaEqui;
                                    if (mostrarTabela == 1) {
                                        document.getElementById("btn_Equiv").style.display = "inline";
                                    } else {
                                        document.getElementById("btn_Equiv").style.display = "none";
                                    }
                                } else {
                                    esconderSpinner();
                                    $scope.planoAlimentar = "";
                                    document.getElementById('recomendacoes').style.display = 'none';
                                    toast('Não existe plano alimentar', 3);
                                }
                            })
                            .error(function (data, status, headers) {
                                esconderSpinner();
                                toast('Não conseguiu ir buscar o plano alimentar', 2);
                            });
                    }).error(function () {
                        getPlanoAlimentarOffline();
                    });
                }
            };

            if($rootScope.loggedIn != false){
                getPlanoAlimentar();
            }

            $scope.tiposRefeicao = TiposRefeicaoFactory.all();

            $scope.findUnidade = function (linha) {
                var tipoUnidade;
                if (linha.PorcaoId == null) {
                    tipoUnidade = linha.Unidade;
                    return tipoUnidade;
                } else {
                    for ($f = 0; $f < linha.Porcoes.length; $f++) {
                        if (linha.Porcoes[$f].Id == linha.PorcaoId) {
                            tipoUnidade = linha.Porcoes[$f].Descricao;
                            return tipoUnidade;
                        }
                    }
                }
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