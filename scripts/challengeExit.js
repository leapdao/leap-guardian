const challenge = require('./challenge');

const { EXIT_HASH, SPENT_HASH, NODE_URL, PROVIDER_URL, PRIV_KEY, VALIDATOR_ADDR } = process.env;

challenge(EXIT_HASH, SPENT_HASH, NODE_URL, PROVIDER_URL, PRIV_KEY, VALIDATOR_ADDR);
