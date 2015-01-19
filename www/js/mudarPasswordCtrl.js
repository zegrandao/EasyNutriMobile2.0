easyNutri.controller('mudarPasswordCtrl', ['$scope', '$http', 'WebServiceFactory', 'modalFactory', '$ionicPopup',
    '$window', '$rootScope', '$ionicLoading',
    function ($scope, $http, WebServiceFactory, modalFactory, $ionicPopup, $window, $rootScope, $ionicLoading) {

        $scope.pass = {};
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
                $ionicPopup.alert({
                    title: 'Aviso',
                    template: mensagem
                });
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

        $scope.hideModal = function(){
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
                    $ionicPopup.alert({
                        title: 'Mudar Password',
                        template: 'Password alterada com sucesso'
                    });

                }).error(function (data, status, header) {
                    esconderSpinner();
                    if (status == 0) {
                        $ionicPopup.alert({
                            title: 'Erro',
                            template: 'Não existe ligação à rede!'
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Erro',
                            template: 'Erro a alterar a password'
                        });
                    }
                });
            }

        };
    }]);