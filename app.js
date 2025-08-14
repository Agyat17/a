// ==== 1) YOUR FIREBASE CONFIG ====
const firebaseConfig = {
  apiKey: "AIzaSyDmIv4A9Svjj3avbc7yEe7HDAqF5SnoXcg",
  authDomain: "agyat-18639.firebaseapp.com",
  projectId: "agyat-18639",
  storageBucket: "agyat-18639.firebasestorage.app",
  messagingSenderId: "347075947203",
  appId: "1:347075947203:web:2ec5c18e6643c987409076",
  measurementId: "G-MR9JKP6TDP"
};

// ==== 2) INIT FIREBASE ====
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
auth.signInAnonymously().catch(console.error);

// DOM refs
const youMessagesEl = document.getElementById('youMessages');
const friendMessagesEl = document.getElementById('friendMessages');
const youForm = document.getElementById('youForm');
const friendForm = document.getElementById('friendForm');
const youInput = document.getElementById('youInput');
const friendInput = document.getElementById('friendInput');

// XSS-safe text
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}

// Render message
function render(parent, data) {
  const wrap = document.createElement('div');
  wrap.className = 'msg';
  wrap.innerHTML = `
    <div class="text">${escapeHtml(data.text)}</div>
    <div class="meta">${new Date(data.ts).toLocaleString()}</div>
  `;
  parent.appendChild(wrap);

  // Smooth scroll
  parent.scrollTo({ top: parent.scrollHeight, behavior: 'smooth' });

  // Highlight last message
  wrap.classList.add('highlight');
  setTimeout(() => wrap.classList.remove('highlight'), 1500);
}

// ==== 3) REAL-TIME LISTENERS ====
const messagesRef = db.ref('twoBoxChat');

messagesRef
  .orderByChild('ts')
  .limitToLast(200)
  .on('child_added', snap => {
    const msg = snap.val();
    if (!msg || !msg.sender) return;

    if (msg.sender === 'you') render(youMessagesEl, msg);
    else if (msg.sender === 'friend') render(friendMessagesEl, msg);
  });

// ==== 4) SEND HANDLERS ====
youForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = youInput.value.trim();
  if (!text) return;
  messagesRef.push({ sender: 'you', text, ts: Date.now() });
  youInput.value = '';
});

friendForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = friendInput.value.trim();
  if (!text) return;
  messagesRef.push({ sender: 'friend', text, ts: Date.now() });
  friendInput.value = '';
});

// ==== 5) TYPING INDICATOR ====
const typingRef = db.ref('typingStatus');

youInput.addEventListener('input', () => {
  typingRef.child('you').set(youInput.value.length > 0);
});

friendInput.addEventListener('input', () => {
  typingRef.child('friend').set(friendInput.value.length > 0);
});

typingRef.on('value', snap => {
  const status = snap.val() || {};
  youMessagesEl.dataset.typing = status.friend ? "Friend is typing…" : "";
  friendMessagesEl.dataset.typing = status.you ? "You are typing…" : "";
});
