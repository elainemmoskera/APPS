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

exports.Add = function(request, response)
{
	var body = request.body;
	MongoClient.connect(serviceUrl, function(error, client)
	{
		if(error) throw error;
		var db = client.db('payrollsystem');
		var deductions = body.deductions;
		//taxes
		db.collection('taxes', function(error, collection)
		{
			var taxes = collection.find().toArray();
			for(var item in taxes)
			{
				for(var val in item.sets)
				{
					var inner = {};
					if(((val.min == 0 && val.max == 0) || (val.min == 0 && body.basicPay <= val.max) || (val.max == 0 && body.basicPay > val.min))
						|| ((val.min != 0 || val.max != 0) && ((body.basicPay <= val.max) && (body.basicPay > val.min))))
					{
						inner.name = item.name;
						inner.ee = val.ee;
						inner.total = (val.ee/100) * body.basicPay;
						inner.active = true;
						deductions.push(inner);
						console.log(deductions);
					}
				}
			}

		});

		db.collection('employees', function(error, collection)
		{
			//body.deductions.concat(deductions);
			//console.log(deductions);
			collection.insert({"employeeId" : body.employeeId,
								"name": body.name,
								"basicPay": body.basicPay,
								"allowances": body.allowances,
								"deductions": body.deductions,
								"numberOfMonths": body.numberOfMonths},
			function(error, result)
			{
				if(error) throw error;
				
				response.send(result);
			});
		});

	});
}

exports.Update = function(request, response)
{
	var body = request.body;
	MongoClient.connect(serviceUrl, function(error, client)
	{
		if(error) throw error;
		var db = client.db('payrollsystem');
		db.collection('employees', function(error, collection)
		{
			collection.update({"employeeId" : body.employeeId},
								{$set:
									{
										"name": body.name,
										"basicPay": body.basicPay,
										"numberOfMonths": body.numberOfMonths
									}
								},
								{$addToSet:
									{
										"allowances": body.allowances,
										"deductions": body.deductions,
									}
								},
								{multi:true},
			function(error, result)
			{
				if(error) throw error;
				
				response.json(result);
			});
		});

	});
}

exports.Remove = function(request, response)
{
	var body = request.body;
	MongoClient.connect(serviceUrl, function(error, client)
	{
		if(error) throw error;
		var db = client.db('payrollsystem');
		db.collection('employees', function(error, collection)
		{
			collection.remove({"employeeId" : body.employeeId,},
			function(error, result)
			{
				if(error) throw error;
				
				response.send(result);
			});
		});

	});
}

function GetGovernmentDeductions(salary, callback)
{
	var returnArr = [];
	MongoClient.connect(serviceUrl, function(error, client)
	{
		if(error) throw error;
		var db = client.db('payrollsystem');
		db.collection('taxes', function(error, collection)
		{
			collection.find().toArray(function(error, result)
			{
				if(error) throw error;
				result.forEach(function(item)
				{
					item.sets.forEach(function(val)
					{
						var inner = {};
						if(((val.min == 0 && val.max == 0) || (val.min == 0 && salary <= val.max) || (val.max == 0 && salary > val.min))
							|| ((val.min != 0 || val.max != 0) && ((salary <= val.max) && (salary > val.min))))
						{
							inner.name = item.name;
							inner.ee = val.ee;
							inner.total = (val.ee/100) * salary;
							inner.active = true;
							returnArr.push(inner);
						}
					});
				});
				callback.result = returnArr;
			});
		});

	});
}

// Allowance
exports.AddAllowance = function(request, response)
{
	var body = request.body;
	MongoClient.connect(serviceUrl, function(error, client)
	{
		if(error) throw error;
		var db = client.db('payrollsystem');
		db.collection('employees', function(error, collection)
		{
			var deductions = this.GetGovernmentDeductions(body.basicPay);
			body.deduction.push(deductions);
			
			collection.insert({"employeeId" : body.employeeId,
								"name": body.name,
								"basicPay": body.basicPay,
								"allowances": body.allowances,
								"deductions": body.deductions,
								"numberOfMonths": body.numberOfMonths},
			function(error, result)
			{
				if(error) throw error;
				
				response.json(result);
			});
		});

	});
}