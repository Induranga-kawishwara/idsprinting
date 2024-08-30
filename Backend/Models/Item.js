class Item {
  constructor(
    itemCode,
    itemName,
    stockCategory,
    color,
    qty,
    buyingPrice,
    company,
    wholesale,
    retailPrice
  ) {
    this.itemCode = itemCode;
    this.itemName = itemName;
    this.stockCategory = stockCategory;
    this.color = color;
    this.qty = qty;
    this.buyingPrice = buyingPrice;
    this.company = company;
    this.wholesale = wholesale;
    this.retailPrice = retailPrice;
  }
}

export default Item;
