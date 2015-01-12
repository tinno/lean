//获取背景页面对象：用户记录、更新当前标签页ID及其开启服务情况
var GLOBAL = {}
GLOBAL.bgFuncs = chrome.extension.getBackgroundPage();

/*
	hds 数据检测服务开启标记
	hss 重构模式服务开启标记
	0:服务关闭 | 1:服务开启
*/
var hds = 0,hss = 0;
var tabId = 0,isTarLink = 0;

function init (){
	chrome.tabs.query({active:true}, function(array){
		var currentTab = array[0];
		tabId = currentTab.id;
		var url = currentTab.url;
		
		//判断标签页满足域名限制
		if(url.indexOf("tenpay.com") >= 0){
			isTarLink = 1;
		}

		//当前标签页是否被储存，是则读出服务开启信息，否，则默认未开启服务
		if(GLOBAL.bgFuncs.dataGet(tabId) != undefined){
			hds = GLOBAL.bgFuncs.dataGet(tabId);
			hss = GLOBAL.bgFuncs.staticGet(tabId);
		}
		faceInit();
	});
}

//界面初始化
function faceInit (){
	//满足检测需求及未满足检测需求的界面显示

	if(isTarLink == 1){
		$(".func").removeClass("hide");
	}
	else{
		$(".error-tips").removeClass("hide");
	}

	//功能按钮初始化
	if (hds == 0){
	  	$("#check_open").addClass("btn-work");
	 }
	else{
	  	$("#check_close").addClass("btn-work");
	}

	if (hss == 0){
	  	$("#static_open").addClass("btn-work");
	}
	else{
	  	$("#static_close").addClass("btn-work");
	}

	//加入图标的功能项提示；
} 

$(document).ready(function(){
	init();
});

//数据检测服务开启
$("#check_open").click(function(){
	GLOBAL.bgFuncs.dataCheckOpen(tabId);
	//GLOBAL.bgFuncs.dataSet(tabId,1);

	$(this).removeClass("btn-work");
	$("#check_close").addClass("btn-work");
});

//数据检测服务关闭
$("#check_close").click(function(){
	GLOBAL.bgFuncs.dataCheckClose(tabId);
	//GLOBAL.bgFuncs.dataSet(tabId,0);

	$(this).removeClass("btn-work");
	$("#check_open").addClass("btn-work");
});

//重构查看模式开启
$("#static_open").click(function(){
	GLOBAL.bgFuncs.sendData(tabId,"staticStart");
	GLOBAL.bgFuncs.staticSet(tabId,1);

	$(this).removeClass("btn-work");
	$("#static_close").addClass("btn-work");
});

//重构查看模式关闭
$("#static_close").click(function(){
	GLOBAL.bgFuncs.sendData(tabId,"staticStop");
	GLOBAL.bgFuncs.staticSet(tabId,0);

	$(this).removeClass("btn-work");
	$("#static_open").addClass("btn-work");
});

//[预留]点击流筛选项页 
$("#filter_set").click(function(){
	chrome.tabs.create({url:"options.html"},function(){
	});
});
