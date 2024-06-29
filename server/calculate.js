const calculate = (shares) => {
  const initialPrice = 0.1;
  const ipoPrice = 0.4;
  const ipoShares = 40;
  const q = Math.pow(ipoPrice / initialPrice, 1 / ipoShares);
  const currentPrice =
    (initialPrice * (Math.pow(q, shares + 1) - Math.pow(q, shares))) / (q - 1);
  console.log(currentPrice);
};

calculate(100);
