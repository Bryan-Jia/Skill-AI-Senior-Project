
var endPage = "end.html";
var previousPage = "consent.html";
var imagesPerSession;
var imageLocation = "./img/";
var sessionType;
//var imageLocation = "./img/original/";
var pictureOrder = initImagePool();//read the order of the testing image from the cookie, split the list by ","

const colorList = ["Aqua", "Blue", "BlueViolet", "Brown", "Chartreuse", "Chocolate", "CornflowerBlue", "DarkCyan",
    "DarkGreen", "DarkOrange", "DarkMagenta", "DarkKhaki", "DarkSeaGreen", "DeepPink", "DeepSkyBlue", "Fuchsia", "GreenYellow", "HotPink", "Indigo",
    "Khaki", "LawnGreen", "MediumPurple", "Yellow", "Aquamarine", "IndianRed", "DarkOrchid", "Gold", "MediumVioletRed"];


var colorMap = new Map();
var testerMap; //(order, x, y, conf, type, changeFrom?)
var broswerWidth = window.innerWidth * 0.8;
var picWidth = broswerWidth / 2;
var sizeRatio = picWidth / 1024;
var moveDistance = 0;
var stack = [];
var picIndex = 0; // track the current picture
var performanceViewed = false;
var startTime;
var timeUse = 0;

var originalPicTime;
var aiPicTime;

var hasCylinder = false;
var hasEclipse = false;
var hasCone = false;
var hasSquare = false;

initFunc();

var canDrag = false;

function initImagePool() {
    let allImages = getCookieByName("imageOrder").split("%2C");
    sessionType = allImages[allImages.length - 1];
    imagesPerSession = sessionType == "original" || sessionType == "original%0D" ? 12 : 24;
    if (!window.localStorage.getItem("gPicIndex"))
        window.localStorage.setItem("gPicIndex", 0);

    return allImages.slice(Math.floor(parseInt(window.localStorage.getItem("gPicIndex")) / imagesPerSession) * imagesPerSession,
        Math.floor(parseInt(window.localStorage.getItem("gPicIndex")) / imagesPerSession) * imagesPerSession + imagesPerSession);
}



function removeBothData() {
    window.localStorage.removeItem("testTime");
    window.localStorage.removeItem("picIndex");

}



var imageDrag = function () {
    var isDrag = false;
    var dragTarget;
    var startX, startY;
    var imgPositionTop, imgPositionLeft;
    var boxWidthMin, boxWidthMax, boxHeightMin, boxHeightMax;

    function moveMouse(e) {
        if (isDrag && canDrag) {
            var e = window.event || e;
            var clientY = e.clientY;
            var clientX = e.clientX;
            var limit = -moveDistance;
            var top;
            var left;
            if (clientY >= boxHeightMin && clientY <= boxHeightMax) {
                top = imgPositionTop + clientY - startY;
                if (top >= 0) {
                    top = 0;
                } else if (top < limit) {
                    top = limit;
                }
                dragTarget.style.top = top + "px";
            }
            if (clientX >= boxWidthMin && clientX <= boxWidthMax) {
                left = imgPositionLeft + clientX - startX;
                if (left >= 0) {
                    left = 0;
                } else if (left < limit) {
                    left = limit;
                }
                dragTarget.style.left = left + "px";
            }
            return false;
        }
    }

    function initDrag(e) {
        var e = window.event || e;
        var dragHandle = e.srcElement;
        var topElement = "HTML";
        var eventBtn = e.button == 0 || e.button == 1;

        while (dragHandle.tagName != topElement && dragHandle.className != "test-img") {
            dragHandle = dragHandle.parentElement;
        }
        if (dragHandle.className == "test-img" && eventBtn) {
            isDrag = true;
            dragTarget = dragHandle;
            imgPositionTop = parseInt(dragTarget.style.top + 0);
            startY = e.clientY;
            imgPositionLeft = parseInt(dragTarget.style.left + 0);
            startX = e.clientX;

            var initVal = 50;
            var $box = $(".test-box");
            boxWidthMin = $box.offset().left + initVal;
            boxWidthMax = $box.offset().left + $box.width() - initVal;
            boxHeightMin = $box.offset().top + initVal;
            boxHeightMax = $box.offset().top + $box.height() - initVal;
            $(document).unbind("mousemove").bind("mousemove", moveMouse);
            return false;
        }
    }

    $(document).unbind("mousedown").bind("mousedown", initDrag);
    $(document).unbind("mouseup").bind("mouseup", function () {
        isDrag = false;
    });
};
imageDrag();

//***********************************Zoom************************************************************************************
function zoomIn() {
    document.getElementById("myCanvas").style.visibility = "hidden";
    var pic = document.getElementById("pic1");
    var currentWidth = pic.clientWidth;
    if (currentWidth <= 1500) {
        pic.style.width = currentWidth + 50 + "px";
        moveDistance = moveDistance + 50;
    } else {
        return false;
    }
}

function zoomOut() {
    document.getElementById("myCanvas").style.visibility = "hidden";
    var pic = document.getElementById("pic1");
    var currentWidth = pic.clientWidth;

    if (currentWidth > picWidth + 5) {

        pic.style.width = currentWidth - 50 + "px";
        moveDistance = moveDistance - 50;
    } else {
        pic.style.width = picWidth + "px";
        pic.style.top = "0px";
        pic.style.left = "0px";
        return false;
    }
}

function move() {
    document.getElementById("myCanvas").style.visibility = "hidden";
    document.getElementById("zoom_In").disabled = false;
    document.getElementById("zoom_Out").disabled = false;
    canDraw = false;
    canDrag = true;
}
//***********************************draw************************************************************************************

var canDraw = false;
function addNew() {
    moveDistance = 0;
    if (attempts < 9) {
        document.body.style.cursor = 'crosshair';
        var pic = document.getElementById("pic1");
        pic.style.width = picWidth + "px";
        pic.style.top = "0px";
        pic.style.left = "0px";
        disableViewButton(true);
        disableDiv(true);
        document.getElementById("zoom_In").disabled = true;
        document.getElementById("zoom_Out").disabled = true;
        document.getElementById("myCanvas").style.visibility = "visible";
        document.getElementById("confirm_Btn").disabled = true;
        canDraw = true;
    } else {
        alert("You have at most 9 attemps." + "\n" + "You can Delete one of your answers if you want to add more.");
    }

}

function selectAnswer(e) {
    if (canDraw == true) {
        var offsets = document.getElementById('imgBox').getBoundingClientRect();
        ansX = (e.clientX - offsets.left).toFixed();
        ansY = (e.clientY - offsets.top).toFixed();
        Draw(ansX, ansY, index);
    }
}

function Draw(x, y, colorID) {
    var img = document.getElementById("pic1");
    var cnvs = document.getElementById("myCanvas");
    cnvs.style.position = "absolute";
    cnvs.style.left = img.style.left + "px";
    cnvs.style.top = img.style.top + "px";
    var ctx = cnvs.getContext("2d");
    ctx.beginPath();
    //ctx.arc(x, y, 20, 0, 3 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = colorMap.get(colorID);
    drawStar(ctx, x, y);
    ctx.stroke();
    if (canDraw == true) {
        document.getElementById("confidence_type").style.visibility = "visible";
    }
    canDraw = false;
}
//utility function to draw a star at a given location
function drawStar(ctx, x, y) {
    ctx.moveTo(x, y);
    ctx.lineTo(x - (-15), y);
    ctx.moveTo(x, y);
    ctx.lineTo(x - (15), y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - (15));
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - (-15));
    ctx.moveTo(x, y);
    ctx.lineTo(x - (-10), y - (-10));
    ctx.moveTo(x, y);
    ctx.lineTo(x - (10), y - (10));
    ctx.moveTo(x, y);
    ctx.lineTo(x - (10), y - (-10));
    ctx.moveTo(x, y);
    ctx.lineTo(x - (-10), y - (10));
}

//***********************************answer zone*****************************************************************************
var ansX, ansY;
var conf;
var changeIndex; //indicate which line of answer is changing
var index; // to keep track of new answer lines
var attempts; // track how many attemps user used
var timer; // a timmer to count down 5 min

/**
 * Example Map:
 * {"1":["506","534",50,"Broken Cylinder","FALSE"],
 *  "2":["749","626",50,"Broken Cylinder","FALSE"],
 *  "pictureNumber":1,
 *  "id":"nick",
 *  "sessionType":"TEST"}
 */
function sizeReset() {
    $(".testPage").css("width", broswerWidth + "px");
    $(".leftpart, .rightpart, .test-box, .answer, .submit, #pic1, #addNew_Btn, #submit_Btn, #answerArea, #confidence_type, #confidence_checkbox").css("width", picWidth + "px");
    $("#zoom_In, #zoom_Out, #move_Btn, #undo_Btn, #checkbox").css("width", picWidth / 4.2 + "px");
    $(".test-box").css("height", picWidth + "px");
    $(".answer").css("height", picWidth - 140 + "px");
    var cnvs = $("#myCanvas");
    cnvs.width = picWidth;
    cnvs.height = picWidth;
}

function initFunc() {
  //  if (parseInt(window.localStorage.getItem("gPicIndex")) > getCookieByName("imageOrder").split("%2C").length - 2)
   //     window.location.href = "/sessionFinished";

    createColorMap();
    disableViewButton(false);
    resetDropDown();
    document.getElementById("pic1").src = imageLocation + pictureOrder[picIndex];
    testerMap = new Map();
    unDoLimitCheck();
    document.getElementById("submit_Btn").disabled = true;
    $("#confidence_type").css("visibility", "hidden");
    $("#timeLeft").css("visibility", "hidden");

    localStorage.setItem("StartTime", new Date());
    document.getElementById("answerArea").innerHTML = "";
    sizeReset();
    changeIndex = -1;
    index = 0;
    attempts = 0;
    ansX = -1;
    ansY = -1;
    stack = [];
    timeUse = 0;
    clearCanvas();
    restore();
}



function reSetTestTime() {
    // original
    if (sessionType == "original%0D" || sessionType == "original") {
        originalPicTime = 150000;
        aiPicTime = 0;
        // incorrect
    } else {
        originalPicTime = 210000;
        aiPicTime = 90000;
    }
}

var typeCheckBox = setInterval(function() {
    typeCheck(testerMap);
});

var timeUsed = setInterval(function () {
    reSetTestTime();
    var current = new Date();
    var startTime = new Date(window.localStorage.getItem("StartTime"));

    var time = Math.abs(current - startTime);
    var timeLimit;
    if (aiPicTime == 0 || picIndex % 2 == 0) {
        timeLimit = originalPicTime;
    } else {
        timeLimit = aiPicTime;
    }
    if (time >= timeLimit - 60000 - timeUse) {
        timeLeft("60 Seconds Left");
    }
    if (time >= timeLimit - 30000 - timeUse) {
        timeLeft("30 Seconds Left");
    }
    if (time >= timeLimit - timeUse) {
        timeLeft("Please Complete the Type Confidence and Submit!");
        disableDiv(true);
        document.getElementById("zoom_In").disabled = true;
        document.getElementById("zoom_Out").disabled = true;
        document.getElementById("move_Btn").disabled = true;
        document.getElementById("undo_Btn").disabled = true;
        document.getElementById("addNew_Btn").disabled = true;
    }
    console.log(time+timeUse);
    window.localStorage.setItem("testTime", time + timeUse);
});

// change this line to change tester (still working on it)
function confirmAns() {
    attempts++;
    disableDiv(false);
    disableViewButton(false);
    document.getElementById("submit_Btn").disabled = true;
    $("#confidence_type").css("visibility", "hidden");
    document.body.style.cursor = 'default';
    //document.getElementById("submit_Btn").disabled = false;
    conf = getConfText(document.getElementById("confidence").value);
    if (changeIndex == -1) {
        index++;
        var abnormalType = document.getElementById("types").value;
        var date = new Date().toUTCString();
        //*********create answer field********************************
        createAnswerLine(index, ansX, ansY, conf, abnormalType, sizeRatio, "FALSE", date);
        stack.push("NULL" + "#" + testerMap.get(index.toString())[4] + "#" + index.toString() + "N");
        unDoLimitCheck();

    } else {
        changeAnswer();
    }
    window.localStorage.setItem("finished", "false");
    window.localStorage.setItem(picIndex, JSON.stringify(Array.from((testerMap.entries()))));
    resetDropDown();
}
//***************************************************************************************************************************

function createAnswerLine(index, ansX, ansY, conf, abnormalType, sizeRatio, op, time) {
    const newAnswerLine = document.createElement("div");
    const newTextArea = document.createElement("button");
    const newChangeBtn = document.createElement("button");
    const newDeleteBtn = document.createElement("button");
    newDeleteBtn.innerHTML = "Delete";
    newChangeBtn.innerHTML = "Change";
    newAnswerLine.setAttribute("class", "div_ans");
    newAnswerLine.style.width = picWidth + "px";
    newAnswerLine.setAttribute("id", "answer" + index.toString());
    newTextArea.style.width = picWidth - 160 + "px";
    newTextArea.setAttribute("class", "div_text");
    newTextArea.setAttribute("id", index.toString());
    newTextArea.style.border = "8px solid " + colorMap.get(index - 1);
    newDeleteBtn.setAttribute("class", "del_Btn");
    newDeleteBtn.setAttribute("id", index.toString());
    document.getElementById("answerArea").appendChild(newAnswerLine);
    newAnswerLine.appendChild(newTextArea);
    newTextArea.innerHTML += "Confidence: " + conf + "&nbsp;&nbsp;&nbsp;"
        + "Abnormal Type: " + abnormalType;
    newAnswerLine.appendChild(newDeleteBtn);
    //*************highlight function ****************************
    newTextArea.onclick = function () { answerLineClick(newTextArea); };
    //*************delete answers*********************************
    newDeleteBtn.onclick = function () { deleteClick(newDeleteBtn); };
    //*************change answers*********************************
    pushValue(testerMap, index, Math.round(ansX / sizeRatio), Math.round(ansY / sizeRatio), conf, abnormalType, op, time);
}

function createAnswer(ord, op) {
    var x = testerMap.get(ord)[0];
    var y = testerMap.get(ord)[1];
    var confident = testerMap.get(ord)[2];
    var type = testerMap.get(ord)[3];
    var time = testerMap.get(ord)[5];
    createAnswerLine(ord, x, y, confident, type, 1, op, time);
    Draw(x * sizeRatio, y * sizeRatio, ord - 1);
}

function deleteAnswer(ord, op) {
    var x = testerMap.get(ord)[0];
    var y = testerMap.get(ord)[1];
    var confident = testerMap.get(ord)[2];
    var type = testerMap.get(ord)[3];
    var change = testerMap.get(ord)[4];
    var time = testerMap.get(ord)[5];
    if (change == "FALSE") {
        pushValue(testerMap, ord, x, y, confident, type, op + new Date().toUTCString(), time);
    } else {
        change = change + op + new Date().toUTCString();
        pushValue(testerMap, ord, x, y, confident, type, change, time);
    }
    clearCanvas();
    reDrawCanvas();
    attempts--;
    document.getElementById("answer" + ord).remove();
}

function changeAnswer() {
    var x = testerMap.get(changeIndex)[0];
    var y = testerMap.get(changeIndex)[1];
    var preConf = testerMap.get(changeIndex)[2];
    var preType = testerMap.get(changeIndex)[3];
    var changes = testerMap.get(changeIndex)[4];
    var time = testerMap.get(changeIndex)[5];
    var type = document.getElementById("types").value;
    var confident = getConfText(document.getElementById("confidence").value);
    var unDo = preConf + "+" + preType;

    if (preConf != confident || preType != type) {
        stack.push(unDo + "#" + changes + "#" + changeIndex + "C");
        unDoLimitCheck();
    }

    document.getElementById(changeIndex.toString()).innerHTML = "Confidence: " + confident + "&nbsp;&nbsp;&nbsp;" + "Abnormal Type: " + type;
    if (changes == "FALSE" && ((preConf != confident) || (preType != type))) {
        changes = "";
    }
    if (preConf != confident) {
        changes = changes + "CHANGE " + "Conf from " + preConf.toString() + " to " + confident.toString() + " " + "@" + new Date().toUTCString() + "///";
    }
    if (preType != type) {
        changes = changes + "CHANGE " + "Type from " + preType + " to " + type + " " + "@" + new Date().toUTCString() + "///";
    }
    pushValue(testerMap, changeIndex, x, y, confident, type, changes, time);
    window.localStorage.setItem(picIndex, JSON.stringify(Array.from((testerMap.entries()))));
    clearCanvas();
    reDrawCanvas();
}

function unDoChange(index, data, answer) {
    var x = testerMap.get(index)[0];
    var y = testerMap.get(index)[1];
    var confident = data.split("+")[0];
    var type = data.split("+")[1];
    var change = answer;
    var time = testerMap.get(index)[5];
    pushValue(testerMap, index, x, y, confident, type, change, time);
    document.getElementById(index.toString()).innerHTML = "Confidence: " + confident + "&nbsp;&nbsp;&nbsp;"
        + "Abnormal Type: " + type;
}

function unDoLimitCheck() {
    if (stack.length == 0) {
        document.getElementById("undo_Btn").disabled = true;
    } else {
        document.getElementById("undo_Btn").disabled = false;
        if (stack.length > 5) {
            stack.shift();
        }
    }
}

function pushValue(map, ord, x, y, confident, type, change, timeStamp) {
    var order = ord + "";
    map.set(order, []);
    testerMap.get(order).push(x);
    testerMap.get(order).push(y);
    testerMap.get(order).push(confident);
    testerMap.get(order).push(type);
    testerMap.get(order).push(change);
    testerMap.get(order).push(timeStamp);
    window.localStorage.setItem(picIndex, JSON.stringify(Array.from((testerMap.entries()))));
    setTimeout(function(){changeCheckBox()}, 500)
}

function clearCanvas() {
    var cnvs = document.getElementById("myCanvas");
    var ctx = cnvs.getContext("2d");
    ctx.clearRect(0, 0, cnvs.width, cnvs.height);
}

function disableViewButton(state) {
    document.getElementById("addNew_Btn").disabled = state;
    document.getElementById("move_Btn").disabled = state;
    document.getElementById("submit_Btn").disabled = state;
    document.getElementById("undo_Btn").disabled = state;
}

//**************************************interaction button*******************************************************************
function unDo() {
    var unDoData = stack.pop();
    var data = unDoData.split("#")[0];
    var answer = unDoData.split("#")[1];
    var target = unDoData.split("#")[2];
    var index = target.substring(0, target.length - 1);
    var operation = target.charAt(target.length - 1);
    switch (operation) {
        case "N":
            deleteAnswer(index, "UNDONEW@")
            break;
        case "D":
            createAnswer(index, answer);
            attempts++;
            break;
        case "C":
            unDoChange(index, data, answer);
            break;
    }
    unDoLimitCheck();
}



function submit() {
    var id;
    //change picture here
    if (window.localStorage.getItem("picIndex") !== null) {
        picIndex = window.localStorage.getItem("picIndex");
    }
    picIndex++;
    window.localStorage.setItem("gPicIndex", parseInt(window.localStorage.getItem("gPicIndex"))+1);
    if (picIndex == imagesPerSession) {
        window.localStorage.setItem("finished", "true");
        dataPostProcessing(testerMap, picIndex, id, sessionType, true);
        window.localStorage.removeItem("testTime");
        window.localStorage.removeItem("picIndex");


    } else {
        window.localStorage.setItem("picIndex", picIndex);
        window.localStorage.setItem("finished", "true");
        dataPostProcessing(testerMap, picIndex, id, sessionType, false);
        testerMap.clear();
        removeData();
        //window.localStorage.setItem("testTime", 0);
        initFunc();
    }



}

function answerLineClick(newTextArea) {
    var ord = newTextArea.id;
    var x = testerMap.get(ord)[0] * sizeRatio;
    var y = testerMap.get(ord)[1] * sizeRatio;
    clearCanvas();
    Draw(x, y, ord - 1);
    disableViewButton(true);
    disableDiv(true);
    document.getElementById("confirm_Btn").disabled = true;
    $("#confidence_type").css("visibility", "visible");
    document.getElementById("addNew_Btn").disabled = true;
    document.getElementById("undo_Btn").disabled = true;
    document.getElementById("move_Btn").disabled = true;
    document.getElementById("submit_Btn").disabled = true;
    changeIndex = newTextArea.id;
    attempts--;
}

function deleteClick(newDeleteBtn) {
    var ord = newDeleteBtn.id + "";
    stack.push("NULL" + "#" + testerMap.get(ord)[4] + "#" + ord + "D");
    unDoLimitCheck();
    deleteAnswer(ord, "DELETE@");
}

/**
 * 
 * @param {*} testerMap 
 * @param {*} picIndex 
 * @param {*} id 
 * @param {*} sessionType 
 * @param {*} completed 
 * 
 * store the current trial result to the local storage
 */
function dataPostProcessing(testerMap, picIndex, id, sessionType, completed) {
    var picSrc = imageLocation + pictureOrder[picIndex];
    document.getElementById("pic1").src = picSrc;
    window.localStorage.setItem(picIndex, JSON.stringify(Array.from((testerMap.entries()))));
    indexRatio = sessionType == "original" || sessionType == "original%0D" ? 1 : 2;
    if (window.localStorage.getItem("finished") == "true" && imagesPerSession / 2 == picIndex || imagesPerSession == picIndex) {
        let res = {};
        let imageIds = [];
        if (imagesPerSession / 2 == picIndex) {
            for (let i = 1 * indexRatio; i < 7 * indexRatio; i += indexRatio) {
                res[pictureOrder[i - indexRatio].split("%2F")[1].split(".")[0]] = JSON.parse(window.localStorage.getItem(i + ""));
                imageIds.push(pictureOrder[i - indexRatio].split("%2F")[1].split(".")[0]);
                window.localStorage.setItem("sessionFinished", false);
            }
        } else if (imagesPerSession == picIndex) {
            for (let i = 7 * indexRatio; i < 13 * indexRatio; i += indexRatio) {
                res[pictureOrder[i - indexRatio].split("%2F")[1].split(".")[0]] = JSON.parse(window.localStorage.getItem(i + ""));
                imageIds.push(pictureOrder[i - indexRatio].split("%2F")[1].split(".")[0]);
                window.localStorage.setItem("sessionFinished", true);
                document.cookie = "ableStartNewSession=false; expires=" + new Date(new Date().getTime() + 30 * 60000).toUTCString();;
            }
        }
        res["uid"] = getCookieByName('id');
        res["sessionType"] = sessionType;
        res["sessionId"] = Math.floor(parseInt(window.localStorage.getItem("gPicIndex")) / imagesPerSession);
        res["imageIds"] = imageIds;
        //console.log(JSON.stringify(res));
        sendResult(JSON.stringify(res));
    }
}

function mapToJson(map) {
    var obj = {};
    map.forEach(function (value, key) {
        obj[key] = value
    });
    return obj;
}

function disableDiv(state) {
    var childNodes = document.getElementById("answerArea").getElementsByTagName('*');
    for (var node of childNodes) {
        node.disabled = state;
    }
}

function reDrawCanvas() {

    //since the redraw function will re-render all the circles from the first one when undo button is clicked, to make sure the color is correct we need to reset the index back to 0
    for (let k = 1; k <= testerMap.size; k++) {

        var order = k + "";
        var change1 = testerMap.get(order)[4];
        if (!(change1.includes("DELETE") || change1.includes("UNDONEW"))) {
            var x1 = testerMap.get(order)[0] * sizeRatio;
            var y1 = testerMap.get(order)[1] * sizeRatio;
            Draw(x1, y1, order - 1);
        }
    }
}

function generateLightColorRgb() {
    const red = Math.floor((1 + Math.random()) * 256 / 2);
    const green = Math.floor((1 + Math.random()) * 256 / 2);
    const blue = Math.floor((1 + Math.random()) * 256 / 2);
    return "rgb(" + red + ", " + green + ", " + blue + ")";
}

function createColorMap() {
    for (var i = 0; i < 100; i++) {
        if (i < colorList.length) {
            colorMap.set(i, colorList[i]);
        } else {
            colorMap.set(i, generateLightColorRgb());
        }
    }
}

function resetDropDown() {
    document.getElementById("confidence").selectedIndex = 0;
    document.getElementById("confidence1").selectedIndex = 0;
    document.getElementById("confidence2").selectedIndex = 0;
    document.getElementById("confidence3").selectedIndex = 0;
    document.getElementById("confidence4").selectedIndex = 0;
    document.getElementById("types").selectedIndex = 0;
}

function restore() {
    pictureOrder = initImagePool();
    if (window.localStorage.getItem("testTime") !== null) {
        timeUse = parseInt(window.localStorage.getItem("testTime"));
        console.log(timeUse);
    }
    if (window.localStorage.getItem("picIndex") !== null) {
        picIndex = window.localStorage.getItem("picIndex");
        document.getElementById("pic1").src = imageLocation + pictureOrder[picIndex];
    }
    //if the trial for current image has not finished yet
    if (window.localStorage.getItem("finished") == "false"
        || (picIndex % 2 != 0 && (sessionType != "original" && sessionType != "original%0D"))) {
        testerMap = new Map(JSON.parse(window.localStorage.getItem(picIndex)));
        reDrawAnswerLine();
        reDrawCanvas();
        index = testerMap.size;

    }
}
/**
 * read from the local variable testerMap,
 * redraw all the answer lines
 */
function reDrawAnswerLine() {

    for (let i = 1; !!testerMap.get(i + ""); i++) {
        var change1 = testerMap.get(i + "")[4];
        if (!(change1.includes("DELETE") || change1.includes("UNDONEW"))) {
            //createAnswerLine(index, ansX, ansY, conf, abnormalType, sizeRatio, op, time)
            createAnswerLine(i, testerMap.get(i + "")[0], testerMap.get(i + "")[1], testerMap.get(i + "")[2], testerMap.get(i + "")[3], 1, testerMap.get(i + "")[4], testerMap.get(i + "")[5]);
        }
    }
}

function removeData() {
    window.localStorage.removeItem("testTime");
    window.localStorage.removeItem("StartTime");
}

//still working on


function timeLeft(timeleft) {
    var timeLeftDiv = document.getElementById("timeLeft");
    timeLeftDiv.style.visibility = "visible";
    timeLeftDiv.innerHTML = timeleft;
}

function getConfText(value) {
    if (value == 1) {
        return "Possible";
    } else if (value == 2) {
        return "Probable";
    } else {
        return "Definite";
    }
}
//***************************************************************************************************************************

//***************disable zoom in and out on broswer *************************************************************************
// disable ctrl+scoll
document.addEventListener('mousewheel', function (e) {
    e = e || window.event;
    if ((e.wheelDelta && event.ctrlKey) || e.detail) {
        event.preventDefault();
    }
}, {
    capture: false,
    passive: false
});

// disable ctrl+ "+"
document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey === true || event.metaKey === true)
        && (event.keyCode === 61 || event.keyCode === 107
            || event.keyCode === 173 || event.keyCode === 109
            || event.keyCode === 187 || event.keyCode === 189)) {
        event.preventDefault();
    }
}, false);


var confDropDown = document.getElementById("confidence");
var confButton = document.getElementById("confirm_Btn");
var typeDropDown = document.getElementById("types");
document.getElementById("confidence").addEventListener('change', () => {
    if (confDropDown.value === "none" || typeDropDown.value === "none") {
        confButton.disabled = true;
    } else {
        confButton.disabled = false;
    }
});

document.getElementById('types').addEventListener('change', () => {
    if (confDropDown.value === "none" || typeDropDown.value === "none") {
        confButton.disabled = true;
    } else {
        confButton.disabled = false;
    }
});

var conf1DropDown = document.getElementById("confidence1");
var conf2DropDown = document.getElementById("confidence2");
var conf3DropDown = document.getElementById("confidence3");
var conf4DropDown = document.getElementById("confidence4");
var submitButton = document.getElementById("submit_Btn");
document.getElementById("confidence1").addEventListener('change', () => {
    if (conf1DropDown.value === "none" || conf2DropDown.value === "none" || conf3DropDown.value === "none" || conf4DropDown.value === "none") {
        submitButton.disabled = true;
    } else {
        submitButton.disabled = false;
    }
});

document.getElementById("confidence2").addEventListener('change', () => {
    if (conf1DropDown.value === "none" || conf2DropDown.value === "none" || conf3DropDown.value === "none" || conf4DropDown.value === "none") {
        submitButton.disabled = true;
    } else {
        submitButton.disabled = false;
    }
});

document.getElementById("confidence3").addEventListener('change', () => {
    if (conf1DropDown.value === "none" || conf2DropDown.value === "none" || conf3DropDown.value === "none" || conf4DropDown.value === "none") {
        submitButton.disabled = true;
    } else {
        submitButton.disabled = false;
    }
});

document.getElementById("confidence4").addEventListener('change', () => {
    if (conf1DropDown.value === "none" || conf2DropDown.value === "none" || conf3DropDown.value === "none" || conf4DropDown.value === "none") {
        submitButton.disabled = true;
    } else {
        submitButton.disabled = false;
    }
});

function typeCheck(testerMap){
    document.getElementById("cylinder_conf").innerHTML = "&#x2717 Cylinder";
    document.getElementById("ellipse_conf").innerHTML = "&#x2717 Ellipse";
    document.getElementById("cone_conf").innerHTML = "&#x2717 Cone";
    document.getElementById("square_conf").innerHTML = "&#x2717 Square";
    document.getElementById("square_conf").innerHTML = "&#x2717 Square";
    document.getElementById("confidence1").disabled = false;
    document.getElementById("confidence2").disabled = false;
    document.getElementById("confidence3").disabled = false;
    document.getElementById("confidence4").disabled = false;
    hasCylinder = false;
    hasEclipse = false;
    hasCone = false;
    hasSquare = false;
    for (let value of testerMap.values()){
        var change = value[4];
        var type = value[3];
        if(!(change.includes("DELETE") || change.includes("UNDONEW"))){
            if(type == "Broken Cylinder"){
                document.getElementById("cylinder_conf").innerHTML = "&#x2713 Cylinder";
                document.getElementById("confidence1").value = 3;
                document.getElementById("confidence1").disabled = true;
                hasCylinder = true;
            }
            if(type == "Ellipse"){
                document.getElementById("ellipse_conf").innerHTML = "&#x2713 Ellipse";
                document.getElementById("confidence2").value = 3;
                document.getElementById("confidence2").disabled = true;
                hasEclipse = true;
            }
            if(type == "Elongated Cone"){
                document.getElementById("cone_conf").innerHTML = "&#x2713 Cone";
                document.getElementById("confidence3").value = 3;
                document.getElementById("confidence3").disabled = true;
                hasCone = true;
            }
            if(type == "Rotated Square"){
                document.getElementById("square_conf").innerHTML = "&#x2713 Square";
                document.getElementById("confidence4").value = 3;
                document.getElementById("confidence4").disabled = true;
                hasSquare = true;
            }
        }
    }

    
}

(function (window) {
    window.getDevicePixelRatio = function () {
        var ratio = 1;
        // To account for zoom, change to use deviceXDPI instead of systemXDPI
        if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
            // Only allow for values > 1
            ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
        }
        else if (window.devicePixelRatio !== undefined) {
            ratio = window.devicePixelRatio;
        }
        return ratio;
    };
})(this);

function changeCheckBox(){
    console.log(1);
    if(!hasCylinder){
        document.getElementById("confidence1").value = "none";
    }
    if(!hasEclipse){
        document.getElementById("confidence2").value = "none";
    }
    if(!hasCone){
        document.getElementById("confidence3").value = "none";
    }
    if(!hasSquare){
        document.getElementById("confidence4").value = "none";
    }
}
//***************************************************************************************************************************

//middleware
function sendResult(data) {
    let xhr = new XMLHttpRequest();
    let url = "./api/answer";
    xhr.open("POST", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            window.location.href = xhr.response;
        }
    }
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);

}

function getCookieByName(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
        return parts.pop().split(';').shift();
}

function delCookie(name) {
    document.cookie = name + '=; Max-Age=0'
}

 //***************************************************************************************************************************