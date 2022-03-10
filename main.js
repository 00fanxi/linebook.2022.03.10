var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var dbshow = require('./dbshow.js');
var allconnect = require('./lib/allconnect.js');

//몽고디비 모듈 사용
var MongoClient =require('mongodb').MongoClient;

var db;
var counterdb;
MongoClient.connect('mongodb://localhost:27017/local', function(err,client){
	if(err) {return console.log(err)}
		console.log('conncected with DB')
		db = client.db('connectdata');
		counterdb = client.db('counter');
});

var app = http.createServer(function(request,response){
	var _url = request.url;
	var queryData = url.parse(_url,true).query;
	var pathname = url.parse(_url,true).pathname;
	if(pathname === '/'){
		var nodelist = [];
		db.listCollections().toArray(function(err,collections){
			for(var i = 0;i<collections.length;i++){
				nodelist.push(collections[i].name);
			}
			if(queryData.id === undefined || nodelist.indexOf(queryData.id) === -1){
				fs.readFile(`./HOME/HOME.css`,'utf8',function(err,CSS){
					fs.readFile(`./linebook.js`,'utf8',function(err,JS){
						fs.readFile(`./linebook_ajax.js`,'utf8',function(err,ajax){
							fs.readFile(`./jquery-3.6.0.min.js`,'utf8',function(err,jquery){
								var HTML = template.HOME_HTML(CSS,JS,jquery,ajax,nodelist);
								response.writeHead(200);
								response.end(HTML);
							});
						});
					});
				});
			}else{
				fs.readFile(`./linebook.css`,'utf8',function(err,CSS){
						fs.readFile(`./CDF_E1.css`,'utf8',function(err,CDF_E1){
							fs.readFile(`./MDF.css`,'utf8',function(err,MDF){
								fs.readFile(`./linebook.js`,'utf8',function(err,JS){
									fs.readFile(`./jquery-3.6.0.min.js`,'utf8',function(err,jquery){
										fs.readFile(`./linebook_ajax.js`,'utf8',function(err,ajax){
											var title = queryData.id;
											var list = template.List(nodelist,title);
											var newportform = template.NEWPORTFORM(nodelist,title);
											db.collection(title).find().toArray(function(err,result){
												var porttotal = result.length;
												var opp_usingport;
												var opp_bridgeport;
												var opp_disableport;
												var opp_json =[];
												function getOpps(result, callback){
													var got = 0;
													for(var i in result){
														oppnodename = result[i].oppnodename;
														oppsharenum = result[i].sharenum;
														db.collection(oppnodename).find({sharenum : oppsharenum}).toArray(function(err,result2){

															opp_usingport = result2[0].usingport;
															opp_bridgeport = result2[0].bridgeport;
															opp_disableport = result2[0].disableport;
															var j;
														  for(var l in opp_bridgeport){
													 		  j = opp_usingport.indexOf(opp_bridgeport[l]);
												 		 	  opp_usingport.splice(j,1);
												 	 	  }
															opp_json.push([opp_usingport,opp_bridgeport,opp_disableport]);
															if(++got === result.length){
																callback();
															}
													  });
												  }
												}
												function callback(){
													var ports = dbshow.showport(opp_json,porttotal,result);
													var allcon = allconnect.template();
													var HTML = template.HTML(title,CSS,CDF_E1,MDF,JS,jquery,ajax,list,ports,allcon,newportform);
													response.writeHead(200);
													response.end(HTML);
												}
												if(result.length === 0){
													var allcon = allconnect.template()
													var HTML = template.HTML(title,CSS,CDF_E1,MDF,JS,jquery,ajax,list,"",allcon,newportform);
													response.writeHead(200);
													response.end(HTML);
												}else{
													getOpps(result,callback);
												}
											});
										});
									});
								});
							});
						});
				});
			}
		});
	}else if(pathname==='/check/nodename'){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			var newnodename = post.newnodename;

			db.listCollections().toArray(function(err,collections){
				var nodenames = [];
				for(var i in collections){
					nodenames.push(collections[i].name);
				}
				if(nodenames.indexOf(newnodename) === -1){
					var result = "true";
				}else{
					var result = "false";
				}
				console.log(result)
				response.writeHead(200)
				response.end(result);
			});
		});
	}else if(pathname==='/create_newnode'){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			var title = post.node_name;
			//디비에 해당 노드 이름의 콜렉션 생성
			db.createCollection(title,function(err,collection){
				response.writeHead(302, {Location:encodeURI(`/?id=${title}`)})
				response.end();
			});
		});

	//노드 변경사항 저장하기 (텍스트 값의 변경사항만 적용)
	}else if(pathname==="/create_newport"){
	var body = '';
	request.on('data',function(data){
		body = body + data;
	});
	request.on('end',function(){
		var post = qs.parse(body);
		var thisnode = post.thisnode;
		var port_name = `_${post.port_name}`;
		var thisnode = post.thisnode;
		var oppnode = post.oppnode;
		var cable_type = post.cable_type;
		var port_type = post.port_type;
		var port_number = post.port_number;
		var port_number_selfInput = post.port_number_selfInput;
		var tr = post.TR;
		var opp_tr;
		var sharenum;
		var plus_port = "";
		var this_id;
		var opp_id;
		var latestupdate = Date();

		//포트 넘버 처리
		if(port_number==='others'){
			port_number = port_number_selfInput;
		}
		port_number = Number(port_number);

		//TX,RX 처리
		if(tr === "TX"){
			opp_tr = "RX";
		}else if(tr === "RX"){
			opp_tr = "TX";
		}else{
			opp_tr = "";
			tr = ""
		}

		//rx,tx 비고에 넣기
		function putrtx(port_type,reference,tr){
			var rtx;
			for(var i = 1;i<=port_number;i++){
				if(tr != ""){
					if(tr === 'TX'){
						if(i%2 != 0 && (i-1)%4 === 0){
							rtx = "TX";
						}else if(i%2 != 0 && (i-1)%4 != 0){
							rtx = "RX";
						}else{
							rtx = "";
						}
					}else{
						if(i%2 != 0 && (i-1)%4 === 0){
							rtx = "RX";
						}else if(i%2 != 0 && (i-1)%4 != 0){
							rtx = "TX";
						}else{
							rtx = "";
						}
					}
				}else{
					rtx = "";
				}
				reference[i] = rtx;
			}
			return reference;
		}

		//avaliable port,reference, usage, connectstat처리
		var available = [];
		var this_reference = {};
		var opp_reference = {};
		var usage = {};
		var connectstat = {};

			putrtx(port_type,this_reference,tr);
			putrtx(port_type,opp_reference,opp_tr);

		for(var i = 1;i<=port_number;i++){
			available.push(i);
			usage[i] = "";
			connectstat[i] = [];
		}

		//_id 및 sharenum 처리
		counterdb.collection('id_counter').findOne({_id : 'id_counter'},function(err,id_result){
			counterdb.collection('sharenum_counter').findOne({_id : 'sharenum_counter'},function(err,sharenum_result){
			//DB에 해당 포트 정보 생성, id_counter에 새로운 id 나가고, sharenum_counter에도 새로운 sharenum 나가고.
					this_id = id_result.id_counter;
					opp_id = this_id + 1;
					sharenum = sharenum_result.sharenum_counter;

					db.collection(thisnode).insertOne({
						_id : this_id,
						sharenum : sharenum,
						portname : port_name,
						nodename : thisnode,
						oppnodename : oppnode,
						portnumber : port_number,
						porttype: port_type,
						cabletype : cable_type,
						usingport : [],
						bridgeport : [],
						disableport : [],
						availableport : available,
						reference : this_reference,
						usage : usage,
						connectstat : connectstat,
						latestupdate : latestupdate
					},function(err,result){
						if(err) return console.log(err);
					});

					db.collection(oppnode).insertOne({
						_id : opp_id,
						sharenum : sharenum,
						portname : port_name,
						nodename : oppnode,
						oppnodename : thisnode,
						portnumber : port_number,
						porttype: port_type,
						cabletype : cable_type,
						usingport : [],
						bridgeport : [],
						disableport : [],
						availableport : available,
						reference : opp_reference,
						usage : usage,
						connectstat : connectstat,
						latestupdate : latestupdate
					},function(err,result){
						if(err) return console.log(err);
					});

				counterdb.collection('id_counter').updateOne({_id : 'id_counter'},{$inc : {id_counter : 2}},function(err,result){
				});
				counterdb.collection('sharenum_counter').updateOne({_id : 'sharenum_counter'},{$inc : {sharenum_counter : 1}},function(err,result){
				});
			});
		});

		response.writeHead(302,{location :encodeURI(`/?id=${thisnode}`)});
		response.end();
});

	//node 삭제 --------- 해당 노드를 삭제할 시 그 노드의 있는 포트들의 반대편 노드 단자들이 반대편 노드에 아직 남아있을 시 오류 발생
	// 노드를 삭제하면 해당 노드와 연결된 모든 포트들도 삭제되어야함. or 포트를 삭제할시 반대편 노드가 없는경우 그냥 넘어가는 프로세스 만들기

	}else if(pathname==="/save/refer"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var put = qs.parse(body);
			var nodename = put.nodename;
			var _id = parseInt(put._id);
			var num = parseInt(put.num);
			var content = put.content;
			var refnum = `reference.${num}`;

			db.collection(nodename).updateOne({_id : _id},{$set : {[refnum] : content}}, function(err,result){
			});
			response.writeHead(200);
			response.end();
		});
	}else if(pathname==="/save/usage"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var put = qs.parse(body);
			var nodename = put.nodename;
			var _id = parseInt(put._id);
			var num = parseInt(put.num);
			var content = put.content;
			var usagenum = `usage.${num}`;

			db.collection(nodename).updateOne({_id : _id},{$set : {[usagenum] : content}}, function(err,result){
			});
			response.writeHead(200);
			response.end();
		});
	}else if(pathname==="/save/disable"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var put = qs.parse(body);
			var nodename = put.nodename;
			var _id = parseInt(put._id);
			var num = parseInt(put.num);
			//ajax로 받은 값이 available에 있을 경우에만 실행
			db.collection(nodename).findOne({_id : _id}, function(err,result){
				if(result.availableport.indexOf(num) != -1){
					db.collection(nodename).updateOne({_id : _id},{$push : {disableport : num}}, function(err,result){
					});
					db.collection(nodename).updateOne({_id : _id},{$pull : {availableport : num}},function(err,result){
					});
					response.writeHead(200);
					response.end();
				};
			});

		});
	}else if(pathname==="/save/available"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var put = qs.parse(body);
			var nodename = put.nodename;
			var _id = parseInt(put._id);
			var num = parseInt(put.num);
			//ajax로 받은 값이 disable에 있을 경우에만 실행

			db.collection(nodename).findOne({_id : _id}, function(err,result){
				if(result.disableport.indexOf(num) != -1){
					db.collection(nodename).updateOne({_id : _id},{$push : {availableport : num}}, function(err,result){
					});
					db.collection(nodename).updateOne({_id : _id},{$pull : {disableport : num}},function(err,result){
					});
					response.writeHead(200);
					response.end();
				};
			});

		});
	}else if(pathname==="/connect_save"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			var str_scratch = post.save_whole;
			var center_name = post.center_name_s;
			var west_node = post.west_node_s;
			var east_node = post.east_node_s;
			var w_share = post.west_port_sharenum;
			var e_share = post.east_port_sharenum;
			var upload_log_file = post.upload_log_file;
			var str = str_scratch;

			//연결 기록 파일에 저장
			fs.unlink(`./connectdata/${center_name}`,function(err){
			});
			fs.writeFile(`./connectdata/${center_name}`,upload_log_file,'utf8',function(err){
			});
      //디비에 연결정보 저
      // var db;
      // MongoClient.connect('mongodb://localhost:27017/local', function(err,client){
      //   if(err) {return console.log(err)}
      //     console.log('conncected with DB')
      //   db = client.db('connectdata');
      //   db.collection(center_name).insertMany([{name:'James',age:20},{name:'Merry',age:19}],function(err,result){
      //     console.log('save complete')
      //   });
      // });
			//////////////////////////////////////////////////////////////////////
			//west_content 만들기
			var match1 = str.match(/<!--shar.numS/);
			var match2 = str.match(/shar.numS-->/);
			//연결관리 페이지가 빈 상태에서 하는게 아니라는 보장
			if(match1 !== null){
				var shareindex1 = str.indexOf(match1)+13;
				var shareindex2 = str.indexOf(match2);

				var west_sharenum = str.slice(shareindex1,shareindex2);

				var pattern1 = new RegExp("<!--shar.numS"+west_sharenum+"shar.numS-->");
				var pattern2 = new RegExp("<!--shar.numE"+west_sharenum+"shar.numE-->")

				var match1 = str.match(pattern1);
				var match2 = str.match(pattern2);

				var contentindex1 = str.indexOf(match1);
				var contentindex2 = str.indexOf(match2)+25+west_sharenum.toString().length;

				var west_content = str.slice(contentindex1,contentindex2);

				str = str.slice(0,contentindex1) + str.slice(contentindex2);
			}

			//east_content 만들기
			var match1 = str.match(/<!--shar.numS/);
			var match2 = str.match(/shar.numS-->/);
			if(match1 !== null){
				var shareindex1 = str.indexOf(match1)+13;
				var shareindex2 = str.indexOf(match2);

				var east_sharenum = str.slice(shareindex1,shareindex2);

				var pattern1 = new RegExp("<!--shar.numS"+east_sharenum+"shar.numS-->");
				var pattern2 = new RegExp("<!--shar.numE"+east_sharenum+"shar.numE-->")

				var match1 = str.match(pattern1);
				var match2 = str.match(pattern2);

				var contentindex1 = str.indexOf(match1);
				var contentindex2 = str.indexOf(match2)+25+east_sharenum.toString().length;

				var east_content = str.slice(contentindex1,contentindex2);
			}

			fs.readFile(`./data/${center_name}`,'utf8',function(err,data){
				//west_port 저장
				if(west_content !== undefined && west_sharenum !== undefined){
				var west_index1 = data.indexOf(`<!--sharenumS${west_sharenum}sharenumS-->`);
				var west_index2 = data.indexOf(`<!--sharenumE${west_sharenum}sharenumE-->`) +25+ west_sharenum.toString().length;

				var new_content1 = data.slice(0,west_index1);
				var new_content2 = data.slice(west_index2);

				var data = new_content1 + west_content + new_content2;
				var new_content_t = data;
				}
				//east_port 저장
				if(east_content !== undefined && east_sharenum !== undefined){
				var east_index1 = data.indexOf(`<!--sharenumS${east_sharenum}sharenumS-->`);
				var east_index2 = data.indexOf(`<!--sharenumE${east_sharenum}sharenumE-->`)+ 25 + east_sharenum.toString().length;

				var new_content1 = data.slice(0,east_index1);
				var new_content2 = data.slice(east_index2);

				var new_content_t = new_content1 + east_content + new_content2;
				}

				fs.unlink(`./data/${center_name}`,function(err){
				});

				fs.writeFile(`./data/${center_name}`,new_content_t,"utf8",function(err){
				});
			});
			response.writeHead(302,{Location:encodeURI(`/connect_control`)});
			response.end();
		});
	//새로운 포트 만들기
	}else if(pathname==="/delete_process"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			var id = post.id;
			//DB의 해당 노드 컬렉션 삭제
			db.collection(id).drop(function(err,delok){
				response.writeHead(302, {Location:`/`});
				response.end();
			});
		});

//포트 삭제
	}else if(pathname==="/delete_port"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			var thisnode = post.thisnode;
			var oppnode = post.oppnode;
			var sharenum = post.sharenum;
			numin = Number(sharenum);
			//db에서 해당 DOC삭제
			db.collection(thisnode).deleteOne({sharenum : numin},function(err,result){
				if(err) throw err;
				db.collection(oppnode).deleteOne({sharenum : numin},function(err,result){
					if(err) throw err;
					response.writeHead(302,{Location:encodeURI(`/?id=${thisnode}`)});
					response.end();
				});
			});
		});

	}else if(pathname==="/connect/thisnode"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			var thisnode = post.nodename;
			// collection 이름에는 empty가 들어갈 수 없다.
			if(thisnode != ""){
				var oppnodelist = [];
				db.collection(thisnode).find({}).toArray(function(err,result){
					for(var i = 0;i<result.length;i++){
						oppnodelist.push(result[i].oppnodename);
					};
					var json = {oppnodelist : oppnodelist};
					json = JSON.stringify(json);

					response.writeHead(200);
					response.end(json);
				});
			}
		});
	}else if(pathname==="/connect/oppnode"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			var thisnode = post.nodename;
			var oppnode = post.oppnodename;
			var which_side = post.which_side;

			if(oppnode != ""){
				db.collection(thisnode).find({oppnodename : oppnode}).toArray(function(err,result){
					var portnamelist = [];
					for(var i in result){
						portnamelist.push(result[i].portname);
					};

					if(portnamelist != []){
						var json = {portnamelist : portnamelist};
						json = JSON.stringify(json);

						response.writeHead(200);
						response.end(json);
					}
				})
			}else{
				var json = {portnamelist : []};
				json = JSON.stringify(json);

				response.writeHead(200);
				response.end(json);
			}
		});
	}else if(pathname==="/connect/portname"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			var thisnode = post.nodename;
			var oppnode = post.oppnodename;
			var portname = post.portname;

			if(portname != ""){
				db.collection(thisnode).find({oppnodename : oppnode, portname : portname}).toArray(function(err,result){
					// 반대 포트 연결상태 확인후 using,available,disable 추출
					var p = result[0];
					var connect_data = p.connectstat;
					db.collection(p.oppnodename).find({sharenum : p.sharenum}).toArray(function(err,result){

				    var opp_usingport = result[0].usingport;
				    var opp_bridgeport = result[0].bridgeport;
				    var opp_disableport = result[0].disableport;
				    var j;
				    for(var i in opp_bridgeport){
				      j = opp_usingport.indexOf(opp_bridgeport[i]);
				      opp_usingport.splice(j,1);
				    }
						var port = dbshow.showportOne(opp_usingport,opp_bridgeport,opp_disableport,p);

						var data_json = {port : port, connect_data : connect_data};
						data_json = JSON.stringify(data_json);
						response.writeHead(200);
						response.end(data_json);
					});
				});
			}else{
				var data_json = `{"port" : "", "connect_data" : ""}`;
				response.writeHead(200);
				response.end(port);
			}
		});
	}else if(pathname==="/connect/connecting"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			var west_json = JSON.parse(post.west_json);
			var east_json = JSON.parse(post.east_json);

			var w_sharenum = west_json.sharenum;
			var w_num = west_json.num;
			var e_sharenum = east_json.sharenum;
			var e_num = east_json.num;
			var nodename = west_json.nodename;

			db.collection(nodename).find({sharenum : w_sharenum}).toArray(function(err,result){
				var connectstat = result[0].connectstat;
				connectstat[w_num].push(east_json);
				var w_connect_data = connectstat;
				//새로 연결된 포트가 usingport에 있으면 bridgeport에 해당 포트를 추가하고. 없으면 usingport에만 추가.
				if(result[0].usingport.indexOf(w_num) != -1){
					db.collection(nodename).updateOne({sharenum : w_sharenum},{$push : {bridgeport : w_num}}, function(err,result){
					});
				}else{
					db.collection(nodename).updateOne({sharenum : w_sharenum},{$push : {usingport : w_num}}, function(err,result){
					});
					db.collection(nodename).updateOne({sharenum : w_sharenum},{$pull : {availableport : w_num}}, function(err,result){
					});
				}

				var connectstat_num = `connectstat.${w_num}`;
				db.collection(nodename).updateOne({sharenum : w_sharenum},{$set : {[connectstat_num] : connectstat[w_num]}},function(err,result){
				});

				db.collection(nodename).find({sharenum : e_sharenum}).toArray(function(err,result){
					var connectstat = result[0].connectstat;
					connectstat[e_num].push(west_json);
					var e_connect_data = connectstat;

					//새로 연결된 포트가 usingport에 있으면 bridgeport에 해당 포트를 추가하고. 없으면 usingport에만 추가.
					if(result[0].usingport.indexOf(e_num) != -1){
						db.collection(nodename).updateOne({sharenum : e_sharenum},{$push : {bridgeport : e_num}}, function(err,result){
						});
					}else{
						db.collection(nodename).updateOne({sharenum : e_sharenum},{$push : {usingport : e_num}}, function(err,result){
						});
						db.collection(nodename).updateOne({sharenum : e_sharenum},{$pull : {availableport : e_num}}, function(err,result){
						});
					}

					var connectstat_num = `connectstat.${e_num}`;
					db.collection(nodename).updateOne({sharenum : e_sharenum},{$set : {[connectstat_num] : connectstat[e_num]}},function(err,result){
					});
					//west
					db.collection(nodename).find({sharenum : w_sharenum}).toArray(function(err,w){
						// 반대 포트 연결상태 확인후 using,available,disable 추출
						var p = w[0];
						db.collection(p.oppnodename).find({sharenum : p.sharenum}).toArray(function(err,result){

							var opp_usingport = result[0].usingport;
							var opp_bridgeport = result[0].bridgeport;
							var opp_disableport = result[0].disableport;
							var j;
							for(var i in opp_bridgeport){
								j = opp_usingport.indexOf(opp_bridgeport[i]);
								opp_usingport.splice(j,1);
							}
							var w_port = dbshow.showportOne(opp_usingport,opp_bridgeport,opp_disableport,p);
							//east
							db.collection(nodename).find({sharenum : e_sharenum}).toArray(function(err,e){
								// 반대 포트 연결상태 확인후 using,available,disable 추출
								var p = e[0];
								db.collection(p.oppnodename).find({sharenum : p.sharenum}).toArray(function(err,result){

									var opp_usingport = result[0].usingport;
									var opp_bridgeport = result[0].bridgeport;
									var opp_disableport = result[0].disableport;
									var j;
									for(var i in opp_bridgeport){
										j = opp_usingport.indexOf(opp_bridgeport[i]);
										opp_usingport.splice(j,1);
									}
									var e_port = dbshow.showportOne(opp_usingport,opp_bridgeport,opp_disableport,p);

									var data_json = {w_connect_data : w[0].connectstat, e_connect_data : e[0].connectstat, w_port : w_port, e_port : e_port};
									data_json = JSON.stringify(data_json);
									response.writeHead(200);
									response.end(data_json);
								});
							});
						});
					});
				});
			});
		});
	}else if(pathname==="/connect/disconnecting"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			var west_json = JSON.parse(post.west_json);
			var east_json = JSON.parse(post.east_json);

			console.log(west_json)
			var w_sharenum = west_json.sharenum;
			var w_num = west_json.num;
			var e_sharenum = east_json.sharenum;
			var e_num = east_json.num;
			var nodename = west_json.nodename;

			console.log(nodename)

			//WEST
			db.collection(nodename).find({sharenum : w_sharenum}).toArray(function(err,result){
				var connectstat = result[0].connectstat;
				var w_new_connectstat = [];
				for(var i in connectstat[w_num]){
					if(connectstat[w_num][i].sharenum !== e_sharenum || connectstat[w_num][i].num !== e_num){
						w_new_connectstat.push(connectstat[w_num][i]);
					}
				}
				if(result[0].bridgeport.indexOf(w_num) === -1){
					db.collection(nodename).updateOne({sharenum : w_sharenum},{$pull : {usingport : w_num}}, function(err,result){
					});
					db.collection(nodename).updateOne({sharenum : w_sharenum},{$push : {availableport : w_num}}, function(err,result){
					});
				}else if(result[0].bridgeport.indexOf(w_num) !== -1){
					if(result[0].connectstat[w_num].length === 2){
						db.collection(nodename).updateOne({sharenum : w_sharenum},{$pull : {bridgeport : w_num}}, function(err,result){
						});
					}
				}
				var connectstat_num = `connectstat.${w_num}`;
				db.collection(nodename).updateOne({sharenum : w_sharenum},{$set : {[connectstat_num] : w_new_connectstat}},function(err,result){
				});

				//EAST
				db.collection(nodename).find({sharenum : e_sharenum}).toArray(function(err,result){
					var connectstat = result[0].connectstat;
					var e_new_connectstat = [];
					for(var i in connectstat[e_num]){
						if(connectstat[e_num][i].sharenum !== w_sharenum || connectstat[e_num][i].num !== w_num){
							e_new_connectstat.push(connectstat[e_num][i]);
						}
					}
					if(result[0].bridgeport.indexOf(e_num) === -1){
						db.collection(nodename).updateOne({sharenum : e_sharenum},{$pull : {usingport : e_num}}, function(err,result){
						});
						db.collection(nodename).updateOne({sharenum : e_sharenum},{$push : {availableport : e_num}}, function(err,result){
						});
					}else if(result[0].bridgeport.indexOf(e_num) !== -1){
						if(result[0].connectstat[e_num].length === 2){
							db.collection(nodename).updateOne({sharenum : e_sharenum},{$pull : {bridgeport : e_num}}, function(err,result){
							});
						}
					}

					var connectstat_num = `connectstat.${e_num}`;
					db.collection(nodename).updateOne({sharenum : e_sharenum},{$set : {[connectstat_num] : e_new_connectstat}},function(err,result){
					});

					//west
					db.collection(nodename).find({sharenum : w_sharenum}).toArray(function(err,w){
						// 반대 포트 연결상태 확인후 using,available,disable 추출
						var p = w[0];
						db.collection(p.oppnodename).find({sharenum : p.sharenum}).toArray(function(err,result){

							var opp_usingport = result[0].usingport;
							var opp_bridgeport = result[0].bridgeport;
							var opp_disableport = result[0].disableport;
							var j;
							for(var i in opp_bridgeport){
								j = opp_usingport.indexOf(opp_bridgeport[i]);
								opp_usingport.splice(j,1);
							}
							var w_port = dbshow.showportOne(opp_usingport,opp_bridgeport,opp_disableport,p);
							//east
							db.collection(nodename).find({sharenum : e_sharenum}).toArray(function(err,e){
								// 반대 포트 연결상태 확인후 using,available,disable 추출
								var p = e[0];
								db.collection(p.oppnodename).find({sharenum : p.sharenum}).toArray(function(err,result){

									var opp_usingport = result[0].usingport;
									var opp_bridgeport = result[0].bridgeport;
									var opp_disableport = result[0].disableport;
									var j;
									for(var i in opp_bridgeport){
										j = opp_usingport.indexOf(opp_bridgeport[i]);
										opp_usingport.splice(j,1);
									}
									var e_port = dbshow.showportOne(opp_usingport,opp_bridgeport,opp_disableport,p);

									var data_json = {w_connect_data : w[0].connectstat, e_connect_data : e[0].connectstat, w_port : w_port, e_port : e_port};
									data_json = JSON.stringify(data_json);
									response.writeHead(200);
									response.end(data_json);
								});
							});
						});
					});
				});
			});
		});
	}else if(pathname==="/connect_control"){
		var nodelist = [];
		db.listCollections().toArray(function(err,collections){
			for(var i = 0;i<collections.length;i++){
				nodelist.push(collections[i].name);
			}
			fs.readFile(`./connection/connection.css`,'utf8',function(err,CSS){
				fs.readFile(`./connection/connection.js`,'utf8',function(err,JS){
					fs.readFile(`./jquery-3.6.0.min.js`,'utf8',function(err,jquery){
						fs.readFile(`./connection/connection_ajax.js`,'utf8',function(err,ajax){
							fs.readFile(`./CDF_E1.css`,'utf8',function(err,CDF_E1){
								fs.readFile(`./MDF.css`,'utf8',function(err,MDF){
									var HTML = template.connect_control(CSS,CDF_E1,MDF,JS,jquery,ajax,nodelist);
									response.writeHead(200);
									response.end(HTML);
								});
							});
						});
					});
				});
			});
		});
	//연결관리 중 노드 옵션에 따른 opp노드의 옵션 자동 변화
	}else if(pathname==="/allconnect"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){
			var post = qs.parse(body);
			console.log(post);
			response.writeHead(200);
			response.end();
		});
	}else if(pathname==="/searching"){
		var body = '';
		request.on('data',function(data){
			body = body + data;
		});
		request.on('end',function(){

		});
	}else{
		response.writeHead(404);
		response.end('Not found');
	}
});
app.listen(3000);
