document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const id = urlParams.get('id');
    let priceChart;

    const currencyName = document.getElementById('currencyName');
    const currencySymbol = document.getElementById('currencySymbol');
    const currentPrice = document.getElementById('currentPrice');
    const priceChange = document.getElementById('priceChange');
    const marketCap = document.getElementById('marketCap');
    const volume24h = document.getElementById('volume24h');
    const circulatingSupply = document.getElementById('circulatingSupply');
    const ath = document.getElementById('ath');
    const timeFilters = document.querySelectorAll('.time-filter');

    async function fetchCurrencyData() {
        try {
            if (type === 'crypto') {
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_total_volume=true`);
                const data = await response.json();
                if (data && data[id]) {
                    updateCryptoUIFromSimple(data[id]);
                }
            } else {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await response.json();
                updateFiatUI(data, id);
            }
        } catch (error) {
            console.error('Error fetching currency data:', error);
        }
    }

    function updateCryptoUIFromSimple(data) {
        document.querySelectorAll('.crypto-only').forEach(el => el.style.display = 'block');
        currencyName.textContent = id.charAt(0).toUpperCase() + id.slice(1);
        currencySymbol.textContent = id.toUpperCase();
        currentPrice.textContent = formatPrice(data.usd);
        
        const change24h = data.usd_24h_change;
        priceChange.innerHTML = `
            <i class="fas fa-${change24h >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
            ${Math.abs(change24h).toFixed(2)}%
        `;
        priceChange.className = `price-change ${change24h >= 0 ? 'positive' : 'negative'}`;

        marketCap.textContent = data.usd_market_cap ? formatLargeNumber(data.usd_market_cap) : 'N/A';
        volume24h.textContent = data.usd_24h_vol ? formatLargeNumber(data.usd_24h_vol) : 'N/A';
        circulatingSupply.textContent = 'N/A';
        ath.textContent = 'N/A';

        updateChart(1);
    }

    function updateFiatUI(data, currency) {
        document.querySelectorAll('.crypto-only').forEach(el => el.style.display = 'none');
        currencyName.textContent = currency;
        currencySymbol.textContent = currency;
        const rate = data.rates[currency];
        currentPrice.textContent = formatFiatPrice(rate, currency);
        priceChange.style.display = 'none';

        updateChart(1);
    }

    async function updateChart(days) {
        try {
            let chartData;
            if (type === 'crypto') {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${Math.min(days, 7)}`);
                const data = await response.json();
                chartData = data.prices.map(price => ({
                    x: new Date(price[0]),
                    y: price[1]
                }));
            } else {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await response.json();
                
                if (!data || !data.rates) {
                    throw new Error('Invalid API response');
                }
                
                const rate = data.rates[id];
                if (!rate) {
                    throw new Error('Rate not found');
                }
                
                const now = new Date();
                const startTime = new Date(now);
                startTime.setHours(0, 0, 0, 0);
                
                chartData = [
                    { x: startTime, y: rate },
                    { x: now, y: rate }
                ];
            }

            if (priceChart) {
                priceChart.destroy();
            }

            const ctx = document.getElementById('priceChart').getContext('2d');
            priceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Price',
                        data: chartData,
                        borderColor: '#7c4dff',
                        backgroundColor: 'rgba(124, 77, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0a0a0'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0a0a0',
                                callback: value => type === 'crypto' ? formatPrice(value) : formatFiatPrice(value, id)
                            }
                        }
                    }
                }
            });
        } catch (error) {
            const chartContainer = document.getElementById('priceChart').parentElement;
            chartContainer.innerHTML = '<div class="error-message">ratelimit hit :<</div>';
        }
    }

    function formatPrice(price) {
        if (price >= 1000) {
            return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (price >= 1) {
            return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        } else {
            return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
        }
    }

    function formatFiatPrice(price, currency) {
        if (currency === 'JPY') {
            return '¥' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (currency === 'EUR') {
            return '€' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (currency === 'GBP') {
            return '£' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            return currency + ' ' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }

    function formatLargeNumber(num) {
        if (!num) return 'N/A';
        
        const symbol = type === 'crypto' ? '$' : 
            id === 'JPY' ? '¥' :
            id === 'EUR' ? '€' :
            id === 'GBP' ? '£' : id + ' ';

        if (num >= 1e12) {
            return symbol + (num / 1e12).toFixed(2) + 'T';
        } else if (num >= 1e9) {
            return symbol + (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return symbol + (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return symbol + (num / 1e3).toFixed(2) + 'K';
        }
        return symbol + num.toLocaleString('en-US');
    }

    function getDateString(daysAgo) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    }

    timeFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            if (type === 'fiat') {
                return;
            }
            timeFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            updateChart(parseInt(filter.dataset.days));
        });
    });

    fetchCurrencyData();
}); 