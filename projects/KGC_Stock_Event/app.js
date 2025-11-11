// Stock names
const STOCKS = [
    'Guilsus Armory',
    'Goblin',
    'Alice General Store',
    'Black Market',
    'Aram Firm'
];

// Chart colors for each stock
const STOCK_COLORS = {
    'Guilsus Armory': '#7c4dff',
    'Goblin': '#4caf50',
    'Alice General Store': '#ff9800',
    'Black Market': '#f44336',
    'Aram Firm': '#00bcd4'
};

let stockData = [];
let currentChart = null;
let selectedStocks = new Set(STOCKS);
let chartType = 'price';
let roundStart = 1;
let roundEnd = 486;

// Load data from JSON file
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.statusText}`);
        }
        stockData = await response.json();
        
        // Validate data structure
        if (!Array.isArray(stockData) || stockData.length === 0) {
            throw new Error('Data file is empty or invalid format');
        }

        // Update round range inputs
        roundEnd = Math.max(roundEnd, stockData.length);
        document.getElementById('roundStart').max = stockData.length;
        document.getElementById('roundEnd').max = stockData.length;
        document.getElementById('roundEnd').value = stockData.length;

        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        
        initializeUI();
        updateStats();
        updateChart();
        updateTable();
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = `Error: ${error.message}. Please ensure data.json exists and is properly formatted.`;
        console.error('Error loading data:', error);
    }
}

// Initialize UI elements
function initializeUI() {
    // Create stock checkboxes
    const checkboxesContainer = document.getElementById('stockCheckboxes');
    STOCKS.forEach(stock => {
        const checkboxGroup = document.createElement('div');
        checkboxGroup.className = 'checkbox-group';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `stock-${stock}`;
        checkbox.checked = true;
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedStocks.add(stock);
            } else {
                selectedStocks.delete(stock);
            }
            updateChart();
        });
        
        const label = document.createElement('label');
        label.htmlFor = `stock-${stock}`;
        label.textContent = stock;
        label.style.color = STOCK_COLORS[stock];
        
        checkboxGroup.appendChild(checkbox);
        checkboxGroup.appendChild(label);
        checkboxesContainer.appendChild(checkboxGroup);
    });

    // Add event listeners for controls
    document.getElementById('chartType').addEventListener('change', (e) => {
        chartType = e.target.value;
        updateChartTitle();
        updateChart();
    });

    document.getElementById('roundStart').addEventListener('input', (e) => {
        roundStart = Math.max(1, Math.min(parseInt(e.target.value) || 1, stockData.length));
        e.target.value = roundStart;
        if (roundStart > roundEnd) {
            roundEnd = roundStart;
            document.getElementById('roundEnd').value = roundEnd;
        }
        updateChart();
        updateTable();
    });

    document.getElementById('roundEnd').addEventListener('input', (e) => {
        roundEnd = Math.max(roundStart, Math.min(parseInt(e.target.value) || stockData.length, stockData.length));
        e.target.value = roundEnd;
        updateChart();
        updateTable();
    });
}

// Update statistics
function updateStats() {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = '';

    const stats = [
        { label: 'Total Rounds', value: stockData.length },
        { label: 'Stocks Tracked', value: STOCKS.length },
        { label: 'Current Round Range', value: `${roundStart} - ${roundEnd}` }
    ];

    stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
        `;
        statsGrid.appendChild(statCard);
    });
}

// Update chart title
function updateChartTitle() {
    const titles = {
        'price': 'Price Over Time',
        'percentage': 'Percentage Change Over Time',
        'flat': 'Flat Token Change Over Time',
        'cumulative': 'Cumulative Change Over Time'
    };
    document.getElementById('chartTitle').textContent = titles[chartType] || 'Chart';
}

// Update chart
function updateChart() {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    if (currentChart) {
        currentChart.destroy();
    }

    const filteredData = stockData.slice(roundStart - 1, roundEnd);
    const labels = filteredData.map((_, index) => `Round ${roundStart + index}`);

    const datasets = STOCKS
        .filter(stock => selectedStocks.has(stock))
        .map(stock => {
            let data;
            let label;
            let yAxisID = 'y';

            switch (chartType) {
                case 'price':
                    data = filteredData.map(round => round[stock]?.price || 0);
                    label = `${stock} - Price`;
                    break;
                case 'percentage':
                    data = filteredData.map(round => round[stock]?.percentageChange || 0);
                    label = `${stock} - % Change`;
                    break;
                case 'flat':
                    data = filteredData.map(round => round[stock]?.flatChange || 0);
                    label = `${stock} - Flat Change`;
                    break;
                case 'cumulative':
                    let cumulative = 0;
                    data = filteredData.map(round => {
                        cumulative += (round[stock]?.flatChange || 0);
                        return cumulative;
                    });
                    label = `${stock} - Cumulative`;
                    break;
            }

            return {
                label: label,
                data: data,
                borderColor: STOCK_COLORS[stock],
                backgroundColor: STOCK_COLORS[stock] + '20',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 4
            };
        });

    const chartConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(26, 26, 26, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#7c4dff',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label = label.split(' - ')[0] + ': ';
                            }
                            if (context.parsed.y !== null) {
                                const value = context.parsed.y;
                                if (chartType === 'percentage') {
                                    label += value.toFixed(2) + '%';
                                } else {
                                    label += value.toLocaleString();
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#a0a0a0',
                        maxRotation: 45,
                        minRotation: 45,
                        maxTicksLimit: 20
                    },
                    grid: {
                        color: 'rgba(124, 77, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#a0a0a0',
                        callback: function(value) {
                            if (chartType === 'percentage') {
                                return value.toFixed(1) + '%';
                            }
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(124, 77, 255, 0.1)'
                    }
                }
            }
        }
    };

    currentChart = new Chart(ctx, chartConfig);
}

// Update data table
function updateTable() {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');
    
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // Create header
    const headerRow = document.createElement('tr');
    const roundHeader = document.createElement('th');
    roundHeader.textContent = 'Round';
    headerRow.appendChild(roundHeader);

    STOCKS.forEach(stock => {
        if (selectedStocks.has(stock)) {
            const priceHeader = document.createElement('th');
            priceHeader.textContent = `${stock} - Price`;
            headerRow.appendChild(priceHeader);
            
            const changeHeader = document.createElement('th');
            changeHeader.textContent = `${stock} - Change`;
            headerRow.appendChild(changeHeader);
        }
    });
    tableHead.appendChild(headerRow);

    // Create rows
    const filteredData = stockData.slice(roundStart - 1, roundEnd);
    filteredData.forEach((round, index) => {
        const row = document.createElement('tr');
        
        const roundCell = document.createElement('td');
        roundCell.textContent = roundStart + index;
        row.appendChild(roundCell);

        STOCKS.forEach(stock => {
            if (selectedStocks.has(stock)) {
                const stockData = round[stock] || {};
                
                const priceCell = document.createElement('td');
                priceCell.textContent = stockData.price || '-';
                row.appendChild(priceCell);
                
                const changeCell = document.createElement('td');
                const flatChange = stockData.flatChange || 0;
                const percentageChange = stockData.percentageChange || 0;
                changeCell.innerHTML = `
                    <span class="${flatChange >= 0 ? 'positive' : 'negative'}">
                        ${flatChange >= 0 ? '+' : ''}${flatChange.toLocaleString()} 
                        (${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(2)}%)
                    </span>
                `;
                row.appendChild(changeCell);
            }
        });
        
        tableBody.appendChild(row);
    });
}

// Initialize on page load
loadData();

