const {sendFile}=require("./blobApi.js")

// local directory to store answers until they're completed
const localDir = [];

/*
function getTempData(inptID) {
    const tempData = [];
    // pulls answer data from localDir based on id
    for (id in localDir) {
        if (inptID == id) {
            tempData.push(localDir[id].info);
        }
    }
    return tempData;
}
*/

function storeAnswer(answer) {
    localDir.push({
        id: answer.id,
        info: answer
    });
    if (answer?.completed) {
        blobName = answer.id + '-' + answer.sessionType;
        // remove this answer's information from localDir
        const index = localDir.indexOf(answer.id);
        if (index > -1) {
            localDir.splice(index, 1);
        }
        delete answer.id;
        delete answer.sessionType;
        delete answer.completed;
        sendFile(blobName, answer);
    } else if (answer?.completed == false) {
        // answer is stored in localDir and is not removed
        console.log('Storing data in temp file...');
    }
    else {
        throw 'Answer object missing fields!';
    }
}

module.exports = storeAnswer;
