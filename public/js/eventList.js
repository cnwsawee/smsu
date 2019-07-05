var eventRegen =[
	["นอน",3,1,0,0],
	["ฟังเพลง",0,2,0,1],
	["กินเหล้า",-1,2,-1,1],
	["ออกกำลังกาย",1,1,0,1],
	["กิน Buffet",2,1,0,0],
	["ดูหนัง",1,2,-1,1]
	];
var eventKnowledge=[
	["อ่าน textbook",-3,-2,5,0],
	["Prereading",-3,-4,5,0],
	["E-lecture",-3,-4,4,0],
	["ติวกับเพื่อน",-2,-1,3,0],
	["Ward Round",-3,-3,4,1],
	["ท่องข้อสอบเก่า",-2,0,1,0],
	["ออก OPD",-1,-2,2,1],
	["เข้า Journal Club",-3,-2,4,1]
	];
var eventXp =[
	["ทำงานอาสา",-2,3,0,4],
	["เข้า Workshop",-2,0,1,5],
	["อ่าน Non-academic Books",0,2,1,3],
	["วาดรูป",0,2,0,2],
	["เล่นหุ้น",-1,0,0,3],
	["เล่นดนตรี",-2,1,0,3],
	["เที่ยวต่างจังหวัด",-2,3,-1,3]
	];
function getRegen(){
	return eventRegen;
}
function getKnowledge(){
	return eventKnowledge;
}
function getXp(){
	return eventXp;
}

module.exports = {
	getRegen,
	getKnowledge,
	getXp
};
