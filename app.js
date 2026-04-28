// 🔥 IMPORT FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// 🔐 CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDZUTVFhbATsDmBP0VOr7fmfPByQGqwSIE",
  authDomain: "prenotazioni-cas.firebaseapp.com",
  projectId: "prenotazioni-cas",
  storageBucket: "prenotazioni-cas.firebasestorage.app",
  messagingSenderId: "259543341199",
  appId: "1:259543341199:web:9cbba40dcbc06c713e38fa"
};

// 🚀 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 👑 EMAIL ADMIN
const ADMIN_EMAIL = "admin@email.com";


// =====================================================
// 🔐 LOGIN
// =====================================================
window.login = function () {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Inserisci email e password");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location = "prenotazione.html";
    })
    .catch((error) => {
      if (error.code === "auth/invalid-credential") {
        alert("Email o password non corretti");
      } else {
        alert("Errore: " + error.message);
      }
    });
};


// =====================================================
// 👤 CONTROLLO UTENTE LOGGATO
// =====================================================
onAuthStateChanged(auth, (user) => {

  if (!user) return;

  // Se siamo nella pagina utente
  if (document.getElementById("listaPrenotazioni")) {
    caricaPrenotazioni();
  }

  // Se siamo nella pagina admin
  if (document.getElementById("adminLista")) {

    if (user.email !== ADMIN_EMAIL) {
      alert("Accesso negato");
      window.location = "prenotazione.html";
      return;
    }

    caricaTuttePrenotazioni();
  }
});


// =====================================================
// 📋 PRENOTAZIONI UTENTE
// =====================================================
window.caricaPrenotazioni = async function () {

  const user = auth.currentUser;

  if (!user) return;

  const q = query(
    collection(db, "prenotazioni"),
    where("email", "==", user.email)
  );

  const querySnapshot = await getDocs(q);

  const lista = document.getElementById("listaPrenotazioni");
  lista.innerHTML = "";

  querySnapshot.forEach((docSnap) => {

    const data = docSnap.data();

    const div = document.createElement("div");
    div.innerHTML = `
      <p>${data.nome} - ${data.data}</p>
      <button onclick="eliminaPrenotazione('${docSnap.id}')">
        Cancella
      </button>
      <hr>
    `;

    lista.appendChild(div);
  });
};


// =====================================================
// 👑 DASHBOARD ADMIN
// =====================================================
window.caricaTuttePrenotazioni = async function () {

  const querySnapshot = await getDocs(collection(db, "prenotazioni"));

  const lista = document.getElementById("adminLista");
  lista.innerHTML = "";

  querySnapshot.forEach((docSnap) => {

    const data = docSnap.data();

    const div = document.createElement("div");
    div.innerHTML = `
      <p>
        <strong>${data.nome}</strong><br>
        ${data.email}<br>
        ${data.data}
      </p>
      <button onclick="eliminaPrenotazione('${docSnap.id}')">
        Cancella
      </button>
      <hr>
    `;

    lista.appendChild(div);
  });
};


// =====================================================
// 🗑️ CANCELLAZIONE PRENOTAZIONE
// =====================================================
window.eliminaPrenotazione = async function (id) {

  if (!confirm("Vuoi cancellare questa prenotazione?")) return;

  try {
    await deleteDoc(doc(db, "prenotazioni", id));

    alert("Prenotazione cancellata");

    // refresh automatico
    if (document.getElementById("adminLista")) {
      caricaTuttePrenotazioni();
    } else {
      caricaPrenotazioni();
    }

  } catch (error) {
    alert("Errore: " + error.message);
  }
};