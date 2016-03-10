# angularNodeMongoPoki
Simple introduction to attaching a mongo database to a angular-node project

We will start with a simple angular application that talks to a node back end.  We went through this tutorial before, but you may want to clone this repository to get started
<pre>
git clone https://github.com/mjcleme/angularNodeMongoPoki
cd angularNodeMongoPoki
npm install
npm start
</pre>

And make sure the application displays pokemon defined in the routes/index.js back end.

## What about saving a new pokimon?

First add a form to the public/index.html file.
```
<h1> Enter A New Poki</h1>
  <form id="newPoki" ng-submit="addPoki()">
    Name: <input type="text" ng-model="Name" value=""><br>
    Url: <input type="url" ng-model="Url" value=""><br>
    <input type="submit" value="Submit">
  </form>
```

And add the function to execute on the submit
```javascript
    $scope.addPoki = function() {
      var formData = {name:$scope.Name,avatarUrl:$scope.Url};
      console.log(formData);
      pokemonFetcher.post(formData); // Send the data to the back end
      $scope.pokemon.push(formData); // Update the model
    }
```
And we need the pokemonFetcher post function
```javascript
    post: function (formData) {
      return $http
         .post(API_ROOT,formData)
         .then(function (resp) {
           console.log("Post worked");
         })
    } 
```
And now we need to build the back end.  We have created an object that should be pushed directly into the array on the back end.  Once we update the array, it should be permanent even if you refresh the browser.  Edit routes/index.js
```javascript
router.post('/pokemon', function(req, res) {
    console.log("In Pokemon Post");
    console.log(req.body);
    pokemon.push(req.body);
    res.end('{"success" : "Updated Successfully", "status" : 200}');
}); 
```
## Connecting to MongoDB

##### 1. Get access to MongoDB in our javascript
We will need to use npm here to install the javascript library that helps us communicate with mongodb. 

`npm install --save mongodb`

Now, add the module to your routes/index.js file

```js
var mongodb = require('mongodb');
```

##### 2. Open a connection

Next we will open a connection to mongodb using our snazzy new javascript library. Feel free to paste the following right underneath where we declare the `mongodb` variable.

```js
// We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var dbUrl = 'mongodb://localhost:27017/pokemon';

// we will use this variable later to insert and retrieve a "collection" of data
var collection

// Use connect method to connect to the Server
MongoClient.connect(dbUrl, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    // HURRAY!! We are connected. :)
    console.log('Connection established to', dbUrl);
    
    /**
     * TODO: insert data here, once we've successfully connected
     */
  }
});

```

Go ahead and run `npm start` in your terminal again, and you should expect to see the `connection established` log.

## Inserting data

##### 1. Make a 'pokemon' collection
Let's put that collection variable we already declared to work. Notice that in the callback funciont we provided to `MongoClient.connect`, we expect to receive a `db` variable. We will use that to create a `pokemon` collection like so:

```js
collection = db.collection('pokemon');
```
##### 2. Insert data
Now we will use that collection object to insert the array `pokemon` like so:

```js
// do some work here with the database.
collection = db.collection('pokemon');

collection.insert(pokemon, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log('Inserted documents into the "pokemon" collection. The documents inserted with "_id" are:', result.length, result);
  }
  
  // Close connection
  db.close()
}
```

All said and done our code connecting to the db and inserting our array of pokemon into the database should look something like the following:

```js
// Use connect method to connect to the Server
MongoClient.connect(dbUrl, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    // HURRAY!! We are connected. :)
    console.log('Connection established to', dbUrl);

    // do some work here with the database.
    collection = db.collection('pokemon');
    collection.insert(pokemon, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "pokemon" collection. The documents inserted with "_id" are:', result.length, result);
      }

      // Close connection
      db.close();
    })
  }
});
```

If we run `npm start` we should expect a log telling us we have an established connection, and a log informing us we've inserted documents.

## Retrieving data

Sadly, if we look in our browser, we still only see red. That's because we aren't returning any data when the pathname is `/pokemon`. We want to return this data from the mongo database.

##### 1. Define callback that will receive data from the db

Inside the callback function where we create our server, underneat the `TODO` comment, let's add the following optimistic funciton:

```js

/**
 * TODO: return pokemon data stored in mongodb
 */

getPokemonFromDb(function (data) {
  res.writeHead(200)
  res.end(JSON.stringify(data))
})

```
This will throw an error if we try to run it because we haven't defined a function named `getPokemonFromDb`. It is good practice though to define _how_ you want to use code you haven't written yet. This promotes better quality code.

##### 2. Define `getPokemonFromDb`

Just above the line with `http.createServer` let's place the following:

```js
function getPokemonFromDb (donOnSuccess) {
  MongoClient.connect(dbUrl, function (err, db) {

    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {

      // Get the documents collection
      var collection = db.collection('pokemon');

      // Get all pokemon from mongodb
      collection.find({}).toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
          donOnSuccess(result)
        } else {
          console.log('No document(s) found with defined "find" criteria!');
        }
        // Close connection
        db.close();
      });
    }
  });
}
```

Now if we run our server (`node api-server.js`) and view the results in the browser, we should expect to see a blue screen with our pokemon gifs running in the view. 

NOTE: If you have run `api-server.js` multiple times since adding the code to insert data into mongo, there will be duplicates of the pokemon data. This demonstrates that the data is persisting between server runs. Because we are not removing data, we add our array of pokemon to the previous inserts each time we execute the code. This will result in more and more pokemon showing up every time the `api-server.js` is run.

For additional learning, you can try to clear the pokemon collection before inserting each time. The method for this is `.remove` and would look similar to `.insert`

