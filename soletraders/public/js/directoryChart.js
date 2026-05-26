// CHART JS FILE WITH: 
// LOGIC TO AVOID A CHART SHOWING A UNIQUE COLOUR IN THE DOUGHNUT WHEN A TRADE IS SELECTED 
// IF BOTH FILTERS ARE SELECTED, THE INDIVIDUAL RATING IS SHOWN TO AVOID A UX DEAD-END (A CHART THAT'S IRRELEVANT AND DOESN'T LOOK GOOD)
// ADDITIONALLY, SINCE THE FILTERS ARE DYNAMICALLY GENERATED AND WE DON'T HAVE A LIMITED NUMBER OF TRADE TYPES (TRADERS CAN ENTER THE TRADE TYPE FREELY), WE CAN'T SET A LIMITED NUMBER OF COLOURS FOR THE CHART AND WE NEED TO GENERATE THEM DYMANICALLY
//      

// Note: We can't use '<%- ... %>' inside a .js file, so we need to grab the data from a "data attribute" in the HTML

document.addEventListener('DOMContentLoaded', function() {
    const chartCanvas = document.getElementById('tradeDoughnutChart');
    if (!chartCanvas) return;

    // 1. Pull data from the HTML Data Attributes
    const rawData = chartCanvas.getAttribute('data-traders');
    const currentTrade = chartCanvas.getAttribute('data-current-trade');
    const currentRegion = chartCanvas.getAttribute('data-current-region');
    const traderData = JSON.parse(rawData);

    // Safety check: If no traders found, don't try to build a chart
    if (!traderData || traderData.length === 0) {
        chartCanvas.parentElement.innerHTML = '<p class="text-muted small mt-4">No data to visualize</p>';
        return;
    }

    // 2. Determine Chart Logic based on Filter Depth
    const counts = {};
    let chartLabel = "";

    if (!currentTrade || currentTrade === "") {
        // LEVEL 1: No Trade Filter -> Show Trade Types
        chartLabel = "Service Variety";
        traderData.forEach(t => {
            counts[t.trade_type] = (counts[t.trade_type] || 0) + 1;
        });
    } else if (currentTrade && (!currentRegion || currentRegion === "")) {
        // LEVEL 2: Trade Filtered, but no Region -> Show Regions
        chartLabel = `Regional Distribution: ${currentTrade}s`;
        traderData.forEach(t => {
            counts[t.region] = (counts[t.region] || 0) + 1;
        });
    } else {
        // LEVEL 3: Both Filtered -> Show individual ratings for comparison
        chartLabel = "Trader Rating Comparison";
        traderData.forEach(t => {
            counts[t.trader_name] = parseFloat(t.average_rating) || 0;
        });
    }

    // 3. Prepare Data Arrays
    const labels = Object.keys(counts);
    const dataValues = Object.values(counts);

    // 4. Dynamic Color Generation (HSL Math)
    // This ensures every slice gets a unique color regardless of how many items there are
    const dynamicColors = labels.map((_, index) => {
        const hue = (index * (360 / labels.length)); 
        return `hsl(${hue}, 70%, 60%)`; 
    });

    // 5. Initialize Chart.js
    const ctx = chartCanvas.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: dynamicColors,
                hoverOffset: 15,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true, // For responsiveness
            maintainAspectRatio: false, // For responsiveness: lets it fill the container
            plugins: {
                title: {
                    display: true,
                    text: chartLabel,
                    font: { size: 14, weight: 'bold' },
                    padding: { bottom: 10 }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            let value = context.raw || 0;
                            // If we are looking at ratings, add "/ 5" to the tooltip
                            return currentTrade && currentRegion ? `${label}: ${value} ★` : `${label}: ${value}`;
                        }
                    }
                }
            },
            cutout: '65%' // Creates the modern doughnut look
        }
    });
});