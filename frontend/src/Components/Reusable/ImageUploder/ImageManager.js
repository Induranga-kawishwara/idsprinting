import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getStorage,
} from "firebase/storage";
import { storage } from "../../../config/firebaseConfig.js"; // Import from the correct path

function isFirebaseURL(url) {
  return url.startsWith("https://firebasestorage.googleapis.com/");
}

export const ImageUploader = async (name, date, collectionName, file) => {
  if (!file) return null;

  // Check if the file is already a Firebase URL
  if (typeof file === "string" && isFirebaseURL(file)) {
    console.log("File is already a Firebase URL:", file);
    return file;
  }

  // Create a reference to the file location in Firebase Storage
  const storageRef = ref(storage, `${collectionName}/${name + "+" + date}`);

  try {
    // Upload the file to Firebase Storage
    await uploadBytes(storageRef, file);
    console.log("Image uploaded successfully!");

    // Get the download URL of the uploaded file
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const deleteImage = async (imageURL) => {
  try {
    if (!imageURL) return;

    const storage = getStorage();
    const storageRef = ref(storage, imageURL);
    await deleteObject(storageRef);
    console.log("Image deleted successfully.");
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
