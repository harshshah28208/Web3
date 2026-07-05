/* ============================================
   Web3Edu - Live Prices JavaScript
   CoinGecko API Integration with Fallback
   ============================================ */

const COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' }
];

const COIN_IMAGES = {
  'bitcoin': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  'ethereum': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  'matic-network': 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
  'solana': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  'arbitrum': 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
  'cardano': 'https://assets.coingecko.com/coins/images/975/small/cardano.png'
};

// Realistic mock data as fallback when API fails
const MOCK_PRICES = {
  'bitcoin': { usd: 67234.56, usd_24h_change: 2.34, usd_market_cap: 1325000000000, usd_24h_vol: 28500000000 },
  'ethereum': { usd: 3521.78, usd_24h_change: -1.12, usd_market_cap: 423000000000, usd_24h_vol: 15200000000 },
  'matic-network': { usd: 0.5234, usd_24h_change: 5.67, usd_market_cap: 5200000000, usd_24h_vol: 320000000 },
  'solana': { usd: 142.89, usd_24h_change: 8.91, usd_market_cap: 64500000000, usd_24h_vol: 4100000000 },
  'arbitrum': { usd: 0.8912, usd_24h_change: -3.45, usd_market_cap: 2800000000, usd_24h_vol: 180000000 },
  'cardano': { usd: 0.4231, usd_24h_change: 1.23, usd_market_cap: 15000000000, usd_24h_vol: 450000000 }
};

let currentPrices = {};
let filteredCoins = [...COINS];
let isLoading = false;
let useMockData = false;

/* ============================================
   Initialize Prices Page
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('prices-grid');
  if (!grid) return;

  // Wait briefly to ensure main.js has initialized showToast
  setTimeout(() => {
    initPrices();
  }, 100);

  initSearch();
  initFilters();
  initRefresh();
});

async function initPrices() {
  if (isLoading) return;
  isLoading = true;
  useMockData = false;

  showLoading();

  try {
    await fetchPrices();
    renderPrices();
    if (typeof showToast === 'function') {
      showToast('Live prices loaded from CoinGecko', 'success');
    }
  } catch (error) {
    console.warn('CoinGecko API failed, using mock data:', error.message);
    useMockData = true;
    currentPrices = { ...MOCK_PRICES };
    renderPrices();
    showMockDataNotice();
    if (typeof showToast === 'function') {
      showToast('Using demo data. CoinGecko API temporarily unavailable.', 'info');
    }
  } finally {
    isLoading = false;
  }
}

/* ============================================
   Fetch Prices from CoinGecko API
   ============================================ */
async function fetchPrices() {
  const ids = COINS.map(c => c.id).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;

  // Try with a small timeout to avoid hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limited by CoinGecko. Please wait a moment.');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate response has data
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Empty response from API');
    }

    currentPrices = data;
    localStorage.setItem('pricesLastUpdated', Date.now().toString());
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/* ============================================
   Render Price Cards
   ============================================ */
function renderPrices() {
  const grid = document.getElementById('prices-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (filteredCoins.length === 0) {
    grid.innerHTML = `
      <div class="price-error" style="grid-column: 1 / -1;">
        <p>No coins match your search.</p>
      </div>
    `;
    return;
  }

  filteredCoins.forEach((coin, index) => {
    const priceData = currentPrices[coin.id] || MOCK_PRICES[coin.id];
    if (!priceData) return;

    const card = createPriceCard(coin, priceData, index);
    grid.appendChild(card);
  });

  updateLastUpdated();

  // Trigger fade-in animation
  requestAnimationFrame(() => {
    document.querySelectorAll('.price-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 100);
    });
  });
}

function createPriceCard(coin, data, index) {
  const price = data.usd;
  const change = data.usd_24h_change || 0;
  const marketCap = data.usd_market_cap || 0;
  const volume = data.usd_24h_vol || 0;

  const isUp = change >= 0;
  const changeClass = isUp ? 'up' : 'down';
  const arrow = isUp
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l5-5 5 5M12 12V3"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7l5 5 5-5M12 12v9"/></svg>';

  const mockBadge = useMockData ? '<span style="font-size:0.7rem;color:var(--text-muted);margin-left:6px;">(demo)</span>' : '';

  const card = document.createElement('div');
  card.className = 'price-card fade-in';
  card.style.transitionDelay = `${index * 0.1}s`;

  card.innerHTML = `
    <div class="price-card-header">
      <img src="${COIN_IMAGES[coin.id]}" alt="${coin.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/48/8B5CF6/FFFFFF?text=${coin.symbol}'">
      <div>
        <h3>${coin.name}${mockBadge}</h3>
        <span>${coin.symbol}</span>
      </div>
    </div>
    <div class="price-value" data-price="${price}">$${formatPrice(price)}</div>
    <div class="price-change ${changeClass}">
      ${arrow}
      <span>${Math.abs(change).toFixed(2)}%</span>
    </div>
    <div class="price-meta">
      <span>MCap: $${formatLargeNumber(marketCap)}</span>
      <span>Vol: $${formatLargeNumber(volume)}</span>
    </div>
  `;

  return card;
}

function formatPrice(price) {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  } else {
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }
}

function formatLargeNumber(num) {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + 'T';
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}

/* ============================================
   Search Functionality
   ============================================ */
function initSearch() {
  const searchInput = document.getElementById('price-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce(() => {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
      filteredCoins = [...COINS];
    } else {
      filteredCoins = COINS.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.symbol.toLowerCase().includes(query)
      );
    }

    renderPrices();
  }, 300));
}

/* ============================================
   Filter Buttons
   ============================================ */
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      if (filter === 'all') {
        filteredCoins = [...COINS];
      } else if (filter === 'gainers') {
        filteredCoins = COINS.filter(c => {
          const data = currentPrices[c.id] || MOCK_PRICES[c.id];
          return data && data.usd_24h_change > 0;
        });
      } else if (filter === 'losers') {
        filteredCoins = COINS.filter(c => {
          const data = currentPrices[c.id] || MOCK_PRICES[c.id];
          return data && data.usd_24h_change < 0;
        });
      }

      renderPrices();
    });
  });
}

/* ============================================
   Refresh Button
   ============================================ */
function initRefresh() {
  const refreshBtn = document.getElementById('refresh-prices');
  if (!refreshBtn) return;

  refreshBtn.addEventListener('click', async () => {
    refreshBtn.style.animation = 'spin 1s linear infinite';

    try {
      await initPrices();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      refreshBtn.style.animation = '';
    }
  });
}

/* ============================================
   Loading & Error States
   ============================================ */
function showLoading() {
  const grid = document.getElementById('prices-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="price-loading">
      <div class="spinner"></div>
      <p>Loading prices from CoinGecko...</p>
    </div>
  `;
}

function showMockDataNotice() {
  const grid = document.getElementById('prices-grid');
  if (!grid) return;

  // Add a notice banner at the top
  const notice = document.createElement('div');
  notice.style.cssText = `
    grid-column: 1 / -1;
    padding: 12px 20px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid var(--accent-orange);
    border-radius: 12px;
    color: var(--accent-orange);
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 8px;
  `;
  notice.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px;">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    Showing demo data. CoinGecko API rate limit reached or unavailable. Prices are simulated for educational purposes.
  `;

  grid.insertBefore(notice, grid.firstChild);
}

function updateLastUpdated() {
  const el = document.getElementById('last-updated');
  if (!el) return;

  if (useMockData) {
    el.textContent = 'Using demo data (CoinGecko API unavailable)';
    el.style.color = 'var(--accent-orange)';
    return;
  }

  const lastUpdated = localStorage.getItem('pricesLastUpdated');
  if (lastUpdated) {
    const date = new Date(parseInt(lastUpdated));
    el.textContent = `Last updated: ${date.toLocaleTimeString()}`;
    el.style.color = '';
  }
}

/* ============================================
   Debounce Utility
   ============================================ */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}