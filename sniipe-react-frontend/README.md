# SNIIPE Frontend — Phase 2

Adds the full product browsing experience on top of the Phase 1 foundation.

---

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## What's New in Phase 2

### Pages
| Route            | Component       | Status |
|------------------|-----------------|--------|
| `/home`          | `Home.jsx`      | ✅     |
| `/product/:id`   | `ProductPage.jsx` | ✅   |

### Components
| Component          | Description                          |
|--------------------|--------------------------------------|
| `ProductCard`      | Grid card with hover image swap      |
| `ProductGrid`      | Responsive grid + loading skeletons  |
| `ProductGallery`   | Main image + thumbnails + zoom       |
| `ColorSelector`    | Clickable color swatches             |
| `SizeSelector`     | Size chips with OOS disabled state   |
| `StockBadge`       | IN STOCK / LOW STOCK / OUT OF STOCK  |

### Hooks
| Hook                | Description                            |
|---------------------|----------------------------------------|
| `useProducts`       | Fetch all, filter, sort, search        |
| `useProductDetail`  | Fetch single product, variant state    |

### Utils
| File              | Description                               |
|-------------------|-------------------------------------------|
| `variantUtils.js` | resolveVariant, getUniqueSizes, etc.      |
| `productApi.js`   | fetchProducts, fetchProductById, normalize|

---

## Variant Resolution Logic

```
resolveVariant(variants, selectedColor, selectedSize)
```

Priority:
1. Exact color + size match
2. Color only (if no size dimension)
3. Size only (if no color dimension)
4. First variant (fallback)

Stock is always read from the *resolved* variant's `.stock` field.

---

## API Integration

Flask endpoints consumed:

```
GET /api/products         → product list
GET /api/products/:id     → single product
```

The `normalizeProduct()` function in `productApi.js` maps the API response
to a consistent internal shape. If the Flask response shape changes, only
this function needs updating.

Expected API response shape:

```json
{
  "id": 1,
  "name": "Classic Hoodie",
  "description": "...",
  "price": 2499,
  "category": "Hoodies",
  "thumbnail": "https://...",
  "is_out_of_stock": false,
  "images": [
    { "image_url": "https://...", "color": "Black" }
  ],
  "variants": [
    { "color": "Black", "size": "M", "stock": 12 },
    { "color": "Black", "size": "L", "stock": 3 },
    { "color": "White", "size": "M", "stock": 0 }
  ]
}
```

---

## Phase Roadmap

| Phase | Scope                                          | Status |
|-------|------------------------------------------------|--------|
| 1     | Foundation, routing, navbar, theme, landing    | ✅     |
| 2     | Product listing, detail, variants, gallery     | ✅     |
| 3     | Cart, checkout, auth, orders, profile          | 🔲     |
