class Product {
  constructor(
    productID,
    name,
    details = [
      [
        stock,
        stokePrice,
        otherExpenses,
        totalExpenses,
        expectedProfict,
        oneIteamSellingPrice,
        revenue,
        netProfit,
      ],
    ]
  ) {
    this.productID = productID;
    this.name = name;
    this.details = details;
  }
}

export default Customer;
