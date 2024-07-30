module.exports = {
  apps: [
    {
      name: "user-service",
      script: "dist/src/index.js",
      // script: "--env-file=.env dist/src/index.js",
      instances: "max",
      exec_mode: "cluster"
    }
  ]
};
