var HomeController = require('./controllers/HomeController');
var EmployeeController = require('./controllers/EmployeeController');

// Routes
module.exports = function(app){
     
    // Main Routes     
    app.get('/', HomeController.Index);
	//Employee
	app.get('/listEmployee', EmployeeController.List);
	app.post('/addEmployee', EmployeeController.Add);
	app.post('/updateEmployee', EmployeeController.Update);
	app.post('/removeEmployee', EmployeeController.Remove);
	//app.post('/getGovernmentDeductions', EmployeeController.GetGovernmentDeductions);
};
