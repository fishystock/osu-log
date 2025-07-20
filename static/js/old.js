const apiRoot = "";
const filters = {
  channel: "",
  search: "",
  message: "",
  nickname: "",
  date: "",
};
let page = 1,
  loading = false,
  hasMore = true;

const filtersDiv = document.getElementById("filters");
const messagesDiv = document.getElementById("messages");
const statusDiv = document.getElementById("status");

async function fetchChannels() {
  const res = await fetch(`${apiRoot}/api/channels`);
  const channels = await res.json();
  const select = filtersDiv.querySelector('select[name="channel"]');
  channels.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

function buildQuery() {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) query.append(k, v);
  });
  query.append("page", page);
  return query.toString();
}

async function fetchMessages(reset = false) {
  if (loading || !hasMore) return;
  loading = true;
  statusDiv.textContent = "Loading...";
  const res = await fetch(`${apiRoot}/api/messages?${buildQuery()}`);
  const data = await res.json();
  if (reset) messagesDiv.innerHTML = "";
  if (data.length === 0) {
    hasMore = false;
    statusDiv.textContent = "No more messages";
  } else {
    renderMessages(data);
    statusDiv.textContent = "";
  }
  loading = false;
}

function renderMessages(msgs) {
  msgs.forEach((msg) => {
    const div = document.createElement("div");
    div.className =
      "bg-slate-800 p-4 shadow-md hover:bg-slate-700 transition flex items-center space-x-4 cursor-pointer";
    div.onclick = () =>
      window.open(`https://osu.ppy.sh/users/${msg.nickname}`, "_blank");

    const img = document.createElement("img");
    img.src = `api/picture/${msg.nickname}`;
    img.alt = msg.nickname;
    img.className = "w-10 h-10 rounded-full flex-shrink-0";

    const content = document.createElement("div");
    content.className = "flex-1";

    const header = document.createElement("div");
    header.className =
      "flex justify-between items-center text-sm text-pink-300";
    header.innerHTML = `<span class="font-semibold">${msg.nickname}</span><time>${new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>`;

    const text = document.createElement("div");
    text.className = "text-lg break-words";
    text.textContent = msg.message;

    content.appendChild(header);
    content.appendChild(text);
    div.appendChild(img);
    div.appendChild(content);
    messagesDiv.appendChild(div);
  });
}

filtersDiv.addEventListener("input", (e) => {
  const target = e.target;
  if (!target.name) return;
  filters[target.name] = target.value;
  page = 1;
  hasMore = true;
  fetchMessages(true);
});

messagesDiv.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = messagesDiv;
  if (scrollHeight - scrollTop - clientHeight < 100 && !loading && hasMore) {
    page++;
    fetchMessages();
  }
});

fetchChannels().then(() => fetchMessages());
