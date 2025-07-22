let page = 1;
let loading = false;
let hasMore = true;

const filters = {
  channel: "",
  search: "",
  message: "",
  nickname: "",
  date: "",
};

function purifyString(string) {
  const d = document.createElement("div");
  d.textContent = string;

  return d.innerHTML;
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
  if (!hasMore || loading) return;
  if (reset) messagesDiv.innerHTML = "";

  // Prevent weird double-calls
  loading = true;

  await fetch(`api/messages?${buildQuery()}`)
    .then((resp) => resp.json())
    .then((messages) => {
      if (messages.length === 0) {
        statusDiv.innerText = "No more messages!";
        loading = false;
        return;
      }

      renderMessages(messages);
      loading = false;
    });
}

async function renderMessages(messages) {
  // TODO: Update shitty image with actual profile picture once ID's are worked out.

  const messageTemplate = `
    <div class="message bg-slate-800 p-4 shadow-md hover:bg-pink-950 transition flex items-center space-x-4 max-w-2xl">
      <img src="https://a.ppy.sh/1337.png" alt="USERNAME" class="w-10 h-10 flex-shrink-0" />
      <div class="flex-1 break-words break-all w-full overflow-wrap">
        <div class="flex justify-between items-center text-sm">
          <span>
            <a href="https://osu.ppy.sh/users/USERNAME" target="_blank">
              <span class="font-semibold text-pink-300 hover:text-red-500">USERNAME</span>
            </a>
            in
            <span class="font-semibold text-pink-300">CHANNEL</span>
          </span>
          <time>TIME</time>
        </div>
        <div class="text-lg break-words break-all">
          MESSAGE
        </div>
      </div>
    </div>
  `;

  messages.forEach((m) => {
    const date = new Date(m.time);
    const formattedTime = date
      .toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour12: false,
      })
      .replace(",", "");

    messagesDiv.innerHTML += messageTemplate
      .replaceAll("MESSAGE", purifyString(m.message))
      .replaceAll("CHANNEL", purifyString(m.channel))
      .replaceAll("TIME", purifyString(formattedTime))
      .replaceAll("USERNAME", purifyString(m.nickname));
  });
}

async function getChannels() {
  await fetch("api/channels")
    .then((resp) => resp.json())
    .then((channels) => {
      const select = document.querySelector('select[name="channel"]');

      channels.forEach((channel) => {
        const option = document.createElement("option");
        option.value = channel;
        option.textContent = channel;

        select.appendChild(option);
      });
    });
}

function handleFilterUpdate(e) {
  const target = e.target;
  if (!target.name) return;
  filters[target.name] = target.value;
  page = 1;
  hasMore = true;
  statusDiv.innerText = "";
  fetchMessages(true);
}

async function updateMessageCounter() {
  const counter = document.querySelector("#message-counter");

  await fetch("api/statistics")
    .then((resp) => resp.json())
    .then((json) => {
      counter.innerText = json.count.toLocaleString("en", {
        useGrouping: true,
      });
    })
    .catch((err) => {
      counter.innerText = "an unknown amount of";
    });
}

async function main() {
  window.messagesDiv = document.getElementById("messages");
  window.filtersDiv = document.getElementById("filters");
  window.statusDiv = document.getElementById("status");

  filtersDiv.addEventListener("input", handleFilterUpdate);

  await getChannels();
  await fetchMessages();
  await updateMessageCounter();
}

document.addEventListener("DOMContentLoaded", main);

document.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
    page++;
    fetchMessages(false);
  }
});
