# CoinGecko API Endpoints Summary

## Asset Platforms

### GET /asset_platforms - Asset Platforms List (ID Map)
This endpoint allows you to **query all the asset platforms on CoinGecko**

### GET /token_lists/{asset_platform_id}/all.json - Token Lists by Asset Platform ID
This endpoint allows you to **get full list of tokens of a blockchain network (asset platform) that is supported by [Ethereum token list standard](https://tokenlists.org/)**

## Categories

### GET /coins/categories/list - Coins Categories List (ID Map)
This endpoint allows you to **query all the coins categories on CoinGecko**

### GET /coins/categories - Coins Categories List with Market Data
This endpoint allows you to **query all the coins categories with market data (market cap, volume, ...) on CoinGecko**

## Coins

### GET /coins/list - Coins List (ID Map)
This endpoint allows you to **query all the supported coins on CoinGecko with coins ID, name and symbol**

### GET /coins/markets - Coins List with Market Data
This endpoint allows you to **query all the supported coins with price, market cap, volume and market related data**

### GET /coins/{id} - Coin Data by ID
This endpoint allows you to **query all the metadata (image, websites, socials, description, contract address, etc.) and market data (price, ATH, exchange tickers, etc.) of a coin from the CoinGecko coin page based on a particular coin ID**

### GET /coins/{id}/tickers - Coin Tickers by ID
This endpoint allows you to **query the coin tickers on both centralized exchange (CEX) and decentralized exchange (DEX) based on a particular coin ID**

### GET /coins/{id}/history - Coin Historical Data by ID
This endpoint allows you to **query the historical data (price, market cap, 24hrs volume, ...) at a given date for a coin based on a particular coin ID**

### GET /coins/{id}/market_chart - Coin Historical Chart Data by ID
This endpoint allows you to **get the historical chart data of a coin including time in UNIX, price, market cap and 24hr volume based on particular coin ID**

### GET /coins/{id}/market_chart/range - Coin Historical Chart Data within Time Range by ID
This endpoint allows you to **get the historical chart data of a coin within certain time range in UNIX along with price, market cap and 24hr volume based on particular coin ID**

### GET /coins/{id}/ohlc - Coin OHLC Chart by ID
This endpoint allows you to **get the OHLC chart (Open, High, Low, Close) of a coin based on particular coin ID**

## Contract

### GET /coins/{id}/contract/{contract_address} - Coin Data by Token Address
This endpoint allows you to **query all the metadata (image, websites, socials, description, contract address, etc.) and market data (price, ATH, exchange tickers, etc.) of a coin from the CoinGecko coin page based on an asset platform and a particular token contract address**

### GET /coins/{id}/contract/{contract_address}/market_chart - Coin Historical Chart Data by Token Address
This endpoint allows you to **get the historical chart data including time in UNIX, price, market cap and 24hr volume based on asset platform and particular token contract address**

### GET /coins/{id}/contract/{contract_address}/market_chart/range - Coin Historical Chart Data within Time Range by Token Address
This endpoint allows you to **get the historical chart data within certain time range in UNIX along with price, market cap and 24hr volume based on asset platform and particular token contract address**

## Derivatives

### GET /derivatives - Derivatives Tickers List
This endpoint allows you to **query all the tickers from derivatives exchanges on CoinGecko**

### GET /derivatives/exchanges - Derivatives Exchanges List with Data
This endpoint allows you to **query all the derivatives exchanges with related data (ID, name, open interest, ...) on CoinGecko**

### GET /derivatives/exchanges/{id} - Derivatives Exchange Data by ID
This endpoint allows you to **query the derivatives exchange's related data (ID, name, open interest, ...) based on the exchanges' ID**

### GET /derivatives/exchanges/list - Derivatives Exchanges List (ID Map)
This endpoint allows you to **query all the derivatives exchanges with ID and name on CoinGecko**

## Exchange Rates

### GET /exchange_rates - BTC-to-Currency Exchange Rates
This endpoint allows you to **query BTC exchange rates with other currencies**

## Exchanges

### GET /exchanges - Exchanges List with Data
This endpoint allows you to **query all the supported exchanges with exchanges' data (ID, name, country, ...) that have active trading volumes on CoinGecko**

### GET /exchanges/list - Exchanges List (ID Map)
This endpoint allows you to **query all the exchanges with ID and name**

### GET /exchanges/{id} - Exchange Data by ID
This endpoint allows you to **query exchange's data (name, year established, country, ...), exchange volume in BTC and top 100 tickers based on exchange's ID**

### GET /exchanges/{id}/tickers - Exchange Tickers by ID
This endpoint allows you to **query exchange's tickers based on exchange's ID**

### GET /exchanges/{id}/volume_chart - Exchange Volume Chart by ID
This endpoint allows you to **query the historical volume chart data with time in UNIX and trading volume data in BTC based on exchange's ID**

## Global

### GET /global - Crypto Global Market Data
This endpoint allows you **query cryptocurrency global data including active cryptocurrencies, markets, total crypto market cap and etc**

### GET /global/decentralized_finance_defi - Global DeFi Market Data
This endpoint allows you **query top 100 cryptocurrency global decentralized finance (DeFi) data including DeFi market cap, trading volume**

## NFTs (Beta)

### GET /nfts/list - NFTs List (ID Map)
This endpoint allows you to **query all supported NFTs with ID, contract address, name, asset platform ID and symbol on CoinGecko**

### GET /nfts/{id} - NFTs Collection Data by ID
This endpoint allows you to **query all the NFT data (name, floor price, 24hr volume ...) based on the NFT collection ID**

### GET /nfts/{asset_platform_id}/contract/{contract_address} - NFTs Collection Data by Contract Address
This endpoint allows you to **query all the NFT data (name, floor price, 24hr volume ...) based on the NFT collection contract address and respective asset platform**

## Ping

### GET /ping - Check API server status
This endpoint allows you to **check the API server status**

## Public Treasury

### GET /entities/list - Entities List (ID Map)
This endpoint allows you to **query all the supported entities on CoinGecko with entities ID, name, symbol, and country**

### GET /{entity}/public_treasury/{coin_id} - Crypto Treasury Holdings by Coin ID
This endpoint allows you **query public companies & governments' cryptocurrency holdings** by Coin ID

### GET /public_treasury/{entity_id} - Crypto Treasury Holdings by Entity ID
This endpoint allows you **query public companies & governments' cryptocurrency holdings** by Entity ID

### GET /public_treasury/{entity_id}/{coin_id}/holding_chart - Crypto Treasury Holdings Historical Chart Data by ID
This endpoint allows you to **query historical cryptocurrency holdings chart of public companies & governments** by Entity ID and Coin ID

### GET /public_treasury/{entity_id}/transaction_history - Crypto Treasury Transaction History by Entity ID
This endpoint allows you **query public companies & governments' cryptocurrency transaction history** by Entity ID

## Search

### GET /search - Search Queries
This endpoint allows you to **search for coins, categories and markets listed on CoinGecko**

## Simple

### GET /simple/price - Coin Price by IDs
This endpoint allows you to **query the prices of one or more coins by using their unique Coin API IDs**

### GET /simple/token_price/{id} - Coin Price by Token Addresses
This endpoint allows you to **query one or more token prices using their token contract addresses**

### GET /simple/supported_vs_currencies - Supported Currencies List
This endpoint allows you to **query all the supported currencies on CoinGecko**

## Trending

### GET /search/trending - Trending Search List
This endpoint allows you **query trending search coins, NFTs and categories on CoinGecko in the last 24 hours**

