// GitHub often navigates between pages using the history APIs: this breaks
// the default way content scripts work. To get around this, include this
// file as a content script before your main file and implement the functions
// - onPageLoad: called when a new page is loaded
// - removeAddedNodes: this should remove any nodes you previously added to the DOM.
//   This is necessary because page state isn't clean when navigating because there's
//   no refresh.
//
// Then call onPageLoad() at the end of your files.

function _onPageLoadOuter() {
    // Back-forward navigation can add nodes: create a clean slate.
    removeAddedNodes(); // defined by application.
    onPageLoad(); // defined by application.
}

// window.location is an object so we convert it to a string to copy it.
function _getLocation() { return "" + window.location; }

var _currentLocation = _getLocation();
function _dispatchIfLocationUpdate() {
    if (window.location !== _currentLocation) {
        _currentLocation = _getLocation();
        _onPageLoadOuter();
    }
}

// We watch the DOM to detect when GitHub changes the page through the history API,
// such as when the user is on the issues list and they click an issue.
//
// The proper way to do this would be browser.webNavigation.onHistoryStateUpdated,
// but this isn't available to content scripts.
let _containerObserver = new MutationObserver(_dispatchIfLocationUpdate);
let _ghPageContainer = document.getElementById('js-repo-pjax-container');
_containerObserver.observe(_ghPageContainer, {childList: "true"});