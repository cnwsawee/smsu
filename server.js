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
var showStatus=1;

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

var statSubmission =[];
for(var x = 0; x < 100; x++){
    statSubmission[x]=0;
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
	constructor(id,hp,mp,kp,xp,locked){
		this.id=id;
		this.hp=hp;
		this.mp=mp;
		this.kp=kp;
		this.xp=xp;
		this.locked=locked;	
		this.death=0;
		this.failed=0;
		this.eventCount=0;	
	}
	applyScore(score){
		if(score.hp == null) score.hp = 0;
		if(score.mp == null) score.mp = 0;
		if(score.kp == null) score.kp = 0;
		if(score.xp == null) score.xp = 0;
		this.hp+=score.hp;
		this.mp+=score.mp;
		this.kp+=score.kp;
		this.xp+=score.xp;
		if(this.hp<0) this.hp=0;
		if(this.mp<0) this.mp=0;
		if(this.kp<0) this.kp=0;
		if(this.xp<0) this.xp=0;

		if(this.hp == 0 || this.mp ==0){
			this.death++;
		}
		this.eventCount++;
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
var userSelectedEvent=[];

io.on('connection', function(socket){
	//console.log('a user connected');
	socket.on('start',function(data){
		if(data!=0){
			var tmp=0;
			var index;
			currentUser.forEach(function(element,index){
				if(element.id==data) tmp=1;
			});
			if(tmp==0){
				currentUser.push(new User(data,10,10,0,0,0));
				console.log('add user');
				index=getUserById(data,currentUser);
				userSelectedEvent[index]=[];
			}
			if(statSubmission[data]==0) {
				io.emit('statSubmission'+data,0);
				index=getUserById(data,currentUser);
			}
			io.emit('updateScore'+data,currentUser[getUserById(data,currentUser)]);
			io.emit('eventRegen',listRegenActive);
			io.emit('eventKnowledge',listKnowledgeActive);
			io.emit('eventXp',listXpActive);
			io.emit("choiceStatus",showStatus);

			if(currentUser[getUserById(data,currentUser)].locked==1){
				io.emit('lockSignal'+currentUser[getUserById(data,currentUser)].id,1);
			}
		}
	})
	socket.on('allowEvent',function(data){
		if(data==1){
			io.emit('allowEventChange',1);
		}
	})
	socket.on('sendEvent', function(data){
		//console.log(data);
		var index = getUserById(data[0],currentUser);
		console.log("user index",index);
		var scoreChange=[];
		if(data[1] == 0) scoreChange = eventListRegen[data[2]].slice();
		else if(data[1] == 1) scoreChange = eventListKnowledge[data[2]].slice();
		else if(data[1] == 2) scoreChange = eventListXp[data[2]].slice();

		var tmp = new Event(scoreChange[0],scoreChange[1],scoreChange[2],scoreChange[3],scoreChange[4])
		if(scoreChange[0]!=null){
				userSelectedEvent[index].push(tmp);
		
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
			}
	});
	socket.on('getEvent',function(data){
		var index=getUserById(data,currentUser);
		io.emit('userEventList',userSelectedEvent[index]);
	})
	socket.on('sendRandom', function(data){
		var randomEvent = new Event(data[1],parseInt(data[2]),parseInt(data[3]),parseInt(data[4]),parseInt(data[5]));
		var index= getUserById(data[0],currentUser);
		userSelectedEvent[index].push(randomEvent);
		if(randomEvent.hp<0) {
			randomEvent.hp+=userStat[index].modPhy;
			if(randomEvent.hp>0) randomEvent.hp=0;
		}
		if(randomEvent.mp<0) {
			randomEvent.mp+=userStat[index].modRes;
			if(randomEvent.mp>0) randomEvent.mp=0;
		}
		if(randomEvent.kp>0) {
			randomEvent.kp+=userStat[index].modInt;
			if(randomEvent.kp<0) randomEvent.kp=0;
		}
		currentUser[index].applyScore(randomEvent);
		io.emit('updateScore'+currentUser[index].id,currentUser[index]);
	});
	socket.on("sendLocked",function(data){
		data.forEach(function(element,index){
			if(!lockedUser.includes(element)) lockedUser.push(element);
		})
		lockedUser.sort();
		lockedUser.forEach(function(element,index){
			currentUser[getUserById(element,currentUser)].locked=1;
			io.emit('lockSignal'+element,1);
		})
	});
	socket.on("clearLock", function(data){
		lockedUser.forEach(function(element,index){
			currentUser[getUserById(element,currentUser)].locked=0;
			io.emit('lockSignal'+element,0);
		})
		lockedUser=[];
	});
	socket.on("showSignal", function(data){
		showStatus=data;
		io.emit("choiceStatus",data);
	});
	socket.on('examSignal', function(data){
		currentUser.forEach(function(element, index){
			var tmp=element.kp;
			if(element.kp<10) {
				element.failed++;
				io.emit('failed'+element.id,element.failed);
			}
			element.kp=Math.ceil((element.kp-10)/2);
			if(element.kp<0) element.kp=0;
			tmp=element.kp-tmp;
			var tmpEvent=new Event("Exam",0,0,tmp,0);
			userSelectedEvent[index].push(tmpEvent);
			io.emit('updateScore'+element.id,element);
		});
	});
	socket.on('console',function(data){
		var index=getUserById(data[0],currentUser);
		var tmp = new Event("Override",data[1],data[2],data[3],data[4]);
		currentUser[index].applyScore(tmp);
		userSelectedEvent[index].push(tmpEvent);
		io.emit('updateScore'+currentUser[index].id,currentUser[index]);
	})
	socket.on('consoleOverride', function(data){
		var index=getUserById(data[0],currentUser);
		var tmp = new Event("Override",data[1]-currentUser[index].hp,data[2]-currentUser[index].mp,data[3]-currentUser[index].kp,data[4]-currentUser[index].xp);
		currentUser[index].applyScore(tmp);
		userSelectedEvent[index].push(tmp);
		io.emit('updateScore'+currentUser[index].id,currentUser[index]);
	});
	socket.on('sendStat',function(data){
		var index= getUserById(data[0],currentUser);
		userStat[index]= new Stat(data[0],data[1],data[2],data[3]);
		if(userStat[index].modPhy<0) userStat[index].modPhy=0;
		if(userStat[index].modRes<0) userStat[index].modRes=0;
		if(userStat[index].modInt<0) userStat[index].modInt=0;
		console.log(userStat[index]);	
		statSubmission[data[0]]=1;
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
	socket.on('requestUserColor', function(data){
		var arr=[];
		currentUser.forEach(function(element,index){
			arr.push(element.id);
		})
		arr.sort();
		io.emit('currentUserList',arr);
	});
	socket.on('requestUser', function(data){
		io.emit('currentUser',currentUser);
	})
	socket.on('getLockedUser', function(data){
		io.emit('sendLockedUser',lockedUser);
	})
	socket.on('requestStat',function(data){
		var index = getUserById(data,currentUser);
		io.emit('showStat'+data,userStat[index]);
	})
//----------------Event List----------------//
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


});

http.listen(8080, function(){
  console.log('listening on *:8080');
});