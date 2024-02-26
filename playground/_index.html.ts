export default /* html */ `<!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <title>CrossWS Test Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body {
        background-color: #1a1a1a;
      }
    </style>
    <script type="module">
      // https://github.com/vuejs/petite-vue
      import {
        createApp,
        reactive,
        nextTick,
      } from "https://esm.sh/petite-vue@0.4.1";

      let ws;

      const store = reactive({
        message: "",
        messages: [],
      });

      const scroll = () => {
        nextTick(() => {
          const el = document.querySelector("#messages");
          el.scrollTop = el.scrollHeight;
          el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth",
          });
        });
      };

      const log = (user, ...args) => {
        console.log("[ws]", user, ...args);
        store.messages.push({
          text: args.join(" "),
          user: user,
          date: new Date().toLocaleString(),
        });
        scroll();
      };

      const connect = async () => {
        const isSecure = location.protocol === "https:";
        const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";
        if (ws) {
          log("system", "closing");
          ws.close();
        }

        log("system", "Connecting to", url, "...");
        ws = new WebSocket(url);

        ws.addEventListener("message", (event) => {
          log("server", event.data);
        });

        log("system", "Waiting for connection...");
        await new Promise((resolve) => ws.addEventListener("open", resolve));
      };

      const clear = () => {
        store.messages.splice(0, store.messages.length);
        log("system", "previous messages cleared");
      };

      const send = () => {
        console.log("sending message...");
        if (store.message) {
          log("you", store.message);
          ws.send(store.message);
        }
        store.message = "";
      };

      const ping = () => {
        log("you", "Sending ping");
        ws.send("ping");
      };

      createApp({
        store,
        send,
        ping,
        clear,
        connect,
      }).mount();

      await connect();
      ping();
      send("foo");
    </script>
  </head>
  <body class="h-screen flex flex-col justify-between">
    <main v-scope="{}">
      <!-- Messages -->
      <div id="messages" class="flex-grow flex flex-col justify-end px-4 py-8">
        <div class="flex items-center mb-4" v-for="message in store.messages">
          <div class="flex flex-col">
            <p class="text-gray-500 mb-1 text-xs ml-10">{{ message.user }}</p>
            <div class="flex items-center">
              <img
                src="https://robohash.org/a"
                alt="Avatar"
                class="w-8 h-8 rounded-full"
              />
              <div class="ml-2 bg-gray-800 rounded-lg p-2">
                <p class="text-white">{{ message.text }}</p>
              </div>
            </div>
            <p class="text-gray-500 mt-1 text-xs ml-10">{{ message.date }}</p>
          </div>
        </div>
      </div>

      <!-- Chatbox -->
      <div
        class="bg-gray-800 px-4 py-2 flex items-center justify-between fixed bottom-0 w-full"
      >
        <input
          type="text"
          placeholder="Type your message..."
          class="w-full rounded-l-lg px-4 py-2 bg-gray-700 text-white focus:outline-none focus:ring focus:border-blue-300"
          @keydown.enter="send"
          v-model="store.message"
        />
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
          @click="send"
        >
          Send
        </button>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
          @click="ping"
        >
          Ping
        </button>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
          @click="connect"
        >
          Reconnect
        </button>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-lg"
          @click="clear"
        >
          Clear
        </button>
      </div>
    </main>
  </body>
</html>`;
