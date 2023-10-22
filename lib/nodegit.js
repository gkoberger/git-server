const os = require("os");

module.exports =
  os.platform() === "darwin" ? require("../../nodegit") : require("nodegit");
