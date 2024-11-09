fetch("https://raw-api.is-a.dev")
    .then((response) => response.json())
    .then((data) => {
        const totalDomains = data.length;
        let totalRecords = 0;
        const uniqueUsers = [...new Set(data.map((domain) => domain.owner.username))].length;
        const averageDomainsPerUser = (totalDomains / uniqueUsers).toFixed(1);
        let userWithMostDomains = [
            ...new Set(data.map((domain) => domain.owner.username)),
        ].reduce((a, b) =>
            data.filter((domain) => domain.owner.username === a).length >=
            data.filter((domain) => domain.owner.username === b).length
                ? a
                : b
        );
        userWithMostDomains = `${userWithMostDomains} (${data.filter((domain) => domain.owner.username === userWithMostDomains).length})`;

        let A = 0;
        let AAAA = 0;
        let CAA = 0;
        let CNAME = 0;
        let DS = 0;
        let MX = 0;
        let NS = 0;
        let SRV = 0;
        let TXT = 0;
        let URL = 0;

        for (const domain of data) {
            if (domain.record.A) {
                A += domain.record.A.length;
                totalRecords++;
            }

            if (domain.record.AAAA) {
                AAAA += domain.record.AAAA.length;
                totalRecords++;
            }

            if (domain.record.CAA) {
                CAA += domain.record.CAA.length;
                totalRecords++;
            }

            if (domain.record.CNAME) {
                CNAME++;
                totalRecords++;
            }

            if (domain.record.DS) {
                DS++;
                totalRecords++;
            }

            if (domain.record.MX) {
                MX += domain.record.MX.length;
                totalRecords++;
            }

            if (domain.record.NS) {
                NS += domain.record.NS.length;
                totalRecords++;
            }

            if (domain.record.SRV) {
                SRV += domain.record.SRV.length;
                totalRecords++;
            }

            if (domain.record.TXT) {
                if (Array.isArray(domain.record.TXT)) {
                    TXT += domain.record.TXT.length;
                    totalRecords += domain.record.TXT.length;
                } else {
                    TXT++;
                    totalRecords++;
                }
            }

            if (domain.record.URL) {
                URL++;
                totalRecords++;
            }
        }

        document.getElementById("total-domains").innerText = totalDomains;
        document.getElementById("total-records").innerText = totalRecords;
        document.getElementById("unique-users").innerText = uniqueUsers;
        document.getElementById("average-domains-per-user").innerText = averageDomainsPerUser;
        document.getElementById("user-with-most-domains").innerText = userWithMostDomains;
        document.getElementById("a-records").innerText = A;
        document.getElementById("aaaa-records").innerText = AAAA;
        document.getElementById("caa-records").innerText = CAA;
        document.getElementById("cname-records").innerText = CNAME;
        document.getElementById("ds-records").innerText = DS;
        document.getElementById("mx-records").innerText = MX;
        document.getElementById("ns-records").innerText = NS;
        document.getElementById("srv-records").innerText = SRV;
        document.getElementById("txt-records").innerText = TXT;
        document.getElementById("url-records").innerText = URL;
    });

fetch("https://api.hrsn.net/is-a-dev/zone-updated")
    .then((response) => response.json())
    .then((data) => {
        document.getElementById("zone-updated").innerText = data.timestamp.rfc;
    });
