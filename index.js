const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "data.csv");

let data = fs
  .readFileSync(filePath, "utf-8")
  .split("\n")
  .slice(1)
  .filter((line) => line.trim() !== "") 
  .map((line) => {
    const [date, sku, unitPrice, quantity, totalPrice] = line.split(",");
    return {
      date: date.trim(),
      month: date.slice(0, 7), 
      sku: sku.trim(),
      unitPrice: parseFloat(unitPrice),
      quantity: parseInt(quantity, 10),
      totalPrice: parseFloat(totalPrice),
    };
  });

function totalSales(salesData) {
  const totalSalesAmount = salesData.reduce((sum, item) => sum + item.totalPrice, 0);

  const monthWiseSales = salesData.reduce((acc, item) => {
    acc[item.month] = (acc[item.month] || 0) + item.totalPrice;
    return acc;
  }, {});

  const mostPopularItems = {};
  const itemQuantities = salesData.reduce((acc, item) => {
    acc[item.month] = acc[item.month] || {};
    acc[item.month][item.sku] = (acc[item.month][item.sku] || 0) + item.quantity;
    return acc;
  }, {});
  
  for (const month in itemQuantities) {
    const popularItem = Object.keys(itemQuantities[month]).reduce((a, b) =>
      itemQuantities[month][a] > itemQuantities[month][b] ? a : b
    );
    mostPopularItems[month] = popularItem;
  }

  const topRevenueItems = {};
  const itemRevenues = salesData.reduce((acc, item) => {
    acc[item.month] = acc[item.month] || {};
    acc[item.month][item.sku] = (acc[item.month][item.sku] || 0) + item.totalPrice;
    return acc;
  }, {});
  
  for (const month in itemRevenues) {
    const topItem = Object.keys(itemRevenues[month]).reduce((a, b) =>
      itemRevenues[month][a] > itemRevenues[month][b] ? a : b
    );
    topRevenueItems[month] = topItem;
  }

  const ordersStats = {};
  for (const month in mostPopularItems) {
    const popularItem = mostPopularItems[month];
    const quantities = salesData
      .filter((item) => item.month === month && item.sku === popularItem)
      .map((item) => item.quantity);

    ordersStats[month] = {
      min: Math.min(...quantities),
      max: Math.max(...quantities),
      avg: (quantities.reduce((sum, qty) => sum + qty, 0) / quantities.length).toFixed(2),
    };
  }

  return {
    totalSalesAmount,
    monthWiseSales,
    mostPopularItems,
    topRevenueItems,
    ordersStats,
  };
}

const results = totalSales(data);
console.log(results);
