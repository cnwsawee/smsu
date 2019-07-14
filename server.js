var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var http = require('http').createServer(app);


var io = require('socket.io')(http);
var eventList = require('./public/js/eventList');
var eventListRegen = eventList.getRegen();
const eventListKnowledge = eventList.getKnowledge();
var eventListXp = eventList.getXp();
var listRegenActive =[];
var listKnowledgeActive =[];
var listXpActive =[];
var lockedUser=[];

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
class Event{
	constructor(name,hp,mp,kp,xp){
		this.name = name;
		this.hp=hp;
		this.mp=mp;
		this.kp=kp;
		this.xp=xp;
	}
}
class User{
	constructor(id,hp,mp,kp,xp){
		this.id=id;
		this.hp=hp;
		this.mp=mp;
		this.kp=kp;
		this.xp=xp;		
	}
	applyScore(score){
		this.hp+=score.hp;
		this.mp+=score.mp;
		this.kp+=score.kp;
		this.xp+=score.xp;
		if(this.hp<0) this.hp=0;
		if(this.mp<0) this.mp=0;
		if(this.kp<0) this.kp=0;
		if(this.xp<0) this.xp=0;
		return this.id;
	}
}
class Stat{
	constructor(id,phy,res,int){
		this.id=id;
		this.phy=phy;
		this.res=res;
		this.int=int;
		this.modPhy=Math.floor((phy-1)/3);
		this.modRes=Math.floor((res-1)/3);
		this.modInt=Math.floor((int-1)/3);
	}
}
var getUserById = function(id,arr){
	for(var x=0;x<arr.length;x++){
		if(id==arr[x].id) return x;
	}
}
var currentUser=[];
var userStat=[];

io.on('connection', function(socket){
	//console.log('a user connected');
	socket.on('start',function(data){
		if(data!=0){
			var tmp=0;
			currentUser.forEach(function(element,index){
				if(element.id==data) tmp=1;
			});
			if(tmp==0){
				currentUser.push(new User(data,10,10,0,0));
				console.log('add user');
			}
			if(stat[data][0]==0) {
				io.emit('statSubmission'+data,0);
			}
			io.emit('updateScore'+data,status[data]);
			io.emit('eventRegen',listRegenActive);
			io.emit('eventKnowledge',listKnowledgeActive);
			io.emit('eventXp',listXpActive);
			lockedUser.forEach(function(element,index){
				if(element == data){
					io.emit('lockSignal'+data,1);
				}
			})
			console.log(currentUser[0].id,currentUser[0].hp,currentUser[0].mp,currentUser[0].xp);
		}
	})
	/*socket.on('start',function(data){
		if(data!=0){
			if(stat[data][0]==0) {
				io.emit('statSubmission'+data,0);
			}
			io.emit('updateScore'+data,status[data]);
			io.emit('eventRegen',listRegenActive);
			io.emit('eventKnowledge',listKnowledgeActive);
			io.emit('eventXp',listXpActive);
			lockedUser.forEach(function(element,index){
				if(element == data){
					io.emit('lockSignal'+data,1);
				}
			})
			currentUser.push(data);
			currentUser = currentUser.sort();
		}
	});*/
	socket.on('sendEvent', function(data){
		//console.log(data);
		var index = getUserById(data[0],currentUser);
		console.log("user index",index);
		var scoreChange =[0,0,0,0];
		if(data[1] == 0) scoreChange = eventListRegen[data[2]].slice();
		else if(data[1] == 1) scoreChange = eventListKnowledge[data[2]].slice();
		else if(data[1] == 2) scoreChange = eventListXp[data[2]].slice();

		var tmp = new Event(scoreChange[0],scoreChange[1],scoreChange[2],scoreChange[3],scoreChange[4])

		//selectedEvent[index].push(temp);

		if(tmp.hp<0) {
			tmp.hp+=userStat[index].modPhy;
			if(tmp.hp>0) tmp.hp=0;
		}
		if(tmp.mp<0) {
			tmp.mp+=userStat[index].modRes;
			if(tmp.mp>0) tmp.mp=0;
		}
		if(tmp.kp>0) {
			tmp.kp+=userStat[index].modInt;
			if(tmp.kp<0) tmp.kp=0;
		}
		//status[username][0]++;
		//console.log(username,scoreChange,2);
		currentUser[index].applyScore(tmp);
		io.emit('updateScore'+currentUser[index].id,currentUser[index]);
	});
	/*socket.on('sendEvent', function(data){
		//console.log(data);
		var username= data[0];
		var index = getUserById(data[0],currentUser);
		var scoreChange =[0,0,0,0];
		if(username>0&&username<100){
					//console.log(username,scoreChange,0);
					if(data[1] == 0) scoreChange = eventListRegen[data[2]].slice();
					else if(data[1] == 1) scoreChange = eventListKnowledge[data[2]].slice();
					else if(data[1] == 2) scoreChange = eventListXp[data[2]].slice();

					var temp = new Event(scoreChange[0],scoreChange[1],scoreChange[2],scoreChange[3],scoreChange[4])

					selectedEvent[index].push(temp);

					if(scoreChange[1]<0) scoreChange[1]+=mod[username][1];
					if(scoreChange[2]<0) scoreChange[2]+=mod[username][2];
					if(scoreChange[3]>0) scoreChange[3]+=mod[username][3];
					status[username][0]++;
					//console.log(username,scoreChange,2);
					for(var x=1; x<5; x++){
						status[username][x]+=scoreChange[x];
						if(status[username][x]<0) status[username][x]=0;
					}
					io.emit('updateScore'+username,status[username]);

				}
	});*/
	socket.on('sendRandom', function(data){
		var a = new Event(data[1],data[2],data[3],data[4],data[5]);
		var username=data[0];
		var scoreChange=[data[2],data[3],data[4],data[5]];
		selectedEvent[data[0]].push(a);
		if(scoreChange[1]<0) scoreChange[1]+=mod[username][1];
		if(scoreChange[2]<0) scoreChange[2]+=mod[username][2];
		if(scoreChange[3]>0) scoreChange[3]+=mod[username][3];
		status[username][0]++;
		for(var x=1; x<5; x++){
			status[username][x]+=scoreChange[x];
			if(status[username][x]<0) status[username][x]=0;
		}
	});
	socket.on("sendLocked",function(data){
		lockedUser=data;
		for(var x=0;x<data.length;x++){
			io.emit('lockSignal'+data[x],1);
		}
	});
	socket.on("showSignal", function(data){
		io.emit("choiceStatus",data);
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
	/*socket.on('sendStat',function(data){
		var ind=data[0];
		for(var x=1;x<4;x++){
			stat[ind][x]=data[x];
			stat[ind][0]=1;
			if(data[x]>3 && data[x]<7) mod[ind][x]=1;
			else if (data[x]>6 && data[x]<10) mod[ind][x]=2;
			else if (data[x]==10) mod[ind][x]=3;
			else if (data[x]<=3) mod[ind][x]=0;
		}
	});*/

	socket.on('sendStat',function(data){
		var index= getUserById(data[0],currentUser);
		userStat[index]= new Stat(data[0],data[1],data[2],data[3]);
		stat[data[0]][0]=1;
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
		data.forEach(function(element,index){
			if(element!=0)
				io.emit("changeColor"+index ,element);
		});
	});
	socket.on('eventSignal',function(data){
		io.emit('requestEvent',1);
	});
	socket.on('requestScore', function(data){
		io.emit()
	});
	socket.on('requestUser', function(data){
		io.emit('currentUser',currentUser);
	})
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});