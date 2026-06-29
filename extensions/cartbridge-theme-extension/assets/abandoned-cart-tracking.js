(function () {
    // const GOOGLE_URL = 'https://script.google.com/macros/s/AKfycbxPSFvj7q0wCNZ-XVzypBm4ahtCgSpIoHZ2i4kgpRJ7WpeBpbc8t3kweFvT6Cvfr5SolQ/exec';

    const GOOGLE_URL = window.GOOGLE_URL || '';

    if (!GOOGLE_URL) {
      console.warn("Vertex: Abandoned Cart: No spreadsheet URL configured.");
    }

      
    const MIN_INTERVAL_MS = 1000; // 60s cooldown between sends

    async function fetchCart() {
      const r = await fetch('/cart.js', { credentials: 'same-origin' });
      return r.json();
    }

    function makeCartSignature(customerId, cart) {
      // build stable, order-independent items signature
      const itemsSig = (cart.items || [])
        .map((i) => `${i.sku || i.id}:${i.quantity}:${i.price}`)
        .sort()
        .join('|');
      // include cart.token if available for uniqueness
      return `${customerId}|${cart.token || 'no-token'}|${cart.item_count}|${cart.total_price}|${itemsSig}`;
    }

    async function sendIfChanged(reason, opts = {}) {
      try {
        console.log("sendIfChanged triggered", reason);
        if (!window.customerData || !window.customerData.id) return;

        const cart = await fetchCart();
        if (!cart) return;

        const sig = makeCartSignature(window.customerData.id, cart);

        const lastSig = sessionStorage.getItem('abCartLastSig') || '';
        const lastSent = Number(sessionStorage.getItem('abCartLastSent') || '0');
        const now = Date.now();

        // dedupe: skip if same signature AND within cooldown
        if (sig === lastSig && now - lastSent < MIN_INTERVAL_MS) {
          // console.debug('Skip send (dedupe/cooldown):', reason);
          return;
        }

        const payload = {
          customerId: window.customerData.id,
          customerEmail: window.customerData.email,
          customerPhone: window.customerData.phone || null,
          customerTags: Array.isArray(window.customerData.tags) ? window.customerData.tags : [],
          dedupeKey: sig, // <-- send to sheet for optional server-side dedupe
          reason, // why this fired (debug)
          cart: {
            item_count: cart.item_count,
            total_price: cart.total_price,
            currency: cart.currency,
            items: (cart.items || []).map((i) => ({
              title: i.title,
              sku: i.sku,
              quantity: i.quantity,
              price: i.price,
            })),
          },
          lastUpdated: new Date().toISOString(),
        };

        // Special handling: if cart is empty, mark clearly
        if (cart.item_count === 0) {
          payload.cart.items = [];
          payload.cart.total_price = 0;
          payload.reason = reason || 'empty-cart';
        }

        // Send to Google Apps Script
        fetch(GOOGLE_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // persist dedupe state
        sessionStorage.setItem('abCartLastSig', sig);
        sessionStorage.setItem('abCartLastSent', String(now));
        // console.log('Abandoned cart sent:', reason, payload);
      } catch (e) {
        console.error('Abandoned cart send error:', e);
      }
    }

    // Also send shortly after add-to-cart (AJAX)
    document.addEventListener('DOMContentLoaded', () => {
      // Remove this line if you do NOT want a send on every page load:
      // sendIfChanged('dom-loaded');

      // Catch add-to-cart submits
      document.querySelectorAll('form[action^="/cart/add"]').forEach((form) => {
        form.addEventListener('submit', () => setTimeout(() => sendIfChanged('add-to-cart'), 1000));
      });

      // Quantity changes / remove (common selectors for OS 2.0 themes)
      document.addEventListener('change', (e) => {
        if (e.target.matches('input[name^="updates"]')) {
          setTimeout(() => sendIfChanged('qty-change'), 700);
        }
      });

      document.addEventListener('click', (e) => {
        if (e.target.closest('.qty-button')) {
          // covers .qty-plus and .qty-minus
          setTimeout(() => sendIfChanged('qty-change'), 700);
        }
      });

      document.addEventListener('click', (e) => {
        if (e.target.matches('a.remove')) {
          setTimeout(() => sendIfChanged('remove'), 700);
        }
      });

      let reachedCheckout = false;

      // Checkout: handle clicks anywhere inside the button (drawer or page)
      document.addEventListener(
        'click',
        (e) => {
          const btn = e.target.closest(
            '#CheckOut, button[name="checkout"], form[action^="/checkout"] [type="submit"], .cart__checkout'
          );
          if (btn) {
            reachedCheckout = true;
            // send immediately so it runs before navigation
            sendIfChanged('reach-checkout');
          }
        },
        true
      );

      // Beforeunload
      window.addEventListener('beforeunload', () => {
        if (!reachedCheckout) {
          sendIfChanged('beforeunload');
        }
      });

      // Force tracking
      let forceTimer;
      const FORCE_LIMIT_MS = 300000; // 1 hour (adjust as needed)

      function resetForceTimer() {
        clearTimeout(forceTimer);
        forceTimer = setTimeout(() => {
          // Force send snapshot even if duplicate
          sendIfChanged('5-min-update', { force: true });
        }, FORCE_LIMIT_MS);
      }

      // Reset timer on common user actions
      ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'].forEach((evt) => {
        document.addEventListener(evt, resetForceTimer, true);
      });

      // Start the timer right away
      resetForceTimer();

      // Detect when user leaves or returns to this tab
      let hiddenHeartbeatTimer;
      const INACTIVITY_LIMIT_MS = 300000; // 30s for testing (set 3600000 for 1h)
      let lastVisibleAt = Date.now();

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Tab just went to background
          hiddenHeartbeatTimer = setTimeout(() => {
            sendIfChanged('inactivity-heartbeat', { force: true });
          }, INACTIVITY_LIMIT_MS);
        } else {
          // Tab is active again
          clearTimeout(hiddenHeartbeatTimer);

          // If tab was hidden longer than limit, send immediately
          const hiddenDuration = Date.now() - lastVisibleAt;
          if (hiddenDuration >= INACTIVITY_LIMIT_MS) {
            sendIfChanged('inactivity-heartbeat', { force: true });
          }

          lastVisibleAt = Date.now();
        }
      });
      
    });
  })();
