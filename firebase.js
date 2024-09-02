const { initializeApp } = require('firebase/app')
const { getFirestore } = require('firebase/firestore')

const firebaseConfig = {
  apiKey: "AIzaSyDAbhas-bEu5sg22qQ3zt7LtINlfsInnuY",
  authDomain: "dummyims.firebaseapp.com",
  projectId: "dummyims",
  storageBucket: "dummyims.appspot.com",
  messagingSenderId: "196039860313",
  appId: "1:196039860313:web:f71434c58edd2ca6671148"
}

const app = initializeApp(firebaseConfig)
module.exports.db = getFirestore(app)
