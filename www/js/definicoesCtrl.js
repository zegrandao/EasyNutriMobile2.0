easyNutri.controller('definicoesCtrl', function ($scope, $ionicSideMenuDelegate, $rootScope, $window, $ionicModal, $ionicPopup, $state) {


    if ($rootScope.loggedIn != true) {
        $state.go('easyNutri.home', {reload: true, inherit: false});
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

    $scope.numero = "";


    if ($window.localStorage.getItem('numeroPesquisa') !== null) {
        $scope.numero = parseInt($window.localStorage.getItem('numeroPesquisa'));
    } else {
        $scope.numero = 5;
    }


    $ionicModal.fromTemplateUrl('templates/mudarPassword.html', function ($ionicModal) {
        },
        {
            scope: $scope,
            animation: 'slide-in-up',
            focusFirstInput: true

        }).then(function ($ionicModal) {
            $scope.mudarPasswordModal = $ionicModal;
        });


    $scope.abrirMudarPasswordModal = function () {
        $scope.mudarPasswordModal.show();
    };


    var isValidNumero = function (numero) {
        var mensagem = "";

        if (numero != "") {
            if (numero < 5 || numero > 15) {
                mensagem += "Escolha um número entre 5 e 15; ";
            }

            if (mensagem != "") {
                toast(mensagem, 2);
                return false;
            }
        }
        return true;
    };


    $scope.alterarNumero = function (numero) {
        if (isValidNumero(numero)) {
            $window.localStorage.setItem('numeroPesquisa', numero);
        }
    };
});