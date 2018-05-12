let TAG = 'github-story-points';
function log(msg) { console.log(TAG + ': ' + msg); }

let SIZE_S = 'size s';
let SIZE_M = 'size m';
let SIZE_L = 'size l';

function main() {
    if (!isOpenIssuesTabSelected()) {
        log('"Open" tab is not selected. Ignoring.');
        return;
    }

    if (isPageReady()) {
        onPageReady();
    } else {
        var intervalID = window.setInterval(() => {
            if (isPageReady()) {
                window.clearInterval(intervalID);
                onPageReady();
            }
        }, 1000);
    }
}

function onPageReady() {
    let sizes = extractSizes();
    let newNode = createResultNode(sizes);

    let issuesList = document.getElementsByClassName('issues-listing')[0];
    issuesList.parentNode.insertBefore(newNode, issuesList);
}

function extractSizes() {
    var labelCounts = {};
    for (k of [SIZE_S, SIZE_M, SIZE_L]) labelCounts[k] = 0;

    Array.from(document.getElementsByClassName('IssueLabel')).forEach(element => {
        let label = element.innerText.toLowerCase();
        if (labelCounts.hasOwnProperty(label)) {
            labelCounts[label] += 1;
        }
    });

    return labelCounts;
}

function createResultNode(sizes) {
    let container = document.createElement('div');

    let rawCountNode = document.createElement('p');
    let rawCountStr = SIZE_S + ': ' + sizes[SIZE_S] + ', ' +
            SIZE_M + ': ' + sizes[SIZE_M] + ', ' +
            SIZE_L + ': ' + sizes[SIZE_L];
    rawCountNode.innerText = rawCountStr;
    container.appendChild(rawCountNode);

    return container;
}

function getOpenIssuesNode() {
    let elements = Array.from(document.getElementsByClassName('table-list-header-toggle'));
    let openElements = elements.filter(e => e.innerText.includes('Open'));
    return Array.from(openElements[0].childNodes).filter(e => e.innerText && e.innerText.includes('Open'))[0];
}

function getActualOpenCount() {
    // It'd be safer to use the API here...
    return parseInt(getOpenIssuesNode().innerText.trim().split(' ')[0]);
}

function isOpenIssuesTabSelected() {
    return getOpenIssuesNode().classList.contains('selected');
}

function isPageReady() {
    // Issues are loaded asynchronously.
    let displayedIssuesCount = document.getElementsByClassName('js-issue-row').length;
    return getActualOpenCount() === displayedIssuesCount;
}

main();
