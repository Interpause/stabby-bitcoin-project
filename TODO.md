# Project TODO & Progress Tracker

## ✅ Completed
*   **Infrastructure & Tooling**
    *   Set up Next.js 16 with React 19, Tailwind CSS v4, and shadcn/ui.
    *   Configured Orval to generate Vercel SWR SDKs for the CoinGecko API.
    *   Implemented MSW (Mock Service Worker) to intercept CoinGecko requests locally to prevent rate limits, validating mock data using Zod schemas.
    *   Created the Adapter Pattern (`lib/api/` and `lib/types/ui-models.ts`) to cleanly decouple UI components from backend schemas.
    *   Added custom mock data (`lib/mock/missing-data.ts`) for GDP and geographic coordinates.
    *   Applied global Dark Theme and created a sticky top Navbar for route switching.
*   **`/` (Home Page)**
    *   Created intro hero section with navigation cards to the three main dashboards.
*   **`/adoption` (Global Adoption Dashboard)**
    *   Designed the responsive split-viewport layout.
    *   Built the interactive **Sovereign Map** (pannable/zoomable) using `react-simple-maps` with active tooltips.
    *   Created the **U.S. Strategic Reserve Anniversary** KPI metric cards.
    *   Constructed the sortable **Adoption Leaderboard** using `TanStack Table v8`.

---

## 🚧 Pending Tasks & Missing Features

### 1. Global Adoption Dashboard Additions (`/adoption`)
- [ ] **Entity Drill-downs (Modals/Side-Sheets):**
    - [ ] Add `onClick` handlers to both Map markers and Leaderboard rows.
    - [ ] Create a detailed drill-down Modal/Sheet that displays when an entity is clicked.
    - [ ] Implement a **Holding Growth Chart** (using Recharts Stacked Area Chart) inside the drill-down to show historical BTC accumulation over time.

### 2. Macro Implications & Geopolitics Dashboard (`/macro`)
- [ ] Scaffold the `/macro` Next.js route page.
- [ ] **IMF Tensions Timeline/Feed:** A scrollable live-feed or timeline of recent legislative news correlated with sovereign debt yield changes.
- [ ] **Hashrate Distribution Chart:** Visualizing the infrastructure arms race (e.g., U.S. vs. China vs. Rest of World).
- [ ] **Policy Status Matrix:** A detailed table comparing global legislative steps (Legal Tender vs. Strategic Reserve vs. Banned).

### 3. Portfolio Diversification & Correlation Dashboard (`/portfolio`)
- [ ] Scaffold the `/portfolio` Next.js route page.
- [ ] **Normalized Performance Chart:** A multi-line chart (using Recharts) comparing the performance of BTC against Gold, Equities (S&P 500), and Long-duration Treasuries.
- [ ] **Rolling Correlation Heatmap:** Matrix visualization of asset correlations over recent timeframes.
- [ ] **Diversification Simulator:** Interactive sliders allowing the user to seamlessly shift portfolio weightings and see projected changes to risk/return profiles.

### 4. General / Data Backbone
- [ ] Complete the `<MockProvider>` handlers for any remaining CoinGecko endpoints needed by the Recharts visualizations (e.g., pulling historical chart data).
- [ ] Refine the mock data adapter mappings (`lib/api`) for the new dashboards as they are built.
- [ ] (Future) Transition the mock endpoints to real API integrations once suitable providers are found for the missing macro/portfolio data.
