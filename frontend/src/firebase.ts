import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyARHcPTpQ09ekeN91DtgfrAl8kA3bgrcYM",
  authDomain: "e-notes-nush.firebaseapp.com",
  databaseURL: "https://e-notes-nush.firebaseio.com",
  projectId: "e-notes-nush",
  storageBucket: "e-notes-nush.appspot.com",
  messagingSenderId: "1002111194265",
  appId: "1:1002111194265:web:24a8837e5d910ebcd11408"
};
firebase.initializeApp(firebaseConfig)

// utils
const db = firebase.firestore()
const auth = firebase.auth()

// collection references
const usersCollection = db.collection('users')
const collectionCollection = db.collection('collections')

// export utils/refs
export {
  db,
  auth,
  usersCollection
}
