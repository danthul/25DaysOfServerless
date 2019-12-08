var config = {};

config.endpoint = "https://twentyfivedaychallenge.documents.azure.com:443/";
config.key = process.env.twentyfivedaycosoms_DOCUMENTDB_key;

config.database = {
  id: "PotluckDatabase"
};

config.container = {
  id: "PotluckContainer"
};

module.exports = config;
