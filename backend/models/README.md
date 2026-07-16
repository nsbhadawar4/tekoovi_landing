# Models (Phase C — MongoDB)

Mongoose schemas will live here once MongoDB is connected, e.g.:

- `project.model.ts`
- `service.model.ts`
- `testimonial.model.ts`
- `faq.model.ts`

Until then, content is stored in `backend/data/content.json` via
`backend/repository/content.repository.ts`. Only that repository file needs to
change to switch the store to MongoDB — the controllers, API routes, admin panel
and landing page stay the same.
