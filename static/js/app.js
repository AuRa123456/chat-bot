const chat = document.getElementById('chat');
const form = document.getElementById('composer');
const input = document.getElementById('input');

function el(tag, cls, text){
  const n = document.createElement(tag);
  if(cls) n.className = cls;
  if(text) n.textContent = text;
  return n;
}

function addMessage(role, content){
  const msg = el('div', `msg ${role}`);
  const avatar = el('div', 'avatar');
  avatar.textContent = role === 'user' ? '🧑' : '🤖';
  const bubble = el('div', 'bubble');
  bubble.textContent = content;

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}

function addTyping(){
  const msg = el('div', 'msg bot');
  const avatar = el('div', 'avatar');
  avatar.textContent = '🤖';
  const bubble = el('div', 'bubble');
  const wrap = el('div', 'typing');
  wrap.appendChild(el('div','dotty'));
  wrap.appendChild(el('div','dotty'));
  wrap.appendChild(el('div','dotty'));
  bubble.appendChild(wrap);
  const small = el('div', 'small');
  small.textContent = 'Thinking…';
  bubble.appendChild(small);
  msg.appendChild(avatar);
  msg.appendChild(bubble);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;
  addMessage('user', text);
  input.value = '';

  const typing = addTyping();

  try{
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    typing.remove();

    if(res.ok){
      const answer = data.answer || "Sorry, I couldn't find an answer.";
      const meta = data.matched_question ? `\n\n— matched: “${data.matched_question}”` : "";
      addMessage('bot', answer + meta);
    } else {
      addMessage('bot', data.error || 'Server error');
    }
  }catch(err){
    typing.remove();
    addMessage('bot', 'Network error. Please try again.');
  }
});
