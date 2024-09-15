import db from "../db.js";
import User from "../Models/Users.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";

const UsersCollection = db.collection("Users");

// Create a new User
export const createUser = async (req, res) => {
  const {
    uID,
    name,
    surName,
    birthDay,
    email,
    nicFront,
    nicBack,
    houseNo,
    street,
    zipCode,
    employeePic,
    contactNum,
    referenceConNum,
    epfNumber,
    etfNUmber,
    sex,
    dateAndTime,
  } = req.body;

  try {
    const user = new User(
      uID,
      name,
      surName,
      birthDay,
      email,
      nicFront,
      nicBack,
      houseNo,
      street,
      zipCode,
      employeePic,
      contactNum,
      referenceConNum,
      epfNumber,
      etfNUmber,
      sex,
      dateAndTime
    );

    const docRef = await UsersCollection.add({ ...user });
    const { uID, ...userWithoutUID } = user;
    const newUser = { id: docRef.id, ...userWithoutUID };
    broadcastCustomerChanges("UserAdded", newUser);

    return res
      .status(201)
      .send({ message: "User created successfully", id: docRef.id });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get all Users
export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await UsersCollection.get();
    const User = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const sortedUser = User.map((user) => ({
      ...user,
      dateAndTime: new Date(user.dateAndTime),
    })).sort((a, b) => b.dateAndTime - a.dateAndTime);
    return res.status(200).send(sortedUser);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get a User by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await UsersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "User not found" });
    }
    return res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Update a User
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    // Check if the customer exists
    const doc = await UsersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    await UsersCollection.doc(id).update(updatedData);

    const updatedUsers = { id, ...updatedData };
    broadcastCustomerChanges("UsersUpdated", updatedUsers);

    return res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

export const updateUserAccessibility = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  try {
    // Check if the user exists
    const userDoc = UsersCollection.doc(id);
    const doc = await userDoc.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve the existing user data
    const { accessibility = [] } = doc.data();

    // Update the accessibility array with new data
    await userDoc.update({ accessibility: [...accessibility, updatedData] });

    // Broadcast the changes (ensure updatedData is properly structured)
    const updatedUser = { id, ...updatedData };
    broadcastCustomerChanges("UserAccessibilityUpdated", updatedUser);

    return res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Delete a User
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const doc = await UsersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    await UsersCollection.doc(id).delete();

    broadcastCustomerChanges("UserDeleted", { id });

    return res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
