angular.module('easyNutri').factory('modalFactory', function () {

    var modalFactory = {};
    var notif = {};
    var exists = false;

    modalFactory.setNotificacao = function (notificacao) {
        if (notificacao != null) {
            notif = notificacao;
            exists = true;
            return true;
        }

        return false;
    };
    return modalFactory;
});