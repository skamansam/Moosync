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
    msg: String,
  },
  data() {
    return {
      socket: undefined,
      peerConnections: {},
      stream: undefined,
    };
  },
  mounted() {
    this.setupStream();
    this.playAudio();
  },
  methods: {
    initializeSocket: function () {
      this.socket = require("socket.io-client").connect(
        "http://localhost:4000",
        connectionOptions
      );
    },

    makePeerConnection: function (id) {
      const peerConnection = new RTCPeerConnection(config);
      this.peerConnections[id] = peerConnection;
    },

    emitOffer: function (id, description) {
      this.socket.emit("offer", id, description);
    },

    listenStateFailed: function (id) {
      this.peerConnections[id].addEventListener(
        "iceconnectionstatechange",
        () => {
          if (
            this.peerConnections[id].iceConnectionState === "failed" ||
            this.peerConnections[id].connectionState === "failed"
          ) {
            this.peerConnections[id].restartIce();
          }
        }
      );
    },

    sendOffer: function (id) {
      this.peerConnections[id]
        .createOffer()
        .then((sdp) => this.peerConnections[id].setLocalDescription(sdp))
        .then(() => {
          this.emitOffer(id, this.peerConnections[id].localDescription);
        });
    },

    addIceCandidate: function (id, candidate) {
      this.peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
    },

    acceptAnswer: function (id, description) {
      this.peerConnections[id].setRemoteDescription(description);
    },

    addTrackToPeer: function (conn) {
      if (this.stream !== undefined) {
        this.stream.getTracks().forEach((track) => {
          conn.addTrack(track, this.stream);
          this.track = track;
        });
      }
    },

    addTracksToAllPeers: function () {
      for (var id in this.peerConnections) {
        this.addTrackToPeer(this.peerConnections[id]);
      }
    },

    addTracks: function (id) {
      if (id === undefined) {
        this.addTracksToAllPeers();
      } else {
        this.addTrackToPeer(this.peerConnections[id]);
      }
    },

    replaceTrack: function () {
      for (var id in this.peerConnections) {
        this.stream.getTracks().forEach((track) => {
          var senders = this.peerConnections[id].getSenders();
          for (var index in senders) {
            senders[index].replaceTrack(track);
          }
        });
      }
    },

    gotCandidate: function () {
      this.socket.on("candidate", (id, candidate) => {
        this.addIceCandidate(id, candidate);
      });
    },

    peerDisconnected: function () {
      this.socket.on("disconnectPeer", (id) => {
        this.peerConnections[id].close();
        delete this.peerConnections[id];
      });
    },

    gotAnswer: function () {
      this.socket.on("answer", (id, description) => {
        this.acceptAnswer(id, description);
      });
    },

    emitCandidate: function (id, candidate) {
      this.socket.emit("candidate", id, candidate);
    },

    listenCandidate: function (id) {
      this.peerConnections[id].onicecandidate = (event) => {
        console.log(event);
        if (event.candidate) {
          this.emitCandidate(id, event.candidate);
        }
      };
    },

    setupSocket: function () {
      this.socket.on("watcher", (id) => {
        this.makePeerConnection(id);
        this.listenStateFailed(id);
        this.addTracks(id);
        this.listenCandidate(id);
        this.sendOffer(id);
      });

      this.gotCandidate();
      this.peerDisconnected();

      this.gotAnswer();

      this.socket.emit("broadcaster");
    },

    gotStream: function (stream) {
      if (this.stream === undefined) {
        this.stream = stream;
        this.addTracks();
      } else {
        this.stream = stream;
        this.replaceTrack();
      }
    },

    setupStream: function () {
      this.initializeSocket();
      this.setupSocket();
    },

    playAudio: function () {
      this.getAudioFile();
      const audioElement = this.$refs.audio;
      let stream = audioElement.captureStream();
      stream.onaddtrack = () => {
        this.gotStream(stream);
      };
    },

    getAudioFile: function () {
      var fs = require("fs");
      var path = require("path");
      var p = path.join("/home/ovenoboyo/test.flac");

      const file = fs.readFileSync(p);
      this.fileURL = URL.createObjectURL(new Blob([file]));
      this.$refs.audio.src = this.fileURL;
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