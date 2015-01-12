//预定义代码块
var codeBlock = '';
var GLOBAL = {}
GLOBAL.staticArray = [];
var isInitFace = 0;
var isDataList = 0;
var tcss_link_main = {
  "点击流":"http://tcss.oa.com/TCSS/Pages/HotLink/TrendPage.aspx?beginDate={begin_date}&EndDate={end_date}&url=&domain={domain}&HotTag={name}",
  "页面PVUV":"http://tcss.oa.com/tcss/pages/pvuv/default.aspx?PreciseMatchUrl=all&domain={domain}&BeginDate={begin_date}&EndDate={end_date}&Url={name}",
  "页面来源":"http://tcss.oa.com/TCSS/Pages/SourceAnalysis/Default.aspx?BeginDate={begin_date}&EndDate={end_date}&domain={domain}&RefUrl=adtag{name}"
}

var dataType = {
  "点击流":"type-hot",
  "页面PVUV":"type-pvuv",
  "页面来源":"type-adtag"
}

//重构查看模式开启
function staticModeStart (argument) {
  var data_pre = "";
  var idNum = 1;
  var tempName = "dataCheckTool_" + idNum,tempValue = "",data_main = "";
  var isAdtag = 0;
  var tempArray_1 = "";

  //data_pre:页面前缀
  if($('meta[name="page"]').attr("content") != undefined){
    tempArray_1 = $('meta[name="page"]').attr("content").replace(",","").split(",") ;//去掉第一个逗号
  }
  
  var tempArray_2 = [];
  for (var i = 0; i < tempArray_1.length; i++) {
    if (tempArray_1[i] != "") {      
        tempArray_2.push(tempArray_1[i]);
    }
  }

  if(tempArray_1 != ""){
    data_pre = tempArray_2.join(".");
  }

  //通过data-stat方式添加的点击流
  if($("[data-stat]").length != 0){
    $("[data-stat]").each(function(){
      data_main = $(this).attr("data-stat");
      dataNameShow($(this),tempName,data_main,data_pre);
      idNum++;
    });
  }

  //通过@@方式添加的点击流
  if($("[class*='@']").length != 0){
    $("[class*='@']").each(function(){
      if($(this).attr("class").match(/\@.*\@/)){
        data_main = $(this).attr("class").match(/\@.*\@/).toString().replace(/\@/g,"");
        dataNameShow($(this),tempName,data_main,data_pre);
        idNum++;
      }
    });
  }
  
  //通过ADTAG方式添加的来源统计
  $("a[href]").each(function(){
    var link = $(this).attr("href");
    if(link.match("ADTAG=")){
      link = $(this).attr("href").split("ADTAG=")[1];
      if(link.match("&")){
        link = $(this).split("&")[0];
      }

      adtagNameShow($(this),tempName,link);
      idNum++;
    }
  });

}

//重构查看模式关闭
function staticModeStop (argument) {
  var string = "";
  for (var i in GLOBAL.staticArray) {
    var name = GLOBAL.staticArray[i]["name"];
    $("." + name).attr("title",GLOBAL.staticArray[i]["value"]);
  }
}

//初始化数据界面
function initFace (){
  if(isInitFace == 0 || $("#dataCheckWrap").length == 0){
    var codeBlock = '<div id="dataCheckWrap">'
                  + '<div id="dataCheckTool">'
                  + '<div class="data-head"><h2><span class="ico-tool"><!--工具图标--></span>Lean</h2></div>'
                  + '<div class="data-body">'
                  + '<p class="data-info">正在检测数据…</p>'
                  + '</div>'
                  + '</div>'
                  + '</div>';

    $("body").append(codeBlock);
    $("#dataCheckTool").easydrag();
    isInitFace = 1;
    isIncComm();

    $("#dataCheckTool").delegate(".btn-copy","click",function(){
      dataCopy($(this));
    });
  }
}

//初始化数据表格 
function initDataList (){
  if(isInitFace == 0 || $("#dataCheckWrap").length == 0){
    initFace();
  }
  if(isDataList == 0){
    var codeBlock = '<table>'
                  + '<tbody>'
                  + '</tbody>'
                  + '</table>';            
    $("#dataCheckTool .data-body").html(codeBlock);

    isDataList = 1;
  }
}

//未接收SDC信息，报错
function showErrorTip (){
  var codeBlock = '<p class="data-info-error">此页面尚未添加JS统计组件！</p>';
  $("#dataCheckTool .data-body").html(codeBlock);
}

//返回一条数据代码行
function getCodeLine (datas){

  //获取当前年、月、日
  var date_begin = new Date();
  var date_end = new Date();
  date_begin.setDate(1);

  if(date_end.getMonth() == 0){
    date_begin.setMonth(11);
  }else{
    date_begin.setMonth(date_end.getMonth() - 1);
  }

  var codeLine = '<tr><td class="data-type {datatype}">{type}</td><td class="data-line"><a href="{link}" title="{name}" target="_blank">{name}</a></td><td class="data-opt"><a class="btn-copy" href="#none">复制</a></td></tr>';
  var string = "",tcss_string = "";
  for (var i = 0; i < datas.length; i++) {
    tcss_string = tcss_link_main[datas[i].type].replace(/{domain}/g,datas[i].domain).replace(/{name}/g,datas[i].name).replace(/{begin_date}/g,dateFormat(date_begin,'yyyy-MM-dd')).replace(/{end_date}/g,dateFormat(date_end,'yyyy-MM-dd'));
    type_string = dataType[datas[i].type];
    string += codeLine.replace(/{type}/g,datas[i].type).replace(/{name}/g,datas[i].name).replace(/{link}/g,tcss_string).replace(/{datatype}/g,type_string);
  }
  return string;
}

//日期格式化
function dateFormat(date,format){
  var temp_date = date;
  var o = {
    "M+" : temp_date.getMonth()+1, //month
    "d+" : temp_date.getDate(),    //day
    "h+" : temp_date.getHours(),   //hour
    "m+" : temp_date.getMinutes(), //minute
    "s+" : temp_date.getSeconds(), //second
    "q+" : Math.floor((temp_date.getMonth()+3)/3),  //quarter
    "S" : temp_date.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format))
    {
        format = format.replace(RegExp.$1,(temp_date.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o)
    {
        if(new RegExp("("+ k +")").test(format))
        {
            format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}

//更新当前页面的数据板块
function updatedDataList (datas) {
  initDataList();
  $("#dataCheckTool tbody").append(getCodeLine(datas));

  //滚动条始终置底
  $("#dataCheckTool tbody").scrollTop($("#dataCheckTool tbody").height());
}

//复制数据
function dataCopy(dom){
  var string = dom.parent().prev().children().attr("title");
  window.prompt("ctrl+c复制，enter关闭弹窗即可",string);

  /*$(".btn-copy").zclip({
        path: "http://tid.tenpay.com/ui_static/demo/tinno/lean_swf/ZeroClipboard.swf",
        copy: function(){
        return $(this).parent().prev().children().attr("title");
        },
        afterCopy:function(){
            var $copysuc = $("<div class='copy-tips'><div class='copy-tips-wrap'>☺ 复制成功</div></div>");
            $("#dataCheckWrap").find(".copy-tips").remove().end().append($copysuc);
            $(".copy-tips").fadeOut(3000);
        }
    });*/
}

//清除当前页面的数据板块
function cleanDataList () {
  $("#dataCheckWrap").remove();
  isInitFace = 0;
  isDataList = 0;
}

//检测是否引入点击流JS组件
function isIncComm (){
  console.log("倒计时");
  window.setTimeout(function(){
    console.log("执行检测JS组件");
    if($(".data-line").length == 0){
      console.log("添加统计组件失败");
      showErrorTip();
    }
    else{console.log("添加统计组件成功");}
  },5000);
}

//重构模式点击流展示
function dataNameShow (object,domTag,cnt,pre){
  var tempValue = "",data_main = cnt,data_pre = pre;
  var pre_l = 0;
  //保存点击流的原title堆栈
  if(object.attr("title") != undefined){
    tempValue = object.attr("title")
  }
  GLOBAL.staticArray.push({"name":domTag,"value":tempValue});
  object.addClass(domTag);

  //meta拼合节点点击流名称 = 4段；

  if(data_pre != ""){
    pre_l = data_pre.split(".").length;
  }

  if( pre_l + data_main.split(".").length >= 4){
    //行内点击流名称优先级最高
    var mainLg = data_main.split(".").length;
    var restLg = 4 - mainLg;
    var string = "";

    for(var i = 0;i < restLg;i++ ){
      string += data_pre.split(".")[i] + ".";
    }
    string += data_main;
    object.attr("title","点击流：" + string);
  }
  else {
    object.attr("title", "点击流添加不规范！特殊写法请开启数据检测验证");
  }

}

//重构模式ADTAG展示
function adtagNameShow (object,domTag,link){
  var tempValue = "",subString = "",datas = "",adtagString = "";
  var linkTrue = 0; 

  if(link.split(".").length == 4){
    adtagString = "来源统计名称：" + link;
    linkTrue = 1;
  }
  else{
    adtagString = "来源统计添加出错！";
  }

  //保存点击流的原title堆栈
  if(object.attr("title") != undefined){
    if(object.attr("title").match("点击流") != null){
      datas = object.attr("title") + "\n";
      subString = datas + adtagString;
      /*if (linkTrue == 1){
        if(!link.match(datas.replace("点击流：",""))){
          subString = datas + adtagString + "\nADTAG名称可能被点击流名称覆盖！建议只保留点击流名称";
        }
      }
      else {
        subString = datas + adtagString;
      }*/
    }
    else {
      tempValue = object.attr("title");
      GLOBAL.staticArray.push({"name":domTag,"value":tempValue});
      object.addClass(domTag);
      subString = adtagString;
    }
  }
  else {
    GLOBAL.staticArray.push({"name":domTag,"value":tempValue});
    object.addClass(domTag);
    subString = adtagString;
  }

  object.attr("title",subString);
}

//拖拽函数
(function($) {
    var isMouseDown = false;
    var currentElement = null;
    var dropCallbacks = {};
    var dragCallbacks = {};
    var bubblings = {};
    var lastMouseX;
    var lastMouseY;
    var lastElemTop;
    var lastElemLeft;
    var dragStatus = {};
    var holdingHandler = false;
    $.getMousePosition = function(e) {
        var posx = 0;
        var posy = 0;
        if (!e) {
            var e = window.event
        }
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY
        } else {
            if (e.clientX || e.clientY) {
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
            }
        }
        return {x: posx,y: posy}
    };
    $.updatePosition = function(e) {
        var pos = $.getMousePosition(e);
        var spanX = (pos.x - lastMouseX);
        var spanY = (pos.y - lastMouseY);
        var maxLeft = $(window).width() - $(currentElement).outerWidth();
        var maxTop = $(window).height() - 25;
        var top = (lastElemTop + spanY);
        var left = (lastElemLeft + spanX);
        if (currentElement.id != "unit-design-img") {
            if (top < 0) {
                top = 0
            } else {
                if (top > maxTop) {
                    top = maxTop
                }
            }
            if (left > maxLeft) {
                left = maxLeft
            } else {
                if (left < 0) {
                    left = 0
                }
            }
        }
        $(currentElement).css("top", top);
        $(currentElement).css("left", left)
    };
    $(document).mousemove(function(e) {
        if (isMouseDown && dragStatus[currentElement.id] != "false") {
            $.updatePosition(e);
            if (dragCallbacks[currentElement.id] != undefined) {
                dragCallbacks[currentElement.id](e, currentElement)
            }
            return false
        }
    });
    $(document).mouseup(function(e) {
        if (isMouseDown && dragStatus[currentElement.id] != "false") {
            isMouseDown = false;
            if (dropCallbacks[currentElement.id] != undefined) {
                dropCallbacks[currentElement.id](e, currentElement)
            }
            return false
        }
    });
    $.fn.ondrag = function(callback) {
        return this.each(function() {
            dragCallbacks[this.id] = callback
        })
    };
    $.fn.ondrop = function(callback) {
        return this.each(function() {
            dropCallbacks[this.id] = callback
        })
    };
    $.fn.dragOff = function() {
        return this.each(function() {
            dragStatus[this.id] = "off"
        })
    };
    $.fn.dragOn = function() {
        return this.each(function() {
            dragStatus[this.id] = "on"
        })
    };
    $.fn.setHandler = function(handlerId) {
        return this.each(function() {
            var draggable = this;
            bubblings[this.id] = true;
            dragStatus[draggable.id] = "handler";
            $("#" + handlerId).mousedown(function(e) {
                holdingHandler = true;
                $(draggable).trigger("mousedown", e)
            });
            $("#" + handlerId).mouseup(function(e) {
                holdingHandler = false
            })
        })
    };
    $.fn.easydrag = function(allowBubbling) {
        return this.each(function() {
            if (undefined == this.id || !this.id.length) {
                this.id = "easydrag" + (new Date().getTime())
            }
            bubblings[this.id] = allowBubbling ? true : false;
            dragStatus[this.id] = "on";
            $(this).mousedown(function(e) {
                if ((dragStatus[this.id] == "off") || (dragStatus[this.id] == "handler" && !holdingHandler)) {
                    return bubblings[this.id]
                }
                isMouseDown = true;
                currentElement = this;
                var pos = $.getMousePosition(e);
                lastMouseX = pos.x;
                lastMouseY = pos.y;
                lastElemTop = this.offsetTop;
                lastElemLeft = this.offsetLeft;
                $.updatePosition(e);
                return bubblings[this.id]
            })
        })
    }
})(jQuery);

chrome.runtime.onMessage.addListener(function(message, sender, emptyFunc){
  var datas = message;

  /*
    @datas : 后台传输的数据信息
      start:启动插件，重刷页面，并定时检测是否有发向SDC的包，若没有就提示木有添加组件
      end  :关闭插件
      staticStart : 重构模式开启
      staticStop : 重构模式关闭
      其他 :展示正常数据
  */

  switch(datas){
    case "dataStart":
        initFace();
        break;
    case "dataEnd":
        cleanDataList();
        break;
    case "staticStart":
        staticModeStart();
        break;
    case "staticStop":
        staticModeStop();
        break;
    case "noDataJs":
        showErrorTip();
    default:
        updatedDataList(datas);
  }
});