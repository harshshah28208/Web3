/* ============================================
   Web3Edu - Blockchain Simulator JavaScript
   SHA-256 Hashing, Mining Logic, Chain Validation
   ============================================ */

const BLOCKS_COUNT = 3;
let blocks = [];
let isMining = false;

/* ============================================
   Initialize Simulator
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('block-chain')) return;

  initBlocks();
  renderChain();
  updateChainStatus();
});

function initBlocks() {
  const now = Date.now();

  blocks = [
    {
      index: 1,
      timestamp: now,
      data: 'Genesis Block: Web3Edu Platform Launch',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      nonce: 0,
      hash: '',
      isValid: true
    },
    {
      index: 2,
      timestamp: now + 1000,
      data: 'Transaction: Alice sends 5 ETH to Bob',
      previousHash: '',
      nonce: 0,
      hash: '',
      isValid: true
    },
    {
      index: 3,
      timestamp: now + 2000,
      data: 'Transaction: Bob sends 2 ETH to Charlie',
      previousHash: '',
      nonce: 0,
      hash: '',
      isValid: true
    }
  ];

  // Calculate initial hashes
  calculateAllHashes();
}

/* ============================================
   SHA-256 Hashing using Web Crypto API
   ============================================ */
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ============================================
   Calculate Block Hash
   ============================================ */
async function calculateBlockHash(block) {
  const data = `${block.index}${block.timestamp}${block.data}${block.previousHash}${block.nonce}`;
  return await sha256(data);
}

async function calculateAllHashes() {
  for (let i = 0; i < blocks.length; i++) {
    if (i > 0) {
      blocks[i].previousHash = blocks[i - 1].hash;
    }
    blocks[i].hash = await calculateBlockHash(blocks[i]);
  }
}

/* ============================================
   Render Blockchain
   ============================================ */
function renderChain() {
  const container = document.getElementById('block-chain');
  if (!container) return;

  container.innerHTML = '';

  blocks.forEach((block, index) => {
    const blockWrapper = document.createElement('div');
    blockWrapper.className = 'block-wrapper';

    // Block element
    const blockEl = document.createElement('div');
    blockEl.className = `block ${block.isValid ? 'valid' : 'invalid'}`;
    blockEl.id = `block-${block.index}`;

    const statusIcon = block.isValid
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';

    const statusText = block.isValid ? 'Valid' : 'Invalid';
    const statusClass = block.isValid ? 'valid' : 'invalid';

    blockEl.innerHTML = `
      <div class="block-header">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2">
            <rect x="2" y="2" width="20" height="8" rx="2"/>
            <rect x="2" y="14" width="20" height="8" rx="2"/>
          </svg>
          Block #${block.index}
        </h3>
        <div class="block-status ${statusClass}">
          ${statusIcon}
          <span>${statusText}</span>
        </div>
      </div>

      <div class="block-field">
        <label>Timestamp</label>
        <input type="text" value="${new Date(block.timestamp).toLocaleString()}" readonly>
      </div>

      <div class="block-field">
        <label>Block Data</label>
        <textarea rows="2" id="data-${block.index}">${block.data}</textarea>
      </div>

      <div class="block-field">
        <label>Previous Hash</label>
        <div class="block-hash" id="prev-hash-${block.index}">${block.previousHash}</div>
      </div>

      <div class="block-field">
        <label>Nonce</label>
        <input type="number" id="nonce-${block.index}" value="${block.nonce}" readonly>
      </div>

      <div class="block-field">
        <label>Current Hash</label>
        <div class="block-hash" id="hash-${block.index}">${block.hash}</div>
      </div>

      <button class="mine-btn btn-ripple" id="mine-btn-${block.index}" ${isMining ? 'disabled' : ''}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
        Mine Block
      </button>

      <div class="mining-stats" id="stats-${block.index}" style="display: none;">
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Time: <span id="time-${block.index}">0.00s</span>
        </span>
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Attempts: <span id="attempts-${block.index}">0</span>
        </span>
      </div>
    `;

    blockWrapper.appendChild(blockEl);

    // Add arrow if not last block
    if (index < blocks.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'block-arrow';
      arrow.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>`;
      blockWrapper.appendChild(arrow);
    }

    container.appendChild(blockWrapper);

    // Attach event listeners AFTER appending to DOM
    const textarea = blockEl.querySelector(`#data-${block.index}`);
    if (textarea) {
      textarea.addEventListener('input', () => {
        handleDataChange(block.index);
      });
    }

    const mineBtn = blockEl.querySelector(`#mine-btn-${block.index}`);
    if (mineBtn) {
      mineBtn.addEventListener('click', () => {
        mineBlock(block.index);
      });
    }
  });
}

/* ============================================
   Handle Data Change - Breaks Chain
   ============================================ */
async function handleDataChange(blockIndex) {
  if (isMining) return;

  const textarea = document.getElementById(`data-${blockIndex}`);
  if (!textarea) return;

  const newData = textarea.value;

  // Update block data
  const block = blocks.find(b => b.index === blockIndex);
  if (!block) return;

  block.data = newData;
  block.isValid = false;

  // Recalculate hash immediately
  block.hash = await calculateBlockHash(block);

  // Update hash display immediately
  const hashEl = document.getElementById(`hash-${blockIndex}`);
  if (hashEl) {
    hashEl.textContent = block.hash;
    // Flash effect to show change
    hashEl.style.transition = 'background 0.3s';
    hashEl.style.background = 'rgba(239, 68, 68, 0.2)';
    setTimeout(() => {
      hashEl.style.background = '';
    }, 300);
  }

  // Invalidate all subsequent blocks
  let chainBroken = false;
  for (let i = blockIndex; i < blocks.length; i++) {
    if (i > blockIndex) {
      blocks[i].previousHash = blocks[i - 1].hash;
      blocks[i].hash = await calculateBlockHash(blocks[i]);
      blocks[i].isValid = false;

      // Update displays
      const prevHashEl = document.getElementById(`prev-hash-${blocks[i].index}`);
      const currHashEl = document.getElementById(`hash-${blocks[i].index}`);

      if (prevHashEl) {
        prevHashEl.textContent = blocks[i].previousHash;
        prevHashEl.style.transition = 'background 0.3s';
        prevHashEl.style.background = 'rgba(239, 68, 68, 0.2)';
        setTimeout(() => { prevHashEl.style.background = ''; }, 300);
      }
      if (currHashEl) {
        currHashEl.textContent = blocks[i].hash;
        currHashEl.style.transition = 'background 0.3s';
        currHashEl.style.background = 'rgba(239, 68, 68, 0.2)';
        setTimeout(() => { currHashEl.style.background = ''; }, 300);
      }
    }

    // Update block status visual
    const blockEl = document.getElementById(`block-${blocks[i].index}`);
    if (blockEl) {
      blockEl.classList.remove('valid');
      blockEl.classList.add('invalid');
    }

    const statusEl = blockEl ? blockEl.querySelector('.block-status') : null;
    if (statusEl) {
      statusEl.classList.remove('valid');
      statusEl.classList.add('invalid');
      statusEl.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
        <span>Invalid</span>
      `;
    }

    chainBroken = true;
  }

  // Show chain broken banner
  if (chainBroken) {
    showChainBrokenBanner();
  }

  updateChainStatus();
}

/* ============================================
   Mine Block
   ============================================ */
async function mineBlock(blockIndex) {
  if (isMining) return;

  const block = blocks.find(b => b.index === blockIndex);
  if (!block) return;

  isMining = true;

  // Disable all mine buttons
  document.querySelectorAll('.mine-btn').forEach(btn => btn.disabled = true);

  const blockEl = document.getElementById(`block-${blockIndex}`);
  if (blockEl) {
    blockEl.classList.add('mining');
  }

  const statsEl = document.getElementById(`stats-${blockIndex}`);
  if (statsEl) {
    statsEl.style.display = 'flex';
  }

  const startTime = performance.now();
  let attempts = 0;
  const difficulty = 2; // Number of leading zeros required
  const target = '0'.repeat(difficulty);

  const timeEl = document.getElementById(`time-${blockIndex}`);
  const attemptsEl = document.getElementById(`attempts-${blockIndex}`);
  const hashEl = document.getElementById(`hash-${blockIndex}`);
  const nonceEl = document.getElementById(`nonce-${blockIndex}`);

  // Mining loop with async to prevent blocking UI
  let found = false;

  while (!found) {
    const batchSize = 300;

    for (let i = 0; i < batchSize; i++) {
      block.nonce = attempts;
      block.hash = await calculateBlockHash(block);
      attempts++;

      if (block.hash.startsWith(target)) {
        found = true;
        break;
      }
    }

    // Update UI after each batch
    if (timeEl) timeEl.textContent = ((performance.now() - startTime) / 1000).toFixed(2) + 's';
    if (attemptsEl) attemptsEl.textContent = attempts.toLocaleString();
    if (hashEl) hashEl.textContent = block.hash;
    if (nonceEl) nonceEl.value = block.nonce;

    // Yield to browser for UI updates
    if (!found) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // Mining complete
  if (found) {
    const elapsed = (performance.now() - startTime) / 1000;
    if (timeEl) timeEl.textContent = elapsed.toFixed(2) + 's';
    if (attemptsEl) attemptsEl.textContent = attempts.toLocaleString();
    if (nonceEl) nonceEl.value = block.nonce;
    if (hashEl) hashEl.textContent = block.hash;

    block.isValid = true;

    // Update block UI
    if (blockEl) {
      blockEl.classList.remove('mining', 'invalid');
      blockEl.classList.add('valid');
    }

    const statusEl = blockEl ? blockEl.querySelector('.block-status') : null;
    if (statusEl) {
      statusEl.classList.remove('invalid');
      statusEl.classList.add('valid');
      statusEl.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
        <span>Valid</span>
      `;
    }

    // Update previous hash for next block
    if (blockIndex < blocks.length) {
      for (let i = blockIndex + 1; i <= blocks.length; i++) {
        const nextBlock = blocks.find(b => b.index === i);
        if (nextBlock) {
          nextBlock.previousHash = block.hash;
          const prevHashEl = document.getElementById(`prev-hash-${i}`);
          if (prevHashEl) {
            prevHashEl.textContent = nextBlock.previousHash;
            prevHashEl.style.transition = 'background 0.3s';
            prevHashEl.style.background = 'rgba(16, 185, 129, 0.2)';
            setTimeout(() => { prevHashEl.style.background = ''; }, 300);
          }
        }
      }
    }

    if (typeof showToast === 'function') {
      showToast(`Block #${blockIndex} mined! Hash: ${block.hash.substring(0, 16)}...`, 'success');
    }

    // Remove chain broken banner if all blocks valid
    updateChainStatus();
  }

  isMining = false;
  if (blockEl) {
    blockEl.classList.remove('mining');
  }

  // Re-enable mine buttons for invalid blocks
  blocks.forEach(b => {
    const btn = document.getElementById(`mine-btn-${b.index}`);
    if (btn && !b.isValid) {
      btn.disabled = false;
    }
  });
}

/* ============================================
   Chain Status & Validation
   ============================================ */
function updateChainStatus() {
  const allValid = blocks.every(b => b.isValid);
  const banner = document.getElementById('chain-status-banner');

  if (!allValid) {
    if (!banner) {
      showChainBrokenBanner();
    }
  } else {
    if (banner) {
      banner.remove();
    }
    if (typeof showToast === 'function') {
      showToast('Blockchain is valid! All blocks are properly linked.', 'success');
    }
  }

  // Update mine buttons
  blocks.forEach(block => {
    const btn = document.getElementById(`mine-btn-${block.index}`);
    if (btn) {
      // Disable if mining or already valid
      btn.disabled = isMining || block.isValid;

      // If previous block is invalid, this one can't be mined yet
      if (block.index > 1) {
        const prevBlock = blocks.find(b => b.index === block.index - 1);
        if (prevBlock && !prevBlock.isValid) {
          btn.disabled = true;
          btn.title = 'Mine the previous block first';
        }
      }
    }
  });
}

function showChainBrokenBanner() {
  let banner = document.getElementById('chain-status-banner');
  if (banner) return;

  const container = document.getElementById('block-chain');
  if (!container) return;

  banner = document.createElement('div');
  banner.id = 'chain-status-banner';
  banner.className = 'chain-broken-banner';
  banner.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
    <span>Chain Broken! Data was tampered. Re-mine affected blocks to restore validity.</span>
  `;

  container.insertBefore(banner, container.firstChild);
}

/* ============================================
   Reset Simulator
   ============================================ */
function resetSimulator() {
  if (isMining) return;

  const banner = document.getElementById('chain-status-banner');
  if (banner) banner.remove();

  initBlocks();
  renderChain();
  updateChainStatus();

  if (typeof showToast === 'function') {
    showToast('Simulator reset to initial state', 'info');
  }
}

// Expose functions to window for any inline handlers
window.resetSimulator = resetSimulator;