# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Screenshots and an animated walkthrough of the live demo in the README.
- CodeQL code scanning workflow (JavaScript/TypeScript and Actions) and Dependabot updates for npm, Docker and GitHub Actions.
- Roadmap tracked as GitHub issues under the v0.2.0 milestone.
- This changelog.

## [0.1.0] - 2026-10-25

First public release.

### Added

- Login with a fake, expiry-aware JWT, persisted session and route guards that return to the requested page.
- Dashboard with four KPI cards (30-day deltas), Recharts revenue chart, orders-by-status breakdown and recent orders.
- Orders list with server-style pagination, sorting, debounced search and status filter stored in the URL; order detail modal driven by a status transition map.
- Customers list ranked by lifetime value with Bangladeshi addresses and phone numbers.
- Product CRUD in react-hook-form + zod modals, prices entered in Taka and stored in paisa, server validation errors mapped onto fields.
- Settings page with light/dark/system theme and a validated profile form.
- MSW 2 mock API over a seeded dataset (480 orders, 120 customers, 28 products).
- 42 Vitest + Testing Library tests, ESLint, strict TypeScript, CI on Node 18 and 20, nginx Dockerfile with SPA fallback and `/healthz`.
- Live demo kit: GitHub Pages build, Codespaces dev container and Render blueprint.

### Fixed

- Router basename and MSW worker URL now honour the build base path, so the app works under a GitHub Pages sub-path.

[Unreleased]: https://github.com/AkibUllah/react-admin-dashboard/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/AkibUllah/react-admin-dashboard/releases/tag/v0.1.0
