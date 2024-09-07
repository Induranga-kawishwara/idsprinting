class Categories {
  constructor(
    rawMaterialName,
    size,
    thickness,
    qty,
    supplier,
    buyingPrice,
    addedBy
  ) {
    this.rawMaterialName = rawMaterialName;
    this.size = size;
    this.thickness = thickness;
    this.qty = qty;
    this.supplier = supplier;
    this.buyingPrice = buyingPrice;
    this.addedBy = addedBy;
  }
}

export default Categories;
