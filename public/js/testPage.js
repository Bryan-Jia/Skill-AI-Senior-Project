//***********************************generate random img*********************************************************************

//***************************************************************************************************************************
//<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
//***********************************image drag******************************************************************************
var endPage = "end.html";
var previousPage = "consent.html";
var imageLocation = "public/img/";
var pictureOrder = ["broken_cylinder_1.png", 
"broken_cylinder_2.png", "broken_cylinder_3.png", 
"broken_cylinder_4.png", "broken_cylinder_3.png"]; // the picture order

initFunc();
var canDrag = false;
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
            if (clientY >= boxHeightMin && clientY <= boxHeightMax) {
                dragTarget.style.top = imgPositionTop + clientY - startY + "px";
            }
            if (clientX >= boxWidthMin && clientX <= boxWidthMax) {
                dragTarget.style.left = imgPositionLeft + clientX - startX + "px";
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
//***************************************************************************************************************************

//***********************************Zoom************************************************************************************
function zoomIn() {
    document.getElementById("myCanvas").style.visibility = "hidden";
    var pic = document.getElementById("pic1");
    var currentWidth = pic.clientWidth;
    if (currentWidth <= 1500) {
        pic.style.width = currentWidth + 50 + "px";
    } else {
        return false;
    }
}

function zoomOut() {
    document.getElementById("myCanvas").style.visibility = "hidden";
    var pic = document.getElementById("pic1");
    var currentWidth = pic.clientWidth;

    if (currentWidth >= 960) {
        pic.style.width = currentWidth - 50 + "px";
    } else {
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
//***************************************************************************************************************************

//***********************************draw************************************************************************************
var canDraw = false;
function addNew() {
    if (attemp < 9) {
        var pic = document.getElementById("pic1");
        pic.style.width = "960px";
        pic.style.top = "0px";
        pic.style.left = "0px";
        document.getElementById("addNew_Btn").disabled = true;
        document.getElementById("submit_Btn").disabled = true;
        document.getElementById("move_Btn").disabled = true;
        document.getElementById("zoom_In").disabled = true;
        document.getElementById("zoom_Out").disabled = true;
        disableDiv(true);
        document.getElementById("myCanvas").style.visibility = "visible";
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
        Draw(ansX, ansY);
    }
}

function Draw(x, y) {
    var img = document.getElementById("pic1");
    var cnvs = document.getElementById("myCanvas");
    cnvs.style.position = "absolute";
    cnvs.style.left = img.style.left + "px";
    cnvs.style.top = img.style.top + "px";
    var ctx = cnvs.getContext("2d");
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 3 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    ctx.stroke();
    if (canDraw == true) {
        document.getElementById("confidence_type").style.visibility = "visible";
    }
    canDraw = false;
}
//***************************************************************************************************************************
var conf = 50;
function sliderChange() {
    conf = document.getElementById("conf_slider").value;
    document.getElementById("conf_value").innerHTML = conf + "%";
}
//***********************************answer zone*****************************************************************************
var ansX, ansY;
var changeIndex; //indicate which line of answer is changing
var index; // to keep track of new answer lines
var attemp; // track how many attemps user used
var timer; // a timmer to count down 5 min
var picNumber = 0; // track the current picture
var testPicNumber = 5; // how many picture for each tester
var testerMap; //(order, x, y, conf, opeartion?, changeFrom?)

function initFunc() {
    document.getElementById("submit_Btn").disabled = true;
    document.getElementById("move_Btn").disabled = false;
    document.getElementById("zoom_In").disabled = true;
    document.getElementById("zoom_Out").disabled = true;
    document.getElementById("addNew_Btn").disabled = false;
    document.getElementById("confidence_type").style.visibility = "hidden";
    document.getElementById("answerArea").innerHTML = "";
    var pic = document.getElementById("pic1");
    pic.style.width = "960px";
    pic.style.top = "0px";
    pic.style.left = "0px";
    changeIndex = -1;
    index = 0;
    attemp = 0;
    ansX = -1;
    ansY = -1;
    testerMap = new Map();
    timer = setTimeout(submit, 300000);
    clearCanvas();
}

// change this line to change tester (still working on it)
function confirmAns() {
    attemp++;
    console.log(attemp);
    disableDiv(false);
    document.getElementById("addNew_Btn").disabled = false;
    document.getElementById("submit_Btn").disabled = false;
    document.getElementById("confidence_type").style.visibility = "hidden";
    document.getElementById("move_Btn").disabled = false;
    if (changeIndex == -1) {
        index++;
        var abnormalType;
        abnormalType = document.getElementById("types").value;
        //*********create answer field********************************
        const newAnswerLine = document.createElement("div");
        const newTextArea = document.createElement("div");
        const newChangeBtn = document.createElement("button");
        const newDeleteBtn = document.createElement("button");
        newAnswerLine.setAttribute("class", "div_ans");
        newTextArea.setAttribute("class", "div_text");
        newTextArea.setAttribute("id", "text" + index.toString());
        newChangeBtn.setAttribute("class", "change_btn");
        newChangeBtn.setAttribute("id", index.toString());
        newDeleteBtn.setAttribute("class", "del_Btn");
        newDeleteBtn.setAttribute("id", index.toString());
        document.getElementById("answerArea").appendChild(newAnswerLine);
        newAnswerLine.appendChild(newTextArea);
        newTextArea.innerHTML += "Position x: " + ansX + "&nbsp;&nbsp;&nbsp;"
            + "Position y: " + ansY + "&nbsp;&nbsp;&nbsp;"
            + "Confidence: " + conf + "%" + "&nbsp;&nbsp;&nbsp;"
            + "Abnormal Type: " + abnormalType;
        newAnswerLine.appendChild(newDeleteBtn);
        newAnswerLine.appendChild(newChangeBtn);
        //put answer into the map
        pushValue(testerMap, index, ansX, ansY, conf, abnormalType, "FALSE");
        console.log(testerMap);

        //*************delete answers*********************************
        newDeleteBtn.innerHTML = "Delete";
        newDeleteBtn.onclick = function () {
            var ord = this.id + "";
            var x = testerMap.get(ord)[0];
            var y = testerMap.get(ord)[1];
            var confident = testerMap.get(ord)[2];
            var type = testerMap.get(ord)[3];
            var change = testerMap.get(ord)[4];
            if (change == "FALSE") {
                pushValue(testerMap, this.id, x, y, confident, type, "DELETE");
            } else {
                change += "DELETE";
                pushValue(testerMap, this.id, x, y, confident, type, change);
            }
            console.log(testerMap);
            clearCanvas();
            for (var k = 1; k <= testerMap.size; k++) {
                var order = k + "";
                var change1 = testerMap.get(order)[4];
                if (change1 == "FALSE") {
                    var x1 = testerMap.get(order)[0];
                    var y1 = testerMap.get(order)[1];
                    Draw(x1, y1);
                }
            }
            attemp--;
            newAnswerLine.remove();
        };
        //*********************************************************
        //*************delete answers*********************************
        newChangeBtn.innerHTML = "Change";
        newChangeBtn.onclick = function () {
            disableDiv(true);
            document.getElementById("confidence_type").style.visibility = "visible";
            document.getElementById("addNew_Btn").disabled = true;
            document.getElementById("move_Btn").disabled = true;
            document.getElementById("submit_Btn").disabled = true;
            changeIndex = this.id;
            attemp--;
            console.log(testerMap);
        };
        //*********************************************************
    } else {
        var x = testerMap.get(changeIndex)[0];
        var y = testerMap.get(changeIndex)[1];
        var preConf = testerMap.get(changeIndex)[2];
        var preType = testerMap.get(changeIndex)[3];
        var changes = testerMap.get(changeIndex)[4];
        var type = document.getElementById("types").value;
        var confident = document.getElementById("conf_slider").value;
        document.getElementById("text" + changeIndex.toString()).innerHTML = "Position x: " + x + "&nbsp;&nbsp;&nbsp;"
            + "Position y: " + y + "&nbsp;&nbsp;&nbsp;"
            + "Confidence: " + confident + "%" + "&nbsp;&nbsp;&nbsp;"
            + "Abnormal Type: " + type;
        if (changes == "FALSE" && ((preConf != confident) || (preType != type))) {
            changes = "";
        }
        if (preConf != confident) {
            changes = changes + "Conf changes from " + preConf.toString() + " to " + confident.toString() + " ";
        }
        if (preType != type) {
            changes = changes + "Type changes from " + preType + " to " + type + " ";
        }
        pushValue(testerMap, changeIndex, x, y, confident, type, changes);
        console.log(testerMap);
        changeIndex = -1;
    }
    //***********************************************************
}
//***************************************************************************************************************************


function pushValue(map, ord, x, y, confident, type, change) {
    var order = ord + "";
    map.set(order, []);
    testerMap.get(order).push(x);
    testerMap.get(order).push(y);
    testerMap.get(order).push(confident);
    testerMap.get(order).push(type);
    testerMap.get(order).push(change);
}

function clearCanvas() {
    var cnvs = document.getElementById("myCanvas");
    var ctx = cnvs.getContext("2d");
    ctx.clearRect(0, 0, cnvs.width, cnvs.height);
}

//**************************************interaction button*******************************************************************
function back() {
    location.href = previousPage;
}

function submit() {
    //change picture here
    picNumber++;
    if(picNumber == testPicNumber){
        location.href = endPage;
    }else {
        var picSrc = imageLocation + pictureOrder[picNumber];
        document.getElementById("pic1").src = picSrc;
        console.log(picSrc);
        sendResult(JSON.stringify(mapToJson(testerMap)));
        console.log(JSON.stringify(mapToJson(testerMap)));
        //need to push the data to database here
        testerMap.clear();
        initFunc();
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

function getPicture(){

}
//***************************************************************************************************************************

//middleware
function sendResult(data) {
    let xhr = new XMLHttpRequest();
    let url = "http://localhost:9000/api/answer";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}
 //***************************************************************************************************************************