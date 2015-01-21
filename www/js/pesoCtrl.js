easyNutri.controller('pesoCtrl', ['$scope', '$http', 'WebServiceFactory', '$filter', '$ionicModal', '$ionicPopup', '$ionicLoading', '$rootScope', '$window', '$state',
    function ($scope, $http, WebServiceFactory, $filter, $ionicModal, $ionicPopup, $ionicLoading, $rootScope, $window, $state) {

        if($rootScope.loggedIn != true){
            $state.go('login', {reload: true, inherit: false});
        }

        $scope.reg = {};
        $scope.reg.Dia = new Date();
        $scope.reg.Dia = $filter('date')($scope.reg.Dia, 'yyyy-MM-dd');

        $scope.reg.Hora = "";
        $scope.reg.Hora = $filter('date')(new Date(), 'HH:mm');

        $scope.peso = {};

        var patternPeso = /^[0-9]{1,3}(\.[0-9])?$/;
        var patternHora = /^[0-9]{1,2}\:[0-9]{2}$/;

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

        var isValid = function (peso) {
            var mensagem = "";
            var horaSistema = $filter('date')(new Date(), 'HH:mm');
            if ($scope.reg.Dia == null) {
                mensagem += "Defina o dia; ";
            }

            if ($scope.reg.Hora == "") {
                mensagem += "Defina a hora; ";
            }

            if ($scope.reg.Hora > horaSistema) {
                mensagem += "A hora é superior à hora do sistema; ";
            }

            if (!patternHora.test($scope.reg.Hora)) {
                mensagem += "Formato incorreto da hora. Exemplo: 23:15; ";
            }

            if (peso.Valor == "") {
                mensagem += "Defina o peso; ";
            }

            if (!patternPeso.test(peso.Valor) || peso.Valor.indexOf(',') !== -1) {
                mensagem += "Formato incorreto do valor do peso. Exemplo: 75.5; ";
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

        $scope.tornarVisivel = function () {
            if (document.getElementById("campoValor").value == "") {
                document.getElementById("botaoRegistar").style.display = 'none';
            } else {
                document.getElementById("botaoRegistar").style.display = 'block';
            }
        };

        var inicializar = function () {
            $scope.reg = {};
            $scope.reg.Dia = new Date();
            $scope.reg.Dia = $filter('date')($scope.reg.Dia, 'yyyy-MM-dd');
            $scope.reg.Hora = new Date();
            $scope.reg.Hora = $filter('date')($scope.reg.Hora, 'HH:mm');
            $scope.peso = {};
            $scope.peso.Valor = "";
            $scope.tornarVisivel();
        };

        $scope.getRegistos = function () {
            mostrarSpinner();
            if($rootScope.loggedIn != false){
                if (!$rootScope.offline) {
                    WebServiceFactory.getRegistosPeso()
                        .success(function(lista) {
                            if (lista != null) {
                                esconderSpinner();
                                var item;
                                for (item in lista) {
                                    lista[item].DataMed = $filter('date')(lista[item].DataMed, 'yyyy-MM-dd HH:mm');
                                    lista[item].tipoRegisto = (lista[item].EmCasa == "0") ? "Consulta" : "Casa";
                                }
                                $scope.listaPesos = lista;
                                $window.localStorage.setItem('listaPesos', JSON.stringify(eval(lista)));
                            } else {
                                esconderSpinner();
                                $ionicPopup.alert({
                                    title: 'Aviso',
                                    template: 'Não existem registos de pesos!'
                                });
                            }
                        })
                        .error(function (data, status, headers) {
                            if (status == 0) {
                                var listaPesosVelhos = JSON.parse($window.localStorage.getItem('listaPesos'));
                                var listaPesosNovos = JSON.parse($window.localStorage.getItem('listaPesosNovos'));
                                if (listaPesosVelhos != null && listaPesosNovos != null) {
                                    for (var a in listaPesosVelhos) {
                                        $scope.listaPesos.push(a);

                                    }

                                    for (var pesoNovo in listaPesosNovos) {
                                        $scope.listaPesos.push(pesoNovo);
                                    }
                                    esconderSpinner();

                                } else if (listaPesosVelhos != null && listaPesosNovos == null) {
                                    $scope.listaPesos = listaPesosVelhos;
                                    esconderSpinner();

                                } else if (listaPesosVelhos == null && listaPesosNovos != null) {
                                    $scope.listaPesos = listaPesosNovos;
                                    esconderSpinner();

                                } else {
                                    esconderSpinner();
                                    $ionicPopup.alert({
                                        title: 'Aviso',
                                        template: 'Não existem registos de pesos!'
                                    });
                                }
                            } else {
                                esconderSpinner();
                                $ionicPopup.alert({
                                    title: 'Erro',
                                    template: 'Erro a processar pedido de pesos!'
                                });
                            }
                        });
                } else {
                    var listaPesosVelhos = JSON.parse($window.localStorage.getItem('listaPesos'));
                    var listaPesosNovos = JSON.parse($window.localStorage.getItem('listaPesosNovos'));
                    if (listaPesosVelhos != null && listaPesosNovos != null) {
                        for (var a in listaPesosVelhos) {
                            $scope.listaPesos.push(a);

                        }

                        for (var pesoNovo in listaPesosNovos) {
                            $scope.listaPesos.push(pesoNovo);
                        }
                        esconderSpinner();

                    } else if (listaPesosVelhos != null && listaPesosNovos == null) {
                        $scope.listaPesos = listaPesosVelhos;
                        esconderSpinner();

                    } else if (listaPesosVelhos == null && listaPesosNovos != null) {
                        $scope.listaPesos = listaPesosNovos;
                        esconderSpinner();

                    } else {
                        esconderSpinner();
                        $ionicPopup.alert({
                            title: 'Aviso',
                            template: 'Não existem registos de pesos!'
                        });
                    }
                }
            }
        }

        $scope.getRegistos();

        $scope.registarPeso = function (peso) {
            if (isValid(peso)) {
                mostrarSpinner();
                peso.DataMed = $scope.reg.Dia + " " + $scope.reg.Hora;
                peso.TipoMedicaoID = 1;
                peso.EmCasa = 1;
                if (!$rootScope.offline) {
                    WebServiceFactory.registarPeso(peso)
                        .success(function () {
                            esconderSpinner();
                            $ionicPopup.alert({
                                title: 'Sucesso',
                                template: 'Peso inserido com sucesso'
                            });
                            inicializar();
                            $scope.getRegistos();
                        })
                        .error(function (data, status, headers) {
                            if (status == 0) {
                                var lista = new Array();
                                if (JSON.parse($window.localStorage.getItem('listaPesosNovos') != null)) {
                                    lista = JSON.parse($window.localStorage.getItem('listaPesosNovos'));
                                    lista.push(peso);
                                    $window.localStorage.setItem('listaPesosNovos', JSON.stringify(eval(lista)));
                                    $ionicPopup.alert({
                                        title: 'Sucesso',
                                        template: 'Peso inserido com sucesso'
                                    });
                                } else {
                                    lista.push(peso);
                                    $window.localStorage.setItem('listaPesosNovos', JSON.stringify(eval(lista)));
                                    $ionicPopup.alert({
                                        title: 'Sucesso',
                                        template: 'Peso inserido com sucesso'
                                    });
                                }
                                esconderSpinner();
                                inicializar();
                                $scope.getRegistos();
                            } else {
                                esconderSpinner();
                                $ionicPopup.alert({
                                    title: 'Erro',
                                    template: 'Erro a guardar peso!'
                                });
                            }
                        });
                } else {
                    var lista = new Array();
                    if (JSON.parse($window.localStorage.getItem('listaPesosNovos') != null)) {
                        lista = JSON.parse($window.localStorage.getItem('listaPesosNovos'));
                        lista.push(peso);
                        $window.localStorage.setItem('listaPesosNovos', JSON.stringify(eval(lista)));
                        $ionicPopup.alert({
                            title: 'Sucesso',
                            template: 'Peso inserido com sucesso'
                        });
                    } else {
                        lista.push(peso);
                        $window.localStorage.setItem('listaPesosNovos', JSON.stringify(eval(lista)));
                        $ionicPopup.alert({
                            title: 'Sucesso',
                            template: 'Peso inserido com sucesso'
                        });
                    }
                    esconderSpinner();
                    inicializar();
                    $scope.getRegistos();
                }
            }
        };

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
                $scope.reg.Dia = data;
            } else {
                $ionicPopup.alert({
                    title: 'Aviso',
                    template: 'Escolheu uma data superior à do sistema'
                })
            }
        };
    }]);