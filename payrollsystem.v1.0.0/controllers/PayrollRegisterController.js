 var json = require('res-json');
var mongodb = require('mongodb');
var serviceUrl = "mongodb://localhost:27017";
// connect to db
var MongoClient = mongodb.MongoClient;

exports.List = function(request, response)
{
	MongoClient.connect(serviceUrl, function(error, client)
	{
		if(error) throw error;
		var db = client.db('payrollsystem');
		db.collection('employees', function(error, collection)
		{
			collection.find().toArray(function(error, result)
			{
				if(error) throw error;
				
				response.json(result);
			});
		});

	});
};