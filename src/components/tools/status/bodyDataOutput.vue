<template>
  <div class="data-output">
    <div class="creative-server-status">
      <h2 v-bind:class=" {offline: !this.serverCreative.pingable, online: this.serverCreative.pingable} ">{{ $t("status.creativeName") }}</h2>
      <v-progress-circular
        :size="150"
        :width="15"
        :rotate="270"
        :value="(this.serverCreative.serverOnlinePlayer / this.serverCreative.serverMaxCapacity) * 100"
        id="creative-online"
        v-if="this.serverCreative.pingable"
      >
        {{this.serverCreative.serverOnlinePlayer}}/{{this.serverCreative.serverMaxCapacity}}
      </v-progress-circular>
      <v-progress-circular
          :size="150"
          :width="15"
          :rotate="270"
          :value="100"
          id="creative-offline"
          v-if="!this.serverCreative.pingable"
      >
        {{ $t("status.offline") }}
      </v-progress-circular>
    </div>
    <div>

    </div>
  </div>
</template>

<script>
export default {
  name: "bodyDataOutput",
  data: () => ({
    serverCreative: {
      pingable: false,
      serverMaxCapacity: 50,
      serverOnlinePlayer: 10,
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
    this.timer = setInterval(this.getServerStatus, 1000)
  },
  methods: {
    getServerStatus() {

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
  height: 20%;
  width: 100%;
  float: left;
  display: flex;
  align-items: center;
  padding: 5% 30%;
  justify-content: space-between;
}

#creative-online{
  color: var(--body-content-span-text-color);
  font-size: 1.7rem;
}

#creative-offline{
  color: var(--global-danger);
  font-size: 1.7rem;
}

h2.online{
  color: var(--body-content-span-text-color);
  font-size: 2rem;
  width: fit-content;
  height: 2.3rem;
  border-bottom: 0.5rem solid var(--global-ok);
}

h2.offline{
  color: var(--body-content-span-text-color);
  font-size: 1.7rem;
  width: fit-content;
  height: 2.2rem;
  border-bottom: 0.75rem solid var(--global-danger);
}
</style>