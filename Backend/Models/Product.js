class Product {
  constructor(productID, test, name, image, details = []) {
    this.productID = productID;
    this.name = name;
    this.image = image;
    this.details = details;
  }
}

export default Product;
