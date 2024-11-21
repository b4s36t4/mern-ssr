module.exports = {
  pipeline: {
    build: ["^build"],
    dev: {
      outputs: ["dist"],
      dependsOn: ["build"],
    },
  },
};
