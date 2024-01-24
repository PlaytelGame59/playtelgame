const { getDatabase } = require("firebase-admin/database");
const { initializeApp, cert } = require("firebase-admin/app");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const serviceAccount = require('./service-account.json')

const firebaseConfig = {
  credential: cert(serviceAccount),
  apiKey: "AIzaSyAhYUKc9pTGGZ-LpKtOZ6q-dDy_t5W9un8",
  authDomain: "namoastro-8f2e7.firebaseapp.com",
  databaseURL: "https://namoastro-8f2e7-default-rtdb.firebaseio.com",
  projectId: "namoastro-8f2e7",
  storageBucket: "namoastro-8f2e7.appspot.com",
  messagingSenderId: "1057767146446",
  appId: "1:1057767146446:web:4e81291eda71f8ad72619f",
  measurementId: "G-3Z56X2BZVK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

module.exports = {
  app,
  database,
};
