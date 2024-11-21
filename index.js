const fs = require("fs");

const filePath = "./data.csv";
const rawData = fs.readFileSync(filePath, "utf-8");
const rows = rawData
  .trim()
  .split("\n")
  .slice(1)
  .map((row) => {
    const [date, sku, unitPrice, quantity, totalPrice] = row
      .replace(/"/g, "")
      .split(",");
    return {
      date: date.slice(0, 7),
      sku,
      unitPrice: +unitPrice,
      quantity: +quantity,
      totalPrice: +totalPrice,
    };
  });

const totalSales = rows.reduce((sum, row) => sum + row.totalPrice, 0);

const monthSales = rows.reduce((acc, row) => {
  acc[row.date] = (acc[row.date] || 0) + row.totalPrice;
  return acc;
}, {});

const mostPopularItem = rows.reduce((acc, row) => {
  acc[row.date] = acc[row.date] || {};
  acc[row.date][row.sku] = (acc[row.date][row.sku] || 0) + row.quantity;
  return acc;
}, {});

const popularItems = Object.entries(mostPopularItem).reduce(
  (acc, [month, items]) => {
    const mostPopular = Object.keys(items).reduce((a, b) =>
      items[a] > items[b] ? a : b
    );
    acc[month] = { item: mostPopular, quantity: items[mostPopular] };
    return acc;
  },
  {}
);

const revenueItems = rows.reduce((acc, row) => {
  acc[row.date] = acc[row.date] || {};
  acc[row.date][row.sku] = (acc[row.date][row.sku] || 0) + row.totalPrice;
  return acc;
}, {});

const topRevenueItems = Object.entries(revenueItems).reduce(
  (acc, [month, items]) => {
    const topItem = Object.keys(items).reduce((a, b) =>
      items[a] > items[b] ? a : b
    );
    acc[month] = { item: topItem, revenue: items[topItem] };
    return acc;
  },
  {}
);

const minMaxAvgOrders = Object.entries(popularItems).reduce(
  (acc, [month, { item }]) => {
    const quantities = rows
      .filter((row) => row.date === month && row.sku === item)
      .map((row) => row.quantity);
    acc[month] = {
      item,
      min: Math.min(...quantities),
      max: Math.max(...quantities),
      avg: (quantities.reduce((a, b) => a + b, 0) / quantities.length).toFixed(
        2
      ),
    };
    return acc;
  },
  {}
);

console.log("Total Sales:", totalSales);
console.log("Month-wise Sales Totals:", monthSales);
console.log("Most Popular Item Each Month:", popularItems);
console.log("Items Generating Most Revenue Each Month:", topRevenueItems);
console.log("Min, Max, and Avg Orders for Most Popular Item:", minMaxAvgOrders);
