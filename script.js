const tableBody = document.getElementById("data-body");
const loadingSpinner = document.getElementById("spinner");

const types = {
    Cloudflare: ".pages.dev",
    GitHub: ".github.io",
    Netlify: ".netlify.app",
    Railway: ".railway.app"
};

const hiddenDomains = ["_psl", "@", "www"];

// Function to show loading spinner
function showLoadingSpinner() {
    loadingSpinner.classList.remove("hidden");
}

// Function to hide loading spinner
function hideLoadingSpinner() {
    loadingSpinner.classList.add("hidden");
}

// Function to create a pie chart
function createPieChart(labels, data, chartTitle) {
    const ctx = document.getElementById("pieChart").getContext("2d");

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: generateRandomColors(labels.length),
                    borderWidth: 0,
                },
            ],
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
                        weight: "bold",
                    },
                    color: "rgb(66, 133, 244)", // Use a different color for the title
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderColor: "rgba(0, 0, 0, 0.9)",
                    borderWidth: 1,
                },
            },
        },
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

    data.forEach((i) => {
        if (!hiddenDomains.includes(i.subdomain)) {
            Object.keys(i.record).forEach((record) => {
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
            datasets: [
                {
                    label: chartTitle,
                    data: data,
                    backgroundColor: generateRandomColors(labels.length),
                    borderWidth: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom", // Change legend position to bottom
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderColor: "rgba(0, 0, 0, 0.9)",
                    borderWidth: 0,
                },
            },
        },
    });
}

// Function to extract data for the bar chart
function extractBarChartData(data, serviceTypes) {
    const serviceCounts = {};

    data.forEach((i) => {
        if (!hiddenDomains.includes(i.subdomain)) {
            // Check if the subdomain type matches any of the specified service types
            const matchedServiceType = serviceTypes.find((type) => {
                if (type === "Cloudflare" && i.record.CNAME?.endsWith(types[type])) return true;
                if (type === "Email" && i.record.MX?.length) return true;
                if (type === "GitHub" && i.record.CNAME?.endsWith(types[type])) return true;
                if (type === "Netlify" && i.record.CNAME?.endsWith(types[type])) return true;
                if (type === "Railway" && i.record.CNAME?.endsWith(types[type])) return true;
                if (type === "A" && i.record.A?.length) return true;
                if (type === "AAAA" && i.record.AAAA?.length) return true;
                if (type === "MX" && i.record.MX?.length) return true;
                if (type === "TXT" && i.record.TXT?.length) return true;
                if (type === "CNAME" && i.record.CNAME) return true;

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

// Function to display data in the table
function displayData(data) {
    tableBody.innerHTML = "";

    const filterType = document.getElementById("filterType").value;
    const searchRecord = document.getElementById("searchRecord").value.toLowerCase();

    data.forEach((i) => {
        if (hiddenDomains.includes(i.subdomain)) return;

        // Filter by domain type
        if (filterType) {
            const matchedType =
            (filterType === "Cloudflare" && i.record.CNAME?.endsWith(types[filterType])) ||
            (filterType === "GitHub" && i.record.CNAME?.endsWith(types[filterType])) ||
            (filterType === "Netlify" && i.record.CNAME?.endsWith(types[filterType])) ||
            (filterType === "Railway" && i.record.CNAME?.endsWith(types[filterType])) ||
            (filterType === "Email" && i.record.MX?.length) ||
            (filterType === "A" && i.record.A?.length) ||
            (filterType === "AAAA" && i.record.AAAA?.length) ||
            (filterType === "MX" && i.record.MX?.length) ||
            (filterType === "TXT" && i.record.TXT?.length) ||
            (filterType === "CNAME" && i.record.CNAME);

            if (!matchedType) return;
        }

        // Filter by search term
        const records = Object.keys(i.record).map(record => {
            if (record === "A" || record === "AAAA" || record === "MX" || record === "TXT") {
                if (Array.isArray(i.record[record])) {
                    return i.record[record].map(r => `<span class="text-blue-600 font-semibold">${record}</span> ${r}`).join("<br>");
                } else {
                    return `<span class="text-blue-600 font-semibold">${record}</span> ${i.record[record]}`;
                }
            } else if (record === "URL") {
                return `<span class="text-green-600 font-semibold">${record}</span> <a href="${i.record[record]}" class="underline underline-2 hover:no-underline">${i.record[record]}</a>`;
            } else {
                return `<span class="text-blue-600 font-semibold">${record}</span> ${i.record[record]}`;
            }
        }).join("<br>");

        if (searchRecord && !records.toLowerCase().includes(searchRecord)) return;

        let row = tableBody.insertRow(-1);

        let c1 = row.insertCell(0);
        let c2 = row.insertCell(1);
        let c3 = row.insertCell(2);

        c1.classList = "px-4 py-2 outline outline-1 outline-gray-700";
        c2.classList = "px-4 py-2 outline outline-1 outline-gray-700";
        c3.classList = "px-4 py-2 outline outline-1 outline-gray-700";

        c1.innerHTML = `<a href="https://${i.subdomain}.is-a.dev" class="text-blue-600 hover:text-blue-700">${i.subdomain}</a>`;
        c2.innerHTML = `<span class="font-semibold">Username:</span> ${i.owner.username ? `<a href="https://github.com/${i.owner.username}" class="underline underline-2 hover:no-underline">${i.owner.username}</a>` : `<span class="italic">None</span>`}`;
        c3.innerHTML = records;
    });
}

// Load data function
function loadData() {
    showLoadingSpinner(); // Show loading spinner while data is loading
    fetch("https://raw-api.is-a.dev", {
        method: "GET",
    })
    .then((res) => res.json())
    .then((data) => {
        hideLoadingSpinner(); // Hide loading spinner once data is loaded
        data.sort((a, b) => a.subdomain.localeCompare(b.subdomain));

        // Display initial data
        displayData(data);

        // Add event listeners for filter and search
        document.getElementById("filterType").addEventListener("change", () => displayData(data));
        document.getElementById("searchRecord").addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                displayData(data);
            }
        });
    });
}

// Load data when the page loads
document.addEventListener("DOMContentLoaded", loadData);
