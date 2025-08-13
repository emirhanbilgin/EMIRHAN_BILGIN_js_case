(() => {
    // home page kisminda olup olmadigimizi check etme
    if (window.location.pathname !== '/' && window.location.pathname !== '/home') {
        console.log('wrong page');
        return;
    }

    //  carousel HTML olustur
    const html = `
        <div style="margin: 40px 0; padding: 0 20px;">
            <h2 style="text-align: center; font-size: 24px; margin-bottom: 20px;">Beğenebileceğinizi düşündüklerimiz</h2>
            <div style="position: relative; max-width: 1200px; margin: 0 auto;">
                <button id="prevBtn" style="position: absolute; left: -20px; top: 50%; transform: translateY(-50%); background: #ff6b35; border: none; border-radius: 50%; width: 40px; height: 40px; color: white; cursor: pointer; z-index: 10;">←</button>
                <div id="carousel" style="overflow: hidden; border-radius: 8px;">
                    <div id="slide" style="display: flex; gap: 16px; transition: transform 0.3s ease;"></div>
                </div>
                <button id="nextBtn" style="position: absolute; right: -20px; top: 50%; transform: translateY(-50%); background: #ff6b35; border: none; border-radius: 50%; width: 40px; height: 40px; color: white; cursor: pointer; z-index: 10;">→</button>
            </div>
        </div>
    `;

    const target = document.querySelector('.stories') || document.querySelector('main') || document.body;
    target.insertAdjacentHTML('afterend', html);

    // storagedan favorileri al
    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem('ebebek_favorites') || '[]');
        } catch (e) {
            return [];
        }
    }

    // favorileri storage'a kaydetme kismi
    function saveFavorites(favorites) {
        try {
            localStorage.setItem('ebebek_favorites', JSON.stringify(favorites));
        } catch (e) {
            console.log('Could not save favorites');
        }
    }

    // urunleri api'den fetch etme kismi
    async function fetchProducts() {
        try {
            const response = await fetch('https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json');
            const products = await response.json();
            return products;
        } catch (error) {
            console.log('Error fetching products:', error);
            return [];
        }
    }

    // render products
    function renderProducts(products) {
        const slide = document.getElementById('slide');
        const favorites = getFavorites();
        
        const productsHTML = products.map(product => {
            const isFavorite = favorites.includes(product.id);
            const hasDiscount = product.price !== product.original_price;
            const discountPercent = hasDiscount ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;
            
            return `
                <div style="flex: 0 0 calc(20% - 12.8px); background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; cursor: pointer;" data-id="${product.id}">
                    <div style="position: relative; height: 200px; overflow: hidden;">
                        <img src="${product.img}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        
                        <div style="position: absolute; top: 8px; left: 8px; display: flex; flex-direction: column; gap: 4px;">
                            ${hasDiscount ? `<span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; color: white; background: #4caf50;">İNDİRİM</span>` : ''}
                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; color: white; background: #ff6b35;">${product.brand}</span>
                        </div>
                        
                        <button class="favorite-btn" data-id="${product.id}" style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; color: ${isFavorite ? '#ff6b35' : '#ccc'};">
                            ❤️
                        </button>
                    </div>
                    
                    <div style="padding: 16px;">
                        <h3 style="font-size: 14px; font-weight: 500; color: #333; margin: 0 0 8px 0; line-height: 1.4; height: 40px; overflow: hidden;">${product.name}</h3>
                        
                        <div style="margin-bottom: 8px;">
                            ${hasDiscount ? `
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <span style="font-size: 18px; font-weight: 600; color: #333;">${product.price.toLocaleString('tr-TR', {minimumFractionDigits: 2})} TL</span>
                                    <span style="background: #4caf50; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: 600;">%${discountPercent}</span>
                                    <span style="color: #4caf50; font-size: 12px;">↓</span>
                                </div>
                                <div style="text-decoration: line-through; color: #999; font-size: 14px;">${product.original_price.toLocaleString('tr-TR', {minimumFractionDigits: 2})} TL</div>
                            ` : `
                                <div style="font-size: 18px; font-weight: 600; color: #333;">${product.price.toLocaleString('tr-TR', {minimumFractionDigits: 2})} TL</div>
                            `}
                        </div>
                        
                        <div style="font-size: 12px; color: #666; margin-bottom: 12px;">Farklı Ürünlerde 3 Al 2 Öde</div>
                        
                        <button style="width: 100%; background: #f5f5f5; border: none; border-radius: 6px; padding: 12px; font-size: 14px; font-weight: 600; color: #333; cursor: pointer;">Sepete Ekle</button>
                    </div>
                </div>
            `;
        }).join('');
        
        slide.innerHTML = productsHTML;
    }

    // navigation 
    let currentPosition = 0;
    
    document.getElementById('prevBtn').addEventListener('click', () => {
        const slide = document.getElementById('slide');
        const cardWidth = slide.querySelector('div').offsetWidth + 16;
        currentPosition = Math.min(0, currentPosition + cardWidth * 5);
        slide.style.transform = `translateX(${currentPosition}px)`;
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        const slide = document.getElementById('slide');
        const cardWidth = slide.querySelector('div').offsetWidth + 16;
        const maxScroll = -(slide.scrollWidth - slide.offsetWidth);
        currentPosition = Math.max(maxScroll, currentPosition - cardWidth * 5);
        slide.style.transform = `translateX(${currentPosition}px)`;
    });

    // product click
    document.addEventListener('click', (e) => {
        const productCard = e.target.closest('[data-id]');
        if (productCard) {
            const productId = productCard.dataset.id;
            const product = window.productsData?.find(p => p.id == productId);
            if (product?.url) {
                window.open(product.url, '_blank');
            }
        }
    });

    // favori toggle
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('favorite-btn')) {
            e.stopPropagation();
            const productId = parseInt(e.target.dataset.id);
            const favorites = getFavorites();
            const index = favorites.indexOf(productId);
            
            if (index > -1) {
                favorites.splice(index, 1);
                e.target.style.color = '#ccc';
            } else {
                favorites.push(productId);
                e.target.style.color = '#ff6b35';
            }
            
            saveFavorites(favorites);
        }
    });

    // urunleri yukleme ve render etme kismi
    async function init() {
        const products = await fetchProducts();
        if (products.length > 0) {
            window.productsData = products;
            renderProducts(products);
        }
    }

    init();
})(); 