document.addEventListener('DOMContentLoaded', () => {

  /* ===== Header: ubah background saat scroll ===== */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ===== Toggle menu navigasi mobile ===== */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Tutup menu mobile setelah klik link
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ===== Filter kategori menu ===== */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const menuItems = document.querySelectorAll('.menu-item');

  function filterMenu(category) {
    menuItems.forEach(item => {
      item.classList.toggle('show', item.dataset.cat === category);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterMenu(btn.dataset.cat);
    });
  });

  // Tampilkan kategori pertama saat halaman dimuat
  filterMenu('hitam');

  /* ===== Keranjang Belanja ===== */
  const CART_KEY = 'nusantaraCoffeeCart';
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

  const cartBtn = document.getElementById('cartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const openCheckoutBtn = document.getElementById('openCheckoutBtn');

  function formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function cartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function cartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function renderCart() {
    const count = cartCount();
    cartCountEl.textContent = count;
    cartTotalEl.textContent = formatRupiah(cartTotal());
    openCheckoutBtn.disabled = cart.length === 0;

    cartItemsEl.querySelectorAll('.cart-row').forEach(row => row.remove());

    if (cart.length === 0) {
      cartEmptyEl.style.display = 'block';
      return;
    }
    cartEmptyEl.style.display = 'none';

    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div>
          <div class="cart-row-name">${item.name}</div>
          <div class="cart-row-price">${formatRupiah(item.price)}</div>
          <button class="cart-row-remove" data-id="${item.id}">Hapus</button>
        </div>
        <div class="cart-qty">
          <button class="qty-btn" data-action="dec" data-id="${item.id}">&minus;</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
        </div>
        <div class="cart-row-price">${formatRupiah(item.price * item.qty)}</div>
      `;
      cartItemsEl.appendChild(row);
    });
  }

  function addToCart(id, name, price, btn) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price, qty: 1 });
    }
    saveCart();
    renderCart();

    if (btn) {
      btn.textContent = 'Ditambahkan ✓';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = '+ Tambah';
        btn.classList.remove('added');
      }, 1200);
    }
  }

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const li = btn.closest('.menu-item');
      addToCart(li.dataset.id, li.dataset.name, Number(li.dataset.price), btn);
    });
  });

  cartItemsEl.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('cart-row-remove')) {
      cart = cart.filter(item => item.id !== id);
    } else if (e.target.dataset.action === 'inc') {
      const item = cart.find(i => i.id === id);
      if (item) item.qty += 1;
    } else if (e.target.dataset.action === 'dec') {
      const item = cart.find(i => i.id === id);
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
      }
    }
    saveCart();
    renderCart();
  });

  function openCart() {
    cartOverlay.classList.add('open');
    cartDrawer.classList.add('open');
  }
  function closeCart() {
    cartOverlay.classList.remove('open');
    cartDrawer.classList.remove('open');
  }
  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  renderCart();

  /* ===== Checkout ===== */
  const checkoutOverlay = document.getElementById('checkoutOverlay');
  const checkoutClose = document.getElementById('checkoutClose');
  const checkoutSummary = document.getElementById('checkoutSummary');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutStep = document.getElementById('checkoutStep');
  const checkoutSuccess = document.getElementById('checkoutSuccess');
  const successName = document.getElementById('successName');
  const orderNumberEl = document.getElementById('orderNumber');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');

  function renderCheckoutSummary() {
    let html = '';
    cart.forEach(item => {
      html += `<div class="checkout-summary-row"><span>${item.qty}× ${item.name}</span><span>${formatRupiah(item.price * item.qty)}</span></div>`;
    });
    html += `<div class="checkout-summary-row total"><span>Total</span><span>${formatRupiah(cartTotal())}</span></div>`;
    checkoutSummary.innerHTML = html;
  }

  function openCheckout() {
    if (cart.length === 0) return;
    renderCheckoutSummary();
    checkoutStep.style.display = 'block';
    checkoutSuccess.classList.remove('show');
    checkoutOverlay.classList.add('open');
    closeCart();
  }
  function closeCheckout() {
    checkoutOverlay.classList.remove('open');
  }

  openCheckoutBtn.addEventListener('click', openCheckout);
  checkoutClose.addEventListener('click', closeCheckout);
  checkoutOverlay.addEventListener('click', (e) => {
    if (e.target === checkoutOverlay) closeCheckout();
  });

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ckName').value.trim();
    const orderNum = 'NC-' + Date.now().toString().slice(-6);

    successName.textContent = name;
    orderNumberEl.textContent = orderNum;

    checkoutStep.style.display = 'none';
    checkoutSuccess.classList.add('show');

    cart = [];
    saveCart();
    renderCart();
    checkoutForm.reset();
  });

  closeSuccessBtn.addEventListener('click', closeCheckout);

  /* ===== Form kontak sederhana (tanpa server) ===== */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formStatus.textContent = 'Terima kasih! Pesan Anda telah terkirim.';
    contactForm.reset();
    setTimeout(() => { formStatus.textContent = ''; }, 4000);
  });

});
