let TAG = 'github-story-points';
function log(msg) { console.log(TAG + ': ' + msg); }

let DIV_ID = TAG + '-container';
let RESULT_ID = TAG + '-results';

let SIZE_S = 'size s';
let SIZE_M = 'size m';
let SIZE_L = 'size l';
let ALL_SIZES = [SIZE_S, SIZE_M, SIZE_L];

let DEFAULT_DAYS_PER_SIZE = {};
DEFAULT_DAYS_PER_SIZE[SIZE_S] = 1;
DEFAULT_DAYS_PER_SIZE[SIZE_M] = 3;
DEFAULT_DAYS_PER_SIZE[SIZE_L] = 5;

// required by github-navigation.js
function removeAddedNodes() {
    // We don't add nodes, we only modify the existing one, so we're fine.
}

// required by github-navigation.js
function onPageLoad() {
    if (!isMilestonePage()) {
        log('Not a milestone page: ignoring.');
        return;
    }

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

let MILESTONE_REGEX = '^/.+/.+/milestone/[0-9]+'
function isMilestonePage() {
    return window.location.pathname.match(MILESTONE_REGEX);
}

function onPageReady() {
    let sizes = extractSizes();
    let newNode = createResultNode(sizes);
    insertResultNode(newNode);
    calculateAndUpdateResults(sizes);
}

function insertResultNode(newNode) {
    let oldNode = document.getElementById(DIV_ID);
    if (oldNode) oldNode.remove();

    let issuesList = document.getElementsByClassName('issues-listing')[0];
    issuesList.parentNode.insertBefore(newNode, issuesList);
}

function extractSizes() {
    var labelCounts = {};
    for (k of ALL_SIZES) labelCounts[k] = 0;

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
    let calculatorNode = el('p');
    calculatorNode.style = 'padding-left: 20px;';
    outerContainer.appendChild(calculatorNode);

    let labelTitle = el('span');
    labelTitle.innerText = 'Work remaining: ';
    labelCountsNode.appendChild(labelTitle);
    for (k of ALL_SIZES) {
        let label = k.toUpperCase() + ': ';

        let labelNode = el('span');
        labelNode.style.fontWeight = 'bold';
        labelNode.innerText = label;
        labelCountsNode.appendChild(labelNode);

        let countNode = el('span');
        countNode.innerText = sizes[k] + ' '
        labelCountsNode.appendChild(countNode);
    }

    let calcTitle = el('span');
    calcTitle.innerText = 'Calculator: days';
    calculatorNode.appendChild(calcTitle);
    for (k of ALL_SIZES) {
        let label = '/' + k.trim().split(' ')[1].toUpperCase() + ' ';

        let labelNode = el('span');
        labelNode.innerText = label;
        calculatorNode.appendChild(labelNode);

        let inputNode = el('input');
        inputNode.id = getInputElementID(k);
        inputNode.style = 'max-width: 30px;';
        calculatorNode.appendChild(inputNode);

        let spacer = el('span');
        spacer.innerText = ' ';
        calculatorNode.appendChild(spacer);
    }
    let calcResultNode = el('span');
    calcResultNode.id = RESULT_ID; // text added later.
    calculatorNode.appendChild(calcResultNode);
    let calculateButton = el('button');
    calculateButton.innerText = 'Recalculate';
    calculateButton.onclick = () => { calculateAndUpdateResults(sizes) };
    calculatorNode.appendChild(calculateButton);

    return outerContainer;
}

function calculateAndUpdateResults(sizes) {
    let resultNode = document.getElementById(RESULT_ID);

    var numDays = 0;
    for (k of ALL_SIZES) {
        let labelInputNode = document.getElementById(getInputElementID(k));
        var daysPerLabel = parseInt(labelInputNode.value);
        if (isNaN(daysPerLabel)) {
            let defaultDays = DEFAULT_DAYS_PER_SIZE[k];
            daysPerLabel = defaultDays;
            labelInputNode.value = defaultDays;
        }
        numDays += sizes[k] * daysPerLabel;
    }

    resultNode.innerText = ' = ' + numDays + ' days ';
}

function getInputElementID(label) { return TAG + '-' + k.replace(' ', '-'); }

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

onPageLoad();
