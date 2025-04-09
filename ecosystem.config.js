module.exports = {
  apps: [{
    name: "joker bot",
    script: "./src/index.ts",
    interpreter: 'ts-node',  // Use ts-node to run the TypeScript code
    watch: true,             // Enable watch mode for auto-restart on changes
    args: "limit"
  }]
}