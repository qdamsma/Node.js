# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Production — node app.js
npm run start:dev  # Development — nodemon app.js (auto-restart on changes)
npm run sass       # Watch SCSS → public/css (run alongside start:dev)
```

No test suite is configured.

## Environment variables

Create a `.env` file in the project root with:

```
MONGO_URI=          # MongoDB connection string (must support TLS)
STRIPE_SECRET_KEY=  # Stripe secret key
STRIPE_PUBLISHABLE_KEY=  # Stripe publishable key
MAIL_KEY=           # SendGrid API key
PORT=               # Optional, defaults to 3000
```

## Architecture

Classic MVC Express app. Request flow: `app.js` → `routes/` → `controllers/` → `models/`.

### Route groups
- `/admin/*` — product management (add, edit, delete), all protected by `isAuth`
- `/` — shop (index, product list, product detail, cart, checkout, orders, invoice)
- `/login`, `/signup`, `/logout`, `/reset`, `/reset/:token`, `/new-password` — auth

### Authentication & session
Session state lives in MongoDB (`sessions` collection via `connect-mongodb-session`). On each request, `app.js` reads `req.session.user` (stored as a string ID) and populates `req.user` with the full Mongoose User document. Protected routes use `middleware/is-auth.js` which checks `req.session.isLoggedIn`.

### CSRF
`csrf-sync` reads the token from either the `csrf-token` header or `_csrf` body field. The token is generated per-request and injected into `res.locals.csrfToken` — every form must include it.

### Models
- **User** — embedded `cart.items[]` array with `productId` refs and `quantity`. Cart logic (`addToCart`, `removeFromCart`, `clearCart`) lives as instance methods on the schema.
- **Product** — title, price, description, imageUrl, userId (owner ref).
- **Order** — stores a snapshot of `productData` (plain object, not a ref) so orders survive product edits/deletes. Linked to a user via `user.userId`.

### File uploads
Multer stores uploaded images in `/images/` with an ISO-timestamp prefix. Only PNG/JPG/JPEG are accepted. The `imageUrl` field on Product stores the relative path `images/<filename>`.

When deleting a product, call `util/file.js deleteFile(imageUrl)` to clean up the file on disk. It skips deletion if the path starts with `http`.

### PDF invoices
`controllers/shop.js getInvoice` generates invoices on-the-fly with PDFKit, streams to both the response and `/data/invoices/invoice-<orderId>.pdf`. Authorization is enforced by comparing `order.user.userId` to `req.user._id`.

### Stripe checkout
`getCheckout` creates a Stripe Checkout Session and passes the session ID and publishable key to the `shop/checkout` view. On success, Stripe redirects to `/checkout/success` which creates the Order and clears the cart.

### Pagination
`ITEMS_PER_PAGE` constant in `controllers/shop.js` (currently `2`) controls page size. Pagination data (`currentPage`, `hasNextPage`, etc.) is passed to views that list products.

### Email
SendGrid (`@sendgrid/mail`) is used for signup confirmation and password reset emails. The from address is hardcoded to `shop@gmail.com` — update this before deploying.

### Error handling
Controllers pass errors to `next(error)`. Set `error.httpStatusCode = 500` before calling `next()` to signal a 500. The global error handler in `app.js` renders the `500` view. The 404 handler is `controllers/error.get404`.

### Views & styles
EJS templates live in `views/`. SCSS source is in `scss/`, compiled output goes to `public/css/`. Run `npm run sass` to watch and compile during development.
