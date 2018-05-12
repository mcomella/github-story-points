function getMilestone() {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open("GET", "https://api.github.com/users/octocat/orgs");
        req.setRequestHeader('Accept', 'application/vnd.github.v3+json');

        req.onload = () => {
            if (req.status === 200) { // TODO: handle lack of responses.
                resolve(req.response);
            } else {
                reject(Error(req.statusText));
            }
        };

        req.onerror = (res) => {
            reject(Error('Network error')); // TODO: more?
        };

        req.send();
    });
}

getMilestone().then((serverData) => {
    console.log(serverData);
}, (error) => {
    console.log(error);
});
