# Models — Mongoose schemas

MongoDB is connected. Two schemas live here:

- `content.model.ts` — the single landing-content document
  (`{ key: "landing", data: {...all sections...} }`, collection `content`).
- `media.model.ts` — uploaded images as their own documents
  (`{ contentType, data }`, collection `media`), served via `/api/media/<id>`.

The store is chosen at runtime in `backend/repository/`: MongoDB when
`MONGODB_URI` is set, otherwise the local `backend/data/content.json` file. Only
the repository layer knows which — controllers, API routes, admin, and the
landing page are unaware.

There is intentionally **no** per-section model (`project.model.ts`, etc.). All
sections are fields of the one content document; the whole page is read in a
single round trip. See the root `README.md` (Content & data model) for why.
