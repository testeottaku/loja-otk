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
window.__otkDb = db;

const DEFAULT_CATEGORIES = ["Todas", "Camisetas", "Action Figures", "Acessórios"];

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

async function loadCatalogFromFirestore() {
  try {
    const catalogRef = doc(db, "config", "catalog");
    const catalogSnap = await getDoc(catalogRef);
    const categories = (catalogSnap.exists() && Array.isArray(catalogSnap.data().categories))
      ? catalogSnap.data().categories
      : DEFAULT_CATEGORIES;

    const animesSnap = await getDocs(collection(db, "animes"));
    const animes = animesSnap.docs
      .map(d => normalizeAnime({ id: d.id, ...d.data() }))
      .filter(a => a.name);

    const orderVal = (x) => (Number.isFinite(Number(x?.order)) ? Number(x.order) : 1e9);
    animes.sort((a,b) => (orderVal(a) - orderVal(b)) || String(a.name).localeCompare(String(b.name), "pt-BR"));

    const productsSnap = await getDocs(collection(db, "products"));
    const products = productsSnap.docs
      .map(d => normalizeProduct({ id: d.id, ...d.data() }))
      .filter(p => p.id);

    window.CATEGORIES = categories;
    window.ANIMES = animes;
    window.PRODUCTS = products;

    window.dispatchEvent(new CustomEvent("catalog-loaded", { detail: { products, animes, categories } }));
  } catch (e) {
    console.error("Falha ao carregar catálogo do Firestore:", e);
    window.dispatchEvent(new CustomEvent("catalog-error", { detail: { error: String(e) } }));
  }
}

var PRODUCTS = window.PRODUCTS || [];
var CATEGORIES = window.CATEGORIES || ["Todas"];
var ANIMES = window.ANIMES || [];

let state = {
  view: 'home',
  cart: [],
  isCartOpen: false,
  isFilterOpen: false,
  filters: { search: '', category: 'Todas', anime: 'Todos', maxPrice: 500 },
  coupon: { code: '', discount: 0 },
  selectedProduct: null,
  productForm: { size: '', color: '', quantity: 1, imageIndex: 0 },
  checkoutForm: { name:'', phone:'', cep:'', address:'', number:'', complement:'', bairro:'', city:'', checkoutState:'' },
  loadingCatalog: true,
  catalogError: '',
  homePage: 1,
  animeScrollLeft: 0 // Novo estado para guardar o scroll dos animes
};

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

const getItemUnitPrice = (item) => {
  return Number(item?.unitPrice ?? item?.price ?? 0);
};
const getDiscountPercent = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

const shouldShowCategory = (cat) => {
  const v = String(cat || '').trim().toLowerCase();
  return v !== 'todos' && v !== 'todas' && v !== '';
};

const sortByNewest = (a, b) => {
  const ta = (a.createdAtMs || 0);
  const tb = (b.createdAtMs || 0);
  return tb - ta;
};

const getLatestProducts = (n) => {
  return [...(PRODUCTS || [])].sort(sortByNewest).slice(0, n);
};

function prevHomePage() {
  state.homePage = Math.max(1, (state.homePage || 1) - 1);
  renderApp(false);
}
function nextHomePage(maxPages) {
  state.homePage = Math.min(maxPages, (state.homePage || 1) + 1);
  renderApp();
}

window.addEventListener("catalog-loaded", (ev) => {
  PRODUCTS = window.PRODUCTS || [];
  CATEGORIES = window.CATEGORIES || ["Todas"];
  ANIMES = window.ANIMES || [];
  state.loadingCatalog = false;
  state.catalogError = '';
  if (typeof window.renderApp === "function") window.renderApp();
});

window.addEventListener("catalog-error", (ev) => {
  state.loadingCatalog = false;
  state.catalogError = (ev && ev.detail && ev.detail.error) ? ev.detail.error : "Erro ao carregar catálogo.";
  if (typeof window.renderApp === "function") window.renderApp();
});

// Inicializar ícones estáticos
function initIcons() {
  const instagramIcons = document.querySelectorAll('#icon-instagram');
  instagramIcons.forEach(el => el.innerHTML = Icons.instagram);

  const bagIcons = document.querySelectorAll('#icon-bag');
  bagIcons.forEach(el => el.innerHTML = Icons.bag);

  const searchIcons = document.querySelectorAll('#icon-search');
  searchIcons.forEach(el => el.innerHTML = Icons.search);

  const slidersIcons = document.querySelectorAll('#icon-sliders');
  slidersIcons.forEach(el => el.innerHTML = Icons.sliders);

  const ftInstaIcons = document.querySelectorAll('#ft-icon-insta');
  ftInstaIcons.forEach(el => el.innerHTML = Icons.instagram);

  const ftPhoneIcons = document.querySelectorAll('#ft-icon-phone');
  ftPhoneIcons.forEach(el => el.innerHTML = Icons.phone);

  const cbBagIcons = document.querySelectorAll('#cb-icon-bag');
  cbBagIcons.forEach(el => el.innerHTML = Icons.bag);

  const cbXIcons = document.querySelectorAll('#cb-icon-x');
  cbXIcons.forEach(el => el.innerHTML = Icons.x);

  const currentYears = document.querySelectorAll('#current-year');
  currentYears.forEach(el => el.innerText = new Date().getFullYear());
}

// Controle de Scroll (mantém a barra de pesquisa fixa)
window.addEventListener('scroll', () => {
  const subHeader = document.getElementById('sub-header');
  if (!subHeader) return;
  // Nunca esconde na home
  if (state.view === 'home') {
    subHeader.classList.remove('max-h-0', 'opacity-0', 'pointer-events-none');
    subHeader.classList.add('max-h-20', 'opacity-100');
  }
});

// Controle do Dropdown de Filtro
function toggleFilter(forceClose = false) {
  state.isFilterOpen = forceClose ? false : !state.isFilterOpen;
  const btn = document.getElementById('filter-btn');
  if (state.isFilterOpen) {
    btn.classList.replace('bg-white/40', 'bg-white/60');
    btn.classList.add('shadow-inner');
  } else {
    btn.classList.replace('bg-white/60', 'bg-white/40');
    btn.classList.remove('shadow-inner');
  }
  renderFilterDropdown();
}

// Fechar filtro ao clicar fora
document.addEventListener("mousedown", (e) => {
  const container = document.getElementById('filter-container');
  if (state.isFilterOpen && container && !container.contains(e.target)) {
    toggleFilter(true);
  }
});

function updateSearch(val) {
  state.filters.search = val;
  renderApp(false);
}

function changeView(view, product = null) {
  if (view === 'home') {
    window.location.href = 'index.html';
  } else if (view === 'product') {
    if (product) {
      window.location.href = `produto.html?id=${product.id}`;
    }
  } else if (view === 'checkout') {
    window.location.href = 'checkout.html';
  }
}

// --- API ViaCEP com Validação ---
async function handleCepInput(el) {
  let cep = el.value.replace(/\D/g, '');
  setFormData('cep', cep);
  
  const errorSpan = document.getElementById('cep-error');
  if(errorSpan) errorSpan.classList.add('hidden');

  if (cep.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      
      if (data.erro) {
        if(errorSpan) errorSpan.classList.remove('hidden');
        document.getElementById('input-address').value = '';
        document.getElementById('input-bairro').value = '';
        document.getElementById('input-city').value = '';
        document.getElementById('input-state').value = '';
        
        setFormData('address', '');
        setFormData('bairro', '');
        setFormData('city', '');
        setFormData('checkoutState', '');
      } else {
        document.getElementById('input-address').value = data.logradouro || '';
        document.getElementById('input-bairro').value = data.bairro || '';
        document.getElementById('input-city').value = data.localidade || '';
        document.getElementById('input-state').value = data.uf || '';
        
        setFormData('address', data.logradouro || '');
        setFormData('bairro', data.bairro || '');
        setFormData('city', data.localidade || '');
        setFormData('checkoutState', data.uf || '');
        
        document.getElementById('input-number').focus();
      }
    } catch(e) { 
      console.error('Erro ao buscar CEP', e); 
      if(errorSpan) {
        errorSpan.innerText = "Erro ao conectar. Verifique sua internet.";
        errorSpan.classList.remove('hidden');
      }
    }
  }
}

// --- RENDER FUNCTIONS ---
function renderApp(preserveScroll = true) {
  const _scrollY = window.scrollY || 0;
  
  // Salva o estado do scroll do container de animes antes de recarregar
  const animeScrollEl = document.getElementById('anime-scroll-container');
  if (animeScrollEl) state.animeScrollLeft = animeScrollEl.scrollLeft;

  const root = document.getElementById('app-root');
  if (state.view === 'home') root.innerHTML = getHomeHTML();
  else if (state.view === 'product') root.innerHTML = getProductHTML();
  else if (state.view === 'checkout') root.innerHTML = getCheckoutHTML();
  
  updateCartUI();
  if(state.view === 'home') setupCarousel();
  
  // Restaura o estado do scroll do container de animes depois de recarregar
  const newAnimeScrollEl = document.getElementById('anime-scroll-container');
  if (newAnimeScrollEl) newAnimeScrollEl.scrollLeft = state.animeScrollLeft;

  if (preserveScroll) {
    requestAnimationFrame(() => {
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo(0, Math.min(_scrollY, maxY));
    });
  }
}
window.renderApp = renderApp;

function renderFilterDropdown() {
  const drop = document.getElementById('filter-dropdown');
  if (!state.isFilterOpen) {
    drop.innerHTML = '';
    return;
  }
  
  let catsHTML = CATEGORIES.map(cat => `
    <button onclick="state.filters.category = '${cat}'; renderFilterDropdown(); renderApp(false);" 
      class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${state.filters.category === cat ? 'bg-brand text-gray-900 shadow-md' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'}">
      ${cat}
    </button>
  `).join('');

  drop.innerHTML = `
    <div class="absolute top-12 right-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-2xl p-5 text-gray-800 animate-slide-in-top z-50">
      <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <h3 class="font-bold flex items-center gap-2 text-gray-900">${Icons.filter} Filtros</h3>
        <button onclick="toggleFilter(true)" class="text-gray-500 hover:text-gray-900">${Icons.x}</button>
      </div>
      <div class="mb-5">
        <label class="text-sm font-bold block mb-2 text-gray-900">Categorias</label>
        <div class="flex flex-wrap gap-2">${catsHTML}</div>
      </div>
      <div>
        <label class="text-sm font-bold flex justify-between mb-2 text-gray-900">
          <span>Preço Máx:</span><span id="max-price-display" class="text-brand drop-shadow-sm">${formatPrice(state.filters.maxPrice)}</span>
        </label>
        <input type="range" min="0" max="500" step="10" value="${state.filters.maxPrice}" 
          oninput="document.getElementById('max-price-display').innerText = formatPrice(Number(this.value));" 
          onchange="state.filters.maxPrice = Number(this.value); renderApp(false);"
          class="w-full accent-brand h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
      </div>
    </div>
  `;
}

function getHomeHTML() {
  if (state.loadingCatalog) {
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
  if (state.catalogError) {
    return `
      <div class="container mx-auto px-4 py-20 text-center">
        <div class="text-red-600 font-black mb-2">Não deu pra carregar a loja</div>
        <div class="text-gray-600 font-bold text-sm break-words">${state.catalogError}</div>
      </div>
    `;
  }

  const isFiltering = state.filters.search !== '' || state.filters.category !== 'Todas' || state.filters.maxPrice !== 500 || state.filters.anime !== 'Todos';
  
  let filtered = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(state.filters.search.toLowerCase());
    const matchesCat = state.filters.category === 'Todas' || p.category === state.filters.category;
    const matchesAnime = state.filters.anime === 'Todos' || p.anime === state.filters.anime;
    const matchesPrice = p.price <= state.filters.maxPrice;
    return matchesSearch && matchesCat && matchesAnime && matchesPrice;
  });

  let html = `<div class="container mx-auto px-4 py-8">`;
  const cProds = getLatestProducts(7);
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
                <div class="w-full flex bg-gray-50 rounded-2xl overflow-hidden pointer-events-auto shadow-sm border border-gray-100" onclick='changeView("product", PRODUCTS.find(x=>x.id==="${p.id}"))'>
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

  let animesHTML = ANIMES.map(a => `
    <button onclick="state.filters.anime='${a.name}'; renderApp(false);" class="flex flex-col items-center gap-2 flex-shrink-0 group">
      <div class="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all shadow-sm ${state.filters.anime === a.name ? 'border-brand scale-105' : 'border-gray-200 group-hover:border-brand'}">
        <img src="${a.image}" class="w-full h-full object-cover" />
      </div>
      <span class="text-xs font-bold transition-colors ${state.filters.anime === a.name ? 'text-brand' : 'text-gray-700'}">${a.name}</span>
    </button>
  `).join('');

  html += `
    <div class="mb-10 mt-2">
      <h2 class="text-lg font-black text-gray-900 mb-4 px-2">Animes / Temas</h2>
      <div id="anime-scroll-container" class="flex gap-4 overflow-x-auto hide-scrollbar px-2 pb-2">
        <button onclick="state.filters.anime='Todos'; renderApp(false);" class="flex flex-col items-center gap-2 flex-shrink-0">
          <div class="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-xs md:text-sm border-2 transition-all shadow-sm ${state.filters.anime === 'Todos' ? 'border-brand bg-brand text-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:border-brand'}">Todos</div>
        </button>
        ${animesHTML}
      </div>
    </div>
  `;

  let titleHTML = isFiltering ? 'Resultados da busca' : 'Nossa Coleção';
  if(state.filters.anime !== 'Todos') titleHTML += `<span class="text-sm font-bold bg-brand/20 text-gray-900 px-3 py-1 rounded-lg ml-2">${state.filters.anime}</span>`;
  
  html += `<section><h2 class="text-xl md:text-2xl font-black text-gray-900 mb-6 px-2 flex items-center gap-2">${titleHTML}</h2>`;

  let gridProducts = filtered;
  let totalPages = 1;
  if (!isFiltering) {
    const homeAll = [...PRODUCTS].filter(p => p.colecaoHome === 'sim').sort(sortByNewest);
    const pageSize = 10;
    totalPages = Math.max(1, Math.ceil(homeAll.length / pageSize));
    state.homePage = Math.min(Math.max(1, state.homePage || 1), totalPages);
    const start = (state.homePage - 1) * pageSize;
    gridProducts = homeAll.slice(start, start + pageSize);
  }

  if(gridProducts.length === 0) {
    html += `
      <div class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div class="flex justify-center mb-4 text-gray-300">${Icons.filter}</div>
        <p class="text-gray-500 text-lg font-bold">Nenhum produto encontrado. :(</p>
        <button onclick="state.filters={search:'',category:'Todas',anime:'Todos',maxPrice:500}; renderApp(false);" class="mt-4 text-brand font-black hover:underline">Limpar filtros</button>
      </div>
    `;
  } else {
    html += `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">`;
    gridProducts.forEach(p => {
      html += `
        <div class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-brand/10 transition-all duration-300 cursor-pointer group flex flex-col transform hover:-translate-y-1" onclick='changeView("product", PRODUCTS.find(x=>x.id==="${p.id}"))'>
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
          ${state.homePage > 1 ? `
            <button onclick="prevHomePage()" class="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 shadow-sm hover:border-brand hover:text-brand transition">Voltar</button>
          ` : ''}

          <div class="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 text-gray-700 shadow-sm">
            Página ${state.homePage} de ${totalPages}
          </div>

          ${state.homePage < totalPages ? `
            <button onclick="nextHomePage(${totalPages})" class="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 shadow-sm hover:border-brand hover:text-brand transition">Próxima</button>
          ` : ''}
        </div>
      `;
    }
  }
  html += `</section></div>`;
  return html;
}

let carouselInterval;
function setupCarousel() {
  const container = document.getElementById('carousel-container');
  const track = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if(!container || !track) return;

  let currentIndex = 0;
  const total = (window.__carouselProducts || getLatestProducts(7)).length;
  let isDragging = false;
  let startX = 0;

  const updateUI = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    if(dotsContainer) {
      Array.from(dotsContainer.children).forEach((dot, i) => {
        dot.className = `h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-brand' : 'w-2 bg-gray-300'}`;
      });
    }
  };

  const next = () => { currentIndex = (currentIndex + 1) % total; updateUI(); };
  const prev = () => { currentIndex = (currentIndex - 1 + total) % total; updateUI(); };

  const startAuto = () => {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => { if(!isDragging) next(); }, 2500);
  };
  startAuto();

  const dragStart = (x) => {
    isDragging = true;
    startX = x;
    container.classList.add('cursor-grabbing');
    container.classList.remove('cursor-grab');
  };
  const dragEnd = (x) => {
    if(!isDragging) return;
    const diff = startX - x;
    if(diff > 50) next();
    else if (diff < -50) prev();
    isDragging = false;
    container.classList.remove('cursor-grabbing');
    container.classList.add('cursor-grab');
    startAuto();
  };

  container.addEventListener('mousedown', e => dragStart(e.pageX));
  container.addEventListener('touchstart', e => dragStart(e.touches[0].clientX));
  window.addEventListener('mouseup', e => { if(isDragging) dragEnd(e.pageX); });
  window.addEventListener('touchend', e => { if(isDragging) dragEnd(e.changedTouches[0].clientX); });
}

function getProductHTML() {
  const p = state.selectedProduct;
  if (!p) return '<div class="container mx-auto px-4 py-20 text-center">Produto não encontrado.</div>';
  const sizes = (Array.isArray(p.sizes) && p.sizes.length > 0) ? p.sizes : [];
  const hasColors = p.colors && p.colors.length > 0;
  const idx = state.productForm.imageIndex;

  let thumbs = '';
  if(p.images.length > 1) {
    thumbs = `<div class="flex gap-2 justify-center w-full overflow-x-auto hide-scrollbar pb-1">`;
    p.images.forEach((img, i) => {
      thumbs += `<button onclick="state.productForm.imageIndex=${i}; renderApp();" class="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${idx === i ? 'border-brand scale-105 shadow-sm' : 'border-gray-200 opacity-70 hover:opacity-100'}"><img src="${img}" class="w-full h-full object-cover"></button>`;
    });
    thumbs += `</div>`;
  }

  let colorsHTML = '';
  if(hasColors) {
    let btns = p.colors.map(c => `<button onclick="state.productForm.color='${c}'; renderApp();" class="px-3 py-1.5 rounded-lg font-black text-xs border-2 transition-all ${state.productForm.color === c ? 'border-brand bg-brand text-gray-900 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-brand'}">${c}</button>`).join('');
    colorsHTML = `<div class="flex-1"><span class="font-bold text-sm text-gray-900 block mb-2">Cor</span><div class="flex gap-2 flex-wrap">${btns}</div></div>`;
  }

  let sizesHTML = '';
  if(p.hasSizes && sizes.length > 0) {
    let btns = sizes.map(s => `<button onclick="state.productForm.size='${s}'; renderApp();" class="w-10 h-10 rounded-lg font-black text-sm border-2 transition-all flex items-center justify-center ${state.productForm.size === s ? 'border-brand bg-brand text-gray-900 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-brand'}">${s}</button>`).join('');
    sizesHTML = `<div class="flex-1"><span class="font-bold text-sm text-gray-900 block mb-2">Tamanho</span><div class="flex gap-2 flex-wrap">${btns}</div></div>`;
  }

  return `
    <div class="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
      <button onclick="changeView('home')" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 font-bold transition text-sm">
        ${Icons.chevronLeft} Voltar
      </button>
      
      <div class="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row mb-6">
        <div class="md:w-5/12 p-4 md:p-6 bg-gray-50 border-r border-gray-100 flex flex-col items-center justify-start gap-4">
          <div class="w-fit max-w-full mx-auto flex items-center justify-center overflow-hidden rounded-2xl shadow-sm border border-gray-200 bg-white">
            <img src="${p.images[idx]}" class="max-w-full w-auto h-auto max-h-[425px] object-contain transition-opacity duration-300">
          </div>
          ${thumbs}
        </div>

        <div class="md:w-7/12 p-5 md:p-8 flex flex-col">
          <div class="text-xs font-black text-brand drop-shadow-sm tracking-widest uppercase mb-1">${p.category} • ${p.anime}</div>
          <h1 class="text-2xl md:text-3xl font-black text-gray-900 mb-5 leading-tight">${p.name}</h1>
          
          <div class="flex items-center gap-3 mb-6">
            <div class="text-3xl md:text-4xl font-black text-gray-900">${formatPrice(getEffectivePrice(p, state.productForm.size))}</div>
            ${p.originalPrice ? `
              <div class="flex flex-col">
                <span class="text-sm text-gray-400 line-through font-bold leading-none">${formatPrice(p.originalPrice)}</span>
                <span class="bg-gray-900 text-brand text-xs font-black px-2 py-0.5 rounded-md mt-1 inline-block text-center shadow-sm">-${getDiscountPercent(getEffectivePrice(p, state.productForm.size), p.originalPrice)}%</span>
              </div>
            ` : ''}
          </div>

          <div class="flex flex-col sm:flex-row gap-5 mb-6">
            ${colorsHTML}
            ${sizesHTML}
          </div>

          <div class="mt-auto pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
            <div class="flex items-center border-2 border-gray-200 bg-white rounded-xl overflow-hidden w-full sm:w-auto h-12">
              <button onclick="state.productForm.quantity = Math.max(1, state.productForm.quantity-1); renderApp();" class="p-3 hover:bg-gray-100 text-gray-600 transition h-full flex items-center justify-center">${Icons.minus}</button>
              <span class="px-4 font-black text-base w-12 text-center text-gray-900">${state.productForm.quantity}</span>
              <button onclick="state.productForm.quantity++; renderApp();" class="p-3 hover:bg-gray-100 text-gray-600 transition h-full flex items-center justify-center">${Icons.plus}</button>
            </div>
            <button onclick="handleAddToCart()" class="w-full sm:flex-grow h-12 bg-brand hover:bg-[#1bc762] text-gray-900 font-black rounded-xl shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm">
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
          ${p.description}
        </div>
      </div>
    </div>
  `;
}

function handleAddToCart() {
  const p = state.selectedProduct;
  const { size, color, quantity } = state.productForm;
  const hasColors = p.colors && p.colors.length > 0;
  
  if (p.hasSizes && !size) { alert('Por favor, selecione um tamanho.'); return; }
  if (hasColors && !color) { alert('Por favor, selecione uma cor.'); return; }

  const unitPrice = getEffectivePrice(p, size);
  
  const existingItemIndex = state.cart.findIndex(
    item => item.id === p.id && item.size === size && item.color === color
  );

  if (existingItemIndex >= 0) {
    state.cart[existingItemIndex].quantity += quantity;
    state.cart[existingItemIndex].unitPrice = unitPrice;
  } else {
    state.cart.push({ ...p, size, color, quantity, unitPrice });
  }
  
  saveCartToLocalStorage();
  toggleCart(true);
  if(state.view === 'checkout') renderApp();
}

function setFormData(field, val) { state.checkoutForm[field] = val; }

function finalizeOrder(e) {
  e.preventDefault();
  if(state.cart.length === 0) { alert("Carrinho vazio!"); return; }
  
  const errorSpan = document.getElementById('cep-error');
  if(errorSpan && !errorSpan.classList.contains('hidden')) {
    alert("Por favor, informe um CEP válido antes de finalizar.");
    return;
  }
  
  const { name, phone, cep, address, number, bairro, complement, city, checkoutState } = state.checkoutForm;

  const enderecoLinha =
    `${address || ''}` +
    `${number ? (', ' + number) : ''}` +
    `${bairro ? (' - ' + bairro) : ''}` +
    `${complement ? (' - ' + complement) : ''}`;

  let msg = `🛍️ *Novo Pedido - OttakuBrasil*\n\n👤 *Meus dados :*\nNome: ${name}\nWhatsApp: ${phone}\n\n📦 *Endereço de Entrega:*\nEndereço: ${enderecoLinha}\nCidade: ${city} - ${checkoutState}\nCEP: ${cep}\n\n🛒 *Produtos:*\n\n`;

  state.cart.forEach((item) => {
    msg += `• ${item.quantity}X: ${item.name}\n• ID: ${item.id}\n• Tam: ${item.size || '—'}\n• Cor: ${item.color || '—'}\n• Quantidade: ${item.quantity}\n• Valor unit.: ${formatPrice(getItemUnitPrice(item))}\n\n`;
  });

  const cartSubtotal = state.cart.reduce((a,i)=>a+(getItemUnitPrice(i)*i.quantity), 0);
  const cartTotal = cartSubtotal - (cartSubtotal * state.coupon.discount);

  if(state.coupon.discount > 0) {
    msg += `🏷️ Cupom: ${state.coupon.code} (-${state.coupon.discount*100}%)\n\n`;
  }

  msg += `💰 *Total produtos: ${formatPrice(cartTotal)}*`;

  window.open(`https://wa.me/5531972379858?text=${encodeURIComponent(msg)}`, '_blank');
}

function getCheckoutHTML() {
  if(state.cart.length === 0) {
    return `
      <div class="container mx-auto px-4 py-20 text-center">
        <div class="flex justify-center text-gray-300 mb-6 scale-150">${Icons.bag}</div>
        <h2 class="text-2xl font-black text-gray-900 mb-4">Seu carrinho está vazio</h2>
        <button onclick="changeView('home')" class="bg-brand text-gray-900 px-6 py-3 rounded-xl font-black hover:bg-[#1bc762] transition shadow-md">Voltar às compras</button>
      </div>
    `;
  }

  let summaryItems = state.cart.map(item => `
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

  const cartSubtotal = state.cart.reduce((a,i)=>a+(getItemUnitPrice(i)*i.quantity), 0);
  const cartTotal = cartSubtotal - (cartSubtotal * state.coupon.discount);

  return `
    <div class="container mx-auto px-4 py-8">
      <button onclick="changeView('home')" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold transition">${Icons.chevronLeft} Voltar</button>
      
      <div class="flex flex-col lg:flex-row gap-8">
        <div class="lg:w-2/3">
          <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-200">
            <h2 class="text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Dados para Entrega</h2>
            <form id="checkout-form" onsubmit="finalizeOrder(event)" class="space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="col-span-1 md:col-span-2">
                  <label class="block text-sm font-bold text-gray-900 mb-1">Nome Completo *</label>
                  <input required type="text" oninput="setFormData('name', this.value)" value="${state.checkoutForm.name}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white transition-all outline-none" placeholder="Ex: Naruto Uzumaki"/>
                </div>
                
                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">WhatsApp / Telefone *</label>
                  <input required type="tel" oninput="setFormData('phone', this.value)" value="${state.checkoutForm.phone}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="(XX) 9XXXX-XXXX"/>
                </div>
                
                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">CEP *</label>
                  <input required type="text" oninput="handleCepInput(this)" maxlength="9" value="${state.checkoutForm.cep}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="00000000"/>
                  <span id="cep-error" class="text-red-500 text-xs font-bold hidden block mt-1">CEP não encontrado ou inválido.</span>
                </div>

                <div class="col-span-1 md:col-span-2">
                  <label class="block text-sm font-bold text-gray-900 mb-1">Endereço (Rua/Avenida) *</label>
                  <input required type="text" id="input-address" oninput="setFormData('address', this.value)" value="${state.checkoutForm.address}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="Rua das Folhas..."/>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">Número *</label>
                  <input required type="text" id="input-number" oninput="setFormData('number', this.value)" value="${state.checkoutForm.number}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="123"/>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">Bairro</label>
                  <input type="text" id="input-bairro" oninput="setFormData('bairro', this.value)" value="${state.checkoutForm.bairro}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="Seu Bairro"/>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">Complemento</label>
                  <input type="text" oninput="setFormData('complement', this.value)" value="${state.checkoutForm.complement}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="Apto..."/>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">Cidade *</label>
                  <input required type="text" id="input-city" oninput="setFormData('city', this.value)" value="${state.checkoutForm.city}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none" placeholder="Sua Cidade"/>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-900 mb-1">Estado (UF) *</label>
                  <input required type="text" id="input-state" oninput="setFormData('checkoutState', this.value)" maxlength="2" value="${state.checkoutForm.checkoutState}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-brand focus:bg-white outline-none uppercase" placeholder="SP, MG..."/>
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
              ${state.coupon.discount > 0 ? `
                <div class="flex justify-between text-sm bg-brand/20 p-2 rounded-lg text-gray-900">
                  <span>Desconto aplicado</span><span class="font-black">-${state.coupon.discount*100}%</span>
                </div>
              ` : ''}
              <div class="flex justify-between font-black text-2xl text-gray-900"><span>Total</span><span>${formatPrice(cartTotal)}</span></div>
              <p class="text-xs text-gray-500 text-center mt-2 font-semibold">* O frete será calculado via WhatsApp.</p>
            </div>
            <button type="submit" form="checkout-form" class="w-full bg-brand hover:bg-[#1bc762] text-gray-900 font-black py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
              ${Icons.phone} Finalizar via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleCart(isOpen) {
  state.isCartOpen = isOpen;
  const sidebar = document.getElementById('cart-sidebar');
  if(isOpen) sidebar.classList.remove('hidden');
  else sidebar.classList.add('hidden');
  updateCartUI();
}

function applyAppCoupon() {
  const code = document.getElementById('coupon-input').value.toUpperCase();
  if(code === 'OTTAKU10') {
    state.coupon = { code, discount: 0.1 };
    alert('Cupom de 10% aplicado!');
  } else {
    state.coupon = { code: '', discount: 0 };
    alert('Cupom inválido.');
  }
  updateCartUI();
  if(state.view === 'checkout') renderApp(); 
}

function updateCartQuantity(index, delta) {
  state.cart[index].quantity += delta;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
  }
  saveCartToLocalStorage();
  updateCartUI();
  if(state.view === 'checkout') renderApp();
}

function updateCartUI() {
  const cartItemsDiv = document.getElementById('cart-items');
  const cartFooterDiv = document.getElementById('cart-footer');
  const badge = document.getElementById('cart-badge');
  
  let totalQtd = state.cart.reduce((a,i)=>a+i.quantity, 0);
  if (badge) {
    badge.innerText = totalQtd;
    if(totalQtd > 0) badge.classList.remove('hidden'); else badge.classList.add('hidden');
  }

  if(state.cart.length === 0) {
    if (cartItemsDiv) cartItemsDiv.innerHTML = `<div class="text-center text-gray-400 mt-10"><div class="flex justify-center mb-3 opacity-50 text-gray-300 scale-150">${Icons.bag}</div>Seu carrinho está vazio. =(</div>`;
    if (cartFooterDiv) cartFooterDiv.innerHTML = '';
    return;
  }

  if (cartItemsDiv) cartItemsDiv.innerHTML = state.cart.map((item, idx) => `
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
            <button onclick="updateCartQuantity(${idx}, -1)" class="p-1 hover:bg-gray-100 text-gray-600 rounded-l-lg">${Icons.minus}</button>
            <span class="px-2 text-sm font-bold text-gray-900">${item.quantity}</span>
            <button onclick="updateCartQuantity(${idx}, 1)" class="p-1 hover:bg-gray-100 text-gray-600 rounded-r-lg">${Icons.plus}</button>
          </div>
          <button onclick="updateCartQuantity(${idx}, -${item.quantity})" class="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-bold transition">${Icons.trash} Remover</button>
        </div>
      </div>
    </div>
  `).join('');

  let subtotal = state.cart.reduce((a,i)=>a+(getItemUnitPrice(i)*i.quantity), 0);
  let total = subtotal - (subtotal * state.coupon.discount);

  if (cartFooterDiv) cartFooterDiv.innerHTML = `
    <div class="mb-4 flex gap-2">
      <input type="text" id="coupon-input" placeholder="Cupom (ex: OTTAKU10)" class="flex-grow p-2.5 border border-gray-300 rounded-xl text-sm uppercase bg-white focus:ring-2 focus:ring-brand outline-none font-bold" value="${state.coupon.code}">
      <button onclick="applyAppCoupon()" class="bg-gray-900 text-brand px-4 py-2.5 rounded-xl text-sm font-black hover:bg-black transition">Aplicar</button>
    </div>
    <div class="space-y-2 mb-5 font-bold">
      <div class="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      ${state.coupon.discount > 0 ? `<div class="flex justify-between text-sm text-green-600 bg-green-50 p-1.5 rounded-lg"><span>Desconto (${state.coupon.discount*100}%)</span><span>-${formatPrice(subtotal*state.coupon.discount)}</span></div>` : ''}
      <div class="flex justify-between font-black text-xl text-gray-900 border-t border-gray-200 pt-3"><span>Total</span><span>${formatPrice(total)}</span></div>
    </div>
    <button onclick="toggleCart(false); changeView('checkout');" class="w-full bg-brand hover:bg-[#1bc762] text-gray-900 font-black py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 text-lg">Finalizar Compra</button>
  `;
}

function saveCartToLocalStorage() {
  localStorage.setItem('otk_cart', JSON.stringify(state.cart));
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('otk_cart');
  if (savedCart) {
    state.cart = JSON.parse(savedCart);
  }
}

// Inicialização da App
function initApp() {
  loadCartFromLocalStorage();
  initIcons();

  // Detectar view baseada na URL
  const path = window.location.pathname;
  if (path.includes('produto.html')) {
    state.view = 'product';
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
      // Esperar catálogo carregar para setar selectedProduct
      window.addEventListener('catalog-loaded', () => {
        state.selectedProduct = PRODUCTS.find(p => p.id === productId);
        state.productForm = { size: '', color: '', quantity: 1, imageIndex: 0 };
        renderApp();
      });
    }