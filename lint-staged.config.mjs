/**
 * 仅格式化本次暂存的可识别文本文件，避免自动改写未暂存的工作内容。
 */
const lintStagedConfig = {
  "*": "prettier --ignore-unknown --write",
};

export default lintStagedConfig;
