class Customer {
  constructor(
    surName,
    name,
    email,
    contactNumber,
    HouseNo,
    street,
    city,
    postCode,
    purchaseHistory = []
  ) {
    this.surName = surName;
    this.name = name;
    this.email = email;
    this.contactNumber = contactNumber;
    this.HouseNo = HouseNo;
    this.street = street;
    this.city = city;
    this.postCode = postCode;
    this.purchaseHistory = purchaseHistory;
  }
}

export default Customer;
