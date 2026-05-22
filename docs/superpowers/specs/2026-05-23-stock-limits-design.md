# Design Document: Stock Limits for Buyer Cart

This document outlines the design to prevent buyers from adding more items to their shopping cart than the actual stock available.

## Requirements

1. **Out of Stock Prevention:** Disable all entry points for adding to cart/buying if stock is 0.
2. **Cart Increment Prevention:** Do not allow buyers to increment the quantity in their cart beyond the product's available stock.
3. **Cart Validation on Load:** If stock is reduced below the cart item quantity, display a warning message and disable checkout until the user reduces the quantity.
4. **Live Stock Verification:** Verify live stock from the database before adding to cart/buying to prevent race conditions.

## Proposed Changes

### 1. Product Card (`src/components/ProductCard.jsx`)
* Disable the "Add to Cart" button if `product.stock_quantity === 0` and display "Out of Stock".
* Inside `handleAddToCart`, perform a live query of the product's `stock_quantity` and the user's existing cart quantity. If `existing_qty + 1 > latest_stock`, alert the user and abort.

### 2. Product Details (`src/app/(customer)/product/[id]/page.js`)
* Disable "Add to Cart" and "Buy Now" buttons if `product.stock_quantity === 0`.
* Inside `handleAddToCart`, query the live `stock_quantity` and existing cart item quantity. Alert the user and abort if `existing_qty + 1 > latest_stock`.

### 3. Cart Page (`src/app/(customer)/cart/page.js`)
* Include `stock_quantity` in the products select query.
* Disable the `+` button if `item.quantity >= item.product.stock_quantity`.
* If `item.quantity > item.product.stock_quantity`, show a warning under the item: "Only X left in stock. Please reduce quantity."
* Disable the "Checkout" button if any item has `quantity > stock_quantity`.
* Block `updateQuantity` if `newQty > stock_quantity`.

## Verification Plan

### Manual Verification
1. Create a product with 5 stock.
2. Verify that on the home page and product details page, adding more than 5 items shows the alert message.
3. Verify that on the cart page, clicking `+` past 5 is disabled, and manual triggers are blocked.
4. Reduce stock to 3 while the user has 5 in their cart. Verify that the cart displays a warning and disables the Checkout button.
