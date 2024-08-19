class Product {
  constructor(productID, name, details = []) {
    this.productID = productID;
    this.name = name;
    this.details = details;
  }
}

export default Product;
