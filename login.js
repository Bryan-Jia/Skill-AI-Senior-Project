const fs = require('fs');
const testerFile = fs.readFileSync('./testerList').toString().split("\n");
const testerIDList = [];
const testCaseOrderList=[];

testerFile.forEach((item,index)=>{
    testerIDList[index]=testerFile[index].split(" ")[0];
    testCaseOrderList[index]=testerFile[index].split(" ")[1];
})
//if the user is in the test taker id list, the function will return the order of the test case, otherwise -1;
function verify(uid) {
    return testCaseOrderList[testerIDList.indexOf(uid)] 
}

exports.verify = verify;