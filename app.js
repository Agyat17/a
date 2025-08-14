// ==== Firebase Config ====
const firebaseConfig = {
  apiKey: "AIzaSyDmIv4A9Svjj3avbc7yEe7HDAqF5SnoXcg",
  authDomain: "agyat-18639.firebaseapp.com",
  projectId: "agyat-18639",
  storageBucket: "agyat-18639.firebasestorage.app",
  messagingSenderId: "347075947203",
  appId: "1:347075947203:web:2ec5c18e6643c987409076",
  measurementId: "G-MR9JKP6TDP"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Anonymous login
auth.signInAnonymously().catch(console.error);

// DOM references
const youMessagesEl = document.getElementById('youMessages');
const friendMessagesEl = document.getElementById('friendMessages');
const friendForm = document.getElementById('friendForm');
const friendInput = document.getElementById('friendInput');

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c]));
}

function render(parent, data) {
  const wrap = document.createElement('div');
  wrap.className = 'msg';
  wrap.innerHTML = `
    <div class="text">${escapeHtml(data.text)}</div>
    <div class="meta">${new Date(data.ts).toLocaleString()}</div>
  `;
  parent.appendChild(wrap);
  parent.scrollTo({ top: parent.scrollHeight, behavior: 'smooth' });
  wrap.classList.add('highlight');
  setTimeout(() => wrap.classList.remove('highlight'), 1500);
}

// Realtime messages
const messagesRef = db.ref('twoBoxChat');
messagesRef.orderByChild('ts').limitToLast(200).on('child_added', snap => {
  const msg = snap.val();
  if (!msg || !msg.sender) return;
  if (msg.sender === 'you') render(youMessagesEl, msg);
  else if (msg.sender === 'friend') render(friendMessagesEl, msg);
});

// Friend send handler
friendForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = friendInput.value.trim();
  if (!text) return;
  messagesRef.push({ sender: 'friend', text, ts: Date.now() });
  friendInput.value = '';
});

// Typing indicator
const typingRef = db.ref('typingStatus');
friendInput.addEventListener('input', () => typingRef.child('friend').set(friendInput.value.length > 0));

typingRef.on('value', snap => {
  const status = snap.val() || {};
  youMessagesEl.dataset.typing = status.friend ? "Friend is typing…" : "";
  friendMessagesEl.dataset.typing = "";
});
