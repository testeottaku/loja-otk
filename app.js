import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtMf3dMVe39AQsCq3k_RYaJspzpunxc24",
  authDomain: "loja-otk.firebaseapp.com",
  projectId: "loja-otk",
  storageBucket: "loja-otk.firebasestorage.app",
  messagingSenderId: "856021486676",
  appId: "1:856021486676:web:8cfd4855df5a3c233f31c1",
  measurementId: "G-2TZCC6LP3K"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch (_) {}
const db = getFirestore(app);

window.PRODUCTS = [];
window.CATEGORIES = ["Todas"];
window.ANIMES = [];

const Icons = {
  bag: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  sliders: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  filter: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  minus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.584-6.584a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>`
};

// Carregar carrinho do LocalStorage
let storedCart = [];
try { storedCart = JSON.parse(localStorage.getItem('otk_cart')) || []; } catch(e){}
let storedCoupon = { code: '', discount: 0 };
try { storedCoupon = JSON.parse(localStorage.getItem('otk_coupon')) || storedCoupon; } catch(e){}

window.state = {
  view: 'home',
  cart: storedCart,
  isCartOpen: false,
  isFilterOpen: false,
  filters: { search: '', category: 'Todas', anime: 'Todos', maxPrice: 500 },
  coupon: storedCoupon,
  selectedProduct: null,
  productForm: { size: '', color: '', quantity: 1, imageIndex: 0 },
  checkoutForm: { name:'', phone:'', cep:'', address:'', number:'', complement:'', bairro:'', city:'', checkoutState:'' },
  loadingCatalog: true,
  catalogError: '',
  homePage: 1,
  animeScrollLeft: 0
};

window.saveCartData = function() {
  localStorage.setItem('otk_cart', JSON.stringify(window.state.cart));
  localStorage.setItem('otk_coupon', JSON.stringify(window.state.coupon));
  window.updateCartUI();
};

const formatPrice = (price) => Number(price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const parseOptionalPrice = (v) => {
    if (v == null) return undefined;
    if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
    if (typeof v === 'string') {
      const s = v.trim();
      if (!s) return undefined;
      let norm = s.replace(/[^0-9,.-]/g, '');
      if (norm.includes(',') && !norm.includes('.')) norm = norm.replace(',', '.');
      if (norm.includes(',') && norm.includes('.')) norm = norm.replace(/\./g, '').replace(',', '.');
      const n = Number(norm);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
};
const getEffectivePrice = (product, size) => {
  const base = Number(product?.price || 0);
  const s = String(size || '').toUpperCase().trim();
  if (s === 'G1') return parseOptionalPrice(product?.valorG1) ?? base;
  if (s === 'G2') return parseOptionalPrice(product?.valorG2) ?? base;
  if (s === 'G3') return parseOptionalPrice(product?.valorG3) ?? base;
  return base;
};
const getItemUnitPrice = (item) => Number(item?.unitPrice ?? item?.price ?? 0);
const getDiscountPercent = (price, originalPrice) => (!originalPrice || originalPrice <= price) ? 0 : Math.round(((originalPrice - price) / originalPrice) * 100);
const shouldShowCategory = (cat) => String(cat || '').trim().toLowerCase() !== 'todos' && String(cat || '').trim().toLowerCase() !== 'todas' && String(cat || '').trim() !== '';
const sortByNewest = (a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0);
const getLatestProducts = (n) => [...(window.PRODUCTS || [])].sort(sortByNewest).slice(0, n);

function normalizeProduct(p) {
  const toMillis = (v) => {
    try {
      if (!v) return 0;
      if (typeof v === 'number') return v;
      if (typeof v.toMillis === 'function') return v.toMillis();
      if (typeof v.seconds === 'number') return v.seconds * 1000;
      const t = new Date(v).getTime();
      return Number.isFinite(t) ? t : 0;
    } catch (_) { return 0; }
  };
  return {
    id: p.id || "",
    name: p.name || "Produto",
    price: Number(p.price || 0),
    valorG1: parseOptionalPrice(p.valorG1),
    valorG2: parseOptionalPrice(p.valorG2),
    valorG3: parseOptionalPrice(p.valorG3),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
    category: p.category || "Outros",
    anime: p.anime || "Geral",
    images: (Array.isArray(p.images) ? p.images.filter(Boolean) : []).length ? p.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"],
    colors: Array.isArray(p.colors) ? p.colors.filter(Boolean) : [],
    sizes: Array.isArray(p.sizes) ? p.sizes.filter(Boolean) : [],
    hasSizes: (typeof p.hasSizes === "boolean") ? p.hasSizes : ((Array.isArray(p.sizes) ? p.sizes.filter(Boolean) : []).length > 0),
    description: p.description || "",
    isFeatured: !!p.isFeatured,
    colecaoHome: (p.colecaoHome === 'sim' || p.colecaoHome === 'nao') ? p.colecaoHome : (p.isFeatured ? 'sim' : 'nao'),
    createdAtMs: toMillis(p.createdAt),
    updatedAtMs: toMillis(p.updatedAt)
  };
}

async function loadCatalogFromFirestore() {
  try {
    const catalogSnap = await getDoc(doc(db, "config", "catalog"));
    window.CATEGORIES = (catalogSnap.exists() && Array.isArray(catalogSnap.data().categories)) ? catalogSnap.data().categories : ["Todas", "Camisetas", "Action Figures", "Acessórios"];
    
    const animesSnap = await getDocs(collection(db, "animes"));
    window.ANIMES = animesSnap.docs.map(d => ({id: d.id, name: d.data().name, image: d.data().image || "", order: Number(d.data().order)})).filter(a => a.name).sort((a,b) => (Number.isFinite(a.order) ? a.order : 1e9) - (Number.isFinite(b.order) ? b.order : 1e9) || String(a.name).localeCompare(String(b.name), "pt-BR"));
    
    const productsSnap = await getDocs(collection(db, "products"));
    window.PRODUCTS = productsSnap.docs.map(d => normalizeProduct({ id: d.id, ...d.data() })).filter(p => p.id);
    
    window.state.loadingCatalog = false;
    window.renderApp();
  } catch (e) {
    window.state.loadingCatalog = false;
    window.state.catalogError = "Erro ao carregar catálogo.";
    window.renderApp();
  }
}

// Global functions for HTML
window.changeView = function(view, product = null) {
  if (view === 'home') window.location.href = '/';
  else if (view === 'product' && product) window.location.href = `/produto?id=${product.id}`;
  else if (view === 'checkout') window.location.href = '/checkout';
};

window.toggleCart = function(isOpen) {
  window.state.isCartOpen = isOpen;
  const sidebar = document.getElementById('cart-sidebar');
  if(sidebar) {
    if(isOpen) sidebar.classList.remove('hidden');
    else sidebar.classList.add('hidden');
  }
  window.updateCartUI();
};

window.toggleFilter = function(forceClose = false) {
  window.state.isFilterOpen = forceClose ? false : !window.state.isFilterOpen;
  const btn = document.getElementById('filter-btn');
  if(btn) {
      if (window.state.isFilterOpen) { btn.classList.replace('bg-white/40', 'bg-white/60'); btn.classList.add('shadow-inner'); }
      else { btn.classList.replace('bg-white/60', 'bg-white/40'); btn.classList.remove('shadow-inner'); }
  }
  window.renderFilterDropdown();
};

window.updateSearch = function(val) { window.state.filters.search = val; window.renderApp(false); };
window.prevHomePage = function() { window.state.homePage = Math.max(1, (window.state.homePage || 1) - 1); window.renderApp(false); };
window.nextHomePage = function(maxPages) { window.state.homePage = Math.min(maxPages, (window.state.homePage || 1) + 1); window.renderApp(); };
window.setFormData = function(field, val) { window.state.checkoutForm[field] = val; };

window.handleAddToCart = function() {
  const p = window.state.selectedProduct;
  const { size, color, quantity } = window.state.productForm;
  if (p.hasSizes && !size) { alert('Por favor, selecione um tamanho.'); return; }
  if (p.colors?.length > 0 && !color) { alert('Por favor, selecione uma cor.'); return; }

  const unitPrice = getEffectivePrice(p, size);
  const existingIndex = window.state.cart.findIndex(i => i.id === p.id && i.size === size && i.color === color);
  if (existingIndex >= 0) {
    window.state.cart[existingIndex].quantity += quantity;
    window.state.cart[existingIndex].unitPrice = unitPrice;
  } else {
    window.state.cart.push({ ...p, size, color, quantity, unitPrice });
  }
  window.saveCartData();
  window.toggleCart(true);
};

window.updateCartQuantity = function(index, delta) {
  window.state.cart[index].quantity += delta;
  if (window.state.cart[index].quantity <= 0) window.state.cart.splice(index, 1);
  window.saveCartData();
  if(window.state.view === 'checkout') window.renderApp();
};

window.applyAppCoupon = function() {
  const code = document.getElementById('coupon-input').value.toUpperCase();
  if(code === 'OTTAKU10') {
    window.state.coupon = { code, discount: 0.1 };
    alert('Cupom de 10% aplicado!');
  } else {
    window.state.coupon = { code: '', discount: 0 };
    alert('Cupom inválido.');
  }
  window.saveCartData();
  if(window.state.view === 'checkout') window.renderApp();
};

window.handleCepInput = async function(el) {
  let cep = el.value.replace(/\D/g, '');
  window.setFormData('cep', cep);
  const errorSpan = document.getElementById('cep-error');
  if(errorSpan) errorSpan.classList.add('hidden');
  if (cep.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        if(errorSpan) errorSpan.classList.remove('hidden');
        window.setFormData('address', ''); window.setFormData('bairro', ''); window.setFormData('city', ''); window.setFormData('checkoutState', '');
      } else {
        document.getElementById('input-address').value = data.logradouro || '';
        document.getElementById('input-bairro').value = data.bairro || '';
        document.getElementById('input-city').value = data.localidade || '';
        document.getElementById('input-state').value = data.uf || '';
        window.setFormData('address', data.logradouro || ''); window.setFormData('bairro', data.bairro || ''); window.setFormData('city', data.localidade || ''); window.setFormData('checkoutState', data.uf || '');
      }
    } catch(e) {}
  }
};

window.finalizeOrder = function(e) {
  e.preventDefault();
  if(window.state.cart.length === 0) { alert("Carrinho vazio!"); return; }
  const { name, phone, cep, address, number, bairro, complement, city, checkoutState } = window.state.checkoutForm;
  let msg = `🛍️ *Novo Pedido - OttakuBrasil*\n\n👤 *Meus dados :*\nNome: ${name}\nWhatsApp: ${phone}\n\n📦 *Endereço de Entrega:*\nEndereço: ${address}, ${number} - ${bairro}\nCidade: ${city} - ${checkoutState}\nCEP: ${cep}\n\n🛒 *Produtos:*\n\n`;
  window.state.cart.forEach((item) => {
    msg += `• ${item.quantity}X: ${item.name}\n• Tam: ${item.size || '—'} | Cor: ${item.color || '—'}\n• Valor unit.: ${formatPrice(getItemUnitPrice(item))}\n\n`;
  });
  const cartSubtotal = window.state.cart.reduce((a,i)=>a+(getItemUnitPrice(i)*i.quantity), 0);
  const cartTotal = cartSubtotal - (cartSubtotal * window.state.coupon.discount);
  if(window.state.coupon.discount > 0) msg += `🏷️ Cupom: ${window.state.coupon.code} (-${window.state.coupon.discount*100}%)\n\n`;
  msg += `💰 *Total produtos: ${formatPrice(cartTotal)}*`;
  window.open(`https://wa.me/5531972379858?text=${encodeURIComponent(msg)}`, '_blank');
};

// Render Functions
window.renderApp = function(preserveScroll = true) {
  const root = document.getElementById('app-root');
  if(!root) return;

  const path = window.location.pathname;
  if(path.includes('produto')) window.state.view = 'product';
  else if (path.includes('checkout')) window.state.view = 'checkout';
  else window.state.view = 'home';

  const subHeader = document.getElementById('sub-header');
  if(subHeader) {
      if(window.state.view !== 'home') subHeader.classList.add('hidden');
      else subHeader.classList.remove('hidden');
  }

  if (window.state.view === 'home') root.innerHTML = getHomeHTML();
  else if (window.state.view === 'product') {
      const id = new URLSearchParams(window.location.search).get('id');
      if(!window.state.loadingCatalog) {
          window.state.selectedProduct = window.PRODUCTS.find(p => p.id === id);
          if(!window.state.selectedProduct) root.innerHTML = '<div class="py-20 text-center font-bold">Produto não encontrado.</div>';
          else root.innerHTML = getProductHTML();
      } else {
          root.innerHTML = '<div class="py-20 text-center font-bold">Carregando produto...</div>';
      }
  }
  else if (window.state.view === 'checkout') root.innerHTML = getCheckoutHTML();
  
  window.updateCartUI();
  if(window.state.view === 'home') setupCarousel();
};

window.renderFilterDropdown = function() {
  const drop = document.getElementById('filter-dropdown');
  if(!drop) return;
  if (!window.state.isFilterOpen) { drop.innerHTML = ''; return; }
  let catsHTML = window.CATEGORIES.map(cat => `<button onclick="window.state.filters.category = '${cat}'; window.renderFilterDropdown(); window.renderApp(false);" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${window.state.filters.category === cat ? 'bg-brand text-gray-900 shadow-md' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'}">${cat}</button>`).join('');
  drop.innerHTML = `
    <div class="absolute top-12 right-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-2xl p-5 text-gray-800 animate-slide-in-top z-50">
      <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200"><h3 class="font-bold flex items-center gap-2 text-gray-900">${Icons.filter} Filtros</h3><button onclick="window.toggleFilter(true)" class="text-gray-500 hover:text-gray-900">${Icons.x}</button></div>
      <div class="mb-5"><label class="text-sm font-bold block mb-2 text-gray-900">Categorias</label><div class="flex flex-wrap gap-2">${catsHTML}</div></div>
      <div>
        <label class="text-sm font-bold flex justify-between mb-2 text-gray-900"><span>Preço Máx:</span><span id="max-price-display" class="text-brand drop-shadow-sm">${formatPrice(window.state.filters.maxPrice)}</span></label>
        <input type="range" min="0" max="500" step="10" value="${window.state.filters.maxPrice}" oninput="document.getElementById('max-price-display').innerText = formatPrice(Number(this.value));" onchange="window.state.filters.maxPrice = Number(this.value); window.renderApp(false);" class="w-full accent-brand h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
      </div>
    </div>`;
};

window.updateCartUI = function() {
  const cartItemsDiv = document.getElementById('cart-items');
  const cartFooterDiv = document.getElementById('cart-footer');
  const badge = document.getElementById('cart-badge');
  if(!cartItemsDiv || !cartFooterDiv || !badge) return;
  
  let totalQtd = window.state.cart.reduce((a,i)=>a+i.quantity, 0);
  badge.innerText = totalQtd;
  if(totalQtd > 0) badge.classList.remove('hidden'); else badge.classList.add('hidden');

  if(window.state.cart.length === 0) {
    cartItemsDiv.innerHTML = `<div class="text-center text-gray-400 mt-10"><div class="flex justify-center mb-3 opacity-50 text-gray-300 scale-150">${Icons.bag}</div>Seu carrinho está vazio. =(</div>`;
    cartFooterDiv.innerHTML = '';
    return;
  }

  cartItemsDiv.innerHTML = window.state.cart.map((item, idx) => `
    <div class="flex gap-4 border-b border-gray-100 pb-4">
      <img src="${item.images[0]}" class="w-20 h-20 object-cover rounded-xl border border-gray-100" />
      <div class="flex-grow">
        <h4 class="font-bold text-sm text-gray-800 leading-tight">${item.name}</h4>
        <div class="text-xs text-gray-500 mt-1 flex gap-2">${item.size ? `<span>Tam: ${item.size}</span>` : ''} ${item.color ? `<span>Cor: ${item.color}</span>` : ''}</div>
        <div class="text-brand drop-shadow-sm font-black text-sm mt-1">${formatPrice(getItemUnitPrice(item))}</div>
        <div class="flex items-center gap-3 mt-2">
          <div class="flex items-center border border-gray-200 rounded-lg">
            <button onclick="window.updateCartQuantity(${idx}, -1);" class="p-1 hover:bg-gray-100 text-gray-600 rounded-l-lg">${Icons.minus}</button>
            <span class="px-2 text-sm font-bold text-gray-900">${item.quantity}</span>
            <button onclick="window.updateCartQuantity(${idx}, 1);" class="p-1 hover:bg-gray-100 text-gray-600 rounded-r-lg">${Icons.plus}</button>
          </div>
          <button onclick="window.updateCartQuantity(${idx}, -${item.quantity});" class="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-bold transition">${Icons.trash} Remover</button>
        </div>
      </div>
    </div>`).join('');

  let subtotal = window.state.cart.reduce((a,i)=>a+(getItemUnitPrice(i)*i.quantity), 0);
  let total = subtotal - (subtotal * window.state.coupon.discount);

  cartFooterDiv.innerHTML = `
    <div class="mb-4 flex gap-2"><input type="text" id="coupon-input" placeholder="Cupom (ex: OTTAKU10)" class="flex-grow p-2.5 border border-gray-300 rounded-xl text-sm uppercase bg-white focus:ring-2 focus:ring-brand outline-none font-bold" value="${window.state.coupon.code}"><button onclick="window.applyAppCoupon()" class="bg-gray-900 text-brand px-4 py-2.5 rounded-xl text-sm font-black hover:bg-black transition">Aplicar</button></div>
    <div class="space-y-2 mb-5 font-bold"><div class="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>${window.state.coupon.discount > 0 ? `<div class="flex justify-between text-sm text-green-600 bg-green-50 p-1.5 rounded-lg"><span>Desconto (${window.state.coupon.discount*100}%)</span><span>-${formatPrice(subtotal*window.state.coupon.discount)}</span></div>` : ''}<div class="flex justify-between font-black text-xl text-gray-900 border-t border-gray-200 pt-3"><span>Total</span><span>${formatPrice(total)}</span></div></div>
    <button onclick="window.toggleCart(false); window.changeView('checkout');" class="w-full bg-brand hover:bg-[#1bc762] text-gray-900 font-black py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 text-lg">Finalizar Compra</button>`;
};

function getHomeHTML() {
    if (window.state.loadingCatalog) return `<div class="container mx-auto px-4 py-8"><div class="mb-6 pt-4"><div class="h-7 w-44 rounded-lg skeleton mb-4"></div><div class="h-44 md:h-56 rounded-2xl skeleton"></div></div><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">${Array.from({length: 8}).map(() => `<div class="bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden"><div class="h-40 md:h-64 skeleton"></div><div class="p-3 md:p-5"><div class="h-4 w-3/4 rounded skeleton mb-2"></div><div class="h-6 w-24 rounded skeleton"></div></div></div>`).join('')}</div></div>`;
    
    let filtered = window.PRODUCTS.filter(p => p.name.toLowerCase().includes(window.state.filters.search.toLowerCase()) && (window.state.filters.category === 'Todas' || p.category === window.state.filters.category) && (window.state.filters.anime === 'Todos' || p.anime === window.state.filters.anime) && p.price <= window.state.filters.maxPrice);
    const isFiltering = window.state.filters.search !== '' || window.state.filters.category !== 'Todas' || window.state.filters.maxPrice !== 500 || window.state.filters.anime !== 'Todos';

    let html = `<div class="container mx-auto px-4 py-8">`;
    const cProds = getLatestProducts(7);
    window.__carouselProducts = cProds;

    if(!isFiltering) {
        html += `<div class="mb-6 overflow-hidden relative pt-4"><div class="flex justify-between items-center mb-4 px-2"><h2 class="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2"><span class="text-brand drop-shadow-sm">🔥</span> Lançamentos</h2><div class="flex gap-1.5" id="carousel-dots">${cProds.map((_, i) => `<div class="h-2 rounded-full transition-all duration-300 ${i===0 ? 'w-6 bg-brand' : 'w-2 bg-gray-300'}"></div>`).join('')}</div></div><div class="relative mx-auto bg-white rounded-3xl p-3 border border-gray-100 shadow-sm overflow-hidden select-none cursor-grab" id="carousel-container"><div class="flex transition-transform duration-500 ease-in-out" id="carousel-track" style="transform: translateX(0%);">${cProds.map(p => `<div class="min-w-full px-2 flex justify-center pointer-events-none"><div class="w-full flex bg-gray-50 rounded-2xl overflow-hidden pointer-events-auto shadow-sm border border-gray-100" onclick='window.changeView("product", {id:"${p.id}"})'><div class="w-2/5 md:w-1/3 h-36 md:h-48 overflow-hidden bg-gray-200 flex-shrink-0 relative"><img src="${p.images[0]}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" draggable="false" />${p.originalPrice ? `<div class="absolute top-2 left-2 bg-brand text-gray-900 text-[10px] font-black px-2 py-1 rounded-md shadow-sm">-${getDiscountPercent(p.price, p.originalPrice)}%</div>` : ''}</div><div class="w-3/5 md:w-2/3 p-4 md:p-6 flex flex-col justify-center">${shouldShowCategory(p.category) ? `<div class="text-[10px] md:text-xs font-black text-brand drop-shadow-sm mb-1 uppercase tracking-wider">${p.category}</div>` : ``}<h3 class="font-bold text-sm md:text-xl text-gray-900 leading-tight mb-2 line-clamp-2">${p.name}</h3><div class="mt-auto flex items-baseline gap-2"><div class="text-lg md:text-2xl font-black text-gray-900">${formatPrice(p.price)}</div>${p.originalPrice ? `<div class="text-xs md:text-sm text-gray-400 line-through font-bold">${formatPrice(p.originalPrice)}</div>` : ''}</div></div></div></div>`).join('')}</div></div></div>`;
    }

    let animesHTML = window.ANIMES.map(a => `<button onclick="window.state.filters.anime='${a.name}'; window.renderApp(false);" class="flex flex-col items-center gap-2 flex-shrink-0 group"><div class="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all shadow-sm ${window.state.filters.anime === a.name ? 'border-brand scale-105' : 'border-gray-200 group-hover:border-brand'}"><img src="${a.image}" class="w-full h-full object-cover" /></div><span class="text-xs font-bold transition-colors ${window.state.filters.anime === a.name ? 'text-brand' : 'text-gray-700'}">${a.name}</span></button>`).join('');
    html += `<div class="mb-10 mt-2"><h2 class="text-lg font-black text-gray-900 mb-4 px-2">Animes / Temas</h2><div id="anime-scroll-container" class="flex gap-4 overflow-x-auto hide-scrollbar px-2 pb-2"><button onclick="window.state.filters.anime='Todos'; window.renderApp(false);" class="flex flex-col items-center gap-2 flex-shrink-0"><div class="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-xs md:text-sm border-2 transition-all shadow-sm ${window.state.filters.anime === 'Todos' ? 'border-brand bg-brand text-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:border-brand'}">Todos</div></button>${animesHTML}</div></div>`;

    let gridProducts = filtered;
    let totalPages = 1;
    if (!isFiltering) {
      const homeAll = [...window.PRODUCTS].filter(p => p.colecaoHome === 'sim').sort(sortByNewest);
      totalPages = Math.max(1, Math.ceil(homeAll.length / 10));
      window.state.homePage = Math.min(Math.max(1, window.state.homePage || 1), totalPages);
      const start = (window.state.homePage - 1) * 10;
      gridProducts = homeAll.slice(start, start + 10);
    }

    html += `<section><h2 class="text-xl md:text-2xl font-black text-gray-900 mb-6 px-2 flex items-center gap-2">${isFiltering ? 'Resultados da busca' : 'Nossa Coleção'}${window.state.filters.anime !== 'Todos' ? `<span class="text-sm font-bold bg-brand/20 text-gray-900 px-3 py-1 rounded-lg ml-2">${window.state.filters.anime}</span>` : ''}</h2>`;
    
    if(gridProducts.length === 0) {
      html += `<div class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200"><p class="text-gray-500 text-lg font-bold">Nenhum produto encontrado. :(</p><button onclick="window.state.filters={search:'',category:'Todas',anime:'Todos',maxPrice:500}; window.renderApp(false);" class="mt-4 text-brand font-black hover:underline">Limpar filtros</button></div>`;
    } else {
      html += `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">${gridProducts.map(p => `
        <div class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-brand/10 transition-all duration-300 cursor-pointer group flex flex-col transform hover:-translate-y-1" onclick='window.changeView("product", {id:"${p.id}"})'>
          <div class="relative h-40 md:h-64 overflow-hidden bg-gray-100 flex-shrink-0">
            <img src="${p.images[0]}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ${shouldShowCategory(p.category) ? `<div class="absolute top-2 left-2 bg-brand text-[10px] md:text-xs font-black px-2 py-1 rounded-lg text-gray-900 shadow-sm border border-brand/50">${p.category}</div>` : ``}
          </div>
          <div class="p-3 md:p-5 flex flex-col flex-grow">
            <h3 class="font-bold text-xs md:text-sm text-gray-900 leading-tight mb-2 group-hover:text-brand transition-colors line-clamp-2">${p.name}</h3>
            <div class="mt-auto flex items-end justify-between pt-2 border-t border-gray-50">
              <div><div class="text-sm md:text-xl font-black text-gray-900">${formatPrice(p.price)}</div></div>
              <div class="bg-gray-100 text-gray-900 p-1.5 md:p-2 rounded-lg md:rounded-xl group-hover:bg-brand transition-colors shadow-sm mb-0.5">${Icons.plus}</div>
            </div>
          </div>
        </div>`).join('')}</div>`;
      if (!isFiltering) html += `<div class="flex items-center justify-center gap-3 mt-8">${window.state.homePage > 1 ? `<button onclick="window.prevHomePage()" class="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 shadow-sm hover:border-brand hover:text-brand transition">Voltar</button>` : ''}<div class="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 text-gray-700 shadow-sm">Página ${window.state.homePage} de ${totalPages}</div>${window.state.homePage < totalPages ? `<button onclick="window.nextHomePage(${totalPages})" class="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 shadow-sm hover:border-brand hover:text-brand transition">Próxima</button>` : ''}</div>`;
    }
    return html + `</section></div>`;
}

function getProductHTML() {
  const p = window.state.selectedProduct;
  const idx = window.state.productForm.imageIndex || 0;
  
  let thumbs = p.images.length > 1 ? `<div class="flex gap-2 justify-center w-full overflow-x-auto hide-scrollbar pb-1">${p.images.map((img, i) => `<button onclick="window.state.productForm.imageIndex=${i}; window.renderApp();" class="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${idx === i ? 'border-brand scale-105 shadow-sm' : 'border-gray-200 opacity-70 hover:opacity-100'}"><img src="${img}" class="w-full h-full object-cover"></button>`).join('')}</div>` : '';
  let colorsHTML = p.colors?.length > 0 ? `<div class="flex-1"><span class="font-bold text-sm text-gray-900 block mb-2">Cor</span><div class="flex gap-2 flex-wrap">${p.colors.map(c => `<button onclick="window.state.productForm.color='${c}'; window.renderApp();" class="px-3 py-1.5 rounded-lg font-black text-xs border-2 transition-all ${window.state.productForm.color === c ? 'border-brand bg-brand text-gray-900 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-brand'}">${c}</button>`).join('')}</div></div>` : '';
  let sizesHTML = (p.hasSizes && p.sizes?.length > 0) ? `<div class="flex-1"><span class="font-bold text-sm text-gray-900 block mb-2">Tamanho</span><div class="flex gap-2 flex-wrap">${p.sizes.map(s => `<button onclick="window.state.productForm.size='${s}'; window.renderApp();" class="w-10 h-10 rounded-lg font-black text-sm border-2 transition-all flex items-center justify-center ${window.state.productForm.size === s ? 'border-brand bg-brand text-gray-900 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-brand'}">${s}</button>`).join('')}</div></div>` : '';

  return `
    <div class="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
      <button onclick="window.changeView('home')" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 font-bold transition text-sm">${Icons.chevronLeft} Voltar</button>
      <div class="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row mb-6">
        <div class="md:w-5/12 p-4 md:p-6 bg-gray-50 border-r border-gray-100 flex flex-col items-center justify-start gap-4"><div class="w-fit max-w-full mx-auto flex items-center justify-center overflow-hidden rounded-2xl shadow-sm border border-gray-200 bg-white"><img src="${p.images[idx]}" class="max-w-full w-auto h-auto max-h-[425px] object-contain transition-opacity duration-300"></div>${thumbs}</div>
        <div class="md:w-7/12 p-5 md:p-8 flex flex-col">
          <div class="text-xs font-black text-brand drop-shadow-sm tracking-widest uppercase mb-1">${p.category} • ${p.anime}</div>
          <h1 class="text-2xl md:text-3xl font-black text-gray-900 mb-5 leading-tight">${p.name}</h1>
          <div class="flex items-center gap-3 mb-6"><div class="text-3xl md:text-4xl font-black text-gray-900">${formatPrice(getEffectivePrice(p, window.state.productForm.size))}</div>${p.originalPrice ? `<div class="flex flex-col"><span class="text-sm text-gray-400 line-through font-bold leading-none">${formatPrice(p.originalPrice)}</span><span class="bg-gray-900 text-brand text-xs font-black px-2 py-0.5 rounded-md mt-1 inline-block text-center shadow-sm">-${getDiscountPercent(getEffectivePrice(p, window.state.productForm.size), p.originalPrice)}%</span></div>` : ''}</div>
          <div class="flex flex-col sm:flex-row gap-5 mb-6">${colorsHTML}${sizesHTML}</div>
          <div class="mt-auto pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
            <div class="flex items-center border-2 border-gray-200 bg-white rounded-xl overflow-hidden w-full sm:w-auto h-12"><button onclick="window.state.productForm.quantity = Math.max(1, window.state.productForm.quantity-1); window.renderApp();" class="p-3 hover:bg-gray-100 text-gray-600 transition h-full flex items-center justify-center">${Icons.minus}</button><span class="px-4 font-black text-base w-12 text-center text-gray-900">${window.state.productForm.quantity}</span><button onclick="window.state.productForm.quantity++; window.renderApp();" class="p-3 hover:bg-gray-100 text-gray-600 transition h-full flex items-center justify-center">${Icons.plus}</button></div>
            <button onclick="window.handleAddToCart()" class="w-full sm:flex-grow h-12 bg-brand hover:bg-[#1bc762] text-gray-900 font-black rounded-xl shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm">${Icons.bag} Adicionar</button>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8"><h3 class="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><span class="text-brand">${Icons.tag}</span> Descrição Completa</h3><div class="text-gray-700 leading-relaxed font-medium whitespace-pre-line text-sm md:text-base">${p.description}</div></div>
    </div>`;
}

function getCheckoutHTML() {
  if(window.state.cart.length === 0) return `<div class="container mx-auto px-4 py-20 text-center"><div class="flex justify-center text-gray-300 mb-6 scale-150">${Icons.bag}</div><h2 class="text-2xl font-black text-gray-900 mb-4">Seu carrinho está vazio</h2><button onclick="window.changeView('home')" class="bg-brand text-gray-900 px-6 py-3 rounded-xl font-black hover:bg-[#1bc762] transition shadow-md">Voltar às compras</button></div>`;
  const cartSubtotal = window.state.cart.reduce((a,i)=>a+(getItemUnitPrice(i)*i.quantity), 0);
  const cartTotal = cartSubtotal - (cartSubtotal * window.state.coupon.discount);
  
  return `
    <div class="container mx-auto px-4 py-8">
      <button onclick="window.changeView('home')" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold transition">${Icons.chevronLeft} Voltar</button>
      <div class="flex flex-col lg:flex-row gap-8">
        <div class="lg:w-2/3"><div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-200"><h2 class="text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Dados para Entrega</h2>
          <form id="checkout-form" onsubmit="window.finalizeOrder(event)" class="space-y-5"><div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="col-span-1 md:col-span-2"><label class="block text-sm font-bold text-gray-900 mb-1">Nome Completo *</label><input required type="text" oninput="window.setFormData('name', this.value)" value="${window.state.checkoutForm.name}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white transition-all outline-none"/></div>
            <div><label class="block text-sm font-bold text-gray-900 mb-1">WhatsApp / Telefone *</label><input required type="tel" oninput="window.setFormData('phone', this.value)" value="${window.state.checkoutForm.phone}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none"/></div>
            <div><label class="block text-sm font-bold text-gray-900 mb-1">CEP *</label><input required type="text" oninput="window.handleCepInput(this)" maxlength="9" value="${window.state.checkoutForm.cep}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none"/><span id="cep-error" class="text-red-500 text-xs font-bold hidden block mt-1">CEP não encontrado ou inválido.</span></div>
            <div class="col-span-1 md:col-span-2"><label class="block text-sm font-bold text-gray-900 mb-1">Endereço (Rua/Avenida) *</label><input required type="text" id="input-address" oninput="window.setFormData('address', this.value)" value="${window.state.checkoutForm.address}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none"/></div>
            <div><label class="block text-sm font-bold text-gray-900 mb-1">Número *</label><input required type="text" id="input-number" oninput="window.setFormData('number', this.value)" value="${window.state.checkoutForm.number}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none"/></div>
            <div><label class="block text-sm font-bold text-gray-900 mb-1">Bairro</label><input type="text" id="input-bairro" oninput="window.setFormData('bairro', this.value)" value="${window.state.checkoutForm.bairro}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none"/></div>
            <div><label class="block text-sm font-bold text-gray-900 mb-1">Complemento</label><input type="text" oninput="window.setFormData('complement', this.value)" value="${window.state.checkoutForm.complement}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none"/></div>
            <div><label class="block text-sm font-bold text-gray-900 mb-1">Cidade *</label><input required type="text" id="input-city" oninput="window.setFormData('city', this.value)" value="${window.state.checkoutForm.city}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none"/></div>
            <div><label class="block text-sm font-bold text-gray-900 mb-1">Estado (UF) *</label><input required type="text" id="input-state" oninput="window.setFormData('checkoutState', this.value)" maxlength="2" value="${window.state.checkoutForm.checkoutState}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none uppercase"/></div>
          </div></form>
        </div></div>
        <div class="lg:w-1/3"><div class="bg-gray-50 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-200 sticky top-24"><h2 class="text-xl font-black text-gray-900 mb-4 border-b border-gray-200 pb-3 flex items-center gap-2"><span class="text-brand">${Icons.bag}</span> Resumo</h2>
          <div class="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">${window.state.cart.map(item => `<div class="flex justify-between items-start text-sm"><div class="flex-grow pr-2"><span class="font-black text-gray-900">${item.quantity}x</span> <span class="font-bold text-gray-800">${item.name}</span><div class="text-xs text-gray-500 mt-0.5 font-bold flex gap-2">${item.size ? `<span>Tam: ${item.size}</span>` : ''} ${item.color ? `<span>Cor: ${item.color}</span>` : ''}</div></div><div class="font-black text-gray-900 whitespace-nowrap">${formatPrice(getItemUnitPrice(item) * item.quantity)}</div></div>`).join('')}</div>
          <div class="border-t border-gray-200 pt-5 space-y-3 mb-6 font-bold">${window.state.coupon.discount > 0 ? `<div class="flex justify-between text-sm bg-brand/20 p-2 rounded-lg text-gray-900"><span>Desconto aplicado</span><span class="font-black">-${window.state.coupon.discount*100}%</span></div>` : ''}<div class="flex justify-between font-black text-2xl text-gray-900"><span>Total</span><span>${formatPrice(cartTotal)}</span></div><p class="text-xs text-gray-500 text-center mt-2 font-semibold">* O frete será calculado via WhatsApp.</p></div>
          <button type="submit" form="checkout-form" class="w-full bg-brand hover:bg-[#1bc762] text-gray-900 font-black py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">${Icons.phone} Finalizar via WhatsApp</button>
        </div></div>
      </div>
    </div>`;
}

function setupCarousel() {
  const container = document.getElementById('carousel-container');
  const track = document.getElementById('carousel-track');
  if(!container || !track) return;
  let currentIndex = 0; const total = window.__carouselProducts?.length || 0;
  let isDragging = false; let startX = 0;
  const next = () => { currentIndex = (currentIndex + 1) % total; track.style.transform = `translateX(-${currentIndex * 100}%)`; };
  const prev = () => { currentIndex = (currentIndex - 1 + total) % total; track.style.transform = `translateX(-${currentIndex * 100}%)`; };
  setInterval(() => { if(!isDragging) next(); }, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  const setHtml = (id, html) => { if(document.getElementById(id)) document.getElementById(id).innerHTML = html; };
  setHtml('icon-instagram', Icons.instagram); setHtml('icon-bag', Icons.bag); setHtml('icon-search', Icons.search);
  setHtml('icon-sliders', Icons.sliders); setHtml('ft-icon-insta', Icons.instagram); setHtml('ft-icon-phone', Icons.phone);
  setHtml('cb-icon-bag', Icons.bag); setHtml('cb-icon-x', Icons.x);
  if(document.getElementById('current-year')) document.getElementById('current-year').innerText = new Date().getFullYear();
  loadCatalogFromFirestore();
});

document.addEventListener("mousedown", (e) => {
  const container = document.getElementById('filter-container');
  if (window.state.isFilterOpen && container && !container.contains(e.target)) window.toggleFilter(true);
});