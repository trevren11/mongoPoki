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
Let's put that collection variable we already declared to work. Notice that in the callback function we provided to `MongoClient.connect`, we expect to receive a `db` variable. We will use that to create a `pokemon` collection like so:

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
  
  // Dont Close connection
  // db.close()
});
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
    collection.remove(); // Remove anything that was there before
    collection.insert(pokemon, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "pokemon" collection. The documents inserted with "_id" are:', result.length, result);
      }

      // Dont Close the connection, so we can use it in other routes
      // db.close();
    })
  }
});
```

If we run `npm start` we should expect a log telling us we have an established connection, and a log informing us we've inserted documents.

## Retrieving data

Now we need to have our `get` route use data from the database.

The current code just returns the pokimon array
```js
router.get('/pokemon', function(req, res) {
  console.log("In Pokemon");
  res.send(pokemon);
});
```
Replace it with a call to query the database
```js
router.get('/pokemon', function(req, res) {
  console.log("In Pokemon");
  collection.find().toArray(function(err, result) {
    if(err) {
      console.log(err);
    } else if (result.length) {
      console.log("Query Worked");
      console.log(result);
      res.send(result);
    } else {
      console.log("No Documents found");
    }
  });
});
```
Now we just need to modify the post to put the new pokemon from the form into the database.  We will replace
```js
router.post('/pokemon', function(req, res) {
    console.log("In Pokemon Post");
    console.log(req.body);
    pokemon.push(req.body);
    res.end('{"success" : "Updated Successfully", "status" : 200}');
});
```
with
```js
router.post('/pokemon', function(req, res) {
    console.log("In Pokemon Post");
    console.log(req.body);
    collection.insert(req.body, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "pokemon" collection. The documents inserted with "_id" are:', result.length, result);
        res.end('{"success" : "Updated Successfully", "status" : 200}');
      }
    });
});
```


