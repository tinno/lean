/*
	[预留模块]点击流筛选参数
	@isTagModeOn  : Boolean 点击流筛选模式开启，仅供背景页使用
	@delDataArray : Array 过滤点击流数据
	@tagDataArray : Array 标记点击流名称数据

*/
var isTagModeOn = false;
var delDataArray = ["TENPAY_V2.BROWSER.STAT.STORAGE"];
var markDataArray = [{"dataName":"TENPAY_V2.BROWSER.STAT.STORAGE","tagName":"用户登录"}];
var lastData = {};

/*
	功能标记
	
	监听程序开启 hasDataStart
	重构模式开启 hasStaticStart
	后台检测开启 isBgRequest
	0:服务关闭 | 1:服务开启
	{
		tabId:{
			"hasDataStart":0,
			"hasStaticStart":0
			}
	}
*/
var isBgRequest = 0;
var funcTags = {};

//开启监听窗口的标签页的总数，若为0，即关闭后台监听
var tabsCount = 0;

//设置监听程序开启标记
function dataSet (tabId,value){
	if (value == 1 || value == 0) {
		if(funcTags[tabId] == undefined){
			funcTags[tabId] = {"hasDataStart":value,"hasStaticStart":0};
		}
		else {
			funcTags[tabId]["hasDataStart"] = value;
		}
	}
	else {
		return false;
	}
}

//获取监听程序开启标记
function dataGet (tabId){
	if (funcTags[tabId] != undefined) {
		return funcTags[tabId]["hasDataStart"];
	}
	else {
		return undefined;
	}
}

//设置重构模式开启标记
function staticSet (tabId,value){
	if (value == 1 || value == 0) {
		if(funcTags[tabId] == undefined){
			funcTags[tabId] = {"hasDataStart":0,"hasStaticStart":value};
		}
		else {
			funcTags[tabId]["hasStaticStart"] = value;
		}
	}
	else {
		return false;
	}
}

//获取重构模式开启标记
function staticGet (tabId){
	if (funcTags[tabId] != undefined) {
		return funcTags[tabId]["hasStaticStart"];
	}
	else {
		return undefined;
	}
}

//删除标记列表
function tagDel (tabId){
	if (funcTags[tabId] != undefined) {
		delete funcTags[tabId];
	}
	else {
		return undefined;
	}
}

//后台监测开启
function requestCheckOpen (argument) {
	chrome.webRequest.onBeforeSendHeaders.addListener(statDataCheck,{urls: ["*://sdc.tenpay.com/*","*://pingtcss.qq.com/*","*://pingtas.qq.com/*"]});
	//tabAddEvents();
}

//后台监测关闭
function requestCheckClose (argument) {
	chrome.webRequest.onBeforeSendHeaders.removeListener(statDataCheck);
	//tabDelEvents();
}

//数据检测服务开启
function dataCheckOpen (tabId) {
	if(isBgRequest == 0){//判断后台是否开启请求监测
		isBgRequest = 1;
		requestCheckOpen();
	}
	dataSet(tabId,1);
	tabsCount++;
	chrome.tabs.reload(tabId);
}

//数据检测服务关闭
function dataCheckClose (tabId) {
	//执行关闭前台接收数据
	sendData(tabId,"dataEnd");

	tabsCount--;
	dataSet(tabId,0);
	if(tabsCount == 0){
		requestCheckClose();
		isBgRequest = 0;
	}
}

//检测页面点击流
function statDataCheck(detail){
	var currentTab = detail.tabId;

	if(dataGet(currentTab) == 0){//当前标签页未开启数据检测，将不发送捕获请求信息发送到该前台页面
		//console.log(detail.tabId + "该标签页未开启数据检测");
	}
	else if(dataGet(currentTab) == 1){
		//console.log(detail.tabId + "该标签页正在处理请求数据……");
		var datas = [],dataTemp = {};
		var url = detail.url;
		var dmValue = getPara("dm",url),
			rdmValue = getPara("rdm",url),
			hottagValue = getPara("hottag",url),
			argValue = getPara("arg",url),
			urlValue = getPara("url",url),
			rurlValue = getPara("rurl",url),
			adtValue = getPara("adt",url);

		if(dmValue.match(".hot")){

			//点击流筛选项预留功能，检测delDataArray，markDataArray 是否已包含，作分支处理
			if (isTagModeOn){
				if(delDataArray.length!=0){
					for(var i in delDataArray){
						if(delDataArray[i] == hottagValue){
							return;
						}
					}
				}
				if(markDataArray.length!=0){
					for(var i in markDataArray){
						if(markDataArray[i]["dataName"] == hottagValue){
							hottagValue = "[" + markDataArray[i]["tagName"] + "]" + hottagValue;
							break;
						}
					}
				}
			}

			//点击流统计
			dataTemp.type = "点击流";
			dataTemp.name = hottagValue;
			dataTemp.domain = dmValue.replace(".hot","");
			datas.push(dataTemp);
			sendData(currentTab,datas);
		}
		else if(dmValue != ""){
			datas.push({type:"页面PVUV",name:dmValue + "" + urlValue,domain:dmValue});
			
			if(rdmValue != "-"&&rdmValue != ""){

				if (rdmValue == "ADTAG") {
					dataTemp.name = /*"[ADTAG]" + */rurlValue;
					//来源统计页面统计
					dataTemp.type = "页面来源";
					dataTemp.domain = dmValue;
					datas.push(dataTemp);
				}
				else {
					//dataTemp.name = "[LINK]" + rdmValue + "" + rurlValue;
				}
			}
			
			sendData(currentTab,datas);
		}
	}
	return true;
	
}

//设置当前标签页的扩展图标数字提醒
function setIconText(currentTab){
	var num = 0;
	if(funcTags[tabId] == undefined){
		//设置无数字
		chrome.browserAction.setBadgeText({text:"",tabId:currentTab});
	}
	else {
		//查询整体的数字和，并设置当前标签页的数字提醒(1，2)
		num = dataGet(currentTab) + staticGet(currentTab);
		chrome.browserAction.setBadgeText({text:num,tabId:currentTab});
	}
}

//向给定ID的标签页传输数据
function sendData (tabId,datas) {
	//console.log(tabId + ":" + datas);
  	chrome.tabs.sendMessage(tabId,datas);
}

//向所有标签页传输数据
function sendDataAll (datas) {
	chrome.tabs.query({url:"*://*.tenpay.com/*"},function(tabs){
		for(var i in tabs){
			chrome.tabs.sendMessage(tabs[i].id,datas);
		}
	});
}

//获取url的参数值
function getPara(name,url){
  var params = url.split("?")[1].split("&");
  for (var i = 0; i < params.length; i++) {
    var array = params[i].split("=");
    var a = array[0],b = array[1];
    if (a.match(name)!=null){
      return b;
    }
  };
  return "";
}

/*
	绑定标签事件
*/
function tabAddEvents(){
	// 标签页刷新：标签标记不变，功能重启，图标数字不变
	chrome.tabs.onUpdated.addListener(function(tabId,changeInfo){
		reStart(tabId);
		if(changeInfo.url != undefined){
			console.log("页内发生跳转……");
		}
	});

	//标签页关闭：标签标记清除，图标数字清除
	chrome.tabs.onRemoved.addListener(function(tabId){
		tagDel(tabId);
	});

	// 标签页URL改变：标签标记清除，图标数字清除
	/*chrome.tabs.onReplaced.addListener(function(tabId){
		console.log("标签名称改变");
	});*/

	//选中标签变更时：标记不变，图标数字更新到当前功能开启项总和
	/*chrome.tabs.onActivated.addListener(function(tabId){
		
	});*/
}

/*
	绑定标签事件
*/
function tabDelEvents(){
	// 标签页刷新
	chrome.tabs.onUpdated.removeListener();

	//标签页关闭
	chrome.tabs.onRemoved.removeListener();

	// 标签页URL改变
	//chrome.tabs.onReplaced.removeListener();

	//选中标签变更时：标记不变，图标数字更新到当前功能开启项总和
	//chrome.tabs.onActivated.removeListener();
}

function reStart (tabId){
	console.log(dataGet(tabId) + "" + staticGet(tabId));
	if (dataGet(tabId) == 1) {
		sendData(tabId,"dataStart");
	}
	if (staticGet(tabId) == 1) {
		sendData(tabId,"staticStart");
	}
}

tabAddEvents();