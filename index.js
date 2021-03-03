const moment = require('moment');
const data = require('./data'); 
const fs = require('fs');
var changeLog = [];
data.data.allMdx.edges.forEach(log => {
    let logList = log.node.mdxAST.children;
    let changesArray = [];
    logList.forEach(singleLog => {
        if(singleLog.type === 'heading') {
            let changeObject = {};
            changeObject.revisionDate = singleLog.children[0].value;
            changeObject.contentList = [];
            changeObject.heading = log.node.slug;
            changesArray.push(changeObject);
        }
        else if(singleLog.type !== 'export' && changesArray.length > 0) {
            singleLog.children.forEach(eachItem => {
                if(eachItem.type !== 'link' && eachItem.type !== 'listItem') {
                    changesArray[changesArray.length - 1].contentList.push(`<li>${eachItem.value}</li>`);
                } else if (eachItem.type === 'link'){
                    if(changesArray[changesArray.length - 1].contentList.length > 0) {
                        changesArray[changesArray.length - 1].contentList[changesArray[changesArray.length - 1].contentList.length -1] = changesArray[changesArray.length - 1].contentList[changesArray[changesArray.length - 1].contentList.length -1].replace('</li>',`<a href="${eachItem.url}">${eachItem.children[0].value}</a></li>`);
                    } else {
                        changesArray[changesArray.length - 1].contentList.push(`<li><a href="${eachItem.url}">${eachItem.children[0].value}</a></li>`);
                    }
                } else {
                    changesArray[changesArray.length - 1].contentList.push(`<li>${eachItem.children[0].value}</li>`);
                }
            })
        }
    })
    changeLog.push(changesArray);
});
changeLog = changeLog.flat();
changeLog = changeLog.map(changeLogItem => {
    changeLogItem.timestamp = moment(changeLogItem.revisionDate, 'MMM DD, YYYY').unix();
    return changeLogItem;
}).sort((a, b) => b.timestamp - a.timestamp)

let htmlString = '';
changeLog.map(log => {
    let contentHtml = log.contentList.join(''); 
    htmlString = htmlString + `<div><h3>${log.heading} ${log.revisionDate}</h3><ul>${contentHtml}</ul></div>`;
});
fs.writeFile('output.html', htmlString, (err) => {
    if (err) return console.log(err);
    console.log('Open output.html');
});
