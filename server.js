// server.js - application route module

const express = require('express');
const port = process.env.PORT;
const app = express();
const router = express.Router();
const path = __dirname + '/views/';

app.use(express.static(__dirname)); // serves static files

router.get('/', function(req, res) {
    res.sendFile(path + 'index.html');
});

app.use('/', router);
app.listen(port);

// future work: 
// should add error page to handle erroneous requests--
// router.get('*', function(req, res) {
//     res.sendFile('error.html');
// });
