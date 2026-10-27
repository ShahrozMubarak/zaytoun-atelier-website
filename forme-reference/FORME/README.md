# FORME — Interactive fashion storefront

A minimal, responsive storefront in olive, camel, white, and black. Includes women, men, and child mannequins, garment layering, colour choices, a product dashboard, image alignment, a bag, and light/dark mode.

## Open it

- **Fastest:** open `FORME-standalone.html` in a modern browser. No installation or build is needed.
- **Recommended for integration:** serve the `website/` folder. Run `python3 -m http.server 8080 --directory website`, then open `http://localhost:8080`.
- Upload the contents of `website/` to a static host or a subfolder of your existing website.

The source repository uses `dist/` for the same deployable files; the download names it `website/` for clarity.

## Use the storefront

1. Choose **Women**, **Men**, or **Kids** above the mannequin.
2. Select **Build your look**, then click a garment’s **Try it on** button.
3. The mannequin updates and the page returns to the fitting room. Choose a colour swatch to change the garment colour.
4. Tops and bottoms combine; a dress replaces both. Outer layers go over either outfit. Clicking a worn piece removes it.
5. Use **Add look to bag** beside the current outfit, or **Add look** on the mobile fitting room.
6. Open the bag to change quantities and sizes or download your selections.
7. Use the sun/moon button to switch day and night modes.

## Add your clothes

1. Open **Studio → Add a piece**.
2. Enter the product name, collection, category, price, and colour.
3. Choose a built-in garment shape, or upload a front-facing **transparent PNG/WebP cutout**.
4. For an uploaded image, adjust the horizontal/vertical position, width, and height while checking the mannequin preview.
5. Select **Save piece**. The garment immediately appears in that collection in this browser.
6. Select **Export catalog** to download `products.json`.
7. Replace `website/products.json` with the exported file and publish the updated folder. New visitors will now receive your catalog.

Use **Appearance** in the Studio to change the store name and olive/camel accents. Exporting the catalog includes these changes.

## What this version does

- Uses deterministic 2D SVG mannequin and garment layers; no API keys or paid services are required.
- Renders built-in garment colours instantly.
- Lets a garment image be aligned once for its intended mannequin collection.
- Saves demo catalog edits, cart contents, and theme choice in the current browser.
- Includes searchable/filterable/sortable products, edit/delete, validated JSON import/export, and a responsive product editor.
- Exposes `window.FormeStore` and integration events for a developer to connect your existing commerce backend.

## Boundaries

- This is a **styling preview**, not AI image generation, a 3D cloth simulator, body measurement, size recommendation, or a prediction of fabric drape.
- Product photographs do not automatically become wearable cutouts. Prepare a transparent front-facing garment image first, then align it in the Studio. Uploaded images keep their original colours.
- The Studio is a **local catalog editor**, not an authenticated production admin portal. Edits are private to that browser until exported and published, or sent to your own backend.
- Cart data and prices are illustrative. No payments, inventory reservations, orders, customer accounts, or tax/shipping calculations are implemented.
- Keep production product writes and checkout server-side, protected by your existing store authentication. Client-side hiding is not access control.
- Google Fonts is optional; readable system font fallbacks work offline. All core functions and garment assets are included locally.
- Browser storage has a quota. Use optimised images (ideally under 250 KB each); uploads are limited to 2 MB. Larger production catalogs should keep images in your media storage and use an adapted API rather than base64 data.
- Local catalog edits take precedence over the published catalog. In the browser console, run `FormeStore.clearLocalCatalog()` to restore the published version after changing products.json.

See `INTEGRATION.md` for exact hooks, the catalog schema, embedding, and production integration notes.

## Verification

JavaScript syntax, HTML resource/selector consistency, catalog validation, outfit replacement rules, unsafe catalog rejection, and every built-in garment render were checked. The women, men, and kids mannequin renderings were visually inspected. Full browser interaction and responsive screenshot testing were unavailable in the build environment.
