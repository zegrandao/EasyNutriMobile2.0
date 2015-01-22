easyNutri.controller('refeicaoCtrl', ['$scope', '$http', 'WebServiceFactory', '$filter', '$ionicModal', '$ionicPopup',
    '$rootScope', 'TiposRefeicaoFactory', '$location', '$window', 'TiposRefeicaoFactory', '$state',
    function ($scope, $http, WebServiceFactory, $filter, $ionicModal, $ionicPopup, $rootScope, TiposRefeicaoFactory, $location, $window, $state) {

        if ($rootScope.loggedIn != true) {
            $state.go('login', {reload: true, inherit: false});
        }

        $scope.refeicao = {};
        $scope.alimento = {};
        $scope.refeicao.listaAlimentos = new Array();
        $scope.editarSubmit = false;
        $scope.numeroAlimentos = "";

        if ($window.localStorage.getItem('numeroPesquisa') != null) {
            $scope.numeroAlimentos = parseInt($window.localStorage.getItem('numeroPesquisa'));
        } else {
            $scope.numeroAlimentos = 5;
        }

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
                    toastr.error(texto);
                    break;
                case 3:
                    toastr.info(texto);
                    break;
            }

        };

        //popular tipos de refeicoes disponivies
        $scope.listaTipos = WebServiceFactory.getTiposRefeicao();

        var mostrarBotao = function () {
            if ($scope.refeicao.listaAlimentos.length != 0) {
                document.getElementById("botaoRegistar").style.display = "inline";
                document.getElementById("hr").style.display = "block";
            } else {
                document.getElementById("botaoRegistar").style.display = "none";
                document.getElementById("hr").style.display = "none";
            }
        };


        var isValid = function (refeicao) {
            var mensagem = "";
            var horaSistema = $filter('date')(new Date(), 'HH:mm');
            var dataAtual = $filter('date')(new Date(), 'yyyy-MM-dd');

            if (refeicao.Dia == null) {
                mensagem += "Defina o dia; ";
            }

            if (refeicao.Tipo == 0) {
                mensagem += "Defina o tipo da refeição; ";
            }

            if (refeicao.Hora == "") {
                mensagem += "Defina a hora; ";
            }

            if (refeicao.Hora > horaSistema && refeicao.Dia >= dataAtual) {
                mensagem += "A hora é superior à hora do sistema; "
            }

            if (refeicao.listaAlimentos === undefined) {
                mensagem += "Insira alimentos; ";
            } else {
                for (var $i = 0; $i < refeicao.listaAlimentos.length; $i++) {
                    if (refeicao.listaAlimentos[$i].Quantidade == "") {
                        mensagem += "Defina a quantidade do alimento; ";
                    } else if (refeicao.listaAlimentos[$i].Quantidade <= 0) {
                        mensagem += "A quantidade do alimento tem que ser superior a 0; ";
                        break;
                    }
                }
                }

            if (mensagem != "") {
                $ionicPopup.alert({
                    title: 'Aviso',
                    template: mensagem
                });
                return false;
            }
            return true;

        };

        var inicializar = function () {
            $rootScope.editar = false;
            $scope.titulo = "Nova Refeição";
            $scope.textoBotao = "Registar";
            $scope.refeicao.Data = new Date();
            $scope.refeicao.Dia = $filter('date')($scope.refeicao.Data, 'yyyy-MM-dd');
            $scope.refeicao.Hora = $filter('date')($scope.refeicao.Data, 'HH:mm');
            $scope.refeicao.Tipo = 1;
            $scope.refeicao.listaAlimentos = new Array();
            mostrarBotao();
        };

        //popular página com dados da refeição a editar
        $scope.popularPaginaEditar = function (refeicao) {
            var tipo;
            WebServiceFactory.verificarConexao().success(function () {
                var dia = $filter('date')(refeicao.DataRefeicao, 'yyyy-MM-dd');
                var hora = $filter('date')(refeicao.DataRefeicao, 'HH:mm');
                $scope.refeicao.Dia = dia;
                $scope.refeicao.Hora = hora;
                tipo = TiposRefeicaoFactory.get(refeicao.TipoRefeicaoId);
                $scope.refeicao.idRefeicao = refeicao.Id;
                $scope.refeicao.Tipo = tipo.Id;
                for ($i = 0; $i < refeicao.LinhasRefeicao.length; $i++) {
                    refeicao.LinhasRefeicao[$i].Alimentos.Quantidade = refeicao.LinhasRefeicao[$i].Quant;
                    refeicao.LinhasRefeicao[$i].Alimentos.Porcoes.push(
                        {
                            Descricao: refeicao.LinhasRefeicao[$i].Alimentos.Unidade,
                            Porcao: 1, IdAlimento: refeicao.LinhasRefeicao[$i].Alimentos.Id, Id: 0
                        });

                    if (refeicao.LinhasRefeicao[$i].PorcaoId == null) {
                        refeicao.LinhasRefeicao[$i].Alimentos.PorcaoId = 0;

                    } else {
                        refeicao.LinhasRefeicao[$i].Alimentos.PorcaoId = refeicao.LinhasRefeicao[$i].PorcaoId;
                    }
                    $scope.refeicao.listaAlimentos.push(refeicao.LinhasRefeicao[$i].Alimentos);
                }
                mostrarBotao();
            }).error(function (status, data, headers) {
                if (status == 0) {
                    if ($rootScope.editadaOffline) {
                        tipo = TiposRefeicaoFactory.get(refeicao.Tipo);
                        var dia = $filter('date')(refeicao.Dia, 'yyyy-MM-dd');
                        var hora = $filter('date')(refeicao.Hora, 'HH:mm');
                        $scope.refeicao.Dia = dia;
                        $scope.refeicao.Hora = hora;
                        $scope.refeicao.Tipo = tipo.Id;
                        for ($i = 0; $i < refeicao.listaAlimentos.length; $i++) {
                            $scope.refeicao.listaAlimentos.push(refeicao.listaAlimentos[$i]);
                        }
                        mostrarBotao();
                    } else {
                        var dia = $filter('date')(refeicao.DataRefeicao, 'yyyy-MM-dd');
                        var hora = $filter('date')(refeicao.DataRefeicao, 'HH:mm');
                        $scope.refeicao.Dia = dia;
                        $scope.refeicao.Hora = hora;
                        tipo = TiposRefeicaoFactory.get(refeicao.TipoRefeicaoId);
                        $scope.refeicao.idRefeicao = refeicao.Id;
                        $scope.refeicao.Tipo = tipo.Id;
                        for ($i = 0; $i < refeicao.LinhasRefeicao.length; $i++) {
                            refeicao.LinhasRefeicao[$i].Alimentos.Quantidade = refeicao.LinhasRefeicao[$i].Quant;
                            refeicao.LinhasRefeicao[$i].Alimentos.Porcoes.push(
                                {
                                    Descricao: refeicao.LinhasRefeicao[$i].Alimentos.Unidade,
                                    Porcao: 1, IdAlimento: refeicao.LinhasRefeicao[$i].Alimentos.Id, Id: 0
                                });

                            if (refeicao.LinhasRefeicao[$i].PorcaoId == null) {
                                refeicao.LinhasRefeicao[$i].Alimentos.PorcaoId = 0;

                            } else {
                                refeicao.LinhasRefeicao[$i].Alimentos.PorcaoId = refeicao.LinhasRefeicao[$i].PorcaoId;
                            }
                            $scope.refeicao.listaAlimentos.push(refeicao.LinhasRefeicao[$i].Alimentos);
                        }
                        mostrarBotao();
                    }
                }
            });
        };


        //verificação para ver se é para editar uma nova refeição ou criar uma nova
        if ($rootScope.editar) {
            console.log("entrou no if $rootScope.editar && $rootScope !== undefined");
            $scope.titulo = "Editar Refeição";
            $scope.textoBotao = "Editar";
            $scope.popularPaginaEditar($rootScope.refeicaoEditar);
            $scope.editarSubmit = true;
            $rootScope.editar = false;
        } else {
            inicializar();

        }

        //popular lista de alimentos pesquisavel
        WebServiceFactory.getAlimentos().success(function (lista) {
            $scope.alimentos = lista;
        }).error(function (data, status, headers) {
            if (status == 0) {
                $scope.alimentos = JSON.parse($window.localStorage.getItem('listaAlimentos'));
            } else {
                toast('Erro a processar pedido de alimentos!', 2);
            }
        });


        //método para diferenciar a ação do botão entre editar uma refeição e guardar uma nova refeição
        $scope.acaoBotao = function (refeicao) {
            if ($scope.editarSubmit) {
                $scope.editarRefeicao(refeicao);
            } else {
                $scope.guardarRefeicao(refeicao);
            }

        };

        var guardarRefeicaoOffline = function (refeicao) {
            $scope.listaRefeicoesNovasOffline = new Array();
            if ($window.localStorage.getItem('listaRefeicoesNovas') !== null) {
                $scope.listaRefeicoesNovasOffline = JSON.parse($window.localStorage.getItem('listaRefeicoesNovas'));
                $scope.listaRefeicoesNovasOffline.push(refeicao);
                $window.localStorage.setItem('listaRefeicoesNovas', JSON.stringify(eval($scope.listaRefeicoesNovasOffline)));
                inicializar();
                toast('Refeicao guardada com sucesso', 1);
            } else if ($window.localStorage.getItem('listaRefeicoesNovas') == null) {
                $scope.listaRefeicoesNovasOffline.push(refeicao);
                $window.localStorage.setItem('listaRefeicoesNovas', JSON.stringify(eval($scope.listaRefeicoesNovasOffline)));
                inicializar();
                toast('Refeicao guardada com sucesso', 1);
            }
        };

        //define metodo para guardar refeicao
        $scope.guardarRefeicao = function (refeicao) {
            if (isValid(refeicao)) {
                WebServiceFactory.guardarRefeicao(refeicao)
                    .success(function () {
                        console.log(JSON.stringify(refeicao));
                        inicializar();
                        toast('Refeição guardada com sucesso!', 1);
                    })
                    .error(function (data, status, headers) {
                        if (status == 0) {
                            guardarRefeicaoOffline(refeicao);
                        } else {
                            toast('Erro a guardar refeição!', 2);
                        }
                    });
            }
        };

        var editarRefeicaoOffline = function (refeicao) {
            if ($rootScope.editadaOffline) {
                $scope.listaRefeicoesOffline = new Array();
                if ($window.localStorage.getItem('listaRefeicoesNovas') != null) {
                    $scope.listaRefeicoesOffline = JSON.parse($window.localStorage.getItem('listaRefeicoesNovas'));
                    $scope.listaRefeicoesOffline.push(refeicao);
                    $window.localStorage.setItem('listaRefeicoesNovas', JSON.stringify(eval($scope.listaRefeicoesOffline)));
                    $rootScope.editar = false;
                    $rootScope.editadaOffline = false;
                    delete $rootScope.editarRefeicao;
                    toast('Refeição editada com sucesso!', 1);
                    inicializar();
                }
            } else {
                if ($window.localStorage.getItem('listaRefeicoesEditadas') != null) {
                    $scope.listaRefeicoesEditadasOffline = new Array();
                    $scope.listaRefeicoesEditadasOffline = JSON.parse($window.localStorage.getItem('listaRefeicoesEditadas'));
                    $scope.listaRefeicoesEditadasOffline.push(refeicao);
                    $window.localStorage.setItem('listaRefeicoesEditadas', JSON.stringify(eval($scope.listaRefeicoesEditadasOffline)));
                    $rootScope.editar = false;
                    delete $rootScope.editarRefeicao;
                    toast('Refeição editada com sucesso!', 1);
                    inicializar();
                } else if ($window.localStorage.getItem('listaRefeicoesEditadas') == null) {
                    $scope.listaRefeicoesEditadasOffline.push(refeicao);
                    $window.localStorage.setItem('listaRefeicoesEditadas', JSON.stringify(eval($scope.listaRefeicoesEditadasOffline)));
                    $rootScope.editar = false;
                    delete $rootScope.editarRefeicao;
                    toast('Refeição editada com sucesso!', 1);
                    inicializar();
                }
            }
        };

        //define método para editar uma refeição
        $scope.editarRefeicao = function (refeicao) {
            console.log("A tentar editar refeicao: " + refeicao);
            if (isValid(refeicao)) {
                var idLinha = refeicao.idRefeicao;
                WebServiceFactory.editarRefeicaoWeb(refeicao, idLinha)
                    .success(function () {
                        $rootScope.editar = false;
                        delete $rootScope.editarRefeicao;
                        toast('Refeição editada com sucesso!', 1);
                        $location.path('/easyNutri/consultaDiario');
                    })
                    .error(function (data, status, headers) {
                        if (status == 0) {
                            editarRefeicaoOffline(refeicao);
                            $rootScope.editar = false;
                        } else {
                            toast('Erro a editar refeição!', 2);
                            $rootScope.editar = true;
                        }
                    });
            }
        };

        //método para apagar alimentos da lista
        $scope.apagarItem = function (alimento) {
            for (var i = 0; i < $scope.refeicao.listaAlimentos.length; i++) {
                if ($scope.refeicao.listaAlimentos[i].Id === alimento.Id) {
                    $scope.refeicao.listaAlimentos.splice($scope.refeicao.listaAlimentos.indexOf(alimento), 1);
                }
                }
            mostrarBotao();
        };

        //método para tornar vísivel a lista dos alimentos quando o utilizador tenta pesquisar um alimento
        $scope.tornarVisivel = function () {
            if (document.getElementById("campoAlimento").value == "") {
                document.getElementById("listaPesquisa").style.display = 'none';
            } else {
                document.getElementById("listaPesquisa").style.display = 'block';
            }
        };


        //método para adicionar um alimento à lista
        $scope.addAlimentoLista = function (alimento) {
            document.getElementById("campoAlimento").value = "";
            document.getElementById("listaPesquisa").style.display = "none";
            if ($scope.refeicao.listaAlimentos.length != 0) {
                var addToLista = true;
                for (var i = 0; i < $scope.refeicao.listaAlimentos.length; i++) {
                    if ($scope.refeicao.listaAlimentos[i].Id === alimento.Id) {
                        alimento.Quantidade++;
                        addToLista = false;
                    }
                }
                if (addToLista) {
                    alimento.Quantidade = 1;
                    $scope.refeicao.listaAlimentos.push(alimento);
                }
            } else {
                alimento.Quantidade = 1;
                $scope.refeicao.listaAlimentos.push(alimento);
            }

            alimento.Porcoes.push(
                {
                    Descricao: alimento.Unidade,
                    Porcao: 1, IdAlimento: alimento.Id, Id: 0
                });
            alimento.PorcaoId = alimento.Porcoes[0].Id;
            mostrarBotao();
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

        //método para abrir o datepicker
        $scope.opendateModal = function () {
            $scope.datemodal.show();
        };

        //método para fechar o datepicker
        $scope.closedateModal = function (data) {

            var dataAtual = $filter('date')(new Date(), 'yyyy-MM-dd');

            if (data <= dataAtual) {
                $scope.datemodal.hide();
                data = $filter('date')(data, 'yyyy-MM-dd');
                $scope.refeicao.Dia = data;
            } else {
                toast('Escolheu uma data superior à do sistema', 2);
            }
        };

        $scope.getPorcao = function (alimento) {
            if ($scope.refeicao.listaAlimentos.length != 0) {
                for ($i = 0; $i < $scope.refeicao.listaAlimentos.length; $i++) {
                    if ($scope.refeicao.listaAlimentos[$i] == alimento) {
                        return $scope.refeicao.listaAlimentos[$i].PorcaoId;
                    }
                }
                }
            return "";
        }
    }]);