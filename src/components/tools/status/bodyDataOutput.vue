<template>
  <div class="data-output">
    <div>
      <div class="status-line-deco">
        <div id="status-line-left"></div>
        <div id="status-station-1"></div>
        <div id="status-title">
          <h1>{{ $t('status.serverStatus') }}</h1>
        </div>
        <div id="turn-right"></div>
        <div id="status-middle-line"></div>
        <div id="status-station-2"></div>
      </div>
    </div>
    <div class="creative-server-status">
      <h2 v-bind:class=" {offline: !this.serverCreative.pingable, online: this.serverCreative.pingable} ">{{ $t("status.creativeName") }}</h2>
      <v-progress-circular
        :size="140"
        :width="12"
        :rotate="270"
        :value="(this.serverCreative.serverOnlinePlayer / this.serverCreative.serverMaxCapacity) * 100"
        id="online"
        v-if="this.serverCreative.pingable"
      >
        {{this.serverCreative.serverOnlinePlayer}}/{{this.serverCreative.serverMaxCapacity}}
      </v-progress-circular>
      <v-progress-circular
          :size="140"
          :width="12"
          :rotate="270"
          :value="100"
          id="offline"
          v-if="!this.serverCreative.pingable"
      >
        {{ $t("status.offline") }}
      </v-progress-circular>
    </div>

    <div class="survival-server-status">
      <h2 v-bind:class=" {offline: !this.serverSurvival.pingable, online: this.serverSurvival.pingable} ">{{ $t("status.survivalName") }}</h2>
      <v-progress-circular
          :size="140"
          :width="12"
          :rotate="270"
          :value="(this.serverSurvival.serverOnlinePlayer / this.serverSurvival.serverMaxCapacity) * 100"
          id="online"
          v-if="this.serverSurvival.pingable"
      >
        {{this.serverSurvival.serverOnlinePlayer}}/{{this.serverSurvival.serverMaxCapacity}}
      </v-progress-circular>
      <v-progress-circular
          :size="140"
          :width="12"
          :rotate="270"
          :value="100"
          id="offline"
          v-if="!this.serverSurvival.pingable"
      >
        {{ $t("status.offline") }}
      </v-progress-circular>
    </div>

    <div>

    </div>
  </div>
</template>

<script>
import * as axios from "axios";

export default {
  name: "bodyDataOutput",
  data: () => ({
    serverCreative: {
      pingable: false,
      serverMaxCapacity: 50,
      serverOnlinePlayer: 0,
      onlinePlayers: []
    },
    serverSurvival: {
      pingable: false,
      serverMaxCapacity: 20,
      serverOnlinePlayer: 0,
      onlinePlayers: []
    }
  }),
  mounted() {
    this.getServerStatus();
    this.timer = setInterval(this.getServerStatus, 100000)
  },
  methods: {
    getServerStatus() {
      axios.default.get('https://mcapi.us/server/status?ip=creative.fetarute.org')
          .then(responseCreative => {
            if (responseCreative.data.online){
              this.serverCreative.pingable = true;
              this.parseResponseCreative(responseCreative);
            } else {
              this.serverCreative.pingable = false;
            }
          })
          .catch(error => {
            this.serverCreative.pingable = false;
            console.error(error)
          });

      axios.default.get('https://mcapi.us/server/status?ip=frp.fetarute.org&port=6000')
          .then(responseSurvival => {
            if (responseSurvival.data.online){
              this.serverSurvival.pingable = true;
              this.parseResponseSurvival(responseSurvival);
            } else {
              this.serverSurvival.pingable = false;
            }
          })
          .catch(error => {
            this.serverSurvival.pingable = false;
            console.error(error)
          });
    },
    parseResponseCreative(response) {
      let onlinePlayerNum = response.data.players.now;
      this.serverCreative.serverOnlinePlayer = onlinePlayerNum;
      if (onlinePlayerNum > 0) {
        response.data.players.sample.forEach(player => {
          this.serverCreative.onlinePlayers.push(player.name);
        });
      }
    },
    parseResponseSurvival(response) {
      this.serverSurvival.serverOnlinePlayer = response.data.players.now;
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>

<style scoped>
.data-output{
  background-color: var(--body-content-bg);
  height: 1000px;
}

.creative-server-status{
  height: 10%;
  width: 100%;
  float: left;
  display: flex;
  align-items: center;
  padding: 150px 10% 200px 10%;
  justify-content: space-between;
}

.survival-server-status{
  height: 10%;
  width: 100%;
  float: left;
  display: flex;
  align-items: center;
  padding: 0 10% 20% 10%;
  justify-content: space-between;
}

#online{
  color: var(--body-content-span-text-color);
  font-size: 1.7rem;
}

#offline{
  color: var(--global-danger);
  font-size: 1.7rem;
}

h2.online{
  color: var(--body-content-span-text-color);
  font-size: 1.5rem;
  width: fit-content;
  height: 1.9rem;
  border-bottom: 0.5rem solid var(--global-ok);
}

h2.offline{
  color: var(--body-content-span-text-color);
  font-size: 1.5rem;
  width: fit-content;
  height: 1.9rem;
  border-bottom: 0.5rem solid var(--global-danger);
}

/* Line Deco */

#status-line-left{
  float: left;
  height: 700px;
  width: 20px;
  margin-left: 30px;
  margin-bottom: -500px;
  background-color: var(--body-span-line-syapole);
  display: flex;
  position: relative;
}

#status-station-1 {
  height: 20px;
  width: 30px;
  background-color: var(--body-span-line-syapole);
  transform: translate(50px, 12.5rem);
}

#status-title{
  transform: translate(50px, 10rem);
}

#status-title h1 {
  float: left;
  color: var(--body-content-span-text-color);
  font-size: 2.5rem;
  width: fit-content;
  height: 3.0rem;
  border-bottom: 0.75rem solid var(--body-span-line-syapole);
}

#turn-right{
  float: left;
  width: 60px;
  height: 60px;
  background-color: transparent;
  border-bottom-left-radius: 90px;
  border-left: 20px solid var(--body-span-line-syapole);
  border-bottom: 20px solid var(--body-span-line-syapole);
  transform: translate(-220px, 680px);
}

#status-middle-line{
  float: left;
  height: 20px;
  width: 250px;
  transform: translate(-220px, 720px);
  background-color: var(--body-span-line-syapole);
  display: flex;
  position: relative;
}

#status-station-2{
  float: left;
  height: 60px;
  width: 20px;
  background-color: var(--body-span-line-syapole);
  transform: translate(-220px, 700px);
}
</style>