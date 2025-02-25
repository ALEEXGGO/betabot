// common number filters
Vue.filter("toFixed", (num, asset) => {
  if (typeof asset === "number") return Number(num).toFixed(asset);
  return Number(num).toFixed(asset === "USDT" ? 3 : 8);
});
Vue.filter("toMoney", (num) => {
  return Number(num)
    .toFixed(0)
    .replace(/./g, (c, i, a) => {
      return i && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
    });
});

// component for creating line chart
Vue.component("linechart", {
  props: {
    width: { type: Number, default: 400, required: true },
    height: { type: Number, default: 40, required: true },
    values: { type: Array, default: [], required: true },
  },
  data() {
    return { cx: 0, cy: 0 };
  },
  computed: {
    viewBox() {
      return "0 0 " + this.width + " " + this.height;
    },
    chartPoints() {
      let data = this.getPoints();
      let last = data.length ? data[data.length - 1] : { x: 0, y: 0 };
      let list = data.map((d) => d.x - 10 + "," + d.y);
      this.cx = last.x - 5;
      this.cy = last.y;
      return list.join(" ");
    },
  },
  methods: {
    getPoints() {
      this.width = parseFloat(this.width) || 0;
      this.height = parseFloat(this.height) || 0;
      let min = this.values.reduce(
        (min, val) => (val < min ? val : min),
        this.values[0]
      );
      let max = this.values.reduce(
        (max, val) => (val > max ? val : max),
        this.values[0]
      );
      let len = this.values.length;
      let half = this.height / 2;
      let range = max > min ? max - min : this.height;
      let gap = len > 1 ? this.width / (len - 1) : 1;
      let points = [];

      for (let i = 0; i < len; ++i) {
        let d = this.values[i];
        let val = 2 * ((d - min) / range - 0.5);
        let x = i * gap;
        let y = -val * half * 0.8 + half;
        points.push({ x, y });
      }
      return points;
    },
  },
  template: `
  <svg :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
    <polyline class="color" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" :points="chartPoints" />
    <circle class="color" :cx="cx" :cy="cy" r="4" fill="#fff" stroke="none" />
  </svg>`,
});

// vue instance
new Vue({
  // mount point
  el: "#app",

  // app data
  data: {
    endpoint: "wss://stream.binance.com:9443/ws/!ticker@arr",
    iconbase: "spot/icons/",
    cache: {}, // coins data cache
    coins: [], // live coin list from api
    asset: "USDT", // filter by base asset pair
    search: "", // filter by search string
    sort: "percent", // sort by param
    order: "desc", // sort order ( asc, desc )
    limit: 50, // limit list
    status: 0, // socket status ( 0: closed, 1: open, 2: active, -1: error )
    sock: null, // socket inst
    cx: 0,
    cy: 0,
  },

  // computed methods
  computed: {
    // process coins list
    coinsList() {
      let list = this.coins.slice();
      let search = this.search
        .replace(/[^\s\w\-\.]+/g, "")
        .replace(/[\r\s\t\n]+/g, " ")
        .trim();

      if (this.asset) {
        list = list.filter((i) => i.asset === this.asset);
      }
      if (search && search.length > 1) {
        let reg = new RegExp("^(" + search + ")", "i");
        list = list.filter((i) => reg.test(i.token));
      }
      if (this.sort) {
        list = this.sortList(list, this.sort, this.order);
      }
      if (this.limit) {
        list = list.slice(0, this.limit);
      }
      return list;
    },

    // show socket connection loader
    loaderVisible() {
      return this.status === 2 ? false : true;
    },

    // sort-by label for buttons, etc
    sortLabel() {
      switch (this.sort) {
        case "token":
          return "Token";
        case "percent":
          return "Percent";
        case "close":
          return "Price";
        case "change":
          return "Change";
        case "assetVolume":
          return "Volume";
        case "tokenVolume":
          return "Volume";
        case "trades":
          return "Trades";
        default:
          return "Default";
      }
    },
  },

  // custom methods
  methods: {
    // apply sorting and toggle order
    sortBy(key, order) {
      if (this.sort !== key) {
        this.order = order || "asc";
      } else {
        this.order = this.order === "asc" ? "desc" : "asc";
      }
      this.sort = key;
    },

    // filter by asset
    filterAsset(asset) {
      this.asset = String(asset || "BTC");
    },

    // set list limit
    setLimit(limit) {
      this.limit = parseInt(limit) || 0;
    },

    // on socket connected
    onSockOpen(e) {
      this.status = 1; // open
      console.info(
        "WebSocketInfo:",
        "Connection open (" + this.endpoint + ")."
      );
    },

    // on socket closed
    onSockClose(e) {
      this.status = 0; // closed
      console.info(
        "WebSocketInfo:",
        "Connection closed (" + this.endpoint + ")."
      );
      setTimeout(this.sockInit, 10000); // try again
    },

    // on socket error
    onSockError(err) {
      this.status = -1; // error
      console.error("WebSocketError:", err.message || err);
      setTimeout(this.sockInit, 10000); // try again
    },

    // process data from socket
    onSockData(e) {
      let list = JSON.parse(e.data) || [];

      for (let item of list) {
        // cleanup data for each coin
        let c = this.getCoinData(item);
        // keep to up 100 previous close prices in hostiry for each coin
        c.history = this.cache.hasOwnProperty(c.symbol)
          ? this.cache[c.symbol].history
          : this.fakeHistory(c.close);
        if (c.history.length > 100)
          c.history = c.history.slice(c.history.length - 100);
        c.history.push(c.close);
        // add coin data to cache
        this.cache[c.symbol] = c;
      }
      // convert cache object to final prices list for each symbol
      this.coins = Object.keys(this.cache).map((s) => this.cache[s]);
      this.status = 2; // active
    },

    // start socket connection
    sockInit() {
      if (this.status > 0) return;
      try {
        this.status = 0; // closed
        this.sock = new WebSocket(this.endpoint);
        this.sock.addEventListener("open", this.onSockOpen);
        this.sock.addEventListener("close", this.onSockClose);
        this.sock.addEventListener("error", this.onSockError);
        this.sock.addEventListener("message", this.onSockData);
      } catch (err) {
        console.error("WebSocketError:", err.message || err);
        this.status = -1; // error
        this.sock = null;
      }
    },

    // start socket connection
    sockClose() {
      if (this.sock) {
        this.sock.close();
      }
    },

    // come up with some fake history prices to fill in the initial line chart
    fakeHistory(close) {
      let num = close * 0.0001; // faction of current price
      let min = -Math.abs(num);
      let max = Math.abs(num);
      let out = [];

      for (let i = 0; i < 50; ++i) {
        let rand = Math.random() * (max - min) + min;
        out.push(close + rand);
      }
      return out;
    },

    // finalize data for each coin from socket
    getCoinData(item) {
      let reg = /^([A-Z]+)(BTC|ETH|BNB|USDT|TUSD)$/;
      let symbol = String(item.s)
        .replace(/[^\w\-]+/g, "")
        .toUpperCase();
      let token = symbol.replace(reg, "$1");
      let asset = symbol.replace(reg, "$2");
      let name = token;
      let pair = token + "/" + asset;
      let icon = this.iconbase + token.toLowerCase() + ".png";
      let open = parseFloat(item.o);
      let high = parseFloat(item.h);
      let low = parseFloat(item.l);
      let close = parseFloat(item.c);
      let change = parseFloat(item.p);
      let percent = parseFloat(item.P);
      let trades = parseInt(item.n);
      let tokenVolume = Math.round(item.v);
      let assetVolume = Math.round(item.q);
      let sign = percent >= 0 ? "+" : "";
      let arrow = percent >= 0 ? "▲" : "▼";
      let info = [
        pair,
        close.toFixed(8),
        "(",
        arrow,
        sign + percent.toFixed(2) + "%",
        "|",
        sign + change.toFixed(8),
        ")",
      ].join(" ");
      let style = "";

      if (percent > 0) style = "gain";
      if (percent < 0) style = "loss";

      return {
        symbol,
        token,
        asset,
        name,
        pair,
        icon,
        open,
        high,
        low,
        close,
        change,
        percent,
        trades,
        tokenVolume,
        assetVolume,
        sign,
        arrow,
        style,
        info,
      };
    },

    // sort an array by key and order
    sortList(list, key, order) {
      return list.sort((a, b) => {
        let _a = a[key];
        let _b = b[key];

        if (_a && _b) {
          _a = typeof _a === "string" ? _a.toUpperCase() : _a;
          _b = typeof _b === "string" ? _b.toUpperCase() : _b;

          if (order === "asc") {
            if (_a < _b) return -1;
            if (_a > _b) return 1;
          }
          if (order === "desc") {
            if (_a > _b) return -1;
            if (_a < _b) return 1;
          }
        }
        return 0;
      });
    },
  },

  // app mounted
  mounted() {
    this.sockInit();
  },

  // app destroyed
  destroyed() {
    this.sockClose();
  },
});
