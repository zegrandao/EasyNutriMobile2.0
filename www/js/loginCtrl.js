easyNutri.controller('loginCtrl', ['$scope', '$http', 'WebServiceFactory', 'modalFactory', '$ionicPopup', '$ionicModal', '$location', '$window', '$rootScope', '$state', '$ionicLoading', '$interval',
    function ($scope, $http, WebServiceFactory, modalFactory, $ionicPopup, $ionicModal, $location, $window, $rootScope, $state, $ionicLoading, $interval) {

        $scope.user = {};
        $rootScope.guardarCredenciais = false;

        var nomePagina = $window.localStorage.getItem('pagina');

        if (nomePagina == undefined) {
            nomePagina = 'home';
        }

        if ($window.localStorage.getItem('credencial') != null) {
            $rootScope.loggedIn = true;
            $rootScope.guardarCredenciais = true;
            $state.go('easyNutri.' + nomePagina, {reload: true, inherit: false});
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

        var isValid = function (user) {
            var mensagem = "";

            if (user.Username == undefined && user.Password == undefined || user.Username == "" && user.Password == "" ||
                user.Username == "" && user.Password == undefined || user.Username == undefined && user.Password == "") {
                mensagem += "Preencha os dados de login!"
            } else if (user.Username == undefined || user.Username == "") {
                mensagem += "Username vazio;";
            } else if (user.Password == undefined || user.Password == "") {
                mensagem += "Password vazia;";
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

        $scope.login = function (user) {
            if (isValid(user)) {
                mostrarSpinner();
                var hash = CryptoJS.SHA256(user.Password);
                hash = hash.toString(CryptoJS.enc.Hex);
                var string = user.Username + ":" + hash;
                var stringEncoded = btoa(string);
                user.Username = user.Username.trim();
                WebServiceFactory.userLogin(user.Username, hash).success(function () {
                    if (user.save) {
                        $window.localStorage.setItem('credencial', stringEncoded);
                        $rootScope.guardarCredenciais = true;
                    } else {
                        $rootScope.credencial = stringEncoded;
                    }
                    $rootScope.loggedIn = true;
                    toast('Login efetuado com sucesso', 1);
                    $scope.loginModal.hide();
                    $scope.user = {};
                    esconderSpinner();
                    $state.go('easyNutri.home', {}, {reload: true, inherit: false});
                }).error(function (data, status, headers) {
                    esconderSpinner();
                    if (status == 0) {
                        toast('Não existe ligação à rede!', 2);
                    } else {
                        esconderSpinner();
                        toast('Username ou Password incorreto!', 2);
                    }

                });
            }
            ;
        };
    }]);