var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var http = require('http').createServer(app);


var io = require('socket.io')(http);
var eventList = require('./public/js/eventList');
var eventListRegen = eventList.getRegen();
var eventListKnowledge = eventList.getKnowledge();
var eventListXp = eventList.getXp();
var listRegenActive =[];
var listKnowledgeActive =[];
var listXpActive =[];

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
app.get('/color', function (req, res, next){
	res.sendFile(__dirname + '/color.html');
});
app.get('/dashboard', function (req, res, next){
	res.sendFile(__dirname + '/dashboard.html');
});

var status = [];
for(var x = 0; x < 100; x++){
    status[x] = [];    
    for(var y = 0; y < 5; y++){ 
        if(y==1 || y==2) status[x][y]=10;
        else status[x][y] = 0;    
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
var selectedEvent =[];
var currentUser =[];

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('start',function(data){
		if(data!=0){
			if(stat[data][0]==0) {
				io.emit('statSubmission'+data,0);
			}
			io.emit('updateScore'+data,status[data]);
			io.emit('eventRegen',listRegenActive);
			io.emit('eventKnowledge',listKnowledgeActive);
			io.emit('eventXp',listXpActive);
			currentUser.push(data);
		}
	});
	socket.on('sendEvent', function(data){
		var username= data[0];
			var scoreChange =[];
		if(username>0&&username<100){
					if(data[1] == 0) scoreChange = eventListRegen[data[2]];
					else if(data[1] == 1) scoreChange = eventListKnowledge[data[2]];
					else if(data[1] == 2) scoreChange = eventListXp[data[2]];
					console.log(scoreChange);
		
					if(scoreChange[1]<0) scoreChange[1]+=mod[username][1];
					if(scoreChange[2]<0) scoreChange[2]+=mod[username][2];
					if(scoreChange[3]>0) scoreChange[3]+=mod[username][3];
					status[username][0]++;
		
					for(var x=1; x<5; x++){
						status[username][x]+=scoreChange[x];
						if(status[username][x]<0) status[username][x]=0;
					}
					io.emit('updateScore'+username,status[username]);
				}
		//console.log('EMIT FINISH');
	});
	socket.on('examSignal', function(data){
		for(var x=0;x<100;x++){
			status[x][3]=Math.ceil((score[x][3]-10)/2);
		}
		for(var x=0;x<100;x++){
			io.emit("updateScore"+x,status[x]);
		}
	});
	socket.on('console',function(data){
		var user=data[0];
		for(var x=1;x<5;x++){
			status[user][x]+=data[x];
		}
	})
	socket.on('consoleOverride', function(data){
		var user=data[0];
		for(var x=1;x<5;x++){
			status[user][x]=data[x];
		}
	});
	socket.on('sendStat',function(data){
		var ind=data[0];
		for(var x=1;x<4;x++){
			stat[ind][x]=data[x];
			stat[ind][0]=1;
			if(data[x]>3 && data[x]<7) mod[ind][x]=1;
			else if (data[x]>6 && data[x]<10) mod[ind][x]=2;
			else if (data[x]==10) mod[ind][x]=3;
			else if (data[x]<=3) mod[ind][x]=0;
		}
	});
	socket.on('listRegenActive',function(data){
		listRegenActive=data;
		io.emit('eventRegen',data);
	});
	socket.on('listKnowledgeActive',function(data){
		listKnowledgeActive=data;
		io.emit('eventKnowledge',data);
	});
	socket.on('listXpActive',function(data){
		listXpActive=data;
		io.emit('eventXp',data);
	});
	socket.on('changeColor',function(data){
		console.log(1231231);
		data.forEach(function(element,index){
			if(element!=0)
				io.emit("changeColor"+index ,element);
		});
	});
	socket.on('eventSignal',function(data){
		io.emit('requestEvent',1);
	})
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});