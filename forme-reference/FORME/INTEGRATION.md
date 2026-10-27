# Integrating FORME into your website

## 1. Host the supplied frontend

Copy `website/` into your site's `/fitting-room/` folder. All asset paths are relative, so the page works in a subdirectory. No bundler is required.

Files:

| File | Purpose |
| --- | --- |
| index.html | Full landing page, Studio, product editor, and shopping bag |
| styles.css | Responsive layout, brand palette, light/dark themes |
| engine.js | Portable SVG renderer, catalog validator, and outfit logic |
| app.js | Catalog, product editor, state, cart, and integration events |
| products.json | Shared published catalog and brand settings |
| assets/favicon.svg | Editable brand icon |

To embed the full page in another site:

```html
<iframe
  src="/fitting-room/index.html"
  title="Virtual wardrobe"
  style="width:100%;height:1100px;border:0;display:block"
  loading="lazy">
</iframe>
```

This keeps the storefront's CSS isolated from your existing theme. Adjust the iframe height for your layout. Direct `FormeStore` access across an iframe requires the same origin. No cross-origin messaging bridge is included.

If you merge the HTML into your theme instead, scope the CSS to a container to avoid changing the host site's header, footer, and typography. Remove the duplicate document/header/footer wrappers. Do not paste the entire stylesheet unscoped into a production theme.

## 2. Publish your products without a backend

Open Studio, create or edit pieces, and select Export catalog. Replace the deployed products.json with the export. That file is the shared source for visitors. Browser-local edits never change your deployed files.

For the single-file version, replace the embedded `window.FORME_CATALOG` JSON or rebuild it using `tools/package.py` from the source repository. The multi-file version is easier for regular catalog updates.

## 3. Connect your catalog API

Load your trusted product data using your existing storefront credentials and map it into the schema below. The application fires `forme:ready` after its initial catalog load. A developer can place this script after app.js, or call the initializer after checking for an existing FormeStore object:

```js
async function connectCatalog() {
  const response = await fetch('/api/forme-products', {
    credentials: 'same-origin'
  });
  if (!response.ok) throw new Error('Unable to load store products');
  const catalog = await response.json();
  window.FormeStore.setCatalog(catalog); // no local persistence by default
}

if (window.FormeStore) connectCatalog();
else window.addEventListener('forme:ready', connectCatalog, { once: true });
```

Alternatively set `window.FORME_CATALOG` before app.js to provide the initial data. Existing browser-local edits still take precedence on initial load. For a production storefront, remove the local catalog override and load your server catalog directly.

## 4. Connect your existing checkout

```js
function connectCheckout() {
  FormeStore.setCheckoutHandler(async (cart) => {
    // Map FORME product ID + colour + size to your store's real variant ID.
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.items.map(({ id, variant, size, quantity }) => ({
          id, variant, size, quantity
        }))
      })
    });
    if (!response.ok) throw new Error('Checkout unavailable');
    const { checkoutUrl } = await response.json();
    // Validate checkoutUrl against your approved store/payment domains.
    window.location.assign(checkoutUrl);
  });
}

if (window.FormeStore) connectCheckout();
else window.addEventListener('forme:ready', connectCheckout, { once: true });
```

The `/api/forme-products` and `/api/create-checkout` paths above are **integration examples**, not included server endpoints. Create them in your existing backend or replace them with your platform SDK. Recalculate prices and validate stock, size, and variant IDs on the server. The browser-provided price is never authoritative.

Use your Shopify/WooCommerce/custom store's supported cart and checkout API. This bundle does not include platform authentication or a platform-specific theme extension.

## 5. Public JavaScript interface

| Method | Behaviour |
| --- | --- |
| FormeStore.getCatalog() | Copy of the current validated catalog |
| FormeStore.getCart() | Currency, item selections, product snapshots, subtotal |
| FormeStore.getOutfit() | Current mannequin collection and equipped products |
| FormeStore.setCatalog(data, {persist:false}) | Replace in-memory products; optionally persist in this browser |
| FormeStore.tryOn(productId) | Toggle a product on the correct mannequin |
| FormeStore.setPerson('women' / 'men' / 'kids') | Change the active collection |
| FormeStore.setCheckoutHandler(asyncFunction) | Replace Download your look with Continue to checkout |
| FormeStore.clearLocalCatalog() | Remove local catalog overrides and restore the published catalog |

Events dispatched on window:

```js
window.addEventListener('forme:ready', e => console.log(e.detail));
window.addEventListener('forme:outfit-change', e => console.log(e.detail));
window.addEventListener('forme:person-change', e => console.log(e.detail));
window.addEventListener('forme:cart-change', e => console.log(e.detail));
window.addEventListener('forme:catalog-change', e => console.log(e.detail));
```

Events expose snapshots. A developer can listen to catalog changes in an **authenticated admin view** and save them to a server. Do not connect unauthenticated catalog-change events to public write access.

## 6. Catalog schema

```json
{
  "version": 1,
  "theme": {
    "brand": "YOUR BRAND",
    "olive": "#596244",
    "camel": "#b89470"
  },
  "products": [
    {
      "id": "your-store-product-id",
      "name": "The Everyday Knit",
      "person": "women",
      "slot": "top",
      "style": "knit",
      "price": 48,
      "description": "A soft everyday layer.",
      "colors": [
        { "name": "Ecru", "hex": "#ded8c7" },
        { "name": "Olive", "hex": "#6b7354" }
      ]
    }
  ]
}
```

Allowed combinations:

| slot | styles |
| --- | --- |
| top | knit, tee, shirt, custom |
| bottom | trouser, wide, shorts, custom |
| outer | blazer, coat, custom |
| dress | dress, custom |

Collections are women, men, kids. Price is a nonnegative USD number. IDs are unique strings. Catalogs can contain at most 500 products. Built-in products support 1–12 named hex colours.

For custom images, `style` is `custom` and `asset` is required:

```js
asset: {
  src: 'data:image/png;base64,...', // a real encoded PNG, produced by Studio
  x: 100,
  y: 125,
  width: 200,
  height: 200
}
```

The SVG coordinate system is **400 × 700**. Placement coordinates refer to the unscaled mannequin. Head centre is near (200,76), shoulders near y=140, waist near y=285, ankles near y=600. The child mannequin scales the entire coordinate space after laying out the garment, so the same reference system applies. For best results create a separate product/placement for each collection.

Layer order: base mannequin → bottoms → top → dress → outer layer. A dress clears the top/bottom selections; selecting a top or bottom clears a dress. Product colours change vector garments. Uploaded image colours remain fixed; use separate product assets for real colour variants.

Only PNG/WebP data URLs are accepted by the supplied validator. SVG/HTML/script uploads and remote URLs are rejected. If production assets should use CDN URLs, extend the validator with an explicit allowed origin list, set CORS where needed, and use your own upload service. Do not accept arbitrary SVG markup or executable URLs.

## 7. Standalone renderer

The garment engine can be reused without the rest of the page:

```html
<div id="preview"></div>
<script src="engine.js"></script>
<script>
  const product = {
    id: 'tee', name: 'Tee', person: 'men', slot: 'top',
    style: 'tee', price: 25, colors: [{name:'Olive',hex:'#6b7354'}]
  };
  document.getElementById('preview').innerHTML =
    FormeEngine.mannequin('men', [{product,variant:0}]);
</script>
```

Validate untrusted catalog inputs with FormeEngine.validateCatalog before rendering. The renderer escapes text and image URLs, but validation also enforces product structure and image types.

## 8. Production handoff

Keep the storefront UI, renderer, and palette. Connect shared product storage, real product variants, an authenticated admin, and server-side checkout to your existing store. The local demo can remain a convenient catalog authoring tool, but it does not replace those services.
