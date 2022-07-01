<template>
  <div class="data-output">
    <div class="creative-server-status">
      <h2 v-bind:class=" {offline: !this.serverCreative.pingable, online: this.serverCreative.pingable} ">{{ $t("status.creativeName") }}</h2>
      <v-progress-circular
        :size="150"
        :width="15"
        :rotate="270"
        :value="(this.serverCreative.serverOnlinePlayer / this.serverCreative.serverMaxCapacity) * 100"
        id="online"
        v-if="this.serverCreative.pingable"
      >
        {{this.serverCreative.serverOnlinePlayer}}/{{this.serverCreative.serverMaxCapacity}}
      </v-progress-circular>
      <v-progress-circular
          :size="150"
          :width="15"
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
          :size="150"
          :width="15"
          :rotate="270"
          :value="(this.serverSurvival.serverOnlinePlayer / this.serverSurvival.serverMaxCapacity) * 100"
          id="online"
          v-if="this.serverSurvival.pingable"
      >
        {{this.serverSurvival.serverOnlinePlayer}}/{{this.serverSurvival.serverMaxCapacity}}
      </v-progress-circular>
      <v-progress-circular
          :size="150"
          :width="15"
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
      serverMaxCapacity: 50,
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
            this.serverCreative.pingable = true;
            this.parseResponseCreative(responseCreative);
          })
          .catch(error => {
            this.serverCreative.pingable = false;
            console.error(error)
          });

      axios.default.get('https://mcapi.us/server/status?ip=frp.fetarute.org&port=6000')
          .then(responseSurvival => {
            this.serverSurvival.pingable = true;
            this.parseResponseSurvival(responseSurvival);
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
div{
  height: 2000px;
  background-color: var(--body-content-bg);
}

.creative-server-status{
  height: 10%;
  width: 100%;
  float: left;
  display: flex;
  align-items: center;
  padding: 15% 10% 5% 10%;
  justify-content: space-between;
}

.survival-server-status{
  height: 10%;
  width: 100%;
  float: left;
  display: flex;
  align-items: center;
  padding: 5% 10%;
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
  font-size: 1.7rem;
  width: fit-content;
  height: 2.3rem;
  border-bottom: 0.75rem solid var(--global-ok);
}

h2.offline{
  color: var(--body-content-span-text-color);
  font-size: 1.7rem;
  width: fit-content;
  height: 2.2rem;
  border-bottom: 0.75rem solid var(--global-danger);
}
</style>