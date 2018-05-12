let TAG = 'github-story-points';
function log(msg) { console.log(TAG + ': ' + msg); }

let DIV_ID = TAG + '-container';

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
    insertResultNode(newNode);
}

function insertResultNode(newNode) {
    let oldNode = document.getElementById(DIV_ID);
    if (oldNode) oldNode.remove();

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
    let outerContainer = el('div');
    outerContainer.id = DIV_ID;
    let labelCountsNode = el('p');
    outerContainer.appendChild(labelCountsNode);

    let title = el('span');
    title.innerText = 'Work remaining: ';
    labelCountsNode.appendChild(title);

    for (k of [SIZE_S, SIZE_M, SIZE_L]) {
        let label = k.toUpperCase() + ': ';

        let labelNode = el('span');
        labelNode.style.fontWeight = 'bold';
        labelNode.innerText = label;
        labelCountsNode.appendChild(labelNode);

        let countNode = el('span');
        countNode.innerText = sizes[k] + ' '
        labelCountsNode.appendChild(countNode);
    }

    return outerContainer;
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

function el(tag) { return document.createElement(tag); }

main();
