let TAG = 'github-story-points';
function log(msg) { console.log(TAG + ': ' + msg); }

let DIV_ID = TAG + '-container';
let RESULT_ID = TAG + '-results';

let SIZE_S = 'size s';
let SIZE_M = 'size m';
let SIZE_L = 'size l';
let ALL_SIZES = [SIZE_S, SIZE_M, SIZE_L];

let UNLABELED = 'unlabeled';
let MULTIPLE_LABELS = 'multiple labels';
let ALL_LABELS_DISPLAYED_TO_USER = ALL_SIZES.concat(UNLABELED, MULTIPLE_LABELS);

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
    let labelsDisplayedToUser = extractLabelsDisplayedToUser();
    let newNode = createResultNode(labelsDisplayedToUser);
    insertResultNode(newNode);
    calculateAndUpdateResults(labelsDisplayedToUser);
}

function insertResultNode(newNode) {
    let oldNode = document.getElementById(DIV_ID);
    if (oldNode) oldNode.remove();

    let issuesList = document.getElementsByClassName('issues-listing')[0];
    issuesList.parentNode.insertBefore(newNode, issuesList);
}

function extractLabelsDisplayedToUser() {
    let totalLabelCounts = {};
    for (k of ALL_LABELS_DISPLAYED_TO_USER) totalLabelCounts[k] = 0;

    Array.from(document.getElementsByClassName('d-table')).forEach(issueRow => {
        let issueLabelCounts = {};
        for (k of ALL_SIZES) issueLabelCounts[k] = 0;

        Array.from(issueRow.getElementsByClassName('IssueLabel')).forEach(rawIssueLabel => {
            let label = rawIssueLabel.innerText.toLowerCase();
            if (issueLabelCounts.hasOwnProperty(label)) {
                issueLabelCounts[label] += 1;
            }
        });

        let issueLabelSizeSum = Object.values(issueLabelCounts).reduce((acc, cur) => acc + cur);
        if (issueLabelSizeSum === 0) {
            totalLabelCounts['unlabeled'] += 1;
        } else if (issueLabelSizeSum > 1) {
            totalLabelCounts['multiple labels'] += 1;
        } else {
            for (k in issueLabelCounts) {
                totalLabelCounts[k] += issueLabelCounts[k];
            }
        }
    });

    return totalLabelCounts;
}

function createResultNode(labelsDisplayedToUser) {
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
    for (k of ALL_LABELS_DISPLAYED_TO_USER) {
        var label = k.toUpperCase() + ': ';
        if (k === UNLABELED) {
            label = '|| ' + label; // Separator.
        }
        if (k === UNLABELED || k === MULTIPLE_LABELS) {
            label = label.toLowerCase(); // easier to see sizes.
        }

        let labelNode = el('span');
        labelNode.style.fontWeight = 'bold';
        labelNode.innerText = label;
        labelCountsNode.appendChild(labelNode);

        let countNode = el('span');
        countNode.innerText = labelsDisplayedToUser[k] + ' '
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
    calculateButton.onclick = () => { calculateAndUpdateResults(labelsDisplayedToUser) };
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
