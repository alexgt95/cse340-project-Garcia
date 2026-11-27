import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./src/controllers/routes.js";
import { notFound, errorHandler } from "./src/middleware/errors.js";
import { setupDatabase } from "./src/models/setup.js";
import db from "./src/models/db.js";
import { addCurrentUser, flash } from "./src/middleware/locals.js";

// In ES Modules __dirname does not exist; we rebuild it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || "production";
const PORT = process.env.PORT || 3000;

const app = express();

// Render sits behind a proxy; without this, secure cookies are never sent in production
if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// EJS renders the templates in src/views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// CSS, images and browser JS are served as-is from public/
app.use(express.static(path.join(__dirname, "public")));

// Reads HTML form submissions into req.body
app.use(express.urlencoded({ extended: true }));

// Sessions remember who is logged in between requests. The data lives in PostgreSQL
// (table "session", created automatically); the browser only keeps a signed cookie with the id.
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({ pool: db, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false, // don't save sessions that didn't change
    saveUninitialized: false, // no cookie until there is something to remember
    cookie: {
      httpOnly: true, // browser JavaScript can't read the cookie
      secure: NODE_ENV === "production", // HTTPS only on Render
      sameSite: "lax", // not sent on forms posted from other sites
      maxAge: 1000 * 60 * 60 * 24, // 1 day, in milliseconds
    },
  }),
);

// currentUser and flash messages for every view (they need the session above)
app.use(addCurrentUser);
app.use(flash);

// Every page route lives in src/controllers/routes.js
app.use("/", routes);

// Error handling always goes last
app.use(notFound);
app.use(errorHandler);

// Create missing tables (and sample data) before accepting visitors
await setupDatabase();

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT} (${NODE_ENV})`);
});
