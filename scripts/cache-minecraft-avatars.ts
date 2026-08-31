import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Mojang 玩家名查询返回的最小公开档案。 */
interface MojangProfile {
  /** 不带连字符的 Java 版玩家 UUID。 */
  id: string;
  /** Mojang 记录的规范大小写玩家名。 */
  name: string;
}

/** Mojang 会话档案里承载 Base64 纹理资料的属性。 */
interface MojangProfileProperty {
  /** 当前头像脚本只读取 textures 属性。 */
  name: string;
  /** Base64 编码的纹理 JSON。 */
  value: string;
}

/** Mojang 会话服务器返回的公开玩家纹理档案。 */
interface MojangSessionProfile {
  /** 档案中的公开属性集合。 */
  properties: MojangProfileProperty[];
}

/** Base64 解码后与当前皮肤有关的最小纹理结构。 */
interface MojangTexturePayload {
  /** 当前启用的玩家皮肤；没有自定义皮肤时可能省略。 */
  textures?: {
    SKIN?: {
      url?: string;
    };
  };
}

/** 本地头像统一输出位置，页面运行时不会向头像服务发送访客请求。 */
const avatarOutputDirectory = path.resolve("src/assets/pages/home/community/presence/players");

/** 方形头像最终像素尺寸；页面再交给 Astro 生成响应式格式。 */
const avatarSize = 128;

/** 读取 Mojang JSON，并把玩家名或服务异常转换成明确的脚本错误。 */
async function fetchMojangJson<Payload>(url: string, description: string): Promise<Payload> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Fetarute-Website avatar cache",
    },
  });

  if (!response.ok) {
    throw new Error(`${description}失败：HTTP ${response.status}`);
  }

  return (await response.json()) as Payload;
}

/** 把规范玩家名转换成稳定、可读且不会越出目标目录的文件名。 */
function getAvatarFileName(playerName: string): string {
  const fileName = playerName.toLowerCase().replaceAll("_", "-");

  if (!/^[a-z0-9-]+$/.test(fileName)) {
    throw new Error(`无法为玩家名 ${playerName} 生成安全文件名。`);
  }

  return `${fileName}.png`;
}

/** 从 Mojang 公开档案取得当前皮肤，并按正面同坐标网格叠加头部第二层。 */
async function cacheMinecraftAvatar(requestedPlayerName: string): Promise<void> {
  const profile = await fetchMojangJson<MojangProfile>(
    `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(requestedPlayerName)}`,
    `查询 ${requestedPlayerName} 档案`,
  );
  const sessionProfile = await fetchMojangJson<MojangSessionProfile>(
    `https://sessionserver.mojang.com/session/minecraft/profile/${profile.id}`,
    `查询 ${profile.name} 皮肤`,
  );
  const textureProperty = sessionProfile.properties.find(
    (property) => property.name === "textures",
  );

  if (!textureProperty) {
    throw new Error(`${profile.name} 的公开档案没有纹理资料。`);
  }

  const texturePayload = JSON.parse(
    Buffer.from(textureProperty.value, "base64").toString("utf8"),
  ) as MojangTexturePayload;
  const skinUrl = texturePayload.textures?.SKIN?.url?.replace(/^http:/, "https:");

  if (!skinUrl) {
    throw new Error(`${profile.name} 的公开档案没有可下载的当前皮肤。`);
  }

  const skinResponse = await fetch(skinUrl, {
    headers: {
      "User-Agent": "Fetarute-Website avatar cache",
    },
  });

  if (!skinResponse.ok) {
    throw new Error(`下载 ${profile.name} 皮肤失败：HTTP ${skinResponse.status}`);
  }

  const skin = Buffer.from(await skinResponse.arrayBuffer());
  const baseFace = await sharp(skin)
    .extract({ left: 8, top: 8, width: 8, height: 8 })
    .resize(avatarSize, avatarSize, { kernel: "nearest" })
    .png()
    .toBuffer();
  const outerHeadLayer = await sharp(skin)
    .extract({ left: 40, top: 8, width: 8, height: 8 })
    .resize(avatarSize, avatarSize, { kernel: "nearest" })
    .png()
    .toBuffer();
  const outputPath = path.join(avatarOutputDirectory, getAvatarFileName(profile.name));

  await sharp(baseFace)
    .composite([{ input: outerHeadLayer, left: 0, top: 0, blend: "over" }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(outputPath);

  console.log(`${profile.name} -> ${path.relative(process.cwd(), outputPath)}`);
}

/** 按命令列顺序缓存所需头像，串行请求避免触发 Mojang 的公开接口限流。 */
async function main(): Promise<void> {
  const requestedPlayerNames = process.argv.slice(2);

  if (requestedPlayerNames.length === 0) {
    throw new Error("请至少提供一个 Java 版玩家名，例如：npm run avatar:cache -- Acatine");
  }

  await mkdir(avatarOutputDirectory, { recursive: true });

  for (const playerName of requestedPlayerNames) {
    await cacheMinecraftAvatar(playerName);
  }
}

await main();
