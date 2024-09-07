class Categories {
  constructor(
    rawMaterialName,
    size,
    thickness,
    qty,
    supplier,
    buyingPrice,
    addedBy,
    dateAndTime
  ) {
    this.rawMaterialName = rawMaterialName;
    this.size = size;
    this.thickness = thickness;
    this.qty = qty;
    this.supplier = supplier;
    this.buyingPrice = buyingPrice;
    this.addedBy = addedBy;
    this.dateAndTime = dateAndTime;
  }
}

export default Categories;
