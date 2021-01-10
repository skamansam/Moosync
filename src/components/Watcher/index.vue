<template>
  <div class="hello">
    Watcher
    <audio ref="audio" controls />
  </div>
</template>

<script>
import { config, connectionOptions } from "@/utils/socketBroadcast";

export default {
  name: "Watcher",
  props: {
    msg: String
  },
  mounted() {
    this.setupStream();
  },
  data() {
    return {
      peerConnection: undefined
    };
  },
  methods: {
    initializeSocket: function() {
      this.socket = require("socket.io-client").connect(
        "http://localhost:4000",
        connectionOptions
      );
    },

    makePeerConnection: function() {
      if (this.peerConnection == undefined) {
        this.peerConnection = new RTCPeerConnection(config);
      }
    },

    sendAnswer: function(id, description) {
      this.peerConnection
        .setRemoteDescription(description)
        .then(() => this.peerConnection.createAnswer())
        .then(sdp => this.peerConnection.setLocalDescription(sdp))
        .then(() => {
          this.socket.emit("answer", id, this.peerConnection.localDescription);
        });
    },

    addIceCandidate: function(candidate) {
      this.peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
    },

    gotStream: function() {
      this.peerConnection.ontrack = event => {
        this.$refs.audio.srcObject = event.streams[0];
      };
    },

    setupStream() {
      this.initializeSocket();
      this.socket.on("offer", (id, description) => {
        this.makePeerConnection();
        try {
          this.sendAnswer(id, description);
          this.gotStream();
          this.peerConnection.onicecandidate = event => {
            if (event.candidate) {
              this.socket.emit("candidate", id, event.candidate);
            }
          };
        } catch (err) {
          console.log(err);
        }
      });

      this.socket.on("candidate", (id, candidate) => {
        this.addIceCandidate(candidate);
      });

      this.socket.on("connect", () => {
        this.socket.emit("watcher");
      });

      this.socket.on("broadcaster", () => {
        this.socket.emit("watcher");
      });
    }
  }
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
