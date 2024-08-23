class Customer {
  constructor(
    name,
    surName,
    email,
    contactNumber,
    houseNo,
    street,
    city,
    postalcode,
    purchaseHistory = []
  ) {
    this.name = name;
    this.surName = surName;
    this.email = email;
    this.contactNumber = contactNumber;
    this.houseNo = houseNo;
    this.street = street;
    this.city = city;
    this.postalcode = postalcode;
    this.purchaseHistory = purchaseHistory;
  }
}

export default Customer;
