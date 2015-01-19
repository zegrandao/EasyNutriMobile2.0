angular.module('easyNutri').factory('TiposRefeicaoFactory', function () {

    var tiposRefeicao = [
        {'Id': 1, 'Descricao': 'Pequeno-Almoço' },
        {'Id': 2, 'Descricao': 'Lanche-Manhã' },
        {'Id': 3, 'Descricao': 'Almoço' },
        {'Id': 4, 'Descricao': 'Lanche-Tarde' },
        {'Id': 5, 'Descricao': 'Jantar' },
        {'Id': 6, 'Descricao': 'Ceia'},
        {'Id': 7, 'Descricao': 'Snack/Outro' }
    ];

    return {
        all: function () {
            return tiposRefeicao;
        },
        get: function (refeicaoId) {
            for ($i = 0; $i < tiposRefeicao.length; $i++) {
                if (tiposRefeicao[$i].Id == refeicaoId) {
                    return tiposRefeicao[$i];
                    break;
                }
            }
            return null;
        }
    }
});

