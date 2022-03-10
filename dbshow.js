var dbshow = {};

// var MongoClient =require('mongodb').MongoClient;
//
// let db;
// var counterdb;
// MongoClient.connect('mongodb://localhost:27017/local', function(err,client){
// 	if(err) {return console.log(err)}
// 		console.log('conncected with DB')
// 		db = client.db('connectdata');
// 		counterdb = client.db('counter');
// });


dbshow.showport = function(opp_json,porttotal,result){
  var contents = "";
  for(var i = 0;i<porttotal;i++){
    var p = result[i];
    var opp_usingport = opp_json[i][0];
    var opp_bridgeport = opp_json[i][1];
    var opp_disableport = opp_json[i][2];

    if(p.porttype === 'CDF_E1' || p.porttype === 'CDF'){
      contents += dbshow.CDF_E1(opp_usingport,opp_bridgeport,opp_disableport,p._id,p.sharenum,p.portname,p.nodename,p.oppnodename,p.portnumber,p.porttype,p.cabletype,p.usingport,p.bridgeport,p.disableport,p.availableport,p.reference,p.usage,p.connectstat,p.latestupdate);
    }else{
      contents += dbshow.MDF(opp_usingport,opp_bridgeport,opp_disableport,p._id,p.sharenum,p.portname,p.nodename,p.oppnodename,p.portnumber,p.porttype,p.cabletype,p.usingport,p.bridgeport,p.disableport,p.availableport,p.reference,p.usage,p.connectstat,p.latestupdate);
    }
  }
  return contents;
}

dbshow.showportOne = function(opp_usingport,opp_bridgeport,opp_disableport,result){
  let content;
  var p = result;
  if(p.porttype === "CDF_E1" || p.porttype === 'CDF'){
    content = dbshow.CDF_E1(opp_usingport,opp_bridgeport,opp_disableport,p._id,p.sharenum,p.portname,p.nodename,p.oppnodename,p.portnumber,p.porttype,p.cabletype,p.usingport,p.bridgeport,p.disableport,p.availableport,p.reference,p.usage,p.connectstat,p.latestupdate);
  }else{
    content = dbshow.MDF(opp_usingport,opp_bridgeport,opp_disableport,p._id,p.sharenum,p.portname,p.nodename,p.oppnodename,p.portnumber,p.porttype,p.cabletype,p.usingport,p.bridgeport,p.disableport,p.availableport,p.reference,p.usage,p.connectstat,p.latestupdate);
  }
  return content;
}

dbshow.MDF = function(opp_usingport,opp_bridgeport,opp_disableport,_id,sharenum,portname,nodename,oppnodename,portnumber,porttype,cabletype,usingport,bridgeport,disableport,availableport,reference,usage,connectstat,latestupdate){
  var cablecolor = 'gray';
	if(cabletype=="optical"){
		cablecolor = 'yellow';
	}
  var set_disable_list = '<option selected></option>';
  var remove_disable_list = '<option selected></option>';
	for(var i = 1;i<=portnumber;i++){
    if(availableport.indexOf(i) != -1){
      set_disable_list += `<option class="diset${i}" value='${i}'>${i}번 포트</option>`;
    }else{
      set_disable_list += `<option class="diset${i}" value='${i}' style="display:none">${i}번 포트</option>`;
    }
		if(disableport.indexOf(i) != -1){
      remove_disable_list += `<option class="disrem${i}" value='${i}'>${i}번 포트</option>`;
    }else{
      remove_disable_list += `<option class="disrem${i}" value='${i}' style="display:none">${i}번 포트</option>`;
    }
	}
  var port_height = 9.3 + 2.2*Math.ceil(portnumber/5);
  var plus_ports = "";
  var background_color = "";
  var title = "";
  for(var i = 1;i<=portnumber;i++){
    if(disableport.indexOf(parseInt(i)) !=-1){
      background_color = "red";
      title = "";
    }else if(usingport.indexOf(parseInt(i)) != -1 && bridgeport.indexOf(parseInt(i)) === -1){
      background_color = "green";
      title = `<현재 연결되어있는 단자>
${connectstat[i][0].oppnodename}(으)로 가는${connectstat[i][0].portname}의 ${connectstat[i][0].num}번 포트`
    }else if(usingport.indexOf(parseInt(i)) != -1 && bridgeport.indexOf(parseInt(i)) != -1){
      background_color = "orange";
      title = `<현재 연결되어있는 단자>
[상태 : 브릿지]
[브릿지 수 : ${connectstat[i].length}]`
      for(var j in connectstat[i]){
        title += `
${parseInt(j)+1}. ${connectstat[i][j].oppnodename}(으)로 가는${connectstat[i][j].portname}의 ${connectstat[i][j].num}번 포트`
      }
    }else{
      title = "";
      if(opp_usingport.indexOf(i) != -1){
        background_color = "lightgreen";
      }else if(opp_bridgeport.indexOf(i) != -1){
        background_color = "#FFD580";
      }else if(opp_disableport.indexOf(i) != -1){
        background_color = "tomato";
      }else{
        background_color = "";
      }
    }
    plus_ports += `
<span id="nUm" class="num n${i}" title="${title}" data-id = '{"_id" : ${_id}, "sharenum" : ${sharenum}, "num" : ${i}, "nodename" : "${nodename}","oppnodename" : "${oppnodename}", "portname" : "${portname}"}' style="background:${background_color}">${i}</span>
<input type="text" value="${usage[i]}" class="usage u${i}" id="${i}" style="display:none;" data-id='{"_id" : ${_id}, "num" : ${i}}'>
<input type="text" value="${reference[i]}" class="ref r${i}" id="${i}" style="display:none;" data-id='{"_id" : ${_id}, "num" : ${i}}'>`
  }
	return `
<div class="mdf100 full" id="p${sharenum}" style="height:${port_height}rem;">
<div id="disable_party_none" style="display: none">
<form action="/delete_port" method="post" class="deleting_port" onsubmit="return checkDeletePort(${sharenum})">
		<input type="hidden" name="thisnode" value="${nodename}">
		<input type="hidden" name="sharenum" value="${sharenum}">
		<input type="hidden" class="Oppnode" name="oppnode" value="${oppnodename}">
		<input type="submit" class="deleteport" id="deleteport_none" title="포트 삭제" value="포트 삭제" style="display: none;">
</form>
	<select class="set_disable_select">
		${set_disable_list}
	</select>
	<input type="button" class="set_disable_button" id=${sharenum} data-id='{"_id" : ${_id}}' value="불량설정" onclick="setting_disable(this)">
	<select class="remove_disable_select">
		${remove_disable_list}
	</select>
	<input type="button" class="remove_disable_button" id=${sharenum} data-id='{"_id" : ${_id}}' value="불량해제" onclick="removing_disable(this)">
</div>
<input type="hidden" class="portnumber" value="${portnumber}">
<div class="port_controlers">
<span style="border-bottom:solid 0.5rem ${cablecolor}" class="nodetitle">
${oppnodename}
<input type="hidden" class="port_sharenum" value="${sharenum}">
</span>
<span class="porttitle">
<input type="hidden" class="port_Name" value="${portname}">
${portname}
</span>
<span class="label able">사용가능</span>
<span id="capable" class="display">${availableport.length}</span>
<span class="label disable">불량</span>
<span id="Disable" class="display">${disableport.length}</span>
<span class="label ing">사용중</span>
<span id="occupying" class="display">${usingport.length}</span>
<span class="label bridge">브릿지</span>
<span id="Bridge" class="display">${bridgeport.length}</span>
<input type="button" class="spread" value="펼쳐보기" data-id='{"sharenum":${sharenum},"portnumber":${portnumber},"port_height":${port_height}}' onclick="spread_MDF(this)">
<span class="h port">포트</span>
<span class="h use">용도</span>
<span class="h refer">비고</span>
</div>
<div class="portsinport">
${plus_ports}
</div>
</div>`
}

dbshow.CDF_E1 = function(opp_usingport,opp_bridgeport,opp_disableport,_id,sharenum,portname,nodename,oppnodename,portnumber,porttype,cabletype,usingport,bridgeport,disableport,availableport,reference,usage,connectstat,latestupdate){
  var cablecolor = 'gray';
  if(cabletype=="optical"){
    cablecolor = 'yellow';
  }
  var set_disable_list = '<option selected></option>';
  var remove_disable_list = '<option selected></option>';
	for(var i = 1;i<=portnumber;i++){
    if(availableport.indexOf(i) != -1){
      set_disable_list += `<option class="diset${i}" value='${i}'>${i}번 포트</option>`;
    }else{
      set_disable_list += `<option class="diset${i}" value='${i}' style="display:none">${i}번 포트</option>`;
    }
		if(disableport.indexOf(i) != -1){
      remove_disable_list += `<option class="disrem${i}" value='${i}'>${i}번 포트</option>`;
    }else{
      remove_disable_list += `<option class="disrem${i}" value='${i}' style="display:none">${i}번 포트</option>`;
    }
	}
  var plus_ports = "";
  var background_color = "";
  for(var i = 1;i<=portnumber;i++){
    if(disableport.indexOf(parseInt(i)) !=-1){
      background_color = "red";
      title = "";
    }else if(usingport.indexOf(parseInt(i)) != -1 && bridgeport.indexOf(parseInt(i)) === -1){
      background_color = "green";
      title = `<현재 연결되어있는 단자>
${connectstat[i][0].oppnodename}(으)로 가는${connectstat[i][0].portname}의 ${connectstat[i][0].num}번 포트`
    }else if(usingport.indexOf(parseInt(i)) != -1 && bridgeport.indexOf(parseInt(i)) != -1){
      background_color = "orange";
      title = `<현재 연결되어있는 단자>
[상태 : 브릿지]
[브릿지 수 : ${connectstat[i].length}]`
      for(var j in connectstat[i]){
        title += `
${parseInt(j)+1}. ${connectstat[i][j].oppnodename}(으)로 가는${connectstat[i][j].portname}의 ${connectstat[i][j].num}번 포트`
      }
    }else{
      title = "";
      if(opp_usingport.indexOf(i) != -1){
        background_color = "lightgreen";
      }else if(opp_bridgeport.indexOf(i) != -1){
        background_color = "#FFD580";
      }else if(opp_disableport.indexOf(i) != -1){
        background_color = "tomato";
      }else{
        background_color = "";
      }
    }
    if(portnumber>32 && portnumber <65){
      if(i === 1 || i === 33){
        plus_ports += `<div class="CDF_E1_32row">`
      }
      plus_ports += `
<div class="CDF_E1_row"><span id="nUm" class="num n${i}" title="${title}" data-id = '{"_id" : ${_id}, "sharenum" : ${sharenum}, "num" : ${i}, "nodename" : "${nodename}", "oppnodename" : "${oppnodename}", "portname" : "${portname}"}' style="background:${background_color}">${i}</span>
<input type="text" value="${usage[i]}" class="usage u${i}" style="display:none;" data-id='{"_id" : ${_id}, "num" : ${i}}'>
<input type="text" class="ref r${i}" style="display:none;" value="${reference[i]}" data-id='{"_id" : ${_id}, "num" : ${i}}'></div>`
      if(i === 32 || i === portnumber){
        plus_ports += `</div>`
      }
      var port_width = 20.8;
    }else if(portnumber>64 && portnumber <97){
      if(i === 1 || i === 33 || i === 65){
        plus_ports += `<div class="CDF_E1_32row">`
      }
      plus_ports += `
<div class="CDF_E1_row"><span id="nUm" class="num n${i}" title="${title}" data-id = '{"_id" : ${_id}, "sharenum" : ${sharenum}, "num" : ${i},  "nodename" : "${nodename}", "oppnodename" : "${oppnodename}", "portname" : "${portname}"}' style="background:${background_color}">${i}</span>
<input type="text" value="${usage[i]}" class="usage u${i}" style="display:none;" data-id='{"_id" : ${_id}, "num" : ${i}}'>
<input type="text" class="ref r${i}" style="display:none;" value="${reference[i]}" data-id='{"_id" : ${_id}, "num" : ${i}}'></div>`
      if(i === 32 || i === 64 || i === portnumber){
          plus_ports += `</div>`
      }
      var port_width = 31.2;
    }else if(portnumber>97){
      if(i === 1 || i === 33 || i === 65 || i === 97){
        plus_ports += `<div class="CDF_E1_32row">`
      }
      plus_ports += `
<div class="CDF_E1_row"><span id="nUm" class="num n${i}" title="${title}" data-id = '{"_id" : ${_id}, "sharenum" : ${sharenum}, "num" : ${i}, "nodename" : "${nodename}", "oppnodename" : "${oppnodename}", "portname" : "${portname}"}' style="background:${background_color}">${i}</span>
<input type="text" value="${usage[i]}" class="usage u${i}" style="display:none;" data-id='{"_id" : ${_id}, "num" : ${i}}'>
<input type="text" class="ref r${i}" style="display:none;" value="${reference[i]}" data-id='{"_id" : ${_id}, "num" : ${i}}'></div>`
      if(i === 32 || i === 64 || i === 96 || i === portnumber){
        plus_ports += `</div>`
      }
      var port_width = 41.6;
    }else{
      if(i===1){
        plus_ports += `<div class="CDF_E1_32row">`
      }
      plus_ports += `
<div class="CDF_E1_row"><span id="nUm" class="num n${i}" title="${title}" data-id = '{"_id" : ${_id}, "sharenum" : ${sharenum}, "num" : ${i}, "nodename" : "${nodename}", "oppnodename" : "${oppnodename}", "portname" : "${portname}"}' style="background:${background_color}">${i}</span>
<input type="text" value="${usage[i]}" class="usage u${i}" style="display:none;" data-id='{"_id" : ${_id}, "num" : ${i}}'>
<input type="text" class="ref r${i}" style="display:none;" value="${reference[i]}" data-id='{"_id" : ${_id}, "num" : ${i}}'></div>`
      if(i===portnumber){
        plus_ports += `</div>`
      }
      var port_width = 13;
    }
  }
  return `
	<div class="CDF_E1" id="p${sharenum}">
	<div id="disable_party_none" style="display: none">
	<form action="/delete_port" method="post" class="deleting_port" onsubmit="return checkDeletePort(${sharenum})">
	    <input type="hidden" name="thisnode" value="${nodename}">
	    <input type="hidden" name="sharenum" value="${sharenum}">
	    <input type="hidden" class="Oppnode" name="oppnode" value="${oppnodename}">
	    <input type="submit" class="deleteport" id="deleteport_none" title="포트 삭제" value="포트 삭제" style="display: none;">
	</form>
	  <select class="set_disable_select">
	    ${set_disable_list}
	  </select>
	  <input type="button" class="set_disable_button" id=${sharenum} data-id='{"_id" : ${_id}}' value="불량설정" onclick="setting_disable(this)">
	  <select class="remove_disable_select">
	    ${remove_disable_list}
	  </select>
	  <input type="button" class="remove_disable_button" id=${sharenum} data-id='{"_id" : ${_id}}' value="불량해제" onclick="removing_disable(this)">
	</div>
	<div class="port_controlers">
  	<span style="border-bottom:solid 0.5rem ${cablecolor}" class="nodetitle">
      ${oppnodename}
  	</span>
  	<span class="porttitle">
      ${portname}
  	</span>
  	<span class="label able">사용가능</span>
  	<span id="capable" class="display">${availableport.length}</span>
  	<span class="label disable">불량</span>
    <span id="Disable" class="display">${disableport.length}</span>
    <span class="label ing">사용중</span>
    <span id="occupying" class="display">${usingport.length}</span>
    <span class="label bridge">브릿지</span>
    <span id="Bridge" class="display">${bridgeport.length}</span>
  	<input type="button" class="spread" data-id='{"sharenum":${sharenum},"portnumber":${portnumber},"port_width":${port_width}}' value="펼쳐보기" onclick="spread_CDF(this)">
  	<span class="h port">포트</span>
  	<span class="h use">용도</span>
  	<span class="h refer">비고</span>
	</div>
	<div class="portsinport" style="width:${port_width}rem">
	${plus_ports}
	</div>
	</div>`
}

module.exports = dbshow;
