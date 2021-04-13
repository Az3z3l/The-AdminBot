var express = require('express');
var app = express();

app.use(express.json())

app.get('/', function(req, res) {
    res.json({'status':'ok'})
});



console.log("server starting at port 3000")
app.listen(3000);

