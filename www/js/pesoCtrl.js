easyNutri.controller('pesoCtrl', ['$scope', '$http', 'WebServiceFactory', '$filter', '$ionicModal', '$ionicPopup', '$ionicLoading', '$rootScope', '$window', '$state',
    function ($scope, $http, WebServiceFactory, $filter, $ionicModal, $ionicPopup, $ionicLoading, $rootScope, $window, $state) {

        if($rootScope.loggedIn != true){
            $state.go('login', {reload: true, inherit: false});
        }

        $scope.reg = {};
        $scope.reg.Dia = new Date();
        $scope.reg.Dia = $filter('date')($scope.reg.Dia, 'yyyy-MM-dd');

        $scope.reg.Hora = "";
        var hora = $filter('date')(new Date(), 'HH:mm');
        var arrayHora = hora.split(':');
        $scope.reg.Hora = parseInt(arrayHora[0]);
        $scope.reg.Minutos = parseInt(arrayHora[1]);

        $scope.peso = {};

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
            var hora = $filter('date')(new Date(), 'HH:mm');
            var diaAtual = $filter('date')(new Date(), 'yyyy-MM-dd');
            var arrayHora = hora.split(':');
            var horaSistema = arrayHora[0];
            var minutosSistema = arrayHora[1];

            if ($scope.reg.Dia == null) {
                mensagem += "Defina o dia; ";
            }

            if ($scope.reg.Hora == "") {
                mensagem += "Defina a hora; ";
            }

            if ($scope.reg.Hora > horaSistema && $scope.reg.Dia >= diaAtual && $scope.reg.Minutos > minutosSistema) {
                mensagem += "A hora é superior à hora do sistema; ";
            }

            if ($scope.reg.Hora > 23 || $scope.reg.Hora < 0) {
                mensagem += "Introduza uma hora entre 0 e 23";
            }

            if ($scope.reg.Minutos == "") {
                mensagem += "Defina os minutos; ";
            }


            if ($scope.reg.Minutos > 60 || $scope.reg.Minutos < 0) {
                mensagem += "Introduza minutos entre 0 e 59; "
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
            var hora = $filter('date')($scope.reg.Dia, 'HH:mm');
            var arrayHora = hora.split(':');
            $scope.reg.Hora = parseInt(arrayHora[0]);
            $scope.reg.Minutos = parseInt(arrayHora[1]);
            $scope.peso = {};
            $scope.peso.Valor = "";
            $scope.tornarVisivel();
        };

        var getRegistosOffline = function () {
            var listaPesosVelhos = JSON.parse($window.localStorage.getItem('listaPesos'));
            var listaPesosNovos = JSON.parse($window.localStorage.getItem('listaPesosNovos'));
            if (listaPesosVelhos != null && listaPesosNovos != null) {
                var a;
                for (a in listaPesosVelhos) {
                    $scope.listaPesos.push(a);

                }

                var pesoNovo;
                for (pesoNovo in listaPesosNovos) {
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
                toast('Não existem registos', 3);
            }
        }

        $scope.getRegistos = function () {
            mostrarSpinner();
            if($rootScope.loggedIn != false){
                WebServiceFactory.verificarConexao().success(function () {
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
                                toast('Não existem registos', 3);
                            }
                        })
                        .error(function (data, status, headers) {
                            if (status == 0) {

                            } else {
                                esconderSpinner();
                                toast('Erro a processar pedido', 2);
                            }
                        });
                }).error(function () {
                    getRegistosOffline();
                });

            }
        }

        $scope.getRegistos();

        var registarPesoOffline = function (peso) {
            var lista = new Array();
            if (JSON.parse($window.localStorage.getItem('listaPesosNovos') != null)) {
                peso.DataMed = $scope.reg.Dia + " " + $scope.reg.Hora + ":" + $scope.reg.Minutos;
                lista = JSON.parse($window.localStorage.getItem('listaPesosNovos'));
                lista.push(peso);
                $window.localStorage.setItem('listaPesosNovos', JSON.stringify(eval(lista)));
                toast('Peso inserido com sucesso', 1);
            } else {
                peso.DataMed = $scope.reg.Dia + " " + $scope.reg.Hora + ":" + $scope.reg.Minutos;
                lista.push(peso);
                $window.localStorage.setItem('listaPesosNovos', JSON.stringify(eval(lista)));
                toast('Peso inserido com sucesso', 1);
            }
            esconderSpinner();
            inicializar();
            $scope.getRegistos();
        }

        $scope.registarPeso = function (peso) {
            if (isValid(peso)) {
                mostrarSpinner();
                peso.DataMed = $scope.reg.Dia + " " + $scope.reg.Hora + ":" + $scope.reg.Minutos;
                peso.TipoMedicaoID = 1;
                peso.EmCasa = 1;
                WebServiceFactory.verificarConexao().success(function () {
                    WebServiceFactory.registarPeso(peso)
                        .success(function () {
                            esconderSpinner();
                            toast('Peso inserido com sucesso', 1);
                            inicializar();
                            $scope.getRegistos();
                        })
                        .error(function (data, status, headers) {
                            esconderSpinner();
                            toast('Erro a registar o peso', 2);
                        });
                }).error(function () {
                    registarPesoOffline(peso);
                });

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
        $scope.closeModal = function (data) {
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