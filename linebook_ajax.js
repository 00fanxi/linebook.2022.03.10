$('.ref').change(function(e){
	var nodename = document.querySelector('title').innerText;
	var json = JSON.parse(e.target.dataset.id);
	var num = parseInt(json.num);
	var _id = parseInt(json._id);
	$.ajax({
		method : 'PUT',
		url : '/save/refer',
		data : {_id : _id, nodename : nodename, num : num, content : e.target.value}
	});
});

$('.usage').change(function(e){
	var nodename = document.querySelector('title').innerText;
	var json = JSON.parse(e.target.dataset.id);
	var num = parseInt(json.num);
	var _id = parseInt(json._id);
	$.ajax({
		method : 'PUT',
		url : '/save/usage',
		data : {_id : _id, nodename : nodename, num : num, content : e.target.value}
	});
});

$('.set_disable_button').click(function(e){
	var nodename = document.querySelector('title').innerText;
	var json = JSON.parse(e.target.dataset.id);
	var sharenum = e.target.id;
	var num = document.querySelector(`#p${sharenum} .set_disable_select`).value;
	var _id = parseInt(json._id);
	$.ajax({
		method : 'PUT',
		url : '/save/disable',
		data : {_id : _id, nodename : nodename, num : num}
	});
});

$('.remove_disable_button').click(function(e){
	var nodename = document.querySelector('title').innerText;
	var json = JSON.parse(e.target.dataset.id);
	var _id = parseInt(json._id);
	var sharenum = e.target.id;
	var num = document.querySelector(`#p${sharenum} .remove_disable_select`).value;

	$.ajax({
		method : 'PUT',
		url : '/save/available',
		data : {_id : _id, nodename : nodename, num : num}
	});
});




//노드 생성시 중복 확인
function checking_node_double(){
	var newnodename = document.querySelector('.newnodetext').value;
	$.ajax({
		method : 'post',
		url : '/check/nodename',
		data : {newnodename : newnodename}
	}).done(function(result){
		console.log(result)
		if(result === "true"){
			return true;
		}else{
			return false;
			alert('이미 있는 노드명입니다.')
		}
	}).fail(function(xhr,textStatus,errorThrown){
		console.log(xhr,textStatus,errorThrown);
	});
}













// }
