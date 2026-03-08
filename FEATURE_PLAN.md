# Feature Plan & Data Requirements

This document outlines an expansive set of features for the Bitcoin Global Adoption Dashboard to comprehensively meet (and exceed) the assignment requirements. 

## 1. Real-Time Tracker of Nation-State & Central Bank Adoption
**Requirement addresed:** "Build a real-time tracker of nation-state and central bank Bitcoin adoption with holdings, policy status, and reserve allocation as a percentage of GDP."

* **Features:**
  * **Global Map Visualization (Choropleth):** Visualizes the world and U.S. states by total BTC holdings and policy status (e.g., Legal Tender, Strategic Reserve, Banned).
  * **Adoption Leaderboard / Data Table:** A ranked list of entities showing: Entity Name, Total BTC Holdings, Current USD Value, **Reserve Allocation as % of GDP**, and Current Policy Status.
  * **Reserve Allocation vs. GDP Scatter Plot:** An interactive scatter plot comparing a nation/state's GDP against its Bitcoin allocation percentage to visualize which entities are aggressively adopting relative to their size.
  * **U.S. Strategic Reserve Anniversary Dashboard:** Specific KPI cards detailing the U.S. Federal Government and individual U.S. states' holdings 1 year after the "landmark U.S. Strategic Bitcoin Reserve" (Profit/Loss, accumulated BTC over the last year).
  * **Holding Growth Chart:** A stacked area chart showing cumulative growth of public treasury BTC holdings over time.
* **Data Requirements:**
  * **Entity Name & General Info:** CoinGecko (`GET /entities/list`)
  * **BTC Holdings by Entity:** CoinGecko (`GET /public_treasury/{entity_id}`)
  * **Historical Holdings by Entity:** CoinGecko (`GET /public_treasury/{entity_id}/{coin_id}/holding_chart`)
  * **Current BTC Price (for USD valuation):** CoinGecko (`GET /simple/price`)
  * **National / State GDP:** *Missing*
  * **Policy Status (Legal Tender, Reserve, etc.):** *Missing* (Requires mapping data for El Salvador, UAE, US Federal/States)

## 2. Macro Implications, IMF Tensions, & Geopolitics
**Requirement addresed:** "Assess macro implications, IMF tensions... Can Bitcoin affect the geopolitical monetary game between the U.S. and China?"

* **Features:**
  * **IMF Tensions & Sovereign Debt Tracker:** A timeline/feed of IMF statements regarding Bitcoin adoption (e.g., El Salvador) mapped against changes in the nation's sovereign credit rating or bond yields.
  * **Geopolitical Network Dominance (US vs. China):** A visualization (pie/bar/map) showing the geographical distribution of Bitcoin mining hashrate, illustrating the infrastructure "arms race" between the U.S. and China.
  * **Policy Status Matrix:** A detailed deep-dive matrix comparing specific legislative steps taken by key players (El Salvador, UAE, U.S. Federal, U.S. states).
* **Data Requirements:**
  * **News & Sentiment Data (IMF Tensions):** *Missing*
  * **Sovereign Credit Ratings / Bond Yields:** *Missing*
  * **Bitcoin Hashrate / Mining Distribution by Country:** *Missing*

## 3. Portfolio Diversification & Correlation Dynamics
**Requirement addresed:** "portfolio diversification arguments. Analyze correlation dynamics with gold, long-duration Treasuries, and equities."

* **Features:**
  * **Normalized Performance Chart:** Compares the 1-year, 5-year, and 10-year growth of Bitcoin against Gold (XAU), Long-duration Treasuries (e.g., TLT), and Equities (e.g., S&P 500).
  * **Rolling Correlation Heatmap:** Matrix showing how BTC correlates with Gold, Treasuries, and Equities over 30-day and 90-day intervals.
  * **Diversification Simulator (Efficient Frontier):** An interactive tool demonstrating how adding a 1%, 3%, or 5% BTC allocation to a traditional 60/40 national reserve portfolio shifts the risk/return profile (Sharpe Ratio impact).
* **Data Requirements:**
  * **BTC Historical Prices:** CoinGecko (`GET /coins/bitcoin/market_chart` or `GET /coins/bitcoin/history`)
  * **Historical Prices for Gold (XAU):** *Missing*
  * **Historical Prices for Long-duration Treasuries (TLT):** *Missing*
  * **Historical Prices for Equities (S&P 500):** *Missing*

---

## Summary of External APIs Needed

To fully build out these expansive capabilities, we will need to research and integrate additional APIs for the missing datasets:

1. **Macroeconomic Data APIs (for GDP & Sovereign Debt)**
   * **Required for:** Reserve allocation as a percentage of GDP, sovereign credit rating tracking.
   * **Potential Sources:** World Bank API, IMF Data API, or FRED (Federal Reserve Economic Data).

2. **Traditional Finance (TradFi) APIs (for Asset Prices)**
   * **Required for:** Correlation dynamics and portfolio diversification (Gold, Treasuries, Equities).
   * **Potential Sources:** Yahoo Finance API (`yfinance` or RapidAPI), Alpha Vantage, or FRED.

3. **Bitcoin Network Data APIs (for Hashrate/Mining)**
   * **Required for:** Geopolitical monetary game (US vs. China mining dominance).
   * **Potential Sources:** Cambridge Bitcoin Electricity Consumption Index (CBECI) data exports, Glassnode API, or CryptoQuant.

4. **News, Policy, and Sentiment APIs (for IMF / Geopolitics)**
   * **Required for:** IMF tensions, narrative timelines, and localized policy status.
   * **Potential Sources:** NewsAPI, GDELT, TradingEconomics, or a curated JSON config if real-time APIs lack specific policy nuance.
