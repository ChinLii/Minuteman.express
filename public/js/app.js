

var app = angular.module('minuteApp', []);


app.controller('myController', function ($scope, $http,$window) {
    $scope.data = [];
    var request = $http.get('/data/allminutes');
    request.success(function (data) {
        $scope.data = data;
    });
    request.error(function (data) {
        console.log('Error: ' + data);
    });

    $scope.deleteMinute = function (id) {
        var res = confirm("Do you want to DELETE this minute ?");
        if(res == true){
            var json = {
                id: String
            }
            json.id = id;
            $http.post("/api/delete", json).success(function (responseData) {
                json = null;
                $window.alert(responseData.message);
                $window.location.replace("/");
            });
            }else{
                                                                                     
        }
    }
});

app.filter('dateFormat',function(){
    return function(date){
        //var options = {weekday:'long',year: 'numeric',month: 'long', day: '2-digit',hour: '2-digit',minute:'2-digit',second:'2-digit'};
        //var reformatDate = new Date(date).toLocaleString();
        var reformatDate = moment(date).format('LLLL');
        return reformatDate;
    }
})

app.controller('adminController',function($scope,$http,$window){
    $scope.data = [];
    var request = $http.get('/data/adminAllMinutes');
    request.success(function (data) {
        $scope.data = data;
    });
    request.error(function (data) {
        console.log('Error: ' + data);
    });
    $scope.deleteMinute = function (id) {
        var json = {
            id: String
        }
        json.id = id;
        $http.post("/api/delete", json).success(function (responseData) {
            //do stuff with response
            json = null;
            $window.alert(responseData.message);
            $window.location.replace("/");
        });
    }
})

