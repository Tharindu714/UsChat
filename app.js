import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    signInAnonymously,
    signOut
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ============================================
// FIREBASE CONFIG
// ============================================

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCpvFLBLW4ToEJE-viEEbHMx21fe5dlncM",
    authDomain: "wife-husband-chat.firebaseapp.com",
    projectId: "wife-husband-chat",
    storageBucket: "wife-husband-chat.firebasestorage.app",
    messagingSenderId: "967037355680",
    appId: "1:967037355680:web:a1c1279ecc12cf9cbf6bc5",
    measurementId: "G-BNLHVXJJ7R"
  };

// ============================================
// INITIALIZE FIREBASE
// ============================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ============================================
// LOGIN CODES
// ============================================

const HUSBAND_CODE = "tharinduCHA@3989MMD";

const WIFE_CODE = "NETHU1229";


// ============================================
// CURRENT USER
// ============================================

let currentUserType = null;

let unsubscribeMessages = null;


// ============================================
// ELEMENTS
// ============================================

const loginScreen =
    document.getElementById("loginScreen");

const chatScreen =
    document.getElementById("chatScreen");

const loginCode =
    document.getElementById("loginCode");

const loginError =
    document.getElementById("loginError");

const messagesContainer =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const chatTitle =
    document.getElementById("chatTitle");


// ============================================
// LOGIN
// ============================================

window.login = async function () {

    const code =
        loginCode.value.trim();

    loginError.textContent = "";


    let userType = null;


    if (code === HUSBAND_CODE) {

        userType = "husband";

    } else if (code === WIFE_CODE) {

        userType = "wife";

    } else {

        loginError.textContent =
            "Invalid login code.";

        return;
    }


    try {

        // Firebase anonymous login

        await signInAnonymously(auth);


        currentUserType = userType;


        // Save locally

        localStorage.setItem(
            "chatUser",
            userType
        );


        // Show chat

        loginScreen.classList.add("hidden");

        chatScreen.classList.remove("hidden");


        chatTitle.textContent =
            userType === "husband"
                ? "❤️ Husband"
                : "❤️ Wife";


        startMessagesListener();


    } catch (error) {

        console.error(error);

        loginError.textContent =
            "Login failed. Please try again.";

    }

};


// ============================================
// START MESSAGE LISTENER
// ============================================

function startMessagesListener() {

    if (unsubscribeMessages) {

        unsubscribeMessages();

    }


    const messagesRef =
        collection(db, "messages");


    const messagesQuery =
        query(
            messagesRef,
            orderBy("createdAt", "asc")
        );


    unsubscribeMessages =
        onSnapshot(
            messagesQuery,
            (snapshot) => {

                messagesContainer.innerHTML = "";


                snapshot.forEach((doc) => {

                    const data = doc.data();

                    displayMessage(data);

                });


                // Auto scroll

                messagesContainer.scrollTop =
                    messagesContainer.scrollHeight;

            },

            (error) => {

                console.error(
                    "Message listener error:",
                    error
                );

            }
        );

}


// ============================================
// DISPLAY MESSAGE
// ============================================

function displayMessage(data) {

    const messageDiv =
        document.createElement("div");


    const isMine =
        data.sender === currentUserType;


    messageDiv.classList.add(
        "message",
        isMine ? "mine" : "theirs"
    );


    const userLabel =
        document.createElement("div");

    userLabel.className =
        "message-user";

    userLabel.textContent =
        data.sender === "husband"
            ? "Husband"
            : "Wife";


    const text =
        document.createElement("div");

    text.textContent =
        data.text;


    const time =
        document.createElement("div");

    time.className =
        "message-time";


    if (data.createdAt) {

        const date =
            data.createdAt.toDate();

        time.textContent =
            date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

    }


    messageDiv.appendChild(userLabel);

    messageDiv.appendChild(text);

    messageDiv.appendChild(time);


    messagesContainer.appendChild(
        messageDiv
    );

}


// ============================================
// SEND MESSAGE
// ============================================

window.sendMessage = async function () {

    const text =
        messageInput.value.trim();


    if (!text) {

        return;

    }


    if (!currentUserType) {

        return;

    }


    try {

        await addDoc(
            collection(db, "messages"),
            {

                text: text,

                sender: currentUserType,

                createdAt:
                    serverTimestamp()

            }
        );


        messageInput.value = "";

        messageInput.focus();


    } catch (error) {

        console.error(
            "Error sending message:",
            error
        );

        alert(
            "Message could not be sent."
        );

    }

};


// ============================================
// ENTER KEY TO SEND
// ============================================

messageInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);


// ============================================
// LOGOUT
// ============================================

window.logout = async function () {

    try {

        if (unsubscribeMessages) {

            unsubscribeMessages();

            unsubscribeMessages = null;

        }


        await signOut(auth);


        currentUserType = null;


        localStorage.removeItem(
            "chatUser"
        );


        chatScreen.classList.add(
            "hidden"
        );

        loginScreen.classList.remove(
            "hidden"
        );


        loginCode.value = "";


    } catch (error) {

        console.error(error);

    }

};


// ============================================
// RESTORE LOGIN
// ============================================

const savedUser =
    localStorage.getItem("chatUser");


if (savedUser === "husband" ||
    savedUser === "wife") {

    currentUserType =
        savedUser;


    signInAnonymously(auth)
        .then(() => {

            loginScreen.classList.add(
                "hidden"
            );

            chatScreen.classList.remove(
                "hidden"
            );


            chatTitle.textContent =
                savedUser === "husband"
                    ? "❤️ Husband"
                    : "❤️ Wife";


            startMessagesListener();

        })
        .catch((error) => {

            console.error(error);

            localStorage.removeItem(
                "chatUser"
            );

        });

}
