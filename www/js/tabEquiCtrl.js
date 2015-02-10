easyNutri.controller('tabEquiCtrl', ['$scope', '$window', function ($scope, $window) {

    if ($rootScope.loggedIn != true || $rootScope.mostrarTabela != 1) {
        $state.go('easyNutri.home', {reload: true, inherit: false});
        return false;
    }

            $scope.largura = 100;
            $scope.altura = 100;


            $scope.zoomIn = function () {
                $scope.largura += 10;
                $scope.larguraCont = $scope.largura * 2;
            }

            $scope.zoomOut = function () {
                $scope.largura -= 10;
                $scope.aum = false;
                $scope.larguraCont = $scope.largura / 2;

            }


        }
    ]);

