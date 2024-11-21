function generateRandomTicker() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let ticker = '';
  for (let i = 0; i < 4; i++) {
    ticker += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return ticker;
}

function generateDummyDataForTicker(ticker, numDays = 365) {
  const data = [];
  let currentDate = new Date();
  let currentPrice = 100;

  for (let i = 0; i < numDays; i++) {
    const open = currentPrice;
    const close = open + (Math.random() - 0.5) * 10;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    const volume = Math.floor(Math.random() * 10000);
    const priceChange = ((close - open) / open) * 100;

    data.push({
      date: currentDate.toISOString().split('T')[0],
      open: open.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2),
      close: close.toFixed(2),
      volume: volume,
      priceChange: priceChange.toFixed(2)
    });

    currentDate.setDate(currentDate.getDate() - 1);
    currentPrice = close;
  }

  return { ticker, data };
}

export function generateDummyData(numTickers = 100, numDays = 365) {
  const tickers = [];
  for (let i = 0; i < numTickers; i++) {
    const ticker = generateRandomTicker();
    tickers.push(generateDummyDataForTicker(ticker, numDays));
  }
  return tickers;
}