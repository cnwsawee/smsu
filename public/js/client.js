class User{
	constructor(id,hp,mp,kp,xp){
		this.id=id;
		this.hp=hp;
		this.mp=mp;
		this.kp=kp;
		this.xp=xp;		
		this.locked=0;
	}

	applyScore(score){
		this.hp+=score.hp;
		this.mp+=score.mp;
		this.kp+=score.kp;
		this.xp+=score.xp;
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
var upd = function(name, val){
	//$('#'+name).css('height',(val*5)+'%');
	$('#'+name).animate({
		top: 100-(val*5) +'%',
		height: val*5 +'%'
	},1000);	
	$('#'+name).attr('aria-valuenow'+(val*5));
	//$('#'+name).css('top',100-(val*5)+'%')
	//$("#"+name).text(val);
	$("#"+name+'1').text(val);
}
var progressColor = function(name, val){
	if(val <5){
		if($('#'+name).hasClass('bg-warning')){
			$('#'+name).removeClass('bg-warning');
		}
		if($('#'+name).hasClass('bg-danger')){
			$('#'+name).removeClass('bg-danger');
		}
		$('#'+name).addClass('bg-danger');
	}
	else if(val >=5 && val <10){
		if($('#'+name).hasClass('bg-warning')){
			$('#'+name).removeClass('bg-warning');
		}
		if($('#'+name).hasClass('bg-danger')){
			$('#'+name).removeClass('bg-danger');
		}
		$('#'+name).addClass('bg-warning');	
	}
	else{
		if($('#'+name).hasClass('bg-warning')){
			$('#'+name).removeClass('bg-warning');
		}
		if($('#'+name).hasClass('bg-danger')){
			$('#'+name).removeClass('bg-danger');
		}
	}
}
var progressColorKn = function(name, val){
	if(val <5){
		if($('#'+name).hasClass('bg-warning')){
			$('#'+name).removeClass('bg-warning');
		}
		if($('#'+name).hasClass('bg-danger')){
			$('#'+name).removeClass('bg-danger');
		}
		if($('#'+name).hasClass('bg-success')){
			$('#'+name).removeClass('bg-success');
		}
		$('#'+name).addClass('bg-danger');
	}
	else if(val >=5 && val <10){
		if($('#'+name).hasClass('bg-warning')){
			$('#'+name).removeClass('bg-warning');
		}
		if($('#'+name).hasClass('bg-danger')){
			$('#'+name).removeClass('bg-danger');
		}
		if($('#'+name).hasClass('bg-success')){
			$('#'+name).removeClass('bg-success');
		}
		$('#'+name).addClass('bg-warning');	
	}
	else if(val >=10 && val<15){
		if($('#'+name).hasClass('bg-warning')){
			$('#'+name).removeClass('bg-warning');
		}
		if($('#'+name).hasClass('bg-danger')){
			$('#'+name).removeClass('bg-danger');
		}
		if($('#'+name).hasClass('bg-success')){
			$('#'+name).removeClass('bg-success');
		}
		$('#'+name).addClass('bg-success');
	}
}