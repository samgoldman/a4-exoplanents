const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

const app = express();

app.use(bodyParser.json());
app.use(compression());
app.use(express.static('dist'));

// listen for requests :)
const listener = app.listen(8080/*process.env.PORT*/, function() {
	console.log('Your app is running. Go to http://localhost:' + listener.address().port + '/index.html');
});
