class Expenses {
  constructor(
    expensesname,
    expensesType,
    description,
    amount,
    pymentMethod,
    invoiceNumber,
    Image
  ) {
    this.expensesname = expensesname;
    this.expensesType = expensesType;
    this.description = description;
    this.amount = amount;
    this.pymentMethod = pymentMethod;
    this.invoiceNumber = invoiceNumber;
    this.Image = Image;
  }
}

export default Expenses;
