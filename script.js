const tableBody = document.getElementById("data-body");

const types = {
    Cloudflare: ".pages.dev",
    DBH: "69.30.249.53",
    GitHub: ".github.io"
}

const hiddenDomains = [
    "_psl",
    "@",
    "www"
]

// Function to create a pie chart
function createPieChart(labels, data, chartTitle) {
    const ctx = document.getElementById("pieChart").getContext("2d");

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: generateRandomColors(labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    font: {
                        size: 16,
                        weight: "bold"
                    },
                    color: "rgb(66, 133, 244)" // Use a different color for the title
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderColor: "rgba(0, 0, 0, 0.9)",
                    borderWidth: 1
                }
            }
        }
    });
}

// Function to generate random colors for the pie chart
function generateRandomColors(numColors) {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const randomColor = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.7)`;
        colors.push(randomColor);
    }
    return colors;
}

// Function to extract data for the pie chart
function extractChartData(data) {
    const recordCounts = {};

    data.forEach(i => {
        if (!hiddenDomains.includes(i.subdomain)) {
            Object.keys(i.record).forEach(record => {
                if (recordCounts[record]) {
                    recordCounts[record]++;
                } else {
                    recordCounts[record] = 1;
                }
            });
        }
    });

    const labels = Object.keys(recordCounts);
    const dataValues = Object.values(recordCounts);

    return { labels, dataValues };
}

// Function to create a bar chart
function createBarChart(labels, data, chartTitle) {
    const ctx = document.getElementById("barChart").getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: chartTitle,
                data: data,
                backgroundColor: generateRandomColors(labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom" // Change legend position to bottom
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderColor: "rgba(0, 0, 0, 0.9)",
                    borderWidth: 0
                }
            }
        }
    });
}

// Function to extract data for the bar chart
function extractBarChartData(data, serviceTypes) {
    const serviceCounts = {};

    data.forEach(i => {
        if (!hiddenDomains.includes(i.subdomain)) {
            // Check if the subdomain type matches any of the specified service types
            const matchedServiceType = serviceTypes.find(type => {
                if (type === "Cloudflare" && i.record.CNAME?.endsWith(types[type])) return true;
                if (type === "DBH" && i.record.A?.includes(types[type])) return true;
                if (type === "Email" && i.record.MX?.length) return true;
                if (type === "GitHub" && i.record.CNAME?.endsWith(types[type])) return true;

                return false;
            });

            if (matchedServiceType) {
                if (serviceCounts[matchedServiceType]) {
                    serviceCounts[matchedServiceType]++;
                } else {
                    serviceCounts[matchedServiceType] = 1;
                }
            }
        }
    });

    const labels = Object.keys(serviceCounts);
    const dataValues = Object.values(serviceCounts);

    return { labels, dataValues };
}

function loadData() {
    fetch("https://raw-api.is-a.dev", {
        method: "GET"
    }).then(res => res.json()).then(data => {
        data.sort((a, b) => a.subdomain.localeCompare(b.subdomain));

        data.forEach(i => {
            if(hiddenDomains.includes(i.subdomain)) return;

            let row = tableBody.insertRow(-1);

            let c1 = row.insertCell(0);
            let c2 = row.insertCell(1);
            let c3 = row.insertCell(2);

            c1.classList = "px-4 py-2 outline outline-1 outline-gray-700";
            c2.classList = "px-4 py-2 outline outline-1 outline-gray-700";
            c3.classList = "px-4 py-2 outline outline-1 outline-gray-700";

            const records = [];

            Object.keys(i.record).forEach(record => {
                if(record === "A" || record === "AAAA" || record === "MX" || record === "TXT") {
                    if(Array.isArray(i.record[record])) {
                        i.record[record].forEach(r => {
                            records.push(`<span class="text-blue-600 font-semibold">${record}</span> ${r}`);
                        });
                    } else {
                        records.push(`<span class="text-blue-600 font-semibold">${record}</span> ${i.record[record]}`);
                    }
                } else if(record === "URL") {
                    records.push(`<span class="text-green-600 font-semibold">${record}</span> <a href="${i.record[record]}" class="underline underline-2 hover:no-underline">${i.record[record]}</a>`);
                } else {
                    records.push(`<span class="text-blue-600 font-semibold">${record}</span> ${i.record[record]}`);
                }
            })

            c1.innerHTML = `<a href="https://${i.subdomain}.is-a.dev" class="text-blue-600 hover:text-blue-700">${i.subdomain}</a>`;
            c2.innerHTML = `<span class="font-semibold">Username:</span> ${i.owner.username ? `<a href="https://github.com/${i.owner.username}" class="underline underline-2 hover:no-underline">${i.owner.username}</a>` : `<span class="italic">None</span>`}<br><span class="font-semibold">Email:</span> ${i.owner.email ? `<a href="mailto:${i.owner.email.replace(" (at) ", "@")}" class="underline underline-2 hover:no-underline">${i.owner.email.replace(" (at) ", "@")}</a>` : `<span class="italic">None</span>`}`;
            c3.innerHTML = records.join("<br>");
        })
    })
}
