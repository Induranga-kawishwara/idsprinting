class Expenses {
  constructor(
    expensesname,
    expensesType,
    description,
    amount,
    paymentMethod,
    invoiceNumber,
    image
  ) {
    this.expensesname = expensesname;
    this.expensesType = expensesType;
    this.description = description;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.invoiceNumber = invoiceNumber;
    this.image = image;
  }
}

export default Expenses;
