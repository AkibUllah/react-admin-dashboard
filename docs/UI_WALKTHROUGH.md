# UI walkthrough

What you see when you run `npm run dev` and open http://localhost:5173. No backend is needed; the MSW service worker answers every `/api/*` call from a deterministic in-memory dataset.

## 1. Login

A centred card on a soft green gradient. Email and password are prefilled with the demo admin account (`admin@shopbd.test` / `password123`); two more accounts (`manager@`, `support@`) are listed under the form. Validation runs on submit via zod: an empty email or a password under six characters shows inline red messages under the field. Wrong credentials show the server's "Invalid email or password" banner. A successful login stores a fake JWT in `localStorage` and redirects to the page you originally asked for (route guards remember the `from` location).

## 2. App shell

A 256 px sidebar on the left (Dashboard, Orders, Customers, Products, Settings) with the active item highlighted in brand green. Under 1024 px the sidebar slides off-canvas and a hamburger button in the top bar opens it over a dimmed backdrop. The top bar also holds a sun/moon theme toggle, the signed-in user's initials, name and role, and a sign-out button. Toasts stack in the bottom-right corner and auto-dismiss.

## 3. Dashboard

Four KPI cards (Revenue, Orders, Active customers, Avg. order value) compare the last 30 days to the 30 before, with a green or red trend arrow. Below them a 30-day area chart of daily revenue (Recharts) sits next to an "Orders by status" list with counts for pending, processing, shipped, delivered, cancelled and refunded. A "Recent orders" table lists the six newest orders with a "View all" link. Every block shows a skeleton while loading.

## 4. Orders

A full-width table with server-style pagination (10/20/50 rows), sortable columns (click a header to toggle asc/desc), a debounced search box (order number, customer, city) and a status dropdown. All of that state lives in the URL, so `/orders?status=pending&sort=total&order=desc&page=2` is shareable and the back button works. Clicking a row opens a detail modal with customer, payment method (bKash, Nagad, card, COD), line items, subtotal, shipping and total, plus a "Move to" select that only offers valid next statuses (pending → processing/cancelled, processing → shipped/cancelled, shipped → delivered, delivered → refunded). A successful change toasts and refreshes the list and dashboard.

## 5. Customers

Same table pattern, sorted by lifetime value by default. Each row shows an initials avatar, name and email, phone number in `+8801XXXXXXXXX` format, area and city (Dhaka, Chattogram, Sylhet…), order count, lifetime value in Taka and signup date.

## 6. Products

Catalogue table with English and Bangla names, SKU, category badge, price, a stock badge (red "Out of stock", amber when five or fewer, green otherwise), active/hidden status and last update. "New product" opens a modal form: name, Bangla name, SKU (`ABC-0001` pattern, uppercased), category, price in Taka (stored as paisa), stock and an Active checkbox. Client validation is zod; server validation errors (for example a duplicate SKU) are mapped back onto the same fields. Edit reuses the form; Delete asks for confirmation first.

## 7. Settings

Left: a three-way theme picker (Light / Dark / System) saved per device. Right: a profile form (name, email, phone with BD format validation, store name) and three notification checkboxes. Save is disabled until something changes; Reset restores the loaded values.

## 8. Error handling

Each routed page is wrapped in an error boundary that shows the error message and a "Try again" button; navigating to another page resets it. Failed API calls show an inline red panel with a Retry button rather than a blank page. Unknown URLs render a 404 page inside the shell.
