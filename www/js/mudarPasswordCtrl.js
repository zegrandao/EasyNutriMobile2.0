easyNutri.controller('mudarPasswordCtrl', ['$scope', '$http', 'WebServiceFactory', 'modalFactory', '$ionicPopup',
    '$window', '$rootScope', '$ionicLoading',
    function ($scope, $http, WebServiceFactory, modalFactory, $ionicPopup, $window, $rootScope, $ionicLoading) {

        $scope.pass = {};

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

        var isValid = function (passwords) {
            var mensagem = "";
            if (passwords.antiga == undefined || passwords.antiga == "") {
                mensagem += "Preencha a password antiga; ";
            }

            if (passwords.nova == undefined || passwords.nova == "") {
                mensagem += "Preencha a password nova; ";
            }

            if (passwords.PasswordConfirma == undefined || passwords.PasswordConfirma == "") {
                mensagem += "Preencha a password para confirmar; ";
            }

            if (passwords.nova != passwords.PasswordConfirma) {
                mensagem += "A password nova e a password de confirmação não são iguais; ";
            }

            if (mensagem != "") {
                toast(mensagem, 2);
                return false;
            }
            return true;
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

        $scope.hideModal = function () {
            $scope.mudarPasswordModal.hide();
        };

        $scope.mudarPassword = function (passwords) {
            if (isValid(passwords)) {
                mostrarSpinner();
                var arrayHash = {};
                var hashNova = CryptoJS.SHA256(passwords.nova);
                hashNova = hashNova.toString(CryptoJS.enc.Hex);
                var hashVelha = CryptoJS.SHA256(passwords.antiga);
                hashVelha = hashVelha.toString(CryptoJS.enc.Hex);
                arrayHash.nova = hashNova;
                arrayHash.antiga = hashVelha;
                WebServiceFactory.mudarPasswordWeb(arrayHash).success(function () {
                    esconderSpinner();
                    var stringDescodificada;

                    if ($rootScope.guardarCredenciais) {
                        stringDescodificada = atob($window.localStorage.getItem('credencial'));
                    } else {
                        stringDescodificada = atob($rootScope.credencial);
                    }

                    var res = stringDescodificada.split(':');
                    var string = res[0] + ":" + hashNova;
                    var stringEncoded = btoa(string);

                    if ($rootScope.guardarCredenciais) {
                        $window.localStorage.setItem('credencial', stringEncoded);
                    } else {
                        $rootScope.credencial = stringEncoded;
                    }

                    $scope.hideModal();
                    toast('Password alterada com sucesso!', 1);

                }).error(function (data, status, header) {
                    esconderSpinner();
                    if (status == 0) {
                        toast('Não está ligado à rede', 3);
                    } else {
                        toast('Erro a alterar a password', 2);
                    }
                });
            }

        };
    }]);