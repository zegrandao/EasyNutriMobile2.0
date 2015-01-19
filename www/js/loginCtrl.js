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
                    $ionicPopup.alert({
                        title: 'Login',
                        template: 'Login efetuado com sucesso'
                    });
                    $scope.loginModal.hide();
                    $scope.user = {};
                    esconderSpinner();
                    $state.go('easyNutri.home', {}, {reload: true, inherit: false});
                }).error(function (data, status, headers) {
                    esconderSpinner();
                    if (status == 0) {
                        $ionicPopup.alert({
                            title: 'Erro',
                            template: 'Não existe ligação à rede!'
                        });
                    } else {
                        esconderSpinner();
                        $ionicPopup.alert({
                            title: 'Erro',
                            template: 'Username ou Password incorreto!'
                        });
                    }

                });
            }
            ;
        };
    }]);