<template>
  <div class="hello">
    Watcher
    <audio ref="audio" controls />
  </div>
</template>

<script lang="ts">
import { config, connectionOptions } from "@/utils/socketBroadcast";

export default {
  name: "Watcher",
  props: {
    msg: String,
  },
  mounted() {
    this.setupStream();
  },
  data() {
    return {
      peerConnection: undefined,
    };
  },
  methods: {
    initializeSocket: function () {
      this.socket = require("socket.io-client").connect(
        "http://localhost:4000",
        connectionOptions
      );
    },

    makePeerConnection: function () {
      this.peerConnection = new RTCPeerConnection(config);
    },

    emitAnswer: function (id, description) {
      this.socket.emit("answer", id, description);
    },

    sendAnswer: function (id, description) {
      this.peerConnection
        .setRemoteDescription(description)
        .then(this.peerConnection.createAnswer())
        .then((sdp) => this.peerConnection.setLocalDescription(sdp))
        .then(() => this.emitAnswer(id, this.peerConnection.localDescription));
    },

    addIceCandidate: function (candidate) {
      this.peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch((e) => console.error(e));
    },

    gotStream: function () {
      this.peerConnection.ontrack = (event) => {
        this.$refs.audio.srcObject = event.streams[0];
      };
    },

    registerBroadcaster: function () {
      this.socket.on("broadcaster", () => {
        if (this.peerConnection !== undefined) {
          this.peerConnection.close();
        }
        this.socket.emit("watcher");
      });
    },

    gotCandidate: function () {
      this.socket.on("candidate", (id, candidate) => {
        this.addIceCandidate(candidate);
      });
    },

    socketConnected: function () {
      this.socket.on("connect", () => {
        this.emitWatcher();
      });
    },

    emitWatcher: function () {
      this.socket.emit("watcher");
    },

    emitCandidate: function (id, candidate) {
      if (candidate) {
        this.socket.emit("candidate", id, candidate);
      }
    },

    listenCandidate: function (id) {
      this.peerConnection.onicecandidate = (event) => {
        this.emitCandidate(id, event.candidate);
      };
    },

    gotOffer: function (callback) {
      this.socket.on("offer", (id, description) => {
        callback(id, description);
      });
    },

    listenStateFailed: function () {
      this.peerConnection.onconnectionstatechange = (event) => {
        if (
          event.currentTarget.connectionState === "closed" ||
          event.currentTarget.connectionState === "failed"
        ) {
          this.emitWatcher();
        }
      };
    },

    setupStream() {
      this.initializeSocket();
      this.gotOffer((id, description) => {
        this.makePeerConnection();
        this.listenStateFailed();
        this.sendAnswer(id, description);
        this.gotStream();
        this.listenCandidate();
      });

      this.gotCandidate();
      this.registerBroadcaster();
      this.socketConnected();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
