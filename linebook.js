function spread_MDF(self){
	var json = JSON.parse(self.dataset.id);
	var portnumber = parseInt(json.portnumber);
	var sharenum = parseInt(json.sharenum);
	var port_height = parseInt(json.port_height);

	if(self.value === '펼쳐보기'){
		if(portnumber<21){
			document.querySelector(`#p${sharenum}`).style.height = `((${portnumber} * 2) + 9.3)rem`;
		}else if(portnumber>20 && portnumber<41){
			document.querySelector(`#p${sharenum} .portsinport`).style.width = '26rem';
			document.querySelector(`#p${sharenum}`).style.width = '26rem';
			document.querySelector(`#p${sharenum}`).style.height = (parseInt(portnumber/2) + (portnumber%2)) *2.2 + 9.3 + 'rem';
		}else if(portnumber>40 && portnumber<61){
			document.querySelector(`#p${sharenum} .portsinport`).style.width = '39rem';
			document.querySelector(`#p${sharenum}`).style.width = '39rem';
			document.querySelector(`#p${sharenum}`).style.height = ((parseInt(portnumber/3) + Math.floor(Math.sqrt(portnumber%3)))*2.2) + 9.3 + 'rem';
		}else if(portnumber>60 && portnumber<81){
			document.querySelector(`#p${sharenum} .portsinport`).style.width = '52rem';
			document.querySelector(`#p${sharenum}`).style.width = '52rem';
			document.querySelector(`#p${sharenum}`).style.height = ((parseInt(portnumber/4) + Math.floor(Math.sqrt(portnumber%4)))*2.2) + 9.3 + 'rem';
		}else if(portnumber>80 && portnumber<101){
			document.querySelector(`#p${sharenum} .portsinport`).style.width = '65rem';
			document.querySelector(`#p${sharenum}`).style.width = '65rem';
			document.querySelector(`#p${sharenum}`).style.height = ((parseInt(portnumber/5) + Math.floor(Math.sqrt(Math.sqrt(portnumber%5))))*2.2) + 9.3 + 'rem';
		}else if(portnumber>100 && portnumber<121){
			document.querySelector(`#p${sharenum} .portsinport`).style.width = '78rem';
			document.querySelector(`#p${sharenum}`).style.width = '78rem';
			document.querySelector(`#p${sharenum}`).style.height = ((parseInt(portnumber/6) + Math.floor(Math.sqrt(Math.sqrt(portnumber%6))))*2.2) + 9.3 + 'rem';
		}else if(portnumber>120 && portnumber<129){
			document.querySelector(`#p${sharenum} .portsinport`).style.width = '91rem';
			document.querySelector(`#p${sharenum}`).style.width = '91rem';
			document.querySelector(`#p${sharenum}`).style.height = ((parseInt(portnumber/7) + Math.floor(Math.sqrt(Math.sqrt(portnumber%7))))*2.2) + 9.3 + 'rem';
		}
		for(var i = 1;i<=portnumber;i++){
			document.querySelector(`#p${sharenum} .u`+i).style.display='inline';
			document.querySelector(`#p${sharenum} .r`+i).style.display='inline';
		}
		self.value = '닫기'
	}else{
		document.querySelector(`#p${sharenum}`).style.height = `${port_height}rem`;
		if(portnumber>20){
			document.querySelector(`#p${sharenum} .portsinport`).style.width = '13rem';
			document.querySelector(`#p${sharenum}`).style.width = '13rem';
		}
		for(var i = 1;i<=portnumber;i++){
			document.querySelector(`#p${sharenum} .u`+i).style.display='none';
			document.querySelector(`#p${sharenum} .r`+i).style.display='none';
		}
		self.value = '펼쳐보기'
	}
}

function spread_CDF(self){
	var json = JSON.parse(self.dataset.id);
	var portnumber = parseInt(json.portnumber);
	var sharenum = parseInt(json.sharenum);
	var port_width = parseInt(json.port_width);

	var height_on = (Math.ceil(portnumber/32)*9.3) + 9.3 +'rem';
	var width_on = '102.88rem';
	if(self.value === '펼쳐보기'){
		self.value = '닫기'
		for(var i = 1;i<=portnumber;i++){
			document.querySelector(`#p${sharenum} .u`+i).style.display='inline';
			document.querySelector(`#p${sharenum} .r`+i).style.display='inline';
		}
		document.querySelector(`#p${sharenum} .portsinport`).className = 'portsinport_on';
		document.querySelector(`#p${sharenum}`).style.height = height_on;
		document.querySelector(`#p${sharenum}`).style.width = width_on;
		for(var i = 0;i<Math.ceil(portnumber/32);i++){
			document.querySelector(`#p${sharenum} .CDF_E1_32row`).className = 'CDF_E1_32row_on';
		}
	}else{
		self.value = '펼쳐보기'
		for(var i = 1;i<=portnumber;i++){
			document.querySelector(`#p${sharenum} .u`+i).style.display='none';
			document.querySelector(`#p${sharenum} .r`+i).style.display='none';
		}
		document.querySelector(`#p${sharenum} .portsinport_on`).className = 'portsinport';
		for(var i = 0;i<Math.ceil(portnumber/32);i++){
			document.querySelector(`#p${sharenum} .CDF_E1_32row_on`).className = 'CDF_E1_32row';
		}
		document.querySelector(`#p${sharenum} .portsinport`).style.width = `${port_width}rem`;
		document.querySelector(`#p${sharenum}`).style.width = `${port_width}rem`;
		document.querySelector(`#p${sharenum}`).style.height = '18.1rem';
	}
}



function searching_in_node(){
	var search_str = document.querySelector('.search_string').value;
	//현재 페이지에있는 sharenum과 그에 따른 port_number을 구한다.
	var share_num_t = document.querySelectorAll('.port_sharenum');
	var search_result = '<검색 결과>';
	var total = 0;
	for(var i =0;i<share_num_t.length;i++){
		var sharenum = share_num_t[i].value;
		var port_number = Number(document.querySelector(`#p${sharenum} .port_number`).value);
		var oppnode = document.querySelector(`#p${sharenum} .Oppnode`).value;
		var port_id = document.querySelector(`#p${sharenum} .port_Name`).value;
		for(var j = 1;j<=port_number;j++){
			var usage = document.querySelector(`#p${sharenum} .u${j}`).value;
			var refer = document.querySelector(`#p${sharenum} .r${j}`).value;
			if(usage.indexOf(search_str)!=-1 || refer.indexOf(search_str)!=-1){
				search_result += `
${oppnode}로 가는 ${port_id}포트의 ${j}번 단자 (용도 : ${usage} / 비고 : ${refer})`
				total += 1;
			}
		}

	}
	if(search_result === '<검색 결과>' ){
		search_result += `
검색 결과 일치하는 항목 : 0 건
현재 노드에는 일치하는 항목이 없습니다.`
	}else{
		var split = search_result.split('\n');
		split.splice(1,0,`총 ${total}건의 검색 결과가 있습니다.`);
		var search_result = split.join('\n');
	}
	confirm(search_result)
}

//불량 포트 설정 AJAX
function setting_disable(self){
	var sharenum = self.id;
	//select의 값으로 실제포트의 클래스를 만들어 백그라운드를 붉은색으로 만들고 아이디를 disabled_port로 만든다.
	//사용중인 포트는 alert
	var num = document.querySelector(`#p${sharenum} .set_disable_select`).value;
	var classnum = 'n' + document.querySelector(`#p${sharenum} .set_disable_select`).value;
	if(document.querySelector(`#p${sharenum} .${classnum}`).style.background === 'green' || document.querySelector(`#p${sharenum} .${classnum}`).style.background === 'orange'){
		alert('사용중인 포트는 불량포트로 지정할 수 없습니다.')
	}else if(document.querySelector(`#p${sharenum} .${classnum}`).style.background === 'red'){
		alert('이미 불량포트로 지정된 포트입니다.')
	}else{
		document.querySelector(`#p${sharenum} .${classnum}`).style.background = 'red';
		document.querySelector(`#p${sharenum} .${classnum}`).id = 'disabled_port';
		//disabled된 포트를 set select에서는 뺴고 remove에 추가한다.
		document.querySelector(`#p${sharenum} .diset${num}`).style.display = 'none';
		document.querySelector(`#p${sharenum} .disrem${num}`).style.display = 'inline';
		//display에 추가
		document.querySelector(`#p${sharenum} #Disable`).innerText = Number(document.querySelector(`#p${sharenum} #Disable`).innerText)+1;

		document.querySelector(`#p${sharenum} #capable`).innerText = Number(document.querySelector(`#p${sharenum} #capable`).innerText)-1;
	}
}
//불량포트 해제 AJAX
function removing_disable(self){
	var sharenum = self.id;
	//select의 값으로 실제포트의 클래스를 만들어 백그라운드를 없애고 아이디를 nUm으로 되돌린다.
	var num = document.querySelector(`#p${sharenum} .remove_disable_select`).value;
	var classnum = 'n' + document.querySelector(`#p${sharenum} .remove_disable_select`).value;
	console.log(document.querySelector(`#p${sharenum} .remove_disable_select`).value)
	if(document.querySelector(`#p${sharenum} .${classnum}`).style.background === ""){
		alert('이미 불량포트 해제가 완료된 포트입니다.')
	}else if(document.querySelector(`#p${sharenum} .remove_disable_select`).value != ""){
		document.querySelector(`#p${sharenum} .${classnum}`).removeAttribute("style");
		document.querySelector(`#p${sharenum} .${classnum}`).id = 'nUm';
		//disabled에서 해제된 포트를 remove select에서는 뺴고 set에 추가한다.
		document.querySelector(`#p${sharenum} .diset${num}`).style.display = 'inline';
		document.querySelector(`#p${sharenum} .disrem${num}`).style.display = 'none';
		//display에서 빼기
		document.querySelector(`#p${sharenum} #Disable`).innerText = Number(document.querySelector(`#p${sharenum} #Disable`).innerText)-1;
		document.querySelector(`#p${sharenum} #capable`).innerText = Number(document.querySelector(`#p${sharenum} #capable`).innerText)+1;
	}
}

//포트이름이 같은 반대노드 중에서 중복되는지 확인
function cheking_double(){
	var opp_object = document.querySelectorAll('.nodetitle');
	var id_object = document.querySelectorAll('.porttitle');
	var new_name = document.querySelector('.port_name').value;
	var new_opp = document.querySelector('.selected_oppnode').value;

	// [질문]왜 어떤 객체는 바로 length를 써도 되고 어떤 객체는 Object.keys(united_object).length를 써야만 되는가
	// [질문]왜 어떤 객체는 for in을 쓰면 개같은 entries, key, value 등도 포함되는가 prototype
	var united_object = {};
	for(var i = 0;i<opp_object.length;i++){
		if(united_object[opp_object[i].innerText] !== undefined)
			united_object[opp_object[i].innerText] += ','+id_object[i].innerText + "!";
		else{
			united_object[opp_object[i].innerText] = ','+id_object[i].innerText + '!';
		}
	}
	// 같은 반대노드의 이름들만 비교
	// 같은 반대노드의 포트가 현재 노드 위에 있다면
	if(united_object[new_opp]!==undefined){
		var port_id_content = united_object[new_opp];
		var port_ids = port_id_content.match(/,/g);

		for(var i = 0;i<port_ids.length;i++){
			var index1 = port_id_content.indexOf(',')+1;
			var index2 = port_id_content.indexOf('!');
			var id = port_id_content.slice(index1,index2);
			if(id === new_name){
				alert("현재 노드에 같은 이름을 가진 같은 반대노드로 연결된 포트가 이미 존재합니다");
				document.querySelector('.double_check').value="0";
				break;
			}else{
				document.querySelector('.double_check').value="1";
				port_id_content = port_id_content.slice(index2+1);
			}
		}
		if(document.querySelector('.double_check').value==="1"){
			alert('사용 가능한 이름입니다.')
		}
	// 같은 반대노드의 포트가 현재 노드 위에 없다면
	}else{
		document.querySelector('.double_check').value="1";
		alert('사용 가능한 이름입니다.')
	}
}
//포트이름이 같은 반대노드 중애서 중복되는지 확인했는지 submit전 확인
function check_checking_double(){
	if(document.querySelector('.selected_oppnode').value === ""){
		alert('반대노드 없이는 포트 생성을 할 수 없습니다.')
		return false;
	}else{
		var check = document.querySelector('.double_check').value;
		if(check === "1"){
			return true;
		}else{
			alert('중복확인을 해주시기 바랍니다.')
			return false;
		}
	}
}

//새 포트 생성 폼에서 직접입력시 숫자 입력창 표시
function selfInput(){
	if(document.querySelector('.newportform .port_number').value==="others"){
		document.querySelector('.port_number_selfInput').style.display="block"
	}else{
		document.querySelector('.port_number_selfInput').style.display="none"
	}
}

// 새 포트 생성 폼에서 CDF-E1 선택시 TX/RX 선택창 표시
function CDF_TR_check(){
	console.log(document.querySelector('.port_type').value)
	if(document.querySelector('.port_type').value==="CDF_E1"){
		document.querySelector('.CDF_TR').style.display="block";
	}else{
		document.querySelector('.CDF_TR').style.display="none";
	}
}

//새 노드 생성 폼 나타났다 사라지기
function newnodeform(){
	document.querySelector(".newnodeform").style.display = "flex";
}

function newnodequit(){
	document.querySelector(".newnodeform").style.display = "none";
}

//새 포트 생성 폼 나타났다 사라지기
function newportform(){
	document.querySelector(".newportform").style.display = "flex";
}

function newportquit(){
	document.querySelector(".newportform").style.display = "none";
}

//allconnect 닫기
function closeAllconnect(){
	console.log(document.querySelector('#allconOn'))
	document.querySelector('#allconOn').id = 'allconOff';
}

//포트 삭제 버튼 불량설정/해제 버튼 활성화
function portcontrol(self){
	var number = document.querySelectorAll('.deleteport').length;
	if(self.value === '포트관리'){
		for(var i =0;i<number;i++){
			document.querySelector('#deleteport_none').style.display = 'inline';
			document.querySelector('#deleteport_none').id = 'deleteport_inline';
			document.querySelector('#disable_party_none').style.display = 'block';
			document.querySelector('#disable_party_none').id = 'disable_party_block';
		}
		self.value = '포트관리 닫기'
	}else{
		for(var i =0;i<number;i++){
			document.querySelector('#deleteport_inline').style.display = 'none';
			document.querySelector('#deleteport_inline').id = 'deleteport_none';
			document.querySelector('#disable_party_block').style.display = 'none';
			document.querySelector('#disable_party_block').id = 'disable_party_none';
		}
		self.value = '포트관리'
	}
}

//현재 노드 삭제하기 전 확인 창
function check() {
	var innertext = document.body.innerHTML;
	var index1 = innertext.indexOf(`<!--datastart-->`);
	var index2 = innertext.indexOf(`<!--dataend-->`);
	var data = innertext.slice(index1,index2);
	if(data.indexOf('<!--sharenum')!=-1){
		alert('노드를 삭제하시려면 해당 노드안의 포트들을 먼저 삭제하셔야 됩니다.')
		return false
	}else{
		var check = confirm("현재 노드를 삭제하시겠습니까?");
		if(check === true){
			return true;
		}else{
			return false;
		}
	}
}



//포트 삭제하기 전 확인 창
function checkDeletePort(port_id) {

	if(document.querySelector(`#p${port_id} #occupying`).innerText != 0 || document.querySelector(`#p${port_id} #occupying`).innerText !='0'){
		alert('사용중인 포트가 있습니다!')
		return false;
	}else{
		var check = confirm("한번 포트를 삭제하면 되돌릴 수 없습니다. 포트 삭제를 진행하시겠습니까?");
		if(check === true){
			return true;
		}else{
			return false;
		}
	}
}
