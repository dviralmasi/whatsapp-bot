require('dotenv').config();
const mantiumAi = require('@mantium/mantiumapi');
const credentials = {
    username: process.env.MANTIUM_USER_NAME,
    password: process.env.MANTIUM_PASSWORD,
};
(async () => {
    const loginResponse = await mantiumAi
        .Auth()
        .accessTokenLogin({ ...credentials })
        .then((response) => {
            // get bearer_id and set as a api_key
            mantiumAi.api_key = response.data.attributes.bearer_id;
            return response;
        });
    console.log(loginResponse);
})();