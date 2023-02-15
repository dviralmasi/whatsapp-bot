import {} from 'dotenv/config';

import mantiumAi from '@mantium/mantiumapi';
import twilio from 'twilio';

const prompt_id = process.env.MANTIUM_PROMPT_ID;
const credentials = {
    username: process.env.MANTIUM_USER_NAME,
    password: process.env.MANTIUM_PASSWORD,
};
const MessagingResponse = twilio.twiml.MessagingResponse;

export class Bot {
    apiKey = null;
    interval = null;
    /****************************************************************************************************
     Constructor
     *******************************************************************************************************/
    constructor() {
        if (this.apiKey === null) {
            this.getToken();
            this.interval = setInterval(() => {
                this.getToken();
            }, 9 * 60 * 60 * 1000);
        }
    }

    async getToken() {
        await mantiumAi
            .Auth()
            .accessTokenLogin({ ...credentials })
            .then((response) => {
                // get bearer_id and set as a api_key
                if (response.data?.attributes) {
                    mantiumAi.api_key = response.data.attributes.bearer_id;
                    this.apiKey = response.data.attributes.bearer_id;
                } else {
                    throw Error('no response.data');
                }
            })
            .catch(err => {
                console.log('mantiumAi getToken failed!', err);
                clearInterval(this.interval);
            });
    }

    async delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    async getAnswer(question) {
        return await mantiumAi
            .Prompts('OpenAI')
            .execute({
                id: prompt_id,
                input: question,
            })
            .then(async (res) => {
                /*
                 * from the successful response collect the prompt_execution_id
                 * and then pass this to the result method
                 */
                console.log('here', res);
                if (res?.prompt_execution_id) {
                    await this.delay(5000);
                    return await mantiumAi
                        .Prompts('OpenAI')
                        .result(res.prompt_execution_id)
                        .then((response) => {
                            return response;
                        });
                }
            });
    }

    async postMessage(req, res) {
        let response = await this.getAnswer(req.body.Body);
        console.log('here1', JSON.stringify(response));

        const twiml = new MessagingResponse();

        res.writeHead(200, { 'Content-Type': 'text/xml' });

        twiml.message(response?.output || response);

        /* convert response to twillio xml format
         * read more...
         * https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply-node-js
         */
        const msg = twiml.toString();
        console.log('here2', msg);

        res.end(msg);
    }

    getMessage(req, res) {
        res.status(200).send('HTTP POST method only supported by this endpoint');
    }
}