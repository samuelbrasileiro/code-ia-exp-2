module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['support/**/*.ts', 'steps/**/*.ts'],
    paths: ['features/**/*.feature'],
    timeout: 30000,
  },
};
