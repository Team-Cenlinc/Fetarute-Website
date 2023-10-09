(function(){"use strict";var e={7025:function(e,t,n){var r=n(538),o=n(7152);r.ZP.use(o.Z);const i="zh_cn",a="localeLanguage",s={zh_cn:n(1662),ja_jp:n(4257),en_us:n(3251)},u=new o.Z({locale:i,messages:s}),l=e=>{void 0===e&&(e=window.localStorage.getItem(a),void 0===s[e]&&(e=i)),window.localStorage.setItem(a,e),Object.keys(s).forEach((e=>{document.body.classList.remove(`lang-${e}`)})),document.body.classList.add(`lang-${e}`),document.body.setAttribute("lang",e),r.ZP.config.lang=e,u.locale=e};l(),t["Z"]=u},5499:function(e,t,n){var r=n(538),o=n(8345);r.ZP.use(o.Z);const i=[{path:"/",name:"AppMain",component:()=>Promise.all([n.e(579),n.e(480),n.e(200),n.e(952)]).then(n.bind(n,8029))},{path:"/tools/status",name:"ServerStatus",component:()=>Promise.all([n.e(579),n.e(520)]).then(n.bind(n,4184))},{path:"/downloads",name:"Downloads",component:()=>Promise.all([n.e(579),n.e(480),n.e(200),n.e(336)]).then(n.bind(n,84))},{path:"*",name:"Error",component:()=>Promise.all([n.e(579),n.e(480),n.e(975)]).then(n.bind(n,7486)),props:e=>({code:e.query.code})}],a=new o.Z({routes:i});var s=a,u=n(7025),l=n(3867);r.ZP.use(l.Z);var c=new l.Z({});new r.ZP({router:s,i18n:u.Z,vuetify:c}).$mount("#app");let d=window.matchMedia("(prefers-color-scheme: dark)");function v(e){let t=e.matches,n=document.querySelector('link[rel="icon"]');n&&(n.href=t?"/favicon_dark.ico":"/favicon.ico")}v(d),d.addEventListener("change",v)},3251:function(e){e.exports=JSON.parse('{"headerNav":{"chineseLangOnly":"Page only in Chinese Language","homePage":"Home Page","serverStatus":"Server Status","serverPlayerCount":"Server Player Counts","onlineMap":"Online Map","wikiLink":"Fetarute Wiki","socialMedia":"Social Media","externalLink":"Jump to external link","twitter":"Twitter","toolBox":"Tool Box","onlineMapCreative":"Creative Server","onlineMapSurvival":"Survival Server","onlineMapLobby":"Lobby Server"},"bodyContent":{"promptScroll":"Scroll down to discover","general":"Overview","journeyBegin":"Begin the trip: Summary","introFirstLine":"Welcome to Fetarute！A vanilla Minecraft server featuring City Constructions and Transportation.","introSecondLine":"Established in 2017, and looking for being better! We have 3 different divisions... Continue to discover them!","creativeWorld":"Creative","creativeBegin":"Creativity Fusion","introFirstLineCreative":"The Creating is the tradition playing pattern in Fetarute. We expecting the cities made up by blocks express the community-driven creativity and illustrate the future ideas.","introSecondLineCreative":"We looking forward to have collaborative individuals and warmly welcome any artists! No matter what you are good at, here\'s always place for you.","survivalWorld":"Survival","survivalBegin":"Railroad Journeys","introFirstLineSurvival":"Survival, is the basic behavior of human beings. And railroads, throughout this mysterious land, is called as the vein of the world.","introSecondLineSurvival":"Steel rails spread all over the ground, towards the unknown pasts, present and future... We are looking forward to your arrival!","lobbyWorld":"Lobby","lobbyBegin":"New Future, New Journey","introFirstLineLobby":"As the special location of the junction between the Creative World and Survival World, the Lobby World becomes the most important hub.","introSecondLineLobby":"The lacerated floating islands, the sky-high skyscrapers, where we stand on the memories of the past, and look forward to the future.","memberConclusion":"Closing Rearks","introFirstLineConclusion":"We aim to be a better Minecraft Server... We warmly welcome your arrival, to discover, to build, to make friends, to make memories, to make Fetarute a better place.","introSecondLineConclusion":"We looking forward to see you in Fetarute! No matter the destination of our journey, we, Fetarute Administrative Team, hope you have a joyful time.","memberJoin":"Join Us","introFirstLineJoin":"Due to the speciality of Fetarute, we have to make sure our internal environment is always nice for more, hence any players willing to join us must apply via an online form.","introSecondLineJoin":"If you are interested in us, you are welcome to join our Discord Server！You may also follow our Twitter account for further information.","memberThanks":"Thanks","introFirstLineThanks":"Our Administrative and Technology Team designed and made this website, Fetarute Internal Texture Packs, Internal Plugins, etc.\\nOur Building Team created fabulous and vivid cities, with the collaboration with the transportation system, they created a wonderful skyline.","introSecondLineThanks":"In addition, their dedication is necessary for our development, operation and maintenance. Here I appreciate their efforts and contributions.","memberPortal":"Portal","introFirstLinePortal":"The development of Fetarute is inseparable from other peer servers. Using the link below to visit their official sites for further information.","gallery":"Gallery"},"admins":{"thomasxiao":"Thomasxiao - Vice President of Fetarute","acatine":"Acatine - President of Fetarute"},"friendlyServers":{"hydCraft":"HydCraft - WIKI Site","nebulaeCraft":"NebulaeCraft - WIKI Site"},"status":{"serverStatus":"Server Status","offline":"Offline","creativeName":"Fetarute: Creative - Modern","survivalName":"Fetarute: Survival - Stone Age","creativeMobileName":"Fetarute: Creative","survivalMobileName":"Fetarute: Survival"},"error":{"notFoundText":"The page you are looking for is not found."},"footer":{"joinUs":"Join Us","followUs":"Follow Us","contactUs":"Contact Us"}}')},4257:function(e){e.exports=JSON.parse('{"headerNav":{"chineseLangOnly":"このページは中国語だけです","homePage":"ホームページ","serverStatus":"サーバーステータス","serverPlayerCount":"サーバープレイヤーズ","onlineMap":"オンライン地図","wikiLink":"Fetarute ウィキ","socialMedia":"ソーシャルメディア","externalLink":"別サイトへ","twitter":"ツイッター","toolBox":"ツールボックス","onlineMapCreative":"創造サーバー","onlineMapSurvival":"サバイバルサーバー","onlineMapLobby":"ロビーサーバー"},"bodyContent":{"promptScroll":"文字紹介は下の方へ","general":"概覧","journeyBegin":"旅の始まり：紹介","introFirstLine":"フェタルト (Fetarute) へようこそ！ここは2017年に設立され、より良い鉄道建設・街づくりサーバーを作ることを目指しているMOD無しのマイクラサーバーです。","introSecondLine":"それを中心に、様々な遊び方があります。私たちのサーバーは、主に3つのレジオン：クリエイティブ・ロビー・サバイバルに分けています。","creativeWorld":"クリエイティブ","creativeBegin":"クリエイティブ フーション","introFirstLineCreative":"クリエイティブはここの伝統的な遊び方なのです。７年の間、私たちは自由に建設することで、素敵な街と鉄道システムを作り出して、豊かな経験を積み重ねました。","introSecondLineCreative":"今はあなた、そしてみんなの手を組んで、未来の、夢の中にある素晴らしき世界を、マイクラで作ることを期待しています。","survivalWorld":"サバイバル","survivalBegin":"鉄道紀行","introFirstLineSurvival":"人類はいつまでも生きることを求めている。鉄道がこの大陸で、「世界の命脈」、「知恵の結晶」などと呼ばれている。人はそれを頼って生きてきた。だがここに、誰も知らない歴史か物語が存在している。","introSecondLineSurvival":"この謎だらけの世界で、自らの手で資源を探って生き抜きましょう。もちろん、あなたは他のプレイヤーと一緒に、町を作ることもできます。","lobbyWorld":"ロビー","lobbyBegin":"新しい未来，新しい旅","introFirstLineLobby":"ロビー世界はサーバーのセンターです。裂かれているような空中の島々に、雲に入っている高いビルなどが存在しています。","introSecondLineLobby":"その島々で、あなたは過去の栄光を探したり、簡単に休憩したりすることができます。あるいは、ここでもう一度、旅路の目的地を選び、出発しましょうか。","memberConclusion":"まとめ","introFirstLineConclusion":"フェタルトがずっと、より良いサーバーになるため、努力しています。このファンタジックな世界で、あなたの探索・創造・娯楽を歓迎しています。あなたの加入で、もっと喜びをこのバーチャルワールドにもたらすことを、私たちはいつも期待しています。","introSecondLineConclusion":"最後に、あなたの旅にいい思い出があるように、心から祝福しています。","memberJoin":"Sorry","introFirstLineJoin":"ja_JP Translation Under Construction!","introSecondLineJoin":"如果您对我们服务器感到兴趣，欢迎您加入我们的门户QQ群聊！您也可以关注我们的Twitter来获取最新资讯。","memberThanks":"致谢","introFirstLineThanks":"我们的管理团队与技术团队设计制作了本网站，Fetarute内部资源包，Fetarute内部插件，等等。\\n我们的建筑团队创造出了许多令人振奋的建筑，与轨道交通交相呼应，构造出美丽的天际线。","introSecondLineThanks":"另外，他们为服务器的发展，运行与维护付出了巨大的努力，在此我感谢他们的贡献。","memberPortal":"传送门","introFirstLinePortal":"Fetarute的发展与其他服务器密不可分，您可以使用以下链接跳转至Fetarute的友服官方页面。","gallery":"画廊"},"admins":{"thomasxiao":"Thomasxiao - Fetarute副服主","acatine":"Acatine - Fetarute服主"},"friendlyServers":{"hydCraft":"氢气工艺 - WIKI页面","nebulaeCraft":"星云工艺 - WIKI页面"},"status":{"serverStatus":"サーバーステータス","offline":"オフライン","creativeName":"Fetarute: 創造 - モダン","survivalName":"Fetarute: 生存 - 石器時代","creativeMobileName":"Fetarute: 創造","survivalMobileName":"Fetarute: 生存"},"error":{"notFoundText":"ページが見つかりませんでした"},"footer":{"joinUs":"参加申請","followUs":"ソーシャルメディア","contactUs":"連絡先"}}')},1662:function(e){e.exports=JSON.parse('{"headerNav":{"chineseLangOnly":"仅有中文页面","homePage":"首页","serverStatus":"服务器状态","serverPlayerCount":"服务器玩家计","onlineMap":"在线地图","wikiLink":"Fetarute百科","socialMedia":"社交媒体","externalLink":"跳转至外部链接","twitter":"推特","toolBox":"工具箱","onlineMapCreative":"创造服","onlineMapSurvival":"生存服","onlineMapLobby":"大厅服"},"bodyContent":{"promptScroll":"向 下 滚 动 以 探 索","general":"概览","journeyBegin":"开始旅程：简介","introFirstLine":"欢迎来到Fetarute！这是一个以轨道交通为主题的多元纯净小型服务器。","introSecondLine":"该服成立于2017年，致力于打造更好的轨交城建服务器。全服分为三大区域：创造，大厅，生存，玩家可以凭借跨服铁路在三大区域中自由穿梭。","creativeWorld":"创造世界","creativeBegin":"创汇交融","introFirstLineCreative":"创造是本服的传统玩法，7年来该服积累了丰富的创造经验。通过自由自在的创造，我们曾一起建出过美丽的轨交系统与都市。","introSecondLineCreative":"现在，我们期待通力合作，在未来看到由方块堆砌的宏伟的建筑群系，彰显交通在波澜壮阔的社会里举足轻重的地位。","survivalWorld":"生存世界","survivalBegin":"铁路纪行","introFirstLineSurvival":"生存，是人的根本行为模式。而铁路，在这片神奇的大陆上，被称为世界的命脉，人类生存的结晶。","introSecondLineSurvival":"钢轨铺在大地的表面上，延向至已被过去堙灭的尘埃……请凭借您厉害的要领，四处探索，搜集资源，或是与朋友们一同建立小镇，在过去的时光中获得一席之地……","lobbyWorld":"门户世界","lobbyBegin":"新未来，新征程","introFirstLineLobby":"门户世界为创造世界和生存分区的中转枢纽站，是全服的中心枢纽","introSecondLineLobby":"撕裂的空岛，高耸入云的大厦，您可以站在岛屿上探寻我们辉煌的过去，您也可以在此上稍作休息，与志同道合的朋友们玩耍，您也可以从这里再次出发，选择你的旅途的目的地……","memberConclusion":"结语","introFirstLineConclusion":"Fetarute一直致力于成为更好的服务器。我们欢迎您在这片神奇的世界里随意探索，创造，娱乐……请您不要忘记铁路旅途带给你的欢乐。","introSecondLineConclusion":"我们更期望您的加入会给这个虚拟世界带来更多欢笑，无论最后结果何方，Fetarute管理组诚挚地祝福您，祝您旅途愉快。","memberJoin":"加入我们","introFirstLineJoin":"由于Fetarute服务器的一些特殊性质并确保服务器和平运行，本服务器实行审核制控制玩家流入。","introSecondLineJoin":"如果您对我们服务器感到兴趣，欢迎您加入我们的门户QQ群聊！您也可以关注我们的Twitter来获取最新资讯。","memberThanks":"致谢","introFirstLineThanks":"我们的管理团队与技术团队设计制作了本网站，Fetarute内部资源包，Fetarute内部插件，等等。\\n我们的建筑团队创造出了许多令人振奋的建筑，与轨道交通交相呼应，构造出美丽的天际线。","introSecondLineThanks":"另外，他们为服务器的发展，运行与维护付出了巨大的努力，在此我感谢他们的贡献。","memberPortal":"传送门","introFirstLinePortal":"Fetarute的发展与其他服务器密不可分，您可以使用以下链接跳转至Fetarute的友服官方页面。","gallery":"画廊"},"admins":{"thomasxiao":"Thomasxiao - Fetarute副服主","acatine":"Acatine - Fetarute服主"},"friendlyServers":{"hydCraft":"氢气工艺 - WIKI页面","nebulaeCraft":"星云工艺 - WIKI页面"},"status":{"serverStatus":"服务器状态","offline":"离线","creativeName":"Fetarute: 创造 - 现代","survivalName":"Fetarute: 生存 - 石器时代","creativeMobileName":"Fetarute: 创造","survivalMobileName":"Fetarute: 生存"},"error":{"notFoundText":"页面未找到"},"footer":{"joinUs":"加入我们","followUs":"关注我们","contactUs":"联系我们"}}')}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var i=t[r]={exports:{}};return e[r](i,i.exports,n),i.exports}n.m=e,function(){var e=[];n.O=function(t,r,o,i){if(!r){var a=1/0;for(c=0;c<e.length;c++){r=e[c][0],o=e[c][1],i=e[c][2];for(var s=!0,u=0;u<r.length;u++)(!1&i||a>=i)&&Object.keys(n.O).every((function(e){return n.O[e](r[u])}))?r.splice(u--,1):(s=!1,i<a&&(a=i));if(s){e.splice(c--,1);var l=o();void 0!==l&&(t=l)}}return t}i=i||0;for(var c=e.length;c>0&&e[c-1][2]>i;c--)e[c]=e[c-1];e[c]=[r,o,i]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){n.d=function(e,t){for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}}(),function(){n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(t,r){return n.f[r](e,t),t}),[]))}}(),function(){n.u=function(e){return"js/"+({336:"Downloads",520:"ServerStatus",952:"AppMain",975:"Error"}[e]||e)+"."+{200:"dc3f27fa",336:"ddf6a358",480:"75d4cb64",520:"45f6b1f9",579:"f7e46e62",952:"b63fe044",975:"c8fbea6d"}[e]+".js"}}(),function(){n.miniCssF=function(e){return"css/"+({336:"Downloads",520:"ServerStatus",952:"AppMain",975:"Error"}[e]||e)+"."+{200:"12a6d4e4",336:"922dad7e",520:"9a039c8c",579:"d7d3e7c8",952:"88597700",975:"8edcae41"}[e]+".css"}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={},t="fetarute-website:";n.l=function(r,o,i,a){if(e[r])e[r].push(o);else{var s,u;if(void 0!==i)for(var l=document.getElementsByTagName("script"),c=0;c<l.length;c++){var d=l[c];if(d.getAttribute("src")==r||d.getAttribute("data-webpack")==t+i){s=d;break}}s||(u=!0,s=document.createElement("script"),s.charset="utf-8",s.timeout=120,n.nc&&s.setAttribute("nonce",n.nc),s.setAttribute("data-webpack",t+i),s.src=r),e[r]=[o];var v=function(t,n){s.onerror=s.onload=null,clearTimeout(f);var o=e[r];if(delete e[r],s.parentNode&&s.parentNode.removeChild(s),o&&o.forEach((function(e){return e(n)})),t)return t(n)},f=setTimeout(v.bind(null,void 0,{type:"timeout",target:s}),12e4);s.onerror=v.bind(null,s.onerror),s.onload=v.bind(null,s.onload),u&&document.head.appendChild(s)}}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){n.p=""}(),function(){var e=function(e,t,n,r){var o=document.createElement("link");o.rel="stylesheet",o.type="text/css";var i=function(i){if(o.onerror=o.onload=null,"load"===i.type)n();else{var a=i&&("load"===i.type?"missing":i.type),s=i&&i.target&&i.target.href||t,u=new Error("Loading CSS chunk "+e+" failed.\n("+s+")");u.code="CSS_CHUNK_LOAD_FAILED",u.type=a,u.request=s,o.parentNode.removeChild(o),r(u)}};return o.onerror=o.onload=i,o.href=t,document.head.appendChild(o),o},t=function(e,t){for(var n=document.getElementsByTagName("link"),r=0;r<n.length;r++){var o=n[r],i=o.getAttribute("data-href")||o.getAttribute("href");if("stylesheet"===o.rel&&(i===e||i===t))return o}var a=document.getElementsByTagName("style");for(r=0;r<a.length;r++){o=a[r],i=o.getAttribute("data-href");if(i===e||i===t)return o}},r=function(r){return new Promise((function(o,i){var a=n.miniCssF(r),s=n.p+a;if(t(a,s))return o();e(r,s,o,i)}))},o={143:0};n.f.miniCss=function(e,t){var n={200:1,336:1,520:1,579:1,952:1,975:1};o[e]?t.push(o[e]):0!==o[e]&&n[e]&&t.push(o[e]=r(e).then((function(){o[e]=0}),(function(t){throw delete o[e],t})))}}(),function(){var e={143:0};n.f.j=function(t,r){var o=n.o(e,t)?e[t]:void 0;if(0!==o)if(o)r.push(o[2]);else{var i=new Promise((function(n,r){o=e[t]=[n,r]}));r.push(o[2]=i);var a=n.p+n.u(t),s=new Error,u=function(r){if(n.o(e,t)&&(o=e[t],0!==o&&(e[t]=void 0),o)){var i=r&&("load"===r.type?"missing":r.type),a=r&&r.target&&r.target.src;s.message="Loading chunk "+t+" failed.\n("+i+": "+a+")",s.name="ChunkLoadError",s.type=i,s.request=a,o[1](s)}};n.l(a,u,"chunk-"+t,t)}},n.O.j=function(t){return 0===e[t]};var t=function(t,r){var o,i,a=r[0],s=r[1],u=r[2],l=0;if(a.some((function(t){return 0!==e[t]}))){for(o in s)n.o(s,o)&&(n.m[o]=s[o]);if(u)var c=u(n)}for(t&&t(r);l<a.length;l++)i=a[l],n.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return n.O(c)},r=self["webpackChunkfetarute_website"]=self["webpackChunkfetarute_website"]||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))}();var r=n.O(void 0,[998],(function(){return n(5499)}));r=n.O(r)})();
//# sourceMappingURL=app.e25d915a.js.map