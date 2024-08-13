javascript: (async () => {
    if (window.location.origin != "https://railway.app") {
        alert("This bookmarklet is designed to be used with Railway");
        return;
    };

    const projectRegex = /\/project\/(.+?)(?:\/|$)/;
    const serviceRegex = /\/service\/(.+?)(?:$|\?id)/;

    const pathname = window.location.pathname;

    if (projectRegex.exec(pathname) == null) {
        alert("No Project ID could be found, are you in a Project?");
        return;
    };

    if (serviceRegex.exec(pathname) == null) {
        alert("No Service ID could be found, do you have a Service open?");
        return;
    };

    const queryString = window.location.search;

    if (!queryString || !queryString.startsWith("?id=")) {
        alert("No Deployment could be found, do you have a Deployment open?");
        return;
    };

    const deploymentId = queryString.slice(4);

    const buildLogsBtn = document.querySelector("[id$='trigger-build']");
    const deployLogsBtn = document.querySelector("[id$='trigger-deploy']");

    if (buildLogsBtn == null || deployLogsBtn == null) {
        alert("Unknown state, contact maintainer");
        return;
    };

    const buildLogsBtnState = buildLogsBtn.getAttribute("data-state");
    const deployLogsBtnState = deployLogsBtn.getAttribute("data-state");

    const unknownStateMsg = "Unknown state, contact maintainer";

    if (buildLogsBtnState == null || deployLogsBtnState == null) {
        alert(unknownStateMsg);
        return;
    };

    const expectedStates = ["active", "inactive"];

    if (expectedStates.includes(buildLogsBtnState) == false || expectedStates.includes(buildLogsBtnState) == false) {
        alert(unknownStateMsg);
        return;
    };

    if (buildLogsBtnState == "inactive" && deployLogsBtnState == "inactive") {
        alert("Select the log type to download by opening the Build logs or the Deploy logs");
        return;
    };

    let operationName;
    let friendlyOperationName;

    if (buildLogsBtnState == "active") {
        friendlyOperationName = "build logs";
        operationName = "buildLogs";
    };

    if (deployLogsBtnState == "active") {
        friendlyOperationName = "deployment logs";
        operationName = "deploymentLogs";
    };

    const downloadConfirm = confirm(`Download the ${friendlyOperationName} for the currently open service?`);
    if (downloadConfirm == false) {
        alert("User canceled the prompt");
        return;
    };

    const deploymentReq = await fetch("https://backboard.railway.app/graphql/internal?q=deploymentv2", {
        headers: {
            "cache-control": "no-cache",
            "content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
            operationName: "deployment",
            query: "query deployment($id: String!) {\n deployment(id: $id) {\n id\n status\n createdAt\n projectId\n serviceId\n snapshotId\n environment {\n id\n name\n }\n }\n }",
            variables: {
                "id": deploymentId
            },
        }),
        mode: "cors",
        credentials: "include",
    });

    if (deploymentReq.status != 200) {
        alert(`Non 200 status code returned from API: ${deploymentReq.status}\ncontact maintainer`);
        return;
    };

    const deploymentInfo = await deploymentReq.json();

    if (deploymentInfo.errors != undefined) {
        alert(deploymentInfo.errors[0].message);
        return;
    };

    if (deploymentInfo.data == null) {
        alert("The API returned the null data type");
        return;
    };

    if (deploymentInfo.data.deployment.length == 0) {
        alert("The API didn't return any deployment info");
        return;
    };

    let filter;

    switch (operationName) {
        case "buildLogs":
            filter = `@snapshot:${deploymentInfo.data.deployment.snapshotId} OR @replica:${deploymentInfo.data.deployment.snapshotId}`;
            break;
        case "deploymentLogs":
            filter = `@deployment:${deploymentInfo.data.deployment.id} -@replica:${deploymentInfo.data.deployment.snapshotId}`;
            break;
    };

    const ws = new WebSocket("wss://backboard.railway.app/graphql/internal", "graphql-transport-ws");

    ws.onopen = function () {
        ws.send(JSON.stringify({
            "type": "connection_init"
        }));
    };

    ws.onerror = function (e) {
        alert(e);
        return;
    };

    ws.onmessage = function (wsMsg) {
        var msg = JSON.parse(wsMsg.data);

        switch (msg.type) {
            case "connection_ack":
                ws.send(JSON.stringify({
                    "id": crypto.randomUUID(),
                    "payload": {
                        "query": "subscription streamEnvironmentLogs($environmentId: String!, $filter: String, $beforeLimit: Int!, $beforeDate: String, $anchorDate: String, $afterDate: String, $afterLimit: Int) {\n  environmentLogs(\n environmentId: $environmentId\n filter: $filter\n beforeDate: $beforeDate\n anchorDate: $anchorDate\n afterDate: $afterDate\n beforeLimit: $beforeLimit\n afterLimit: $afterLimit\n ) {\n ...LogFields\n }\n}\n\nfragment LogFields on Log {\n timestamp\n message\n severity\n tags {\n projectId\n environmentId\n pluginId\n serviceId\n deploymentId\n deploymentInstanceId\n snapshotId\n }\n attributes {\n key\n value\n }\n}",
                        "variables": {
                            "afterDate": null,
                            "anchorDate": null,
                            "beforeDate": deploymentInfo.data.deployment.createdAt,
                            "beforeLimit": 1500,
                            "environmentId": deploymentInfo.data.deployment.environment.id,
                            "filter": filter
                        }
                    },
                    "type": "subscribe"
                }));

                break;
            case "next":
                if (!msg.payload.data.environmentLogs || msg.payload.data.environmentLogs.length === 0) {
                    alert("The API didn't return any log lines");

                    ws.close();

                    break;
                };

                let logParts = [];

                msg.payload.data.environmentLogs.forEach((logLine, i) => {
                    let message = logLine.message;
            
                    // skip first line if blank
                    if (i == 0 && message == "") return;
            
                    // remove colour codes
                    message = message.replace(/\u001b[^m]*?m/g, "");
            
                    // handle json attributes, making sure to ignore the json normalization
                    if (logLine.attributes && logLine.attributes.length && !(logLine.attributes.length == 1 && logLine.attributes[0].key == "level")) {
                        let attributes = logLine.attributes;
            
                        attributes.sort((a, b) => {
                            return a.key.localeCompare(b.key);
                        });
            
                        let attributesSuffix = "";
            
                        logLine.attributes.forEach((attribute) => {
                            attributesSuffix += ` ${attribute.key}=${attribute.value}`;
                        });
            
                        message = `message="${message}"${attributesSuffix}`;
                    };
            
                    logParts.push(message);
            
                    if (i < msg.payload.data.environmentLogs.length - 1) logParts.push("\n");
                });
            
                const blob = new Blob(logParts, { type: 'text/plain' });
            
                if (logParts.length == 0) {
                    alert("No log lines where parsed");
                    return;
                };
            
                const url = window.URL.createObjectURL(blob);
            
                const link = document.createElement('a');
            
                link.href = url;
            
                const ogTitle = document.querySelector("meta[property='og:title']");
            
                const serviceName = (ogTitle != null) ? "_" + ogTitle.getAttribute("content").toLowerCase() : "";
            
                link.download = (friendlyOperationName + serviceName + "_" + Math.floor(Date.now() / 1000) + ".log").replaceAll(" ", "_");
            
                link.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                }));
            
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    link.remove();
                }, 100);

                ws.close();

                break;
        };
    };

    return;
})();