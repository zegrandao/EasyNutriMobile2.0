angular.module('easyNutri').factory('WebServiceFactory', function ($http, $window, $rootScope, $ionicPopup) {

    var WebServiceFactory = {};

    var error = false;
    /* url debug */
    var urlBase = 'http://192.168.246.64/easynutriapi2/api/';
///* url produção */
//    var urlBase = 'http://dei.estg.ipleiria.pt/projetos/easynutri/api/api/';

    WebServiceFactory.checkCredencial = function () {
        if ($rootScope.loggedIn) {
            if ($rootScope.guardarCredenciais) {
                return $window.localStorage.getItem('credencial');
            } else {
                return $rootScope.credencial;
            }
        }
    };


    WebServiceFactory.getNotificacoes = function () {
        console.log("entrou");
        var cred = WebServiceFactory.checkCredencial();
        return $http.get(urlBase + 'notificacoes', {
            headers: {
                'Authorization': 'Basic ' + cred
            }
        });
    };


    WebServiceFactory.getRegistosPeso = function () {
        var cred = WebServiceFactory.checkCredencial();
        return $http.get(urlBase + 'DadosAntropometricos', {
            headers: {
                'Authorization': 'Basic ' + cred
            }
        });
    };

    WebServiceFactory.registarPeso = function (peso) {
        var cred = WebServiceFactory.checkCredencial();
        return $http({
            method: 'POST',
            url: urlBase + 'DadosAntropometricos',
            data: JSON.stringify(peso),
            headers: {
                'Authorization': 'Basic ' + cred
            }
        });
    };

    WebServiceFactory.verificarConexao = function () {
        return $http.get(urlBase + 'VerificarConexao');
    };

    WebServiceFactory.alterarEstadoNotificacao = function (idNotificacao) {
        var cred = WebServiceFactory.checkCredencial();
        return $http({
            method: 'PUT',
            url: urlBase + 'notificacoes?idNotificacao=' + idNotificacao,
            headers: {
                'Authorization': 'Basic ' + cred
            }
        });
    }

    WebServiceFactory.getAlimentos = function () {
//        return $http.get(urlBase + 'getAlimentos');
        var cred = WebServiceFactory.checkCredencial();
        return $http.get(urlBase + 'Alimentos',
            {
                headers: {
                    'Authorization': 'Basic ' + cred
                }
            });
    };

    WebServiceFactory.getTiposRefeicao = function () {
        return [
            {
                'Id': 1,
                'Descricao': 'Pequeno-Almoço'
            },
            {
                'Id': 2,
                'Descricao': 'Lanche-Manhã'
            },
            {
                'Id': 3,
                'Descricao': 'Almoço'
            },
            {
                'Id': 4,
                'Descricao': 'Lanche-Tarde'
            },
            {
                'Id': 5,
                'Descricao': 'Jantar'
            },
            {
                'Id': 6,
                'Descricao': 'Ceia'
            },
            {
                'Id': 7,
                'Descricao': 'Snack/Outro'
            }
        ]
    };

    WebServiceFactory.guardarRefeicao = function (refeicao) {
        var cred = WebServiceFactory.checkCredencial();
        for ($i = 0; $i < refeicao.listaAlimentos.length; $i++) {
            delete refeicao.listaAlimentos[$i]['$$hashKey'];
            delete refeicao.listaAlimentos[$i]['Porcoes'];
        }
        return $http({
            method: 'POST',
            url: urlBase + 'Refeicoes',//guardar
            data: JSON.stringify(refeicao),
            headers: {
                'Authorization': 'Basic ' + cred
            }
        });

    };

    WebServiceFactory.userLogin = function (username, hash) {
        return $http({
            method: 'GET',
            url: urlBase + 'Login?username=' + username + '&hash=' + hash
        });
    };

    WebServiceFactory.editarRefeicaoWeb = function (refeicao, idLinha) {
        var cred = WebServiceFactory.checkCredencial();
        if (!$rootScope.editadaOffline || !$rootScope.editadaVelhaOffline) {
            for ($i = 0; $i < refeicao.listaAlimentos.length; $i++) {
                delete refeicao.listaAlimentos[$i]['$$hashKey'];
                delete refeicao.listaAlimentos[$i]['Porcoes'];
            }
        }
        return $http({
            method: 'PUT',
            url: urlBase + 'Refeicoes?idLinha=' + idLinha,//guardar
            data: JSON.stringify(refeicao),
            headers: {
                'Authorization': 'Basic ' + cred
            }
        });
    };

    WebServiceFactory.removerRefeicaoWeb = function (refeicaoId) {
        var cred = WebServiceFactory.checkCredencial();
        return $http({
            method: 'DELETE',
            url: urlBase + 'Refeicoes?refeicaoId=' + refeicaoId,
            headers: {
                'Authorization': 'Basic ' + cred
            }
        });
    }

    WebServiceFactory.getDiarioAlimentar = function (data) {
        var cred = WebServiceFactory.checkCredencial();
        return $http.get(urlBase + "Refeicoes?dataDiario=" + data,
            {
                headers: {
                    'Authorization': 'Basic ' + cred
                }
            });
    }

    WebServiceFactory.mudarPasswordWeb = function (arrayHash) {
        var cred = WebServiceFactory.checkCredencial();
        return $http({
            method: 'PUT',
            url: urlBase + 'Utentes',
            data: JSON.stringify(arrayHash),
            headers: {
                'Authorization': 'Basic ' + cred
            }
        });
    }

    WebServiceFactory.getPlanoAlimentar = function () {
        var cred = WebServiceFactory.checkCredencial();
        return $http.get(urlBase + "PlanoAlimentar", {
            headers: {
                'Authorization': 'Basic ' + cred
            }
        });
    };

    WebServiceFactory.sincronizarDados = function () {

        var credencial = WebServiceFactory.checkCredencial();
        if (credencial != null) {
            if ($window.localStorage.getItem('listaRefeicoesNovas') != null) {
                var listaRefeicoesNovas = JSON.parse($window.localStorage.getItem('listaRefeicoesNovas'));
                for (var $n = 0; $n < listaRefeicoesNovas.length; $n++) {
                    WebServiceFactory.guardarRefeicao(listaRefeicoesNovas[$n]).success(function () {
                        listaRefeicoesNovas.splice($n, 1);
                    }).error(function (status) {
                        if (status == 0) {
                            error = true;
                        }

                    });
                    if (error) {
                        error = false;
                        break;
                    }
                }
                if (listaRefeicoesNovas.length == 0) {
                    $window.localStorage.removeItem('listaRefeicoesNovas');
                }

            }

            if ($window.localStorage.getItem('listaRefeicoesEditadas') != null) {
                var listaRefeicoesEditadas = JSON.parse($window.localStorage.getItem('listaRefeicoesEditadas'));
                console.log('JSON sincronizar dados: ' + JSON.stringify(listaRefeicoesEditadas));
                for (var $e = 0; $e < listaRefeicoesEditadas.length; $e++) {
                    var idLinha = listaRefeicoesEditadas[$e].idRefeicao;
                    WebServiceFactory.editarRefeicaoWeb(listaRefeicoesEditadas[$e], idLinha).success(function () {
                        listaRefeicoesEditadas.splice($e, 1);
                    }).error(function (status) {
                        if (status == 0) {
                            error = true;
                        }

                    });
                    if (error) {
                        error = false;
                        break;
                    }
                }
                if (listaRefeicoesEditadas.length == 0) {
                    $window.localStorage.removeItem('listaRefeicoesEditadas');
                }

            }

            if ($window.localStorage.getItem('listaRefeicoesRemovidas') != null) {
                var listaRefeicoesRemovidas = JSON.parse($window.localStorage.getItem('listaRefeicoesRemovidas'));

                for (var $r = 0; $r < listaRefeicoesRemovidas.length; $r++) {
                    if (listaRefeicoesRemovidas[$r].idRefeicao == undefined) {
                        var id = listaRefeicoesRemovidas[$r].Id;
                        WebServiceFactory.removerRefeicaoWeb(listaRefeicoesRemovidas[$r].Id).success(function () {
                            listaRefeicoesRemovidas.splice($r, 1);
                        }).error(function (status) {

                            if (status == 0) {
                                error = true;
                            }
                        });
                    } else {
                        WebServiceFactory.removerRefeicaoWeb(listaRefeicoesRemovidas[$r].idRefeicao).success(function () {
                            listaRefeicoesRemovidas.splice($r, 1);
                        }).error(function (status) {

                            if (status == 0) {
                                error = true;
                            }
                        });
                    }
                    if (error) {
                        error = false;
                        break;
                    }
                }
                if (listaRefeicoesRemovidas.length == 0) {
                    $window.localStorage.removeItem('listaRefeicoesRemovidas');
                }

            }

            if ($window.localStorage.getItem('listaPesosNovos') != null) {
                var listaPesos = JSON.parse($window.localStorage.getItem('listaPesosNovos'));
                for (var $p = 0; $p < listaPesos.length; $p++) {
                    WebServiceFactory.registarPeso(listaPesos[$p]).success(function () {
                        listaPesos.splice($p, 1);
                    }).error(function (status) {

                        if (status == 0) {
                            error = true;
                        }
                    });
                    if (error) {
                        error = false;
                        break;
                    }
                }
                if (listaPesos.length == 0) {
                    $window.localStorage.removeItem('listaPesosNovos');
                }
            }

            if ($window.localStorage.getItem('listaNotificacoesLidas') != null) {
                var listaNotificacoes = JSON.parse($window.localStorage.getItem('listaNotificacoesLidas'));
                for (var $n = 0; $n < listaNotificacoes.length; $n++) {
                    WebServiceFactory.alterarEstadoNotificacao(listaNotificacoes[$n].Id).success(function () {
                        listaNotificacoes.splice($n, 1);
                    }).error(function (status) {
                        if (status == 0) {
                            error = true;
                        }
                    });
                    if (error) {
                        error = false;
                        break;
                    }
                }
                if (listaNotificacoes.length == 0) {
                    $window.localStorage.removeItem('listaNotificacoesLidas');
                }
            }

        }

    };
    return WebServiceFactory;
});