// ─── UTILITIES ──────────────────────────────────────────────────────────────

function formatPrice(num) {
  return '฿' + num.toLocaleString('th-TH');
}

function getItems() {
  return document.querySelectorAll('.cart-item');
}

function getCheckedItems() {
  return document.querySelectorAll('.cart-item input.item-check:checked');
}

// ─── CART PAGE ───────────────────────────────────────────────────────────────

function changeQty(btn, delta) {
  const input = btn.parentElement.querySelector('.qty-input');
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  input.value = val;
  updateCart();
}

function updateCart() {
  const items = getItems();
  let totalQty = 0;

  items.forEach(item => {
    const price = parseInt(item.dataset.price);
    const qtyInput = item.querySelector('.qty-input');
    const qty = parseInt(qtyInput?.value) || 1;
    const subtotalEl = item.querySelector('.item-subtotal');
    if (subtotalEl) subtotalEl.textContent = formatPrice(price * qty);
    totalQty += qty;
  });

  const totalItemsEl = document.getElementById('totalItems');
  if (totalItemsEl) totalItemsEl.textContent = totalQty;

  const badgeEl = document.getElementById('cartBadge');
  if (badgeEl) badgeEl.textContent = totalQty;

  updateSummary();
  syncSelectAll();
}

function updateSummary() {
  const checkedItems = getCheckedItems();
  let subtotal = 0;
  let selectedQty = 0;

  checkedItems.forEach(cb => {
    const item = cb.closest('.cart-item');
    const price = parseInt(item.dataset.price);
    const qty = parseInt(item.querySelector('.qty-input')?.value) || 1;
    subtotal += price * qty;
    selectedQty += qty;
  });

  const selectedCountEl = document.getElementById('selectedCount');
  const totalAmountEl = document.getElementById('totalAmount');
  const summarySubtotalEl = document.getElementById('summarySubtotal');
  const summaryTotalEl = document.getElementById('summaryTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const summaryCheckoutBtn = document.getElementById('summaryCheckoutBtn');

  if (selectedCountEl) selectedCountEl.textContent = selectedQty;
  if (totalAmountEl) totalAmountEl.textContent = formatPrice(subtotal);
  if (summarySubtotalEl) summarySubtotalEl.textContent = formatPrice(subtotal);
  if (summaryTotalEl) summaryTotalEl.textContent = formatPrice(subtotal);

  const hasSelected = selectedQty > 0;
  if (checkoutBtn) checkoutBtn.disabled = !hasSelected;
  if (summaryCheckoutBtn) {
    summaryCheckoutBtn.disabled = !hasSelected;
    summaryCheckoutBtn.textContent = `ดำเนินการต่อ (${selectedQty} ชิ้น)`;
  }

  saveCartData(checkedItems, subtotal, selectedQty);
}

function saveCartData(checkedItems, subtotal, qty) {
  const items = [];
  checkedItems.forEach(cb => {
    const item = cb.closest('.cart-item');
    items.push({
      name: item.querySelector('.item-name')?.textContent,
      variant: item.querySelector('.item-variant')?.textContent,
      price: parseInt(item.dataset.price),
      qty: parseInt(item.querySelector('.qty-input')?.value) || 1,
      img: item.querySelector('.item-img')?.src,
    });
  });
  localStorage.setItem('cart_items', JSON.stringify(items));
  localStorage.setItem('cart_subtotal', subtotal);
  localStorage.setItem('cart_total', subtotal);
  localStorage.setItem('cart_qty', qty);
}

function deleteItem(btn) {
  const item = btn.closest('.cart-item');
  item.remove();
  const group = item.closest('.shop-group');
  if (group && group.querySelectorAll('.cart-item').length === 0) group.remove();
  updateCart();
}

function deleteSelected() {
  const checked = getCheckedItems();
  if (checked.length === 0) return;
  checked.forEach(cb => {
    const item = cb.closest('.cart-item');
    const group = item.closest('.shop-group');
    item.remove();
    if (group && group.querySelectorAll('.cart-item').length === 0) group.remove();
  });
  updateCart();
}

function syncSelectAll() {
  const allItems = document.querySelectorAll('.item-check');
  const checkedItems = document.querySelectorAll('.item-check:checked');
  const allChecked = allItems.length > 0 && allItems.length === checkedItems.length;

  const sa = document.getElementById('selectAll');
  const saf = document.getElementById('selectAllFooter');
  if (sa) sa.checked = allChecked;
  if (saf) saf.checked = allChecked;

  // sync shop checkboxes
  document.querySelectorAll('.shop-check').forEach(shopCb => {
    const shop = shopCb.dataset.shop;
    const shopItems = document.querySelectorAll(`.cart-item[data-shop="${shop}"] .item-check`);
    const shopChecked = document.querySelectorAll(`.cart-item[data-shop="${shop}"] .item-check:checked`);
    shopCb.checked = shopItems.length > 0 && shopItems.length === shopChecked.length;
  });
}

function goToAddress() {
  window.location.href = 'address.html';
}

// Select All
['selectAll', 'selectAllFooter'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', function () {
      document.querySelectorAll('.item-check').forEach(cb => cb.checked = this.checked);
      document.querySelectorAll('.shop-check').forEach(cb => cb.checked = this.checked);
      updateSummary();
    });
  }
});

// Individual item check
document.querySelectorAll('.item-check').forEach(cb => {
  cb.addEventListener('change', function () {
    updateSummary();
  });
});

// Shop-level check
document.querySelectorAll('.shop-check').forEach(shopCb => {
  shopCb.addEventListener('change', function () {
    const shop = this.dataset.shop;
    document.querySelectorAll(`.cart-item[data-shop="${shop}"] .item-check`)
      .forEach(cb => cb.checked = this.checked);
    updateSummary();
  });
});

// Init cart
if (document.querySelector('.cart-item')) {
  updateCart();
}

// ─── ADDRESS PAGE ────────────────────────────────────────────────────────────

function selectShipping(radio) {
  document.querySelectorAll('.shipping-option').forEach(opt => opt.classList.remove('selected'));
  radio.closest('.shipping-option').classList.add('selected');
  updateAddressSummary();
}

function getShippingCost() {
  const selected = document.querySelector('input[name="shipping"]:checked');
  if (!selected) return 0;
  const costs = { standard: 0, express: 50, sameday: 100 };
  return costs[selected.value] || 0;
}

function getShippingLabel() {
  const selected = document.querySelector('input[name="shipping"]:checked');
  if (!selected) return '';
  const labels = {
    standard: 'จัดส่งมาตรฐาน (3-5 วันทำการ)',
    express: 'Express (1-2 วันทำการ)',
    sameday: 'Same Day (วันเดียวกัน)',
  };
  return labels[selected.value] || '';
}

function updateAddressSummary() {
  const subtotal = parseInt(localStorage.getItem('cart_total')) || 0;
  const shippingCost = getShippingCost();
  const total = subtotal + shippingCost;

  const el = (id) => document.getElementById(id);
  if (el('addrSubtotal')) el('addrSubtotal').textContent = formatPrice(subtotal);
  if (el('addrShipping')) {
    el('addrShipping').textContent = shippingCost === 0 ? 'ฟรี' : formatPrice(shippingCost);
    el('addrShipping').style.color = shippingCost === 0 ? 'var(--success)' : 'var(--text)';
  }
  if (el('addrTotal')) el('addrTotal').textContent = formatPrice(total);

  const items = JSON.parse(localStorage.getItem('cart_items') || '[]');
  const container = el('addressSummaryItems');
  if (container) {
    container.innerHTML = items.slice(0, 3).map(item => `
      <div class="review-item">
        <img class="review-img" src="${item.img}" alt="" />
        <div class="review-name">${item.name} × ${item.qty}</div>
        <div class="review-price">${formatPrice(item.price * item.qty)}</div>
      </div>
    `).join('');
    if (items.length > 3) {
      container.innerHTML += `<div style="font-size:12px;color:var(--muted);padding:8px 0">และอีก ${items.length - 3} รายการ...</div>`;
    }
  }
}

function validateAddress() {
  let valid = true;

  const required = [
    { id: 'firstName', errId: 'firstNameErr' },
    { id: 'lastName', errId: 'lastNameErr' },
    { id: 'address', errId: 'addressErr' },
    { id: 'province', errId: 'provinceErr' },
    { id: 'district', errId: 'districtErr' },
    { id: 'subdistrict', errId: 'subdistrictErr' },
  ];

  required.forEach(({ id, errId }) => {
    const el = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('error');
      if (err) err.classList.add('show');
      valid = false;
    } else {
      el.classList.remove('error');
      if (err) err.classList.remove('show');
    }
  });

  // Phone validation
  const phone = document.getElementById('phone');
  const phoneErr = document.getElementById('phoneErr');
  if (phone) {
    const phoneVal = phone.value.replace(/\D/g, '');
    if (phoneVal.length !== 10) {
      phone.classList.add('error');
      if (phoneErr) phoneErr.classList.add('show');
      valid = false;
    } else {
      phone.classList.remove('error');
      if (phoneErr) phoneErr.classList.remove('show');
    }
  }

  // Zipcode validation
  const zip = document.getElementById('zipcode');
  const zipErr = document.getElementById('zipcodeErr');
  if (zip) {
    if (!/^\d{5}$/.test(zip.value)) {
      zip.classList.add('error');
      if (zipErr) zipErr.classList.add('show');
      valid = false;
    } else {
      zip.classList.remove('error');
      if (zipErr) zipErr.classList.remove('show');
    }
  }

  // Email (optional, validate if filled)
  const email = document.getElementById('email');
  const emailErr = document.getElementById('emailErr');
  if (email && email.value.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      if (emailErr) emailErr.classList.add('show');
      valid = false;
    } else {
      email.classList.remove('error');
      if (emailErr) emailErr.classList.remove('show');
    }
  }

  return valid;
}

function goToPayment() {
  if (!validateAddress()) {
    document.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const data = {
    firstName: document.getElementById('firstName')?.value,
    lastName: document.getElementById('lastName')?.value,
    phone: document.getElementById('phone')?.value,
    email: document.getElementById('email')?.value,
    address: document.getElementById('address')?.value,
    province: document.getElementById('province')?.value,
    district: document.getElementById('district')?.value,
    subdistrict: document.getElementById('subdistrict')?.value,
    zipcode: document.getElementById('zipcode')?.value,
    note: document.getElementById('note')?.value,
    shippingMethod: document.querySelector('input[name="shipping"]:checked')?.value,
    shippingLabel: getShippingLabel(),
    shippingCost: getShippingCost(),
  };

  localStorage.setItem('address_data', JSON.stringify(data));
  window.location.href = 'payment.html';
}

// Init address page
if (document.getElementById('addrSubtotal')) {
  updateAddressSummary();
  document.querySelectorAll('input[name="shipping"]').forEach(r =>
    r.addEventListener('change', () => updateAddressSummary())
  );
}

// ─── PAYMENT PAGE ────────────────────────────────────────────────────────────

let selectedPayment = 'card';
let selectedWallet = 'ShopeePay';

function selectPayment(type) {
  selectedPayment = type;
  document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
  document.getElementById(`pay-${type}`)?.classList.add('selected');
  document.querySelectorAll('input[name="payment"]').forEach(r => r.checked = r.value === type);

  const codRow = document.getElementById('codFeeRow');
  if (codRow) codRow.style.display = type === 'cod' ? 'flex' : 'none';

  updatePaymentSummary();
}

function selectWallet(el) {
  document.querySelectorAll('.wallet-item').forEach(w => w.classList.remove('active'));
  el.classList.add('active');
  selectedWallet = el.textContent;
}

function updatePaymentSummary() {
  const addrData = JSON.parse(localStorage.getItem('address_data') || '{}');
  const items = JSON.parse(localStorage.getItem('cart_items') || '[]');
  const subtotal = parseInt(localStorage.getItem('cart_subtotal')) || 0;
  const shippingCost = addrData.shippingCost || 0;
  const codFee = selectedPayment === 'cod' ? 25 : 0;
  const total = subtotal + shippingCost + codFee;

  const el = (id) => document.getElementById(id);

  if (el('payRecipient')) el('payRecipient').textContent = `${addrData.firstName || ''} ${addrData.lastName || ''}`.trim() || '-';
  if (el('payPhone')) el('payPhone').textContent = addrData.phone || '-';
  if (el('payAddress')) {
    el('payAddress').textContent = [addrData.address, addrData.subdistrict, addrData.district, addrData.province, addrData.zipcode]
      .filter(Boolean).join(', ') || '-';
  }
  if (el('payShippingMethod')) el('payShippingMethod').textContent = addrData.shippingLabel || 'จัดส่งมาตรฐาน (3-5 วัน)';

  if (el('paySubtotal')) el('paySubtotal').textContent = formatPrice(subtotal);
  if (el('payShippingFee')) {
    el('payShippingFee').textContent = shippingCost === 0 ? 'ฟรี' : formatPrice(shippingCost);
    el('payShippingFee').style.color = shippingCost === 0 ? 'var(--success)' : 'var(--text)';
  }
  if (el('payTotal')) el('payTotal').textContent = formatPrice(total > 0 ? total : 0);
  if (el('qrAmount')) el('qrAmount').textContent = formatPrice(total > 0 ? total : 0);

  // Render items
  const container = el('paymentSummaryItems');
  if (container) {
    container.innerHTML = items.slice(0, 3).map(item => `
      <div class="review-item">
        <img class="review-img" src="${item.img}" alt="" />
        <div class="review-name">${item.name} × ${item.qty}</div>
        <div class="review-price">${formatPrice(item.price * item.qty)}</div>
      </div>
    `).join('');
    if (items.length > 3) {
      container.innerHTML += `<div style="font-size:12px;color:var(--muted);padding:8px 0">และอีก ${items.length - 3} รายการ...</div>`;
    }
  }
}

function formatCard(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = val.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 4);
  if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
  input.value = val;
}

function validatePayment() {
  if (selectedPayment !== 'card') return true;

  let valid = true;

  const cardFields = [
    { id: 'cardNumber', errId: 'cardNumberErr', test: v => v.replace(/\s/g,'').length === 16 },
    { id: 'cardName', errId: 'cardNameErr', test: v => v.trim().length > 0 },
    { id: 'cardExpiry', errId: 'cardExpiryErr', test: v => /^\d{2}\/\d{2}$/.test(v) },
    { id: 'cardCvv', errId: 'cardCvvErr', test: v => /^\d{3,4}$/.test(v) },
  ];

  cardFields.forEach(({ id, errId, test }) => {
    const el = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!el) return;
    if (!test(el.value)) {
      el.classList.add('error');
      if (err) err.classList.add('show');
      valid = false;
    } else {
      el.classList.remove('error');
      if (err) err.classList.remove('show');
    }
  });

  return valid;
}

function confirmOrder() {
  if (!validatePayment()) return;

  const orderNum = '#SPE' + Date.now().toString().slice(-10);
  const el = document.getElementById('orderNumber');
  if (el) el.textContent = orderNum;

  const modal = document.getElementById('successModal');
  if (modal) modal.classList.add('show');

  localStorage.removeItem('cart_items');
  localStorage.removeItem('cart_subtotal');
  localStorage.removeItem('cart_total');
  localStorage.removeItem('cart_qty');
  localStorage.removeItem('address_data');
}

function closeModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.classList.remove('show');
  window.location.href = 'index.html';
}

// Init payment page
if (document.getElementById('paySubtotal')) {
  updatePaymentSummary();
  document.getElementById('successModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
}
