document.addEventListener('DOMContentLoaded', () => {
    const cryptoGrid = document.getElementById('cryptoGrid');
    const fiatGrid = document.getElementById('fiatGrid');
    const refreshButton = document.getElementById('refreshButton');
    const fiatSearch = document.getElementById('fiatSearch');

    const topCryptoCurrencies = ['bitcoin', 'ethereum', 'binancecoin', 'tether', 'solana', 'ripple'];
    const topFiatCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
    const allFiatCurrencies = [...topFiatCurrencies, 'CHF', 'CNY', 'INR', 'BRL', 'RUB', 'KRW', 'SGD', 'NZD', 'MXN', 'HKD'];

    let allCryptoData = {};
    let allFiatData = {};

    async function fetchCryptoData() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + 
                topCryptoCurrencies.join(',') + '&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h');
            const data = await response.json();
            const formattedData = {};
            data.forEach(coin => {
                formattedData[coin.id] = {
                    usd: coin.current_price,
                    usd_24h_change: coin.price_change_percentage_24h
                };
            });
            allCryptoData = formattedData;
            updateCryptoDisplay();
        } catch (error) {
            cryptoGrid.innerHTML = '<div class="loading">Rate Limit Reached :<</div>';
        }
    }

    async function fetchFiatData() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            allFiatData = data.rates;
            updateFiatDisplay();
        } catch (error) {
            fiatGrid.innerHTML = '<div class="loading">Error loading fiat currency data</div>';
        }
    }

    function updateCryptoDisplay() {
        cryptoGrid.innerHTML = '';
        
        topCryptoCurrencies.forEach(crypto => {
            if (allCryptoData[crypto]) {
                const data = allCryptoData[crypto];
                const card = createCurrencyCard({
                    name: crypto.charAt(0).toUpperCase() + crypto.slice(1),
                    symbol: crypto.toUpperCase(),
                    price: data.usd,
                    change: data.usd_24h_change
                }, 'crypto', crypto);
                cryptoGrid.appendChild(card);
            }
        });

        if (cryptoGrid.children.length === 0) {
            cryptoGrid.innerHTML = '<div class="loading">Error loading cryptocurrency data</div>';
        }
    }

    function updateFiatDisplay() {
        const searchTerm = fiatSearch.value.toLowerCase();
        fiatGrid.innerHTML = '';
        
        const currenciesToShow = searchTerm ?
            Object.keys(allFiatData).filter(currency => currency.toLowerCase().includes(searchTerm)) :
            topFiatCurrencies.filter(currency => allFiatData[currency]);
        
        if (currenciesToShow.length === 0) {
            fiatGrid.innerHTML = '<div class="loading">No currencies found</div>';
            return;
        }

        currenciesToShow.forEach(currency => {
            const rate = allFiatData[currency];
            const card = createCurrencyCard({
                name: currency,
                symbol: currency,
                price: rate,
                change: 0
            }, 'fiat', currency);
            fiatGrid.appendChild(card);
        });
    }

    function createCurrencyCard(currency, type, id) {
        const card = document.createElement('a');
        card.href = `currency.html?type=${type}&id=${id}`;
        card.className = 'currency-card';
        card.style.textDecoration = 'none';
        card.style.color = 'inherit';
        
        const symbol = type === 'crypto' ? '$' : 
            id === 'JPY' ? '¥' :
            id === 'EUR' ? '€' :
            id === 'GBP' ? '£' : id + ' ';

        const header = document.createElement('div');
        header.className = 'currency-header';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'currency-name';
        nameDiv.textContent = currency.name;
        
        const symbolDiv = document.createElement('div');
        symbolDiv.className = 'currency-symbol';
        symbolDiv.textContent = currency.symbol;
        
        header.appendChild(nameDiv);
        header.appendChild(symbolDiv);
        
        const priceDiv = document.createElement('div');
        priceDiv.className = 'currency-price';
        priceDiv.textContent = symbol + formatPrice(currency.price);
        
        card.appendChild(header);
        card.appendChild(priceDiv);

        if (type === 'crypto') {
            const changeDiv = document.createElement('div');
            changeDiv.className = 'currency-change';
            if (currency.change !== 0) {
                changeDiv.classList.add(currency.change > 0 ? 'positive' : 'negative');
                changeDiv.innerHTML = `
                    <i class="fas fa-${currency.change > 0 ? 'arrow-up' : 'arrow-down'}"></i>
                    ${Math.abs(currency.change).toFixed(2)}%
                `;
            }
            card.appendChild(changeDiv);
        }
        
        return card;
    }

    function formatPrice(price) {
        if (price >= 1000) {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (price >= 1) {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        } else {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
        }
    }

    fiatSearch.addEventListener('input', updateFiatDisplay);

    fetchCryptoData();
    fetchFiatData();

    refreshButton.addEventListener('click', () => {
        fetchCryptoData();
        fetchFiatData();
    });

    setInterval(() => {
        fetchCryptoData();
        fetchFiatData();
    }, 30000);
}); 