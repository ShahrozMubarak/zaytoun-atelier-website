import * as FormeEngine from '../../../src/engine/formeEngine.js';
import { PRODUCTS, COLOR_PALETTE_INFO, CATEGORIES } from '../../../src/data/products.js';

/**
 * Creates a realistic application context that mirrors App.jsx, FittingRoomPage.jsx,
 * and Mannequin3D.jsx state machines and contracts.
 */
export function createTestContext(initialOverrides = {}) {
  const state = {
    selectedPerson: initialOverrides.selectedPerson || 'women',
    products: initialOverrides.products ? [...initialOverrides.products] : [...PRODUCTS],
    outfits: initialOverrides.outfits ? JSON.parse(JSON.stringify(initialOverrides.outfits)) : {
      women: {
        top: { id: "forme-02", variant: 0 },
        bottom: { id: "forme-03", variant: 0 }
      },
      men: {
        top: { id: "forme-07", variant: 0 },
        bottom: { id: "forme-08", variant: 0 }
      },
      kids: {
        top: { id: "forme-13", variant: 0 },
        bottom: { id: "forme-14", variant: 0 }
      }
    },
    cart: initialOverrides.cart ? JSON.parse(JSON.stringify(initialOverrides.cart)) : [],
    orders: initialOverrides.orders || [],
    theme: 'light',
    themeConfig: {
      brand: "ZAYTOUN",
      olive: "#364634",
      camel: "#C69F6F"
    },
    // Mannequin 3D camera state
    rotY: 25,
    rotX: 3,
    zoom: 1.0,
    autoRotate: false,
    lightingMode: 'studio',
    modelMode: '3d',
    selectedSize: 'M',
    isCartOpen: false,
    isCheckoutOpen: false,
    promoCode: '',
    appliedPromo: null
  };

  const context = {
    state,

    // Demographic selection
    selectPerson(person) {
      if (!FormeEngine.PEOPLE.includes(person)) {
        throw new Error(`Invalid person: ${person}`);
      }
      state.selectedPerson = person;
      if (person === 'kids') {
        state.selectedSize = '6–7';
      } else {
        state.selectedSize = 'M';
      }
    },

    // Camera orbit simulation
    rotate(deltaX, deltaY = 0) {
      const sensitivity = 0.55;
      state.rotY = state.rotY + deltaX * sensitivity;
      const rawRotX = Math.max(-20, Math.min(20, state.rotX + deltaY * (sensitivity * 0.4)));
      state.rotX = Math.round(rawRotX * 100) / 100;
    },

    setPresetAngle(deg) {
      state.autoRotate = false;
      state.rotY = deg;
      state.rotX = 3;
    },

    toggleAutoRotate() {
      state.autoRotate = !state.autoRotate;
    },

    advanceTurntable(dtSeconds = 1) {
      if (state.autoRotate) {
        state.rotY = (state.rotY + dtSeconds * 24) % 360;
      }
    },

    setZoom(newZoom) {
      state.zoom = Math.max(0.75, Math.min(1.35, newZoom));
    },

    resetCamera() {
      state.autoRotate = false;
      state.rotY = 25;
      state.rotX = 3;
      state.zoom = 1.0;
    },

    // Garment Equip / Unequip Logic (matches App.jsx handleToggleEquip & FormeEngine.equip)
    toggleEquip(product, variantIndex = 0, forceRecolor = false) {
      const person = product.person || state.selectedPerson;
      if (person !== state.selectedPerson) {
        state.selectedPerson = person;
      }

      const currentPersonOutfit = state.outfits[person] || {};
      const slot = product.slot;
      const equippedSlot = currentPersonOutfit[slot];
      const isAlreadyEquipped = equippedSlot?.id === product.id;

      if (isAlreadyEquipped) {
        if (forceRecolor || (variantIndex !== undefined && variantIndex !== equippedSlot.variant)) {
          // Recolor without unequipping
          state.outfits[person] = {
            ...currentPersonOutfit,
            [slot]: { id: product.id, variant: variantIndex }
          };
        } else {
          // Unequip item
          const updated = { ...currentPersonOutfit };
          delete updated[slot];
          state.outfits[person] = updated;
        }
      } else {
        // Equip item using FormeEngine replacement rules
        const updated = FormeEngine.equip(currentPersonOutfit, product, variantIndex);
        state.outfits[person] = updated;
      }
    },

    clearOutfit(person = state.selectedPerson) {
      state.outfits[person] = {};
    },

    resetOutfit(person = state.selectedPerson) {
      const defaults = {
        women: { top: { id: "forme-02", variant: 0 }, bottom: { id: "forme-03", variant: 0 } },
        men: { top: { id: "forme-07", variant: 0 }, bottom: { id: "forme-08", variant: 0 } },
        kids: { top: { id: "forme-13", variant: 0 }, bottom: { id: "forme-14", variant: 0 } }
      };
      state.outfits[person] = defaults[person] || {};
    },

    // Outfit builder calculations
    getEquippedItems(person = state.selectedPerson) {
      const personOutfit = state.outfits[person] || {};
      const items = [];
      for (const slot of FormeEngine.SLOTS) {
        const item = personOutfit[slot];
        if (item && item.id) {
          const product = state.products.find(p => p.id === item.id);
          if (product) {
            items.push({
              product,
              variant: item.variant || 0,
              slot
            });
          }
        }
      }
      return items;
    },

    getEnsembleTotal(person = state.selectedPerson) {
      const items = this.getEquippedItems(person);
      return items.reduce((sum, a) => sum + (a.product.price || 0), 0);
    },

    // Mannequin SVG generation
    renderSvg(person = state.selectedPerson) {
      const equipped = this.getEquippedItems(person);
      return FormeEngine.mannequin(person, equipped);
    },

    // "Add Entire Look to Bag" (matches App.jsx handleAddLookToBag)
    addLookToBag(person = state.selectedPerson, size = state.selectedSize) {
      const items = this.getEquippedItems(person);
      if (items.length === 0) return;

      items.forEach(({ product, variant }) => {
        const variantColor = product.colors?.[variant]?.hex || product.color;
        const variantColorName = product.colors?.[variant]?.name || product.colorName;
        
        const existingIdx = state.cart.findIndex(
          c => (c.id === product.id || c.product?.id === product.id) &&
               (c.selectedSize === size || c.size === size) &&
               (c.color === variantColor)
        );

        if (existingIdx >= 0) {
          state.cart[existingIdx].quantity += 1;
        } else {
          // Flat schema compatible with nested support
          state.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            selectedSize: size,
            size: size,
            color: variantColor,
            colorName: variantColorName,
            quantity: 1,
            images: product.images,
            product: product // nested compatibility
          });
        }
      });

      state.isCartOpen = true;
    },

    // Single item cart add
    addToCart(product, size = 'M', variant = 0) {
      const variantColor = product.colors?.[variant]?.hex || product.color;
      const variantColorName = product.colors?.[variant]?.name || product.colorName;
      
      const existing = state.cart.find(
        item => (item.id === product.id || item.product?.id === product.id) &&
                (item.selectedSize === size || item.size === size) &&
                item.color === variantColor
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          selectedSize: size,
          size: size,
          color: variantColor,
          colorName: variantColorName,
          quantity: 1,
          images: product.images,
          product: product
        });
      }
      state.isCartOpen = true;
    },

    updateCartQuantity(itemId, size, color, newQuantity) {
      const idx = state.cart.findIndex(
        item => (item.id === itemId || item.product?.id === itemId) &&
                (item.selectedSize === size || item.size === size) &&
                (!color || item.color === color)
      );
      if (idx >= 0) {
        if (newQuantity <= 0) {
          state.cart.splice(idx, 1);
        } else {
          state.cart[idx].quantity = newQuantity;
        }
      }
    },

    removeCartItem(itemId, size, color) {
      state.cart = state.cart.filter(
        item => !((item.id === itemId || item.product?.id === itemId) &&
                  (item.selectedSize === size || item.size === size) &&
                  (!color || item.color === color))
      );
    },

    applyPromo(code) {
      const clean = String(code || '').trim().toUpperCase();
      if (clean === "EARTH10") {
        state.appliedPromo = { code: "EARTH10", discountPercent: 10 };
        return { success: true, message: "Code EARTH10 applied! (10% Off)" };
      } else if (clean === "WELCOME15") {
        state.appliedPromo = { code: "WELCOME15", discountPercent: 15 };
        return { success: true, message: "Code WELCOME15 applied! (15% Off)" };
      } else if (clean === "FREESHIP") {
        state.appliedPromo = { code: "FREESHIP", freeShipping: true };
        return { success: true, message: "Code FREESHIP applied! (Free Shipping)" };
      } else {
        return { success: false, message: "Invalid code. Try EARTH10 or WELCOME15" };
      }
    },

    getCartPricing() {
      const FREE_SHIPPING_THRESHOLD = 15000;
      const STANDARD_SHIPPING_FEE = 250;

      const subtotal = state.cart.reduce((sum, item) => {
        const price = item.price || item.product?.price || 0;
        return sum + price * (item.quantity || 1);
      }, 0);

      const discountAmount = state.appliedPromo?.discountPercent
        ? Math.round((subtotal * state.appliedPromo.discountPercent) / 100)
        : 0;

      const isShippingFree = subtotal >= FREE_SHIPPING_THRESHOLD || Boolean(state.appliedPromo?.freeShipping);
      const shippingFee = (isShippingFree || state.cart.length === 0) ? 0 : STANDARD_SHIPPING_FEE;
      const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

      return {
        subtotal,
        discountAmount,
        shippingFee,
        finalTotal,
        isShippingFree,
        progressToFreeShipping: Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)),
        remainingForFree: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
      };
    },

    // Order checkout completion
    completeCheckout(orderData) {
      const pricing = this.getCartPricing();
      const orderNumber = `ZC-${Math.floor(100000 + Math.random() * 900000)}`;
      const order = {
        orderNumber,
        customer: orderData.customer,
        paymentMethod: orderData.paymentMethod || 'cod',
        items: [...state.cart],
        pricing,
        createdAt: new Date().toISOString()
      };
      state.orders.push(order);
      state.cart = [];
      state.isCheckoutOpen = false;
      return order;
    }
  };

  return context;
}
