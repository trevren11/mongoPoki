var app = window.angular.module('app', [])

app.factory('pokemonFetcher', pokemonFetcher)
app.controller('mainCtrl', mainCtrl)

function pokemonFetcher($http) {

  var API_ROOT = 'pokemon'
  return {
    get: function () {
      return $http
        .get(API_ROOT)
        .then(function (resp) {
          return resp.data
        })
    },
    post: function (formData) {
      return $http
        .post(API_ROOT, formData)
        .then(function (resp) {
          console.log("Post worked");
        })
    }
  }
}

function mainCtrl($scope, pokemonFetcher) {

  $scope.pokemon = []

  pokemonFetcher.get()
    .then(function (data) {
      $scope.pokemon = data
    })

  $scope.addPoki = function () {
    var formData = { name: $scope.Name, avatarUrl: $scope.Url };
    console.log(formData);
    pokemonFetcher.post(formData); // Send the data to the back end
    $scope.pokemon.push(formData); // Update the model
  }
}
