easyNutri.controller('refeicaoCtrl',
    function ($scope, $http, WebServiceFactory, $filter, $ionicModal, $ionicPopup, $rootScope, TiposRefeicaoFactory, $location, $window, $state) {

        if ($rootScope.loggedIn != true) {
            $state.go('easyNutri.home', {reload: true, inherit: false});
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

        var mostrarBotao = function () {
            if ($scope.refeicao.listaAlimentos.length != 0) {
                document.getElementById("botaoRegistar").style.display = "inline";
                document.getElementById("hr").style.display = "block";
            } else {
                document.getElementById("botaoRegistar").style.display = "none";
                document.getElementById("hr").style.display = "none";
            }
        };

        var inicializar = function () {
            $rootScope.editar = false;
            $scope.titulo = "Nova Refeição";
            $scope.textoBotao = "Registar";
            $scope.refeicao.Data = new Date();
            $scope.refeicao.Dia = $filter('date')($scope.refeicao.Data, 'yyyy-MM-dd');
            var horaSistema = $filter('date')($scope.refeicao.Data, 'HH:mm');
            var arrayHora = horaSistema.split(':');
            $scope.refeicao.Hora = parseInt(arrayHora[0]);
            $scope.refeicao.Minutos = parseInt(arrayHora[1]);
            $scope.refeicao.Tipo = 1;
            $scope.refeicao.listaAlimentos = new Array();
            mostrarBotao();
        };

        if ($state.current.name == 'easyNutri.novaRefeicao') {
            inicializar();
        }

        //método para adicionar um alimento à lista
        $scope.addAlimentoLista = function (alimento) {
            document.getElementById("campoAlimento").value = "";
            document.getElementById("listaPesquisa").style.display = "none";
            alimento.Porcoes.push(
                {
                    Descricao: alimento.Unidade,
                    Porcao: 1, IdAlimento: alimento.Id, Id: 0
                });
            if ($scope.refeicao.listaAlimentos.length != 0) {
                var addToLista = true;
                for (var i = 0; i < $scope.refeicao.listaAlimentos.length; i++) {
                    if ($scope.refeicao.listaAlimentos[i].Id === alimento.Id) {
                        $scope.refeicao.listaAlimentos[i].Quantidade++;
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
            alimento.PorcaoId = alimento.Porcoes[0].Id;
            mostrarBotao();
        };

        //popular tipos de refeicoes disponivies
        $scope.listaTipos = WebServiceFactory.getTiposRefeicao();


        var isValid = function (refeicao) {
            var mensagem = "";
            var hora = $filter('date')(new Date(), 'HH:mm');
            var arrayHora = hora.split(':');
            var horaSistema = parseInt(arrayHora[0]);
            var minutosSistema = parseInt(arrayHora[1]);
            var dataAtual = $filter('date')(new Date(), 'yyyy-MM-dd');

            if (refeicao.Dia == null) {
                mensagem += "Defina o dia; ";
            }

            if (refeicao.Tipo == 0) {
                mensagem += "Defina o tipo da refeição; ";
            }

            if (refeicao.Hora == "" && refeicao.Hora != 0) {
                mensagem += "Defina a hora; ";
            }

            if (refeicao.Hora == 0) {
                refeicao.Hora = 24;
            }

            if (refeicao.Hora > horaSistema && refeicao.Dia >= dataAtual) {
                mensagem += "A hora é superior à hora do sistema; ";
            }

            if (refeicao.Minutos > minutosSistema && refeicao.Dia >= dataAtual) {
                mensagem += "Os minutos são superiores aos minutos do sistema; ";
            }

            if (refeicao.Minutos == "" && refeicao.Minutos != 0) {
                mensagem += "Defina os minutos; ";
            }

            if (refeicao.Hora > 24 || refeicao.Hora < 0) {
                mensagem += "Introduza uma hora entre 0 e 23";
            }

            if (refeicao.Minutos > 60 || refeicao.Minutos < 0) {
                mensagem += "Introduza minutos entre 0 e 59; "
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
                    } else if (refeicao.listaAlimentos[$i].Quantidade > 99999) {
                        mensagem += "A quantidade do alimento não pode ser superior a 99999";
                        break;
                    }
                }
            }

            if (mensagem != "") {
                if (refeicao.Hora == 24) {
                    refeicao.Hora = 00;
                }
                $ionicPopup.alert({
                    title: 'Aviso',
                    template: mensagem
                });
                return false;
            }
            return true;

        };

        //popular página com dados da refeição a editar
        $scope.popularPaginaEditar = function (refeicao) {
            var tipo;
            WebServiceFactory.verificarConexao().success(function () {
                var dia = $filter('date')(refeicao.DataRefeicao, 'yyyy-MM-dd');
                var hora = $filter('date')(refeicao.DataRefeicao, 'HH:mm');
                var arrayHora = hora.split(':');
                $scope.refeicao.Dia = dia;
                $scope.refeicao.Hora = parseInt(arrayHora[0]);
                $scope.refeicao.Minutos = parseInt(arrayHora[1]);
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
                    if ($rootScope.editadaOffline) { //refeição criada offline
                        tipo = TiposRefeicaoFactory.get(refeicao.Tipo);
                        var dia = $filter('date')(refeicao.Dia, 'yyyy-MM-dd');
                        var hora = $filter('date')(refeicao.Hora, 'HH:mm');
                        var arrayHora = hora.split(':');
                        $scope.refeicao.Dia = dia;
                        $scope.refeicao.Hora = parseInt(arrayHora[0]);
                        $scope.refeicao.Minutos = parseInt(arrayHora[1]);
                        $scope.refeicao.Tipo = tipo.Id;
                        for ($i = 0; $i < refeicao.listaAlimentos.length; $i++) {
                            $scope.refeicao.listaAlimentos.push(refeicao.listaAlimentos[$i]);
                        }
                        mostrarBotao();
                    } else {
                        if ($rootScope.editadaVelhaOffline) { //refeição que veio do webservice editada pela 2ª vez
                            console.log('JSON Velho: ' + JSON.stringify(refeicao));
                            tipo = TiposRefeicaoFactory.get(refeicao.Tipo);
                            var dia = $filter('date')(refeicao.Dia, 'yyyy-MM-dd');
                            var hora = $filter('date')(refeicao.Hora, 'HH:mm');
                            var arrayHora = hora.split(':');
                            $scope.refeicao.Dia = dia;
                            $scope.refeicao.Hora = parseInt(arrayHora[0]);
                            $scope.refeicao.Minutos = parseInt(arrayHora[1]);
                            $scope.refeicao.Tipo = tipo.Id;
                            $scope.refeicao.idRefeicao = refeicao.idRefeicao;
                            for ($i = 0; $i < refeicao.listaAlimentos.length; $i++) {
                                $scope.refeicao.listaAlimentos.push(refeicao.listaAlimentos[$i]);
                            }
                            mostrarBotao();
                        } else { //refeicao que veio do webservice editada pela 1ª vez
                            console.log('JSON que vem dos dados sincronizados: ' + JSON.stringify(refeicao));
                            var dia = $filter('date')(refeicao.DataRefeicao, 'yyyy-MM-dd');
                            var hora = $filter('date')(refeicao.DataRefeicao, 'HH:mm');
                            var arrayHora = hora.split(':');
                            $scope.refeicao.Dia = dia;
                            $scope.refeicao.Hora = parseInt(arrayHora[0]);
                            $scope.refeicao.Minutos = parseInt(arrayHora[1]);
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
        } else {
            inicializar();

        }

        //popular lista de alimentos pesquisavel
        WebServiceFactory.verificarConexao().success(function () {
            WebServiceFactory.sincronizarDados();
            WebServiceFactory.getAlimentos().success(function (lista) {
                $scope.alimentos = lista;

            }).error(function (data, status, headers) {
                toast('Erro a processar pedido de alimentos!', 2);
            });
        }).error(function () {
            $scope.alimentos = JSON.parse($window.localStorage.getItem('listaAlimentos'));
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
                if (refeicao.Hora == 24) {
                    refeicao.Hora = 0;
                }
                refeicao.Hora = refeicao.Hora + ':' + refeicao.Minutos;
                refeicao.DataRefeicao = refeicao.Dia + " " + refeicao.Hora;
                $scope.listaRefeicoesNovasOffline = JSON.parse($window.localStorage.getItem('listaRefeicoesNovas'));
                $scope.listaRefeicoesNovasOffline.push(refeicao);
                $window.localStorage.setItem('listaRefeicoesNovas', JSON.stringify(eval($scope.listaRefeicoesNovasOffline)));
                inicializar();
                toast('Refeicao guardada com sucesso', 1);
            } else if ($window.localStorage.getItem('listaRefeicoesNovas') == null) {
                if (refeicao.Hora == 24) {
                    refeicao.Hora = 0;
                }
                refeicao.Hora = refeicao.Hora + ':' + refeicao.Minutos;
                refeicao.DataRefeicao = refeicao.Dia + " " + refeicao.Hora;
                $scope.listaRefeicoesNovasOffline.push(refeicao);
                $window.localStorage.setItem('listaRefeicoesNovas', JSON.stringify(eval($scope.listaRefeicoesNovasOffline)));
                inicializar();
                toast('Refeicao guardada com sucesso', 1);
            }
        };

        //define metodo para guardar refeicao
        $scope.guardarRefeicao = function (refeicao) {
            if (isValid(refeicao)) {
                WebServiceFactory.verificarConexao().success(function () {
                    if (refeicao.Hora == 24) {
                        refeicao.Hora = 0;
                    }
                    refeicao.Hora = refeicao.Hora + ':' + refeicao.Minutos;
                    WebServiceFactory.sincronizarDados();
                    WebServiceFactory.guardarRefeicao(refeicao)
                        .success(function () {
                            inicializar();
                            toast('Refeição guardada com sucesso!', 1);
                        })
                        .error(function (data, status, headers) {
                            toast('Erro a guardar refeição!', 2);
                        });

                }).error(function () {
                    guardarRefeicaoOffline(refeicao);
                });
            }
        };

        var editarRefeicaoOffline = function (refeicao) {
            if ($rootScope.editadaOffline) {
                $scope.listaRefeicoesOffline = new Array();
                if ($window.localStorage.getItem('listaRefeicoesNovas') != null) {
                    if (refeicao.Hora == 24) {
                        refeicao.Hora = 0;
                    }
                    refeicao.Hora = refeicao.Hora + ':' + refeicao.Minutos;
                    refeicao.DataRefeicao = refeicao.Dia + " " + refeicao.Hora;
                    $scope.listaRefeicoesOffline = JSON.parse($window.localStorage.getItem('listaRefeicoesNovas'));
                    $scope.listaRefeicoesOffline.splice($scope.listaRefeicoesOffline.indexOf($rootScope.refeicaoEditar), 1);
                    $scope.listaRefeicoesOffline.push(refeicao);
                    $window.localStorage.setItem('listaRefeicoesNovas', JSON.stringify(eval($scope.listaRefeicoesOffline)));
                    $rootScope.editar = false;
                    $rootScope.editadaOffline = false;
                    delete $rootScope.refeicaoEditar;
                    toast('Refeição editada com sucesso!', 1);
                    inicializar();
                }
            } else {
                $scope.listaRefeicoesEditadasOffline = new Array();
                $scope.diarioAlimentar = new Array();
                $scope.diarioAlimentar = JSON.parse($window.localStorage.getItem('diarioAlimentar'));
                if ($window.localStorage.getItem('listaRefeicoesEditadas') != null) {
                    if (refeicao.Hora == 24) {
                        refeicao.Hora = 0;
                    }
                    refeicao.Hora = refeicao.Hora + ':' + refeicao.Minutos;
                    refeicao.DataRefeicao = refeicao.Dia + " " + refeicao.Hora;
                    $scope.listaRefeicoesEditadasOffline = JSON.parse($window.localStorage.getItem('listaRefeicoesEditadas'));
                    $scope.listaRefeicoesEditadasOffline.splice($scope.listaRefeicoesEditadasOffline.indexOf($rootScope.refeicaoEditar), 1);
                    $scope.listaRefeicoesEditadasOffline.push(refeicao);
                    $window.localStorage.setItem('listaRefeicoesEditadas', JSON.stringify(eval($scope.listaRefeicoesEditadasOffline)));
                    $rootScope.editar = false;
                    $rootScope.editarSubmit = false;
                    $rootScope.editadaVelhaOffline = false;
                    $scope.diarioAlimentar.Refeicoes.splice($scope.diarioAlimentar.Refeicoes.indexOf($rootScope.refeicaoEditar), 1);
                    $window.localStorage.setItem('diarioAlimentar', JSON.stringify(eval($scope.diarioAlimentar)));
                    delete $rootScope.refeicaoEditar;
                    toast('Refeição editada com sucesso!', 1);
                    inicializar();
                } else if ($window.localStorage.getItem('listaRefeicoesEditadas') == null) {
                    if (refeicao.Hora == 24) {
                        refeicao.Hora = 0;
                    }
                    refeicao.Hora = refeicao.Hora + ':' + refeicao.Minutos;
                    refeicao.DataRefeicao = refeicao.Dia + " " + refeicao.Hora;
                    $scope.listaRefeicoesEditadasOffline.push(refeicao);
                    $window.localStorage.setItem('listaRefeicoesEditadas', JSON.stringify(eval($scope.listaRefeicoesEditadasOffline)));
                    $rootScope.editar = false;
                    $rootScope.editarSubmit = false;
                    $rootScope.editadaVelhaOffline = false;
                    $scope.diarioAlimentar.Refeicoes.splice($scope.diarioAlimentar.Refeicoes.indexOf($rootScope.refeicaoEditar), 1);
                    $window.localStorage.setItem('diarioAlimentar', JSON.stringify(eval($scope.diarioAlimentar)));
                    delete $rootScope.refeicaoEditar;
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
                WebServiceFactory.verificarConexao().success(function () {
                    WebServiceFactory.sincronizarDados();
                    if (refeicao.Hora == 24) {
                        refeicao.Hora = 0;
                    }
                    refeicao.Hora = refeicao.Hora + ':' + refeicao.Minutos;
                    WebServiceFactory.editarRefeicaoWeb(refeicao, idLinha)
                        .success(function () {
                            $rootScope.editar = false;
                            $rootScope.editarSubmit = false;
                            delete $rootScope.refeicaoEditar;
                            toast('Refeição editada com sucesso!', 1);
                            $location.path('/easyNutri/consultaDiario');
                        })
                        .error(function (data, status, headers) {
                            toast('Erro a editar refeição!', 2);
                            $rootScope.editar = true;
                        });
                }).error(function () {
                    editarRefeicaoOffline(refeicao);
                });

                console.log(JSON.stringify(refeicao));

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

        //datepicker
        $ionicModal.fromTemplateUrl('templates/datemodal.html',
            function (modal) {
                $scope.datemodal = modal;
            },
            {
                id: 1,
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            }
        );

        $ionicModal.fromTemplateUrl('templates/timemodal.html',
            function (modal) {
                $scope.timemodal = modal;
            },
            {
                id: 2,
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            }
        );

        //método para abrir o datepicker
        $scope.openModal = function (index) {
            if (index == 1) {
                $scope.datemodal.show();
            }
        };

        //método para fechar o datepicker
        $scope.closeModal = function (data) {
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
    });