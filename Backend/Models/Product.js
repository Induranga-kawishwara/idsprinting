class Product {
  constructor(productID, name, image, colors = []) {
    this.productID = productID;
    this.name = name;
    this.image = image;
    this.colors = colors;
  }
}

export default Product;
