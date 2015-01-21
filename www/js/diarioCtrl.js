easyNutri.controller('diarioCtrl',
    ['$scope', '$http', 'WebServiceFactory', '$filter', '$ionicModal', 'TiposRefeicaoFactory', '$ionicPopup', '$location', '$rootScope', '$ionicLoading', '$window', '$state',
        function ($scope, $http, WebServiceFactory, $filter, $ionicModal, TiposRefeicaoFactory, $ionicPopup, $location, $rootScope, $ionicLoading, $window, $state) {

            if($rootScope.loggedIn != true){
                $state.go('login', {reload: true, inherit: false});
            }

            $scope.pesquisa = {};
            $scope.pesquisa.Dia = new Date();
            $scope.pesquisa.Dia = $filter('date')($scope.pesquisa.Dia, 'yyyy-MM-dd');
            $scope.diarioAlimentar = new Array();

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
                    "extendedTimeOut": "1000",
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
                        toast.error(texto);
                        break;
                    case 3:
                        toast.info(texto);
                        break;
                }

            };



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

            $scope.pesquisarDiarios = function (dataPesquisa) {
                mostrarSpinner();
                if($rootScope.loggedIn != false){
                        WebServiceFactory.getDiarioAlimentar(dataPesquisa)
                            .success(function (data) {
                                if (data != "null") {
                                    $scope.diarioAlimentar = data;
                                    esconderSpinner();
                                } else {
                                    $scope.diarioAlimentar = "";
                                    esconderSpinner();
                                    toast('Não existem registos!', 3);
                                }

                            })
                            .error(function (data, status, headers) {
                                if (status == 0) {
                                    esconderSpinner();
                                    if ($window.localStorage.getItem('diarioAlimentar') !== null) {
                                        $scope.diarioAlimentar = JSON.parse($window.localStorage.getItem('diarioAlimentar'));
                                    } else {
                                        toast('Não existem registos!', 3);
                                    }
                                } else {
                                    esconderSpinner();
                                    toast('Erro a pesquisar diários alimentares!', 2);

                                }
                            });
                }
            };

            $scope.findUnidade = function (linhaRefeicao) {
                var tipoUnidade;
                if (linhaRefeicao.PorcaoId == null) {
                    tipoUnidade = linhaRefeicao.Alimentos.Unidade;
                    return tipoUnidade;
                } else {
                    for ($f = 0; $f < linhaRefeicao.Alimentos.Porcoes.length; $f++) {
                        if (linhaRefeicao.Alimentos.Porcoes[$f].Id == linhaRefeicao.PorcaoId) {
                            tipoUnidade = linhaRefeicao.Alimentos.Porcoes[$f].Descricao;
                            return tipoUnidade;
                        }
                    }
                }
            };

            if (!$rootScope.offline) {
                $scope.pesquisarDiarios($scope.pesquisa.Dia);
            } else {
                if ($window.localStorage.getItem('diarioAlimentar') !== null) {
                    $scope.diarioAlimentar = JSON.parse($window.localStorage.getItem('diarioAlimentar'));
                } else {
                    toast('Não existem registos!', 3);
                }
            }

            $scope.tiposRefeicao = TiposRefeicaoFactory.all();

            easyNutri.filter('getNomeRef', function () {
                return function (id) {
                    var lista = $scope.tiposRefeicao;
                    var i = 0, len = lista.length;
                    for (; i < len; i++) {
                        if (lista[i].id == id) {
                            return lista[i].descricao;
                        }
                    }
                    return null;
                }
            });

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

            //datepicker
            $ionicModal.fromTemplateUrl('templates/datemodal.html',
                function (modal) {
                    $scope.datemodal = modal;
                },
                {
                    // Use our scope for the scope of the modal to keep it simple
                    scope: $scope,
                    // The animation we want to use for the modal entrance
                    animation: 'slide-in-up'
                }
            );

            $scope.opendateModal = function () {
                $scope.datemodal.show();
            };

            $scope.closedateModal = function (data) {
                var dataAtual = $filter('date')(new Date(), 'yyyy-MM-dd');

                if (data <= dataAtual) {
                    $scope.datemodal.hide();
                    data = $filter('date')(data, 'yyyy-MM-dd');
                    $scope.pesquisa.Dia = data;
                    $scope.pesquisarDiarios($scope.pesquisa.Dia);
                } else {
                    toast('Escolheu uma data superior à data do sistema!', 2);
                }

            };

            $scope.editar = function (refeicao) {
                $rootScope.editar = true;
                $rootScope.refeicaoEditar = refeicao;
                $location.path('/easyNutri/editarRefeicao');
            };

            var removerOffline = function (refeicao) {
                $scope.listaRefeicoesRemovidas = new Array();
                if ($window.localStorage.getItem('listaRefeicoesRemovidas') != null) {
                    $scope.diarioAlimentar.Refeicoes.splice($scope.diarioAlimentar.Refeicoes.indexOf(refeicao), 1);
                    $scope.listaRefeicoesRemovidas = JSON.parse($window.localStorage.getItem('listaRefeicoesRemovidas'));
                    $scope.listaRefeicoesRemovidas.push(refeicao);
                    $window.localStorage.setItem('listaRefeicoesRemovidas', JSON.stringify(eval($scope.listaRefeicoesRemovidas)));
                    esconderSpinner();
                    toast('Refeição removida com sucesso!', 1);
                } else if ($window.localStorage.getItem('listaRefeicoesRemovidas') == null) {
                    $scope.diarioAlimentar.Refeicoes.splice($scope.diarioAlimentar.Refeicoes.indexOf(refeicao), 1);
                    $scope.listaRefeicoesRemovidas.push(refeicao);
                    $window.localStorage.setItem('listaRefeicoesRemovidas', JSON.stringify(eval($scope.listaRefeicoesRemovidas)));
                    esconderSpinner();
                    toast('Refeição removida com sucesso!', 1);
                }
            };

            $scope.remover = function (refeicao) {
                mostrarSpinner();
                if (!$rootScope.offline) {
                    WebServiceFactory.removerRefeicaoWeb(refeicao.Id)
                        .success(function () {
                            esconderSpinner();
                            toast('Refeição removida com sucesso!', 1);
                            $scope.diarioAlimentar.Refeicoes.splice($scope.diarioAlimentar.Refeicoes.indexOf(refeicao), 1);
                        })
                        .error(function (data, status, headers) {
                            if (status == 0) {
                                removerOffline(refeicao);
                            } else {
                                esconderSpinner();
                                toast('Erro a remover refeição!', 2);

                            }
                        });
                } else {
                    removerOffline(refeicao);
                }
            };


            $scope.myPopup = function (refeicao) {
                $ionicPopup.show({
                    title: 'Apagar Refeição',
                    subTitle: 'Tem a certeza que pretende apagar esta refeição:' + $scope.tiposRefeicao[refeicao.TipoRefeicaoId - 1].Descricao + ' ?',
                    scope: $scope,
                    buttons: [
                        {text: 'Cancelar'},
                        {
                            text: '<b>Remover</b>',
                            type: 'button-positive',
                            onTap: function () {
                                $scope.remover(refeicao);
                            }
                        }
                    ]
                });
            }
        }
    ]);

