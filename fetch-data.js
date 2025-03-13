fetch("https://raw.is-a.dev")
    .then((response) => response.json())
    .then((data) => {
        const subdomains = data.length;
        const uniqueUsers = [...new Set(data.map((domain) => domain.owner.username))].length;
        const averageDomainsPerUser = (subdomains / uniqueUsers).toFixed(1);
        const mostDomains = [...new Set(data.map((domain) => domain.owner.username))].reduce((a, b) =>
            data.filter((domain) => domain.owner.username === a).length >=
            data.filter((domain) => domain.owner.username === b).length
                ? a
                : b
        );

        let recordCounts = {};
        let totalRecords = 0;

        for (const domain of data) {
            for (const [recordType, recordValue] of Object.entries(domain.record)) {
                if (!recordCounts[recordType]) recordCounts[recordType] = 0;
                if (Array.isArray(recordValue)) {
                    recordCounts[recordType] += recordValue.length;
                    totalRecords += recordValue.length;
                } else {
                    recordCounts[recordType]++;
                    totalRecords++;
                }
            }
        }

        recordCounts = Object.entries(recordCounts).sort();

        document.getElementById("subdomains").innerText = subdomains;
        document.getElementById("records").innerText = totalRecords;
        document.getElementById("unique-users").innerText = uniqueUsers;
        document.getElementById("average-domains-per-user").innerText = averageDomainsPerUser;
        document.getElementById("most-domains").innerHTML = `<a class="text-blue-600 hover:text-blue-500" href="https://github.com/${mostDomains}">${mostDomains}</a> (${
            data.filter((domain) => domain.owner.username === mostDomains).length
        })`;

        for (const [id, [recordType, count]] of Object.entries(recordCounts)) {
            const list = document.getElementById("records-list");
            const listItem = document.createElement("li");
            list.appendChild(listItem);
            listItem.innerHTML = `<span class="font-semibold">${recordType}</span>: ${count}`;
        }
    });

fetch("https://api.hrsn.net/v1/is-a-dev/zone-updated")
    .then((response) => response.json())
    .then((data) => {
        document.getElementById("zone-updated").innerText = data.timestamp.rfc;
    });
