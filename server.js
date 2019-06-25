var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.set('port',8080);
app.set('ip', '0.0.0.0');
app.get('/', function (req, res, next) {
  res.send('SMSU Camp');
});
app.get(/user*/, function (req, res, next) {
  console.log(2);
  res.sendFile(__dirname + '/client.html');
});
app.get('/console', function (req, res, next){
	console.log(3);
	res.sendFile(__dirname + '/console.html');
});
app.get('/control', function (req, res, next){
	res.sendFile(__dirname + '/control.html');
});

var status = [];
for(var x = 0; x < 100; x++){
    status[x] = [];    
    for(var y = 0; y < 5; y++){ 
        status[x][y] = 0;    
    }    
}

var stat =[];
for(var x = 0; x < 100; x++){
    stat[x] = [];    
    for(var y = 0; y < 4; y++){ 
        stat[x][y] = 0;    
    }    
}

var mod =[];
for(var x = 0; x < 100; x++){
    mod[x] = [];    
    for(var y = 0; y < 4; y++){ 
        mod[x][y] = 0;    
    }    
}

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('console', function(data){
		console.log(data);
		var user= data[0];
		if(data[1]<0) data[1]+=mod[user][0];
		if(data[2]<0) data[2]+=mod[user][1];
		if(data[3]>0) data[3]+=mod[user][2];
		status[user][0]++;
		for(var x=1; x<5; x++){
			status[user][x]+=data[x];
		}
		io.emit('update'+user,status[user]);
		console.log('EMIT FINISH');
	});
	console.log(1);

});

http.listen(8080, function(){
  console.log('listening on *:8080');
});