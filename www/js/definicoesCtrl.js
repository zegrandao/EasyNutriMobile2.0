easyNutri.controller('definicoesCtrl', function ($scope, $ionicSideMenuDelegate, $rootScope, $window, $ionicModal, $ionicPopup, $state) {


    if($rootScope.loggedIn != true){
        $state.go('login', {reload: true, inherit: false});
    }

    $scope.numero = "";
    $scope.paginaInicial = "";
    $scope.arrayPaginas = [
        {'Id': 1, 'nomePagina': 'consultaDiario'},
        {'Id': 2, 'nomePagina': 'planoAlimentar'},
        {'Id': 3, 'nomePagina': 'novaRefeicao'},
        {'Id': 4, 'nomePagina': 'notificacoes'},
        {'Id': 5, 'nomePagina': 'peso'},
        {'Id': 6, 'nomePagina': 'home'}
    ];


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
        if (!$rootScope.offline) {
            $scope.mudarPasswordModal.show();
        } else {
            $ionicPopup.alert({
                title: 'Erro',
                template: 'A aplicação está em modo offline!'
            });
        }
    };


    var getNomePagina = function (idPagina) {
        for ($i = 0; $i < $scope.arrayPaginas.length; $i++) {
            if (idPagina == $scope.arrayPaginas[$i].Id) {
                return $scope.arrayPaginas[$i].nomePagina;
                break;
            }
        }

    };


    var getIdPagina = function (nome) {
        for ($i = 0; $i < $scope.arrayPaginas.length; $i++) {
            if (nome == $scope.arrayPaginas[$i].nomePagina) {
                return $scope.arrayPaginas[$i].Id;
                break;
            }
        }
    };


    if ($window.localStorage.getItem('pagina') != null) {
        var nome = $window.localStorage.getItem('pagina');
        var idPagina = getIdPagina(nome);
        $scope.pagina = idPagina;
    }


    var isValidPagina = function (paginaInicial) {
        var mensagem = "";
        if (paginaInicial == "" || paginaInicial == undefined) {
            mensagem += "Tem que definir uma pagina inicial; ";
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


    var isValidNumero = function (numero) {
        var mensagem = "";

        if (numero != "") {
            if (numero < 5 || numero > 15) {
                mensagem += "Escolha um número entre 5 e 15; ";
            }

            if (mensagem != "") {
                $ionicPopup.alert({
                    title: 'Aviso',
                    template: mensagem
                });
                return false;
            }
        }
        return true;
    };

    $scope.alterarHome = function (paginaInicial) {
        if (isValidPagina(paginaInicial)) {
            var pagina = getNomePagina(paginaInicial);
            $window.localStorage.setItem('pagina', pagina);
        }
    };


    $scope.alterarNumero = function (numero) {
        if (isValidNumero(numero)) {
            $window.localStorage.setItem('numeroPesquisa', numero);
        }
    };
});