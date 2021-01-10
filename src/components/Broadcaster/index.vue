<template>
  <div class="hello">
    broadcaster
    <section class="select">
      <label for="audioSource">Audio source: </label>
      <select ref="audioSource" />
    </section>

    <audio ref="audio" controls />
  </div>
</template>

<script>
import { config, connectionOptions } from "@/utils/socketBroadcast";

export default {
  name: "Broadcaster",
  props: {
    msg: String
  },
  data() {
    return {
      socket: undefined,
      peerConnections: {},
      stream: undefined
    };
  },
  mounted() {
    this.setupStream();
  },

  methods: {
    initializeSocket: function() {
      this.socket = require("socket.io-client").connect(
        "http://localhost:4000",
        connectionOptions
      );
    },

    makePeerConnection: function(id) {
      const peerConnection = new RTCPeerConnection(config);
      this.peerConnections[id] = peerConnection;
    },

    sendOffer: function(id) {
      this.peerConnections[id]
        .createOffer()
        .then(sdp => this.peerConnections[id].setLocalDescription(sdp))
        .then(() => {
          this.socket.emit(
            "offer",
            id,
            this.peerConnections[id].localDescription
          );
        });
    },

    addIceCandidate: function(id, candidate) {
      this.peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
    },

    acceptAnswer: function(id, description) {
      this.peerConnections[id].setRemoteDescription(description);
    },

    addTracks: function(id) {
      if (id === undefined) {
        for (var conn in this.peerConnections) {
          this.stream.getTracks().forEach(track => {
            conn.addTrack(track, this.stream);
          });
        }
      } else {
        this.stream
          .getTracks()
          .forEach(track =>
            this.peerConnections[id].addTrack(track, this.stream)
          );
      }
    },

    setupSocket: function() {
      this.socket.on("watcher", id => {
        this.makePeerConnection(id);
        this.addTracks(id);
        this.peerConnections[id].onicecandidate = event => {
          if (event.candidate) {
            this.socket.emit("candidate", id, event.candidate);
          }
        };

        this.sendOffer(id);
      });

      this.socket.on("candidate", (id, candidate) => {
        this.addIceCandidate(id, candidate);
      });

      this.socket.on("disconnectPeer", id => {
        this.peerConnections[id].close();
        delete this.peerConnections[id];
      });

      this.socket.on("answer", (id, description) => {
        this.acceptAnswer(id, description);
      });
    },

    gotStream: function(stream) {
      this.stream = stream;
      this.addTracks();
      this.socket.emit("broadcaster");
    },

    setupStream: function() {
      this.initializeSocket();
      this.getAudioFile();
      this.setupSocket();

      const audioElement = this.$refs.audio;
      if (audioElement.src !== undefined) {
        this.gotStream(audioElement.captureStream());
      }
    },

    getAudioFile: function() {
      var fs = require("fs");
      var path = require("path");
      var p = path.join("/home/ovenoboyo/test.flac");

      const file = fs.readFileSync(p);
      this.fileURL = URL.createObjectURL(new Blob([file]));
      this.$refs.audio.src = this.fileURL;
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
