// app.js
// ==================== Configuração Firebase ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

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

// ==================== CONSTANTES E ÍCONES ====================
const DEFAULT_CATEGORIES = ["Todas", "Camisetas", "Action Figures", "Acessórios"];

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
  truck: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.584-6.584a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>`
};

// ==================== UTILITÁRIOS ====================
const formatPrice = (price) => Number(price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const parseOptionalPrice = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return undefined;
    const cleaned = s.replace(/[^0-9,.-]/g, '');
    if (!cleaned) return undefined;
    let norm = cleaned;
    if (cleaned.includes(',') && !cleaned.includes('.')) norm = cleaned.replace(',', '.');
    if (cleaned.includes(',') && cleaned.includes('.')) {
      norm = cleaned.replace(/\./g, '').replace(',', '.');
    }
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

const getDiscountPercent = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

const shouldShowCategory = (cat) => {
  const v = String(cat || '').trim().toLowerCase();
  return v !== 'todos' && v !== 'todas' && v !== '';
};

const sortByNewest = (a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0);

const getLatestProducts = (products, n) => [...(products || [])].sort(sortByNewest).slice(0, n);

// ==================== CARRINHO (localStorage) ====================
let cart = [];

function loadCart() {
  try {
    const saved = localStorage.getItem('ottaku_cart');
    cart = saved ? JSON.parse(saved) : [];
  } catch {
    cart = [];
  }
  return cart;
}

function saveCart() {
  localStorage.setItem('ottaku_cart', JSON.stringify(cart));
}

function addToCart(product, size, color, quantity) {
  const unitPrice = getEffectivePrice(product, size);
  const existingIndex = cart.findIndex(
    item => item.id === product.id && item.size === size && item.color === color
  );
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
    cart[existingIndex].unitPrice = unitPrice;
  } else {
    cart.push({
      ...product,
      size,
      color,
      quantity,
      unitPrice
    });
  }
  saveCart();
  updateCartBadge();
}

function updateCartQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartBadge();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartBadge();
}

function getCartSubtotal() {
  return cart.reduce((acc, item) => acc + (getItemUnitPrice(item) * item.quantity), 0);
}

function getCartTotal(couponDiscount = 0) {
  return getCartSubtotal() * (1 - couponDiscount);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const totalQtd = cart.reduce((a, i) => a + i.quantity, 0);
  badge.innerText = totalQtd;
  badge.classList.toggle('hidden', totalQtd === 0);
}

// ==================== NORMALIZAÇÃO DE DADOS DO FIREBASE ====================
function normalizeProduct(p) {
  const images = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
  const colors = Array.isArray(p.colors) ? p.colors.filter(Boolean) : [];
  const sizes = Array.isArray(p.sizes) ? p.sizes.filter(Boolean) : [];
  const hasSizes = (typeof p.hasSizes === "boolean") ? p.hasSizes : (sizes.length > 0);

  const toMillis = (v) => {
    try {
      if (!v) return 0;
      if (typeof v === 'number') return v;
      if (typeof v.toMillis === 'function') return v.toMillis();
      if (typeof v.seconds === 'number') return v.seconds * 1000;
      const d = new Date(v);
      const t = d.getTime();
      return Number.isFinite(t) ? t : 0;
    } catch (_) {
      return 0;
    }
  };

  const createdAtMs = toMillis(p.createdAt);
  const updatedAtMs = toMillis(p.updatedAt);
  const colecaoHome = (p.colecaoHome === 'sim' || p.colecaoHome === 'nao') ? p.colecaoHome : (p.isFeatured ? 'sim' : 'nao');

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
    images: images.length ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"],
    colors,
    sizes,
    hasSizes,
    description: p.description || "",
    isFeatured: !!p.isFeatured,
    colecaoHome,
    createdAtMs,
    updatedAtMs
  };
}

function normalizeAnime(a) {
  const orderNum = (typeof a.order === "number") ? a.order : Number(a.order);
  return {
    id: a.id || "",
    name: a.name || "Tema",
    image: a.image || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=200",
    order: Number.isFinite(orderNum) ? orderNum : null
  };
}

// ==================== CARREGAR CATÁLOGO DO FIREBASE ====================
let CATEGORIES = [...DEFAULT_CATEGORIES];
let ANIMES = [];
let PRODUCTS = [];
let catalogLoadPromise = null;

function loadCatalogFromFirestore() {
  if (catalogLoadPromise) return catalogLoadPromise;
  catalogLoadPromise = (async () => {
    try {
      const catalogRef = doc(db, "config", "catalog");
      const catalogSnap = await getDoc(catalogRef);
      if (catalogSnap.exists() && Array.isArray(catalogSnap.data().categories)) {
        CATEGORIES = catalogSnap.data().categories;
      } else {
        CATEGORIES = DEFAULT_CATEGORIES;
      }

      const animesSnap = await getDocs(collection(db, "animes"));
      ANIMES = animesSnap.docs
        .map(d => normalizeAnime({ id: d.id, ...d.data() }))
        .filter(a => a.name);

      const orderVal = (x) => (Number.isFinite(Number(x?.order)) ? Number(x.order) : 1e9);
      ANIMES.sort((a,b) => (orderVal(a) - orderVal(b)) || String(a.name).localeCompare(String(b.name), "pt-BR"));

      const productsSnap = await getDocs(collection(db, "products"));
      PRODUCTS = productsSnap.docs
        .map(d => normalizeProduct({ id: d.id, ...d.data() }))
        .filter(p => p.id);

      return { products: PRODUCTS, animes: ANIMES, categories: CATEGORIES };
    } catch (e) {
      console.error("Erro ao carregar catálogo:", e);
      throw e;
    }
  })();
  return catalogLoadPromise;
}

// ==================== INICIALIZAÇÃO POR PÁGINA ====================
function initHomePage() {
  // Carregar catálogo e renderizar
  const root = document.getElementById('app-root');
  if (!root) return;

  // Mostrar loading
  root.innerHTML = getHomeLoadingHTML();

  loadCatalogFromFirestore()
    .then(() => {
      renderHomePage(root);
      setupCarousel();
      // Restaurar estado do scroll de animes se necessário (via sessionStorage)
      const savedScroll = sessionStorage.getItem('home_anime_scroll');
      if (savedScroll) {
        const animeScroll = document.getElementById('anime-scroll-container');
        if (animeScroll) animeScroll.scrollLeft = parseInt(savedScroll, 10);
        sessionStorage.removeItem('home_anime_scroll');
      }
    })
    .catch((error) => {
      root.innerHTML = getHomeErrorHTML(error);
    });

  // Event listener para salvar scroll ao sair da página
  window.addEventListener('beforeunload', () => {
    const animeScroll = document.getElementById('anime-scroll-container');
    if (animeScroll) {
      sessionStorage.setItem('home_anime_scroll', animeScroll.scrollLeft);
    }
  });
}

function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (!productId) {
    window.location.href = '/';
    return;
  }

  const root = document.getElementById('app-root');
  if (!root) return;

  root.innerHTML = getProductLoadingHTML();

  loadCatalogFromFirestore()
    .then(() => {
      const product = PRODUCTS.find(p => p.id === productId);
      if (!product) {
        root.innerHTML = `<div class="container mx-auto px-4 py-20 text-center"><p class="text-red-600">Produto não encontrado.</p><button onclick="window.location.href='/'">Voltar</button></div>`;
        return;
      }
      renderProductPage(root, product);
    })
    .catch((error) => {
      root.innerHTML = getProductErrorHTML(error);
    });
}

function initCheckoutPage() {
  const root = document.getElementById('app-root');
  if (!root) return;
  loadCart(); // garantir que cart está carregado
  renderCheckoutPage(root);
}

// ==================== RENDERIZAÇÃO DA HOME ====================
let homePage = 1;
let homeFilters = {
  search: '',
  category: 'Todas',
  anime: 'Todos',
  maxPrice: 500
};
let isFilterOpen = false;

function getHomeLoadingHTML() {
  return `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-6 pt-4">
        <div class="flex justify-between items-center mb-4 px-2">
          <div class="h-7 w-44 rounded-lg skeleton"></div>
          <div class="flex gap-1.5">
            <div class="h-2 w-6 rounded-full skeleton"></div>
            <div class="h-2 w-2 rounded-full skeleton"></div>
            <div class="h-2 w-2 rounded-full skeleton"></div>
          </div>
        </div>
        <div class="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm overflow-hidden">
          <div class="h-44 md:h-56 rounded-2xl skeleton"></div>
        </div>
      </div>

      <div class="mb-10 mt-2">
        <div class="h-6 w-36 rounded-lg skeleton mb-4 px-2"></div>
        <div id="anime-scroll-container" class="flex gap-4 overflow-x-auto hide-scrollbar px-2 pb-2">
          ${Array.from({length: 6}).map(() => `
            <div class="flex flex-col items-center gap-2 flex-shrink-0">
              <div class="w-16 h-16 md:w-20 md:h-20 rounded-full skeleton"></div>
              <div class="h-3 w-14 rounded skeleton"></div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="mb-6 px-2">
        <div class="h-7 w-44 rounded-lg skeleton"></div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        ${Array.from({length: 8}).map(() => `
          <div class="bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden">
            <div class="h-40 md:h-64 skeleton"></div>
            <div class="p-3 md:p-5">
              <div class="h-4 w-3/4 rounded skeleton mb-2"></div>
              <div class="h-4 w-1/2 rounded skeleton mb-4"></div>
              <div class="h-6 w-24 rounded skeleton"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getHomeErrorHTML(error) {
  return `
    <div class="container mx-auto px-4 py-20 text-center">
      <div class="text-red-600 font-black mb-2">Não deu pra carregar a loja</div>
      <div class="text-gray-600 font-bold text-sm break-words">${error}</div>
    </div>
  `;
}

function renderHomePage(root) {
  const isFiltering = homeFilters.search !== '' || homeFilters.category !== 'Todas' || homeFilters.maxPrice !== 500 || homeFilters.anime !== 'Todos';

  let filtered = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(homeFilters.search.toLowerCase());
    const matchesCat = homeFilters.category === 'Todas' || p.category === homeFilters.category;
    const matchesAnime = homeFilters.anime === 'Todos' || p.anime === homeFilters.anime;
    const matchesPrice = p.price <= homeFilters.maxPrice;
    return matchesSearch && matchesCat && matchesAnime && matchesPrice;
  });

  let html = `<div class="container mx-auto px-4 py-8">`;

  // Carrossel de lançamentos
  const cProds = getLatestProducts(PRODUCTS, 7);
  window.__carouselProducts = cProds;
  html += `
    <div class="mb-6 overflow-hidden relative pt-4">
      <div class="flex justify-between items-center mb-4 px-2">
        <h2 class="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
          <span class="text-brand drop-shadow-sm">🔥</span> Lançamentos
        </h2>
        <div class="flex gap-1.5" id="carousel-dots">
          ${cProds.map((_, i) => `<div class="h-2 rounded-full transition-all duration-300 ${i===0 ? 'w-6 bg-brand' : 'w-2 bg-gray-300'}"></div>`).join('')}
        </div>
      </div>
      <div class="relative mx-auto bg-white rounded-3xl p-3 border border-gray-100 shadow-sm overflow-hidden select-none cursor-grab" id="carousel-container">
        <div class="flex transition-transform duration-500 ease-in-out" id="carousel-track" style="transform: translateX(0%);">
          ${cProds.map(p => `
            <div class="min-w-full px-2 flex justify-center pointer-events-none">
              <div class="w-full flex bg-gray-50 rounded-2xl overflow-hidden pointer-events-auto shadow-sm border border-gray-100" onclick='window.location.href="/produto.html?id=${p.id}"'>
                <div class="w-2/5 md:w-1/3 h-36 md:h-48 overflow-hidden bg-gray-200 flex-shrink-0 relative">
                  <img src="${p.images[0]}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" draggable="false" />
                  ${p.originalPrice ? `<div class="absolute top-2 left-2 bg-brand text-gray-900 text-[10px] font-black px-2 py-1 rounded-md shadow-sm">-${getDiscountPercent(p.price, p.originalPrice)}%</div>` : ''}
                </div>
                <div class="w-3/5 md:w-2/3 p-4 md:p-6 flex flex-col justify-center">
                  ${shouldShowCategory(p.category) ? `<div class="text-[10px] md:text-xs font-black text-brand drop-shadow-sm mb-1 uppercase tracking-wider">${p.category}</div>` : ``}
                  <h3 class="font-bold text-sm md:text-xl text-gray-900 leading-tight mb-2 line-clamp-2">${p.name}</h3>
                  <div class="mt-auto flex items-baseline gap-2">
                    <div class="text-lg md:text-2xl font-black text-gray-900">${formatPrice(p.price)}</div>
                    ${p.originalPrice ? `<div class="text-xs md:text-sm text-gray-400 line-through font-bold">${formatPrice(p.originalPrice)}</div>` : ''}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Animes
  let animesHTML = ANIMES.map(a => `
    <button onclick="window.homeFilters.anime='${a.name}'; renderHomePage(document.getElementById('app-root'));" class="flex flex-col items-center gap-2 flex-shrink-0 group">
      <div class="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all shadow-sm ${homeFilters.anime === a.name ? 'border-brand scale-105' : 'border-gray-200 group-hover:border-brand'}">
        <img src="${a.image}" class="w-full h-full object-cover" />
      </div>
      <span class="text-xs font-bold transition-colors ${homeFilters.anime === a.name ? 'text-brand' : 'text-gray-700'}">${a.name}</span>
    </button>
  `).join('');

  html += `
    <div class="mb-10 mt-2">
      <h2 class="text-lg font-black text-gray-900 mb-4 px-2">Animes / Temas</h2>
      <div id="anime-scroll-container" class="flex gap-4 overflow-x-auto hide-scrollbar px-2 pb-2">
        <button onclick="window.homeFilters.anime='Todos'; renderHomePage(document.getElementById('app-root'));" class="flex flex-col items-center gap-2 flex-shrink-0">
          <div class="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-xs md:text-sm border-2 transition-all shadow-sm ${homeFilters.anime === 'Todos' ? 'border-brand bg-brand text-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:border-brand'}">Todos</div>
        </button>
        ${animesHTML}
      </div>
    </div>
  `;

  let titleHTML = isFiltering ? 'Resultados da busca' : 'Nossa Coleção';
  if (homeFilters.anime !== 'Todos') titleHTML += `<span class="text-sm font-bold bg-brand/20 text-gray-900 px-3 py-1 rounded-lg ml-2">${homeFilters.anime}</span>`;

  html += `<section><h2 class="text-xl md:text-2xl font-black text-gray-900 mb-6 px-2 flex items-center gap-2">${titleHTML}</h2>`;

  let gridProducts = filtered;
  let totalPages = 1;
  if (!isFiltering) {
    const homeAll = [...PRODUCTS].filter(p => p.colecaoHome === 'sim').sort(sortByNewest);
    const pageSize = 10;
    totalPages = Math.max(1, Math.ceil(homeAll.length / pageSize));
    homePage = Math.min(Math.max(1, homePage), totalPages);
    const start = (homePage - 1) * pageSize;
    gridProducts = homeAll.slice(start, start + pageSize);
  }

  if (gridProducts.length === 0) {
    html += `
      <div class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div class="flex justify-center mb-4 text-gray-300">${Icons.filter}</div>
        <p class="text-gray-500 text-lg font-bold">Nenhum produto encontrado. :(</p>
        <button onclick="window.homeFilters={search:'',category:'Todas',anime:'Todos',maxPrice:500}; renderHomePage(document.getElementById('app-root'));" class="mt-4 text-brand font-black hover:underline">Limpar filtros</button>
      </div>
    `;
  } else {
    html += `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">`;
    gridProducts.forEach(p => {
      html += `
        <div class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-brand/10 transition-all duration-300 cursor-pointer group flex flex-col transform hover:-translate-y-1" onclick='window.location.href="/produto.html?id=${p.id}"'>
          <div class="relative h-40 md:h-64 overflow-hidden bg-gray-100 flex-shrink-0">
            <img src="${p.images[0]}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ${shouldShowCategory(p.category) ? `<div class="absolute top-2 left-2 md:top-3 md:left-3 bg-brand backdrop-blur-sm text-[10px] md:text-xs font-black px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-gray-900 shadow-sm border border-brand/50">${p.category}</div>` : ``}
            ${p.originalPrice ? `<div class="absolute top-2 right-2 md:top-3 md:right-3 bg-gray-900 text-brand text-[10px] md:text-xs font-black px-2 py-1 md:px-3 md:py-1.5 rounded-lg shadow-sm border border-gray-800">-${getDiscountPercent(p.price, p.originalPrice)}%</div>` : ''}
          </div>
          <div class="p-3 md:p-5 flex flex-col flex-grow">
            <h3 class="font-bold text-xs md:text-sm text-gray-900 leading-tight mb-2 group-hover:text-brand transition-colors line-clamp-2">${p.name}</h3>
            <div class="mt-auto flex items-end justify-between pt-2 md:pt-4 border-t border-gray-50">
              <div>
                <div class="text-sm md:text-xl font-black text-gray-900">${formatPrice(p.price)}</div>
                ${p.originalPrice ? `<div class="text-[10px] md:text-xs text-gray-400 line-through font-bold">${formatPrice(p.originalPrice)}</div>` : ''}
              </div>
              <div class="bg-gray-100 text-gray-900 p-1.5 md:p-2 rounded-lg md:rounded-xl group-hover:bg-brand transition-colors shadow-sm mb-0.5">${Icons.plus}</div>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    if (!isFiltering) {
      html += `
        <div class="flex items-center justify-center gap-3 mt-8">
          ${homePage > 1 ? `
            <button onclick="window.homePage--; renderHomePage(document.getElementById('app-root'));" class="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 shadow-sm hover:border-brand hover:text-brand transition">Voltar</button>
          ` : ''}

          <div class="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 text-gray-700 shadow-sm">
            Página ${homePage} de ${totalPages}
          </div>

          ${homePage < totalPages ? `
            <button onclick="window.homePage++; renderHomePage(document.getElementById('app-root'));" class="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 shadow-sm hover:border-brand hover:text-brand transition">Próxima</button>
          ` : ''}
        </div>
      `;
    }
  }
  html += `</section></div>`;

  root.innerHTML = html;
  updateCartBadge();
  setupSearchInput();
  setupFilterButton();
}

function setupSearchInput() {
  const input = document.getElementById('search-input');
  if (input) {
    input.value = homeFilters.search;
    input.oninput = (e) => {
      homeFilters.search = e.target.value;
      renderHomePage(document.getElementById('app-root'));
    };
  }
}

function setupFilterButton() {
  const btn = document.getElementById('filter-btn');
  if (!btn) return;
  btn.onclick = () => {
    isFilterOpen = !isFilterOpen;
    renderFilterDropdown();
  };
}

function renderFilterDropdown() {
  const drop = document.getElementById('filter-dropdown');
  if (!drop) return;
  if (!isFilterOpen) {
    drop.innerHTML = '';
    return;
  }

  let catsHTML = CATEGORIES.map(cat => `
    <button onclick="window.homeFilters.category = '${cat}'; window.isFilterOpen = false; renderHomePage(document.getElementById('app-root'));" 
      class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${homeFilters.category === cat ? 'bg-brand text-gray-900 shadow-md' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'}">
      ${cat}
    </button>
  `).join('');

  drop.innerHTML = `
    <div class="absolute top-12 right-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-2xl p-5 text-gray-800 animate-slide-in-top z-50">
      <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <h3 class="font-bold flex items-center gap-2 text-gray-900">${Icons.filter} Filtros</h3>
        <button onclick="window.isFilterOpen = false; renderFilterDropdown();" class="text-gray-500 hover:text-gray-900">${Icons.x}</button>
      </div>
      <div class="mb-5">
        <label class="text-sm font-bold block mb-2 text-gray-900">Categorias</label>
        <div class="flex flex-wrap gap-2">${catsHTML}</div>
      </div>
      <div>
        <label class="text-sm font-bold flex justify-between mb-2 text-gray-900">
          <span>Preço Máx:</span><span id="max-price-display" class="text-brand drop-shadow-sm">${formatPrice(homeFilters.maxPrice)}</span>
        </label>
        <input type="range" min="0" max="500" step="10" value="${homeFilters.maxPrice}" 
          oninput="document.getElementById('max-price-display').innerText = formatPrice(Number(this.value));" 
          onchange="window.homeFilters.maxPrice = Number(this.value); renderHomePage(document.getElementById('app-root'));"
          class="w-full accent-brand h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
      </div>
    </div>
  `;
}

function setupCarousel() {
  const container = document.getElementById('carousel-container');
  const track = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!container || !track) return;

  let currentIndex = 0;
  const total = (window.__carouselProducts || []).length;
  let isDragging = false;
  let startX = 0;
  let autoInterval;

  const updateUI = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((dot, i) => {
        dot.className = `h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-brand' : 'w-2 bg-gray-300'}`;
      });
    }
  };

  const next = () => { currentIndex = (currentIndex + 1) % total; updateUI(); };
  const prev = () => { currentIndex = (currentIndex - 1 + total) % total; updateUI(); };

  const startAuto = () => {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => { if (!isDragging) next(); }, 2500);
  };
  startAuto();

  const dragStart = (x) => {
    isDragging = true;
    startX = x;
    container.classList.add('cursor-grabbing');
    container.classList.remove('cursor-grab');
  };
  const dragEnd = (x) => {
    if (!isDragging) return;
    const diff = startX - x;
    if (diff > 50) next();
    else if (diff < -50) prev();
    isDragging = false;
    container.classList.remove('cursor-grabbing');
    container.classList.add('cursor-grab');
    startAuto();
  };

  container.addEventListener('mousedown', e => dragStart(e.pageX));
  container.addEventListener('touchstart', e => dragStart(e.touches[0].clientX));
  window.addEventListener('mouseup', e => { if (isDragging) dragEnd(e.pageX); });
  window.addEventListener('touchend', e => { if (isDragging) dragEnd(e.changedTouches[0].clientX); });
}

// ==================== RENDERIZAÇÃO DO PRODUTO ====================
function getProductLoadingHTML() {
  return `<div class="container mx-auto px-4 py-20 text-center">Carregando produto...</div>`;
}

function getProductErrorHTML(error) {
  return `<div class="container mx-auto px-4 py-20 text-center text-red-600">Erro: ${error}</div>`;
}

function renderProductPage(root, product) {
  // Estado local da página de produto
  let productForm = {
    size: '',
    color: '',
    quantity: 1,
    imageIndex: 0
  };

  const sizes = (Array.isArray(product.sizes) && product.sizes.length > 0) ? product.sizes : [];
  const hasColors = product.colors && product.colors.length > 0;
  const idx = productForm.imageIndex;

  let thumbs = '';
  if (product.images.length > 1) {
    thumbs = `<div class="flex gap-2 justify-center w-full overflow-x-auto hide-scrollbar pb-1">`;
    product.images.forEach((img, i) => {
      thumbs += `<button onclick="window.productForm.imageIndex=${i}; renderProductPage(document.getElementById('app-root'), window.currentProduct);" class="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${idx === i ? 'border-brand scale-105 shadow-sm' : 'border-gray-200 opacity-70 hover:opacity-100'}"><img src="${img}" class="w-full h-full object-cover"></button>`;
    });
    thumbs += `</div>`;
  }

  let colorsHTML = '';
  if (hasColors) {
    let btns = product.colors.map(c => `<button onclick="window.productForm.color='${c}'; renderProductPage(document.getElementById('app-root'), window.currentProduct);" class="px-3 py-1.5 rounded-lg font-black text-xs border-2 transition-all ${productForm.color === c ? 'border-brand bg-brand text-gray-900 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-brand'}">${c}</button>`).join('');
    colorsHTML = `<div class="flex-1"><span class="font-bold text-sm text-gray-900 block mb-2">Cor</span><div class="flex gap-2 flex-wrap">${btns}</div></div>`;
  }

  let sizesHTML = '';
  if (product.hasSizes && sizes.length > 0) {
    let btns = sizes.map(s => `<button onclick="window.productForm.size='${s}'; renderProductPage(document.getElementById('app-root'), window.currentProduct);" class="w-10 h-10 rounded-lg font-black text-sm border-2 transition-all flex items-center justify-center ${productForm.size === s ? 'border-brand bg-brand text-gray-900 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-brand'}">${s}</button>`).join('');
    sizesHTML = `<div class="flex-1"><span class="font-bold text-sm text-gray-900 block mb-2">Tamanho</span><div class="flex gap-2 flex-wrap">${btns}</div></div>`;
  }

  const html = `
    <div class="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
      <button onclick="window.location.href='/'" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 font-bold transition text-sm">
        ${Icons.chevronLeft} Voltar
      </button>
      
      <div class="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row mb-6">
        <div class="md:w-5/12 p-4 md:p-6 bg-gray-50 border-r border-gray-100 flex flex-col items-center justify-start gap-4">
          <div class="w-fit max-w-full mx-auto flex items-center justify-center overflow-hidden rounded-2xl shadow-sm border border-gray-200 bg-white">
            <img src="${product.images[idx]}" class="max-w-full w-auto h-auto max-h-[425px] object-contain transition-opacity duration-300">
          </div>
          ${thumbs}
        </div>

        <div class="md:w-7/12 p-5 md:p-8 flex flex-col">
          <div class="text-xs font-black text-brand drop-shadow-sm tracking-widest uppercase mb-1">${product.category} • ${product.anime}</div>
          <h1 class="text-2xl md:text-3xl font-black text-gray-900 mb-5 leading-tight">${product.name}</h1>
          
          <div class="flex items-center gap-3 mb-6">
            <div class="text-3xl md:text-4xl font-black text-gray-900">${formatPrice(getEffectivePrice(product, productForm.size))}</div>
            ${product.originalPrice ? `
              <div class="flex flex-col">
                <span class="text-sm text-gray-400 line-through font-bold leading-none">${formatPrice(product.originalPrice)}</span>
                <span class="bg-gray-900 text-brand text-xs font-black px-2 py-0.5 rounded-md mt-1 inline-block text-center shadow-sm">-${getDiscountPercent(getEffectivePrice(product, productForm.size), product.originalPrice)}%</span>
              </div>
            ` : ''}
          </div>

          <div class="flex flex-col sm:flex-row gap-5 mb-6">
            ${colorsHTML}
            ${sizesHTML}
          </div>

          <div class="mt-auto pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
            <div class="flex items-center border-2 border-gray-200 bg-white rounded-xl overflow-hidden w-full sm:w-auto h-12">
              <button onclick="window.productForm.quantity = Math.max(1, window.productForm.quantity-1); renderProductPage(document.getElementById('app-root'), window.currentProduct);" class="p-3 hover:bg-gray-100 text-gray-600 transition h-full flex items-center justify-center">${Icons.minus}</button>
              <span class="px-4 font-black text-base w-12 text-center text-gray-900">${productForm.quantity}</span>
              <button onclick="window.productForm.quantity++; renderProductPage(document.getElementById('app-root'), window.currentProduct);" class="p-3 hover:bg-gray-100 text-gray-600 transition h-full flex items-center justify-center">${Icons.plus}</button>
            </div>
            <button onclick="window.addToCart(window.currentProduct, window.productForm.size, window.productForm.color, window.productForm.quantity); window.location.href='/checkout.html';" class="w-full sm:flex-grow h-12 bg-brand hover:bg-[#1bc762] text-gray-900 font-black rounded-xl shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm">
              ${Icons.bag} Adicionar
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h3 class="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
           <span class="text-brand">${Icons.tag}</span> Descrição Completa
        </h3>
        <div class="text-gray-700 leading-relaxed font-medium whitespace-pre-line text-sm md:text-base">
          ${product.description}
        </div>
      </div>
    </div>
  `;

  root.innerHTML = html;
  updateCartBadge();

  // Guarda referência do produto e estado para os eventos inline
  window.currentProduct = product;
  window.productForm = productForm;
}

// ==================== RENDERIZAÇÃO DO CHECKOUT ====================
let coupon = { code: '', discount: 0 };

function renderCheckoutPage(root) {
  loadCart();

  if (cart.length === 0) {
    root.innerHTML = `
      <div class="container mx-auto px-4 py-20 text-center">
        <div class="flex justify-center text-gray-300 mb-6 scale-150">${Icons.bag}</div>
        <h2 class="text-2xl font-black text-gray-900 mb-4">Seu carrinho está vazio</h2>
        <button onclick="window.location.href='/'" class="bg-brand text-gray-900 px-6 py-3 rounded-xl font-black hover:bg-[#1bc762] transition shadow-md">Voltar às compras</button>
      </div>
    `;
    updateCartBadge();
    return;
  }

  const subtotal = getCartSubtotal();
  const total = getCartTotal(coupon.discount);

  const summaryItems = cart.map((item, idx) => `
    <div class="flex justify-between items-start text-sm">
      <div class="flex-grow pr-2">
        <span class="font-black text-gray-900">${item.quantity}x</span> <span class="font-bold text-gray-800">${item.name}</span>
        <div class="text-xs text-gray-500 mt-0.5 font-bold flex gap-2">
          ${item.size ? `<span>Tam: ${item.size}</span>` : ''} ${item.color ? `<span>Cor: ${item.color}</span>` : ''}
        </div>
      </div>
      <div class="font-black text-gray-900 whitespace-nowrap">${formatPrice(getItemUnitPrice(item) * item.quantity)}</div>
    </div>
  `).join('');

  const html = `
    <div class="container mx-auto px-4 py-8">
      <button onclick="window.location.href='/'" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold transition">${Icons.chevronLeft} Voltar</button>
      
      <div class="flex flex-col lg:flex-row gap-8">
        <div class="lg:w-2/3">
          <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-200">
            <h2 class="text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Dados para Entrega</h2>
            <form id="checkout-form" onsubmit="finalizeOrder(event)" class="space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="col-span-1 md:col-span-2">
                  <label class="block text-sm font-bold text-gray-900 mb-1">Nome Completo *</label>
                  <input required type="text" id="input-name" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white transition-all outline-none" placeholder="Ex: Naruto Uzumaki"/>
                </div>
                
                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">WhatsApp / Telefone *</label>
                  <input required type="tel" id="input-phone" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="(XX) 9XXXX-XXXX"/>
                </div>
                
                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">CEP *</label>
                  <input required type="text" id="input-cep" maxlength="9" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="00000000" onblur="handleCep(this.value)"/>
                  <span id="cep-error" class="text-red-500 text-xs font-bold hidden block mt-1">CEP não encontrado ou inválido.</span>
                </div>

                <div class="col-span-1 md:col-span-2">
                  <label class="block text-sm font-bold text-gray-900 mb-1">Endereço (Rua/Avenida) *</label>
                  <input required type="text" id="input-address" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="Rua das Folhas..."/>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">Número *</label>
                  <input required type="text" id="input-number" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="123"/>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">Bairro</label>
                  <input type="text" id="input-bairro" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="Seu Bairro"/>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">Complemento</label>
                  <input type="text" id="input-complement" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="Apto..."/>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">Cidade *</label>
                  <input required type="text" id="input-city" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="Sua Cidade"/>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">Estado (UF) *</label>
                  <input required type="text" id="input-state" maxlength="2" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none uppercase" placeholder="SP, MG..."/>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div class="lg:w-1/3">
          <div class="bg-gray-50 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-200 sticky top-24">
            <h2 class="text-xl font-black text-gray-900 mb-4 border-b border-gray-200 pb-3 flex items-center gap-2"><span class="text-brand">${Icons.bag}</span> Resumo</h2>
            <div class="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">${summaryItems}</div>
            <div class="border-t border-gray-200 pt-5 space-y-3 mb-6 font-bold">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>${formatPrice(subtotal)}</span>
              </div>
              ${coupon.discount > 0 ? `
                <div class="flex justify-between text-sm bg-brand/20 p-2 rounded-lg text-gray-900">
                  <span>Desconto (${coupon.discount*100}%)</span><span class="font-black">-${formatPrice(subtotal * coupon.discount)}</span>
                </div>
              ` : ''}
              <div class="flex justify-between font-black text-2xl text-gray-900"><span>Total</span><span>${formatPrice(total)}</span></div>
              <p class="text-xs text-gray-500 text-center mt-2 font-semibold">* O frete será calculado via WhatsApp.</p>
            </div>
            <div class="mb-4 flex gap-2">
              <input type="text" id="coupon-input" placeholder="Cupom (ex: OTTAKU10)" class="flex-grow p-2.5 border border-gray-300 rounded-xl text-sm uppercase bg-white focus:ring-2 focus:ring-brand outline-none font-bold" value="${coupon.code}">
              <button onclick="applyCoupon()" class="bg-gray-900 text-brand px-4 py-2.5 rounded-xl text-sm font-black hover:bg-black transition">Aplicar</button>
            </div>
            <button type="submit" form="checkout-form" class="w-full bg-brand hover:bg-[#1bc762] text-gray-900 font-black py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
              ${Icons.phone} Finalizar via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  root.innerHTML = html;
  updateCartBadge();

  // Preencher campos salvos (se houver)
  const saved = JSON.parse(sessionStorage.getItem('checkout_form') || '{}');
  if (saved.name) document.getElementById('input-name').value = saved.name;
  if (saved.phone) document.getElementById('input-phone').value = saved.phone;
  if (saved.cep) document.getElementById('input-cep').value = saved.cep;
  if (saved.address) document.getElementById('input-address').value = saved.address;
  if (saved.number) document.getElementById('input-number').value = saved.number;
  if (saved.bairro) document.getElementById('input-bairro').value = saved.bairro;
  if (saved.complement) document.getElementById('input-complement').value = saved.complement;
  if (saved.city) document.getElementById('input-city').value = saved.city;
  if (saved.state) document.getElementById('input-state').value = saved.state;

  // Salvar formulário ao digitar
  document.querySelectorAll('#checkout-form input').forEach(input => {
    input.addEventListener('input', saveCheckoutForm);
  });
}

function saveCheckoutForm() {
  const form = {
    name: document.getElementById('input-name')?.value || '',
    phone: document.getElementById('input-phone')?.value || '',
    cep: document.getElementById('input-cep')?.value || '',
    address: document.getElementById('input-address')?.value || '',
    number: document.getElementById('input-number')?.value || '',
    bairro: document.getElementById('input-bairro')?.value || '',
    complement: document.getElementById('input-complement')?.value || '',
    city: document.getElementById('input-city')?.value || '',
    state: document.getElementById('input-state')?.value || ''
  };
  sessionStorage.setItem('checkout_form', JSON.stringify(form));
}

async function handleCep(cep) {
  cep = cep.replace(/\D/g, '');
  const errorSpan = document.getElementById('cep-error');
  if (errorSpan) errorSpan.classList.add('hidden');

  if (cep.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        if (errorSpan) errorSpan.classList.remove('hidden');
        document.getElementById('input-address').value = '';
        document.getElementById('input-bairro').value = '';
        document.getElementById('input-city').value = '';
        document.getElementById('input-state').value = '';
      } else {
        document.getElementById('input-address').value = data.logradouro || '';
        document.getElementById('input-bairro').value = data.bairro || '';
        document.getElementById('input-city').value = data.localidade || '';
        document.getElementById('input-state').value = data.uf || '';
        document.getElementById('input-number').focus();
      }
    } catch (e) {
      console.error('Erro ao buscar CEP', e);
      if (errorSpan) {
        errorSpan.innerText = "Erro ao conectar. Verifique sua internet.";
        errorSpan.classList.remove('hidden');
      }
    }
  }
}

function applyCoupon() {
  const code = document.getElementById('coupon-input').value.toUpperCase();
  if (code === 'OTTAKU10') {
    coupon = { code, discount: 0.1 };
    alert('Cupom de 10% aplicado!');
  } else {
    coupon = { code: '', discount: 0 };
    alert('Cupom inválido.');
  }
  renderCheckoutPage(document.getElementById('app-root'));
}

function finalizeOrder(e) {
  e.preventDefault();
  if (cart.length === 0) { alert("Carrinho vazio!"); return; }

  const errorSpan = document.getElementById('cep-error');
  if (errorSpan && !errorSpan.classList.contains('hidden')) {
    alert("Por favor, informe um CEP válido antes de finalizar.");
    return;
  }

  const name = document.getElementById('input-name').value;
  const phone = document.getElementById('input-phone').value;
  const cep = document.getElementById('input-cep').value;
  const address = document.getElementById('input-address').value;
  const number = document.getElementById('input-number').value;
  const bairro = document.getElementById('input-bairro').value;
  const complement = document.getElementById('input-complement').value;
  const city = document.getElementById('input-city').value;
  const state = document.getElementById('input-state').value;

  const enderecoLinha =
    `${address || ''}` +
    `${number ? (', ' + number) : ''}` +
    `${bairro ? (' - ' + bairro) : ''}` +
    `${complement ? (' - ' + complement) : ''}`;

  let msg = `🛍️ *Novo Pedido - OttakuBrasil*\n\n👤 *Meus dados :*\nNome: ${name}\nWhatsApp: ${phone}\n\n📦 *Endereço de Entrega:*\nEndereço: ${enderecoLinha}\nCidade: ${city} - ${state}\nCEP: ${cep}\n\n🛒 *Produtos:*\n\n`;

  cart.forEach((item) => {
    msg += `• ${item.quantity}X: ${item.name}\n• ID: ${item.id}\n• Tam: ${item.size || '—'}\n• Cor: ${item.color || '—'}\n• Quantidade: ${item.quantity}\n• Valor unit.: ${formatPrice(getItemUnitPrice(item))}\n\n`;
  });

  const subtotal = getCartSubtotal();
  const total = getCartTotal(coupon.discount);

  if (coupon.discount > 0) {
    msg += `🏷️ Cupom: ${coupon.code} (-${coupon.discount*100}%)\n\n`;
  }

  msg += `💰 *Total produtos: ${formatPrice(total)}*`;

  window.open(`https://wa.me/5531972379858?text=${encodeURIComponent(msg)}`, '_blank');
}

// ==================== CARRINHO LATERAL ====================
function toggleCart(isOpen) {
  const sidebar = document.getElementById('cart-sidebar');
  if (!sidebar) return;
  if (isOpen) {
    sidebar.classList.remove('hidden');
    renderCartSidebar();
  } else {
    sidebar.classList.add('hidden');
  }
}

function renderCartSidebar() {
  const cartItemsDiv = document.getElementById('cart-items');
  const cartFooterDiv = document.getElementById('cart-footer');
  if (!cartItemsDiv || !cartFooterDiv) return;

  loadCart();

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `<div class="text-center text-gray-400 mt-10"><div class="flex justify-center mb-3 opacity-50 text-gray-300 scale-150">${Icons.bag}</div>Seu carrinho está vazio. =(</div>`;
    cartFooterDiv.innerHTML = '';
    return;
  }

  cartItemsDiv.innerHTML = cart.map((item, idx) => `
    <div class="flex gap-4 border-b border-gray-100 pb-4">
      <img src="${item.images[0]}" class="w-20 h-20 object-cover rounded-xl border border-gray-100" />
      <div class="flex-grow">
        <h4 class="font-bold text-sm text-gray-800 leading-tight">${item.name}</h4>
        <div class="text-xs text-gray-500 mt-1 flex gap-2">
          ${item.size ? `<span>Tam: ${item.size}</span>` : ''}
          ${item.color ? `<span>Cor: ${item.color}</span>` : ''}
        </div>
        <div class="text-brand drop-shadow-sm font-black text-sm mt-1">${formatPrice(getItemUnitPrice(item))}</div>
        <div class="flex items-center gap-3 mt-2">
          <div class="flex items-center border border-gray-200 rounded-lg">
            <button onclick="updateCartQuantity(${idx}, -1); renderCartSidebar();" class="p-1 hover:bg-gray-100 text-gray-600 rounded-l-lg">${Icons.minus}</button>
            <span class="px-2 text-sm font-bold text-gray-900">${item.quantity}</span>
            <button onclick="updateCartQuantity(${idx}, 1); renderCartSidebar();" class="p-1 hover:bg-gray-100 text-gray-600 rounded-r-lg">${Icons.plus}</button>
          </div>
          <button onclick="removeCartItem(${idx}); renderCartSidebar();" class="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-bold transition">${Icons.trash} Remover</button>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = getCartSubtotal();
  const total = getCartTotal(coupon.discount);

  cartFooterDiv.innerHTML = `
    <div class="mb-4 flex gap-2">
      <input type="text" id="coupon-input-sidebar" placeholder="Cupom (ex: OTTAKU10)" class="flex-grow p-2.5 border border-gray-300 rounded-xl text-sm uppercase bg-white focus:ring-2 focus:ring-brand outline-none font-bold" value="${coupon.code}">
      <button onclick="applySidebarCoupon()" class="bg-gray-900 text-brand px-4 py-2.5 rounded-xl text-sm font-black hover:bg-black transition">Aplicar</button>
    </div>
    <div class="space-y-2 mb-5 font-bold">
      <div class="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      ${coupon.discount > 0 ? `<div class="flex justify-between text-sm text-green-600 bg-green-50 p-1.5 rounded-lg"><span>Desconto (${coupon.discount*100}%)</span><span>-${formatPrice(subtotal*coupon.discount)}</span></div>` : ''}
      <div class="flex justify-between font-black text-xl text-gray-900 border-t border-gray-200 pt-3"><span>Total</span><span>${formatPrice(total)}</span></div>
    </div>
    <button onclick="toggleCart(false); window.location.href='/checkout.html';" class="w-full bg-brand hover:bg-[#1bc762] text-gray-900 font-black py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 text-lg">Finalizar Compra</button>
  `;
}

function applySidebarCoupon() {
  const code = document.getElementById('coupon-input-sidebar').value.toUpperCase();
  if (code === 'OTTAKU10') {
    coupon = { code, discount: 0.1 };
    alert('Cupom de 10% aplicado!');
  } else {
    coupon = { code: '', discount: 0 };
    alert('Cupom inválido.');
  }
  renderCartSidebar();
}

// ==================== INICIALIZAÇÃO GLOBAL ====================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar ícones fixos no cabeçalho/rodapé
  document.getElementById('icon-instagram')?.innerHTML = Icons.instagram;
  document.getElementById('icon-bag')?.innerHTML = Icons.bag;
  document.getElementById('icon-search')?.innerHTML = Icons.search;
  document.getElementById('icon-sliders')?.innerHTML = Icons.sliders;
  document.getElementById('ft-icon-insta')?.innerHTML = Icons.instagram;
  document.getElementById('ft-icon-phone')?.innerHTML = Icons.phone;
  document.getElementById('cb-icon-bag')?.innerHTML = Icons.bag;
  document.getElementById('cb-icon-x')?.innerHTML = Icons.x;
  document.getElementById('current-year').innerText = new Date().getFullYear();

  // Carregar carrinho e atualizar badge
  loadCart();
  updateCartBadge();

  // Determinar qual página está sendo carregada
  const path = window.location.pathname;
  if (path.endsWith('produto.html') || path.includes('/produto')) {
    initProductPage();
  } else if (path.endsWith('checkout.html') || path.includes('/checkout')) {
    initCheckoutPage();
  } else {
    initHomePage();
  }

  // Configurar eventos de clique para abrir/fechar carrinho
  const cartButton = document.querySelector('[onclick="toggleCart(true)"]');
  if (cartButton) cartButton.onclick = () => toggleCart(true);

  const closeCartBtn = document.getElementById('cb-icon-x')?.parentElement;
  if (closeCartBtn) closeCartBtn.onclick = () => toggleCart(false);

  const overlay = document.querySelector('#cart-sidebar > .absolute');
  if (overlay) overlay.onclick = () => toggleCart(false);

  // Configurar scroll do header
  window.addEventListener('scroll', () => {
    const subHeader = document.getElementById('sub-header');
    if (subHeader && path === '/') {
      subHeader.classList.remove('max-h-0', 'opacity-0', 'pointer-events-none');
      subHeader.classList.add('max-h-20', 'opacity-100');
    }
  });
});