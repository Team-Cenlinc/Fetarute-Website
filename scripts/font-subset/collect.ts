import { readdir } from "node:fs/promises";
import path from "node:path";
import { fromRoot, scanConfig } from "./config.ts";

/**
 * Node 文件系统错误类型判断。
 *
 * 可选目录不存在应被安全跳过，真实的权限或读取错误则必须继续抛出，避免生成不完整子集而不自知。
 *
 * @param error - 捕获到的未知错误对象。
 * @returns true 表示错误对象带有 Node errno code。
 */
function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

/**
 * 递归收集参与字体字符抽取的文本文件。
 *
 * 只扫描 config 中允许的扩展名，并跳过依赖、构建产物和 Git 元数据，避免生成结果随环境变化。
 *
 * @param directory - 当前递归目录的绝对路径。
 * @returns 匹配扩展名的文件绝对路径列表。
 */
async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error: unknown) => {
    if (isErrnoException(error) && error.code === "ENOENT") {
      return [];
    }

    throw error;
  });

  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!scanConfig.ignoredDirectories.has(entry.name)) {
        files.push(...(await collectSourceFiles(absolutePath)));
      }

      continue;
    }

    if (entry.isFile() && scanConfig.extensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

/**
 * 按当前配置收集全部抽取输入文件。
 *
 * @returns 可参与 CJK 字符抽取的文件绝对路径列表。
 */
export async function collectConfiguredSourceFiles(): Promise<string[]> {
  const scanRoots = scanConfig.roots.map((root) => fromRoot(root));

  return (await Promise.all(scanRoots.map((root) => collectSourceFiles(root)))).flat();
}
