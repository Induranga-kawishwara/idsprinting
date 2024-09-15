class Users {
  constructor(
    usID,
    name,
    surName,
    birthDay,
    email,
    nicNumber,
    nicFront,
    nicBack,
    houseNo,
    street,
    city,
    zipCode,
    employeePic,
    contactNum,
    referenceConNum,
    epfNumber,
    etfNUmber,
    sex,
    accessibility = [],
    dateAndTime
  ) {
    this.usID = usID;
    this.name = name;
    this.surName = surName;
    this.birthDay = birthDay;
    this.email = email;
    this.nicNumber = nicNumber;
    this.nicFront = nicFront;
    this.nicBack = nicBack;
    this.houseNo = houseNo;
    this.street = street;
    this.city = city;
    this.zipCode = zipCode;
    this.employeePic = employeePic;
    this.contactNum = contactNum;
    this.referenceConNum = referenceConNum;
    this.epfNumber = epfNumber;
    this.etfNUmber = etfNUmber;
    this.sex = sex;
    this.accessibility = accessibility;
    this.dateAndTime = dateAndTime;
  }
}

export default Users;
