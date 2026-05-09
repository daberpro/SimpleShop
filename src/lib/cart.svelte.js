import { browser } from '$app/environment';

function createCart() {
    let items = $state([]);
    let isOpen = $state(false);

    // Initialize from localStorage if in browser
    if (browser) {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                items = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse cart from localStorage", e);
            }
        }
    }

    function save() {
        if (browser) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }

    return {
        get items() { return items; },
        get isOpen() { return isOpen; },
        set isOpen(value) { isOpen = value; },
        get count() { return items.reduce((acc, item) => acc + item.quantity, 0); },
        get total() { return items.reduce((acc, item) => acc + (item.price * item.quantity), 0); },
        
        toggle() { isOpen = !isOpen; },
        open() { isOpen = true; },
        close() { isOpen = false; },
        
        add(product) {
            const existing = items.find(i => i.id === product.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                items.push({ ...product, quantity: 1 });
            }
            save();
        },
        
        remove(id) {
            const index = items.findIndex(i => i.id === id);
            if (index !== -1) {
                items.splice(index, 1);
                save();
            }
        },
        
        updateQuantity(id, quantity) {
            const item = items.find(i => i.id === id);
            if (item) {
                item.quantity = Math.max(1, quantity);
                save();
            }
        },
        
        clear() {
            items = [];
            save();
        }
    };
}

export const cart = createCart();
