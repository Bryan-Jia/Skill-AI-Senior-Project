const answers = require('require-all')(__dirname + '/answers');
const session = require('express-session');
const {sendFile}=require("./blobApi.js")

async function calculateStats(userAnswer) {
    console.log("useranswer:" + userAnswer)
    let truePositive = 0;
    let falseNegative = 0;
    let userPos = 0;
    let actualPos = 0;
    let userInfo = null;
    let userPreviousAnswer = null;

    try{
        userInfo = await getPrevRes(req.body.uid + '_info');
        truePositive = userInfo.truePositive;
        falseNegative = userInfo.falseNegative;
        userPos = userInfo.userPos;
        actualPos = userInfo.actualPos;
    } catch(err){
    }

    try{
        userPreviousAnswer = await  getPrevRes(req.body.uid + '_answer');
    } catch(err){
    }

    let sessionTP = 0;
    let sessionFP = 0;
    let sessionFN = 0;
    let sessionUserPos = 0;
    let sessionActualPos = 0;

    for (const img of userAnswer.imageIds) {

        let points = userAnswer[img];
        console.log("userAnswerPoints:" + points);
        let imgTP = 0;
        let imgUserPos = points.length;
        sessionUserPos += imgUserPos;
        sessionActualPos += answers[img].length;
        console.log("answerPNumber:" + answers[img].length);

        for (const anomalyMatrix of answers[img]) {
            let found = false;
            for (const point of points) {
                x = point[1][0];
                y = point[1][1];
                if (anomalyMatrix[y][x] != 0) {
                    imgTP++;
                    sessionTP++;
                    found = true;
                    break;
                }
            }
            if (!found) sessionFN++;
        }
        sessionFP += (imgUserPos - imgTP);
    }

    console.log("sessiontp:" + sessionTP);
    
    console.log("sessionfn:" + sessionFN);

    console.log("sActualP"+sessionActualPos);
    console.log("suserPos"+sessionUserPos);

    let sessionTPR = sessionTP / sessionActualPos;
    
    let sessionFNR = sessionFN / sessionActualPos;
    let sessionPrecision = sessionTP / sessionUserPos;

    truePositive += sessionTP;
    falseNegative += sessionFN;
    userPos += sessionUserPos;
    actualPos += sessionActualPos;

    console.log("tp:" + truePositive);
    console.log("ap:" + actualPos);

    let cumTPR = truePositive / actualPos;
    let cumFNR = falseNegative / actualPos;
    let cumPrecision = truePositive / userPos;


    let infoName = userAnswer.uid + "_info";
    
    let info = {
                    "truePositive": truePositive, 
                    "falseNegative": falseNegative,
                    "userPos": userPos,
                    "actualPos": actualPos,
                };
    sendFile(infoName, info);

    console.log(info);

    let userAnswerName = userAnswer.uid + "_answer";

    let sessionName = userAnswer.sessionType + "_" + userAnswer.sessionId;
    if (!userPreviousAnswer)
        userPreviousAnswer = {};
    userPreviousAnswer[sessionName] = userAnswer;
    sendFile(userAnswerName, userPreviousAnswer);
    
    console.log(userPreviousAnswer);
    
    return [sessionTPR, sessionFNR, sessionPrecision, cumTPR, cumFNR, cumPrecision];
}



exports.calculateStats = calculateStats;