const { app } = require('@azure/functions');

function Expired(itemtime,expiry){
    if (expiry != 30){
        hoursSinceItemCreation = parseInt((Date.now() / 1000 - itemtime) / 60 / 60);
        if ((expiry / 60 - hoursSinceItemCreation) <= 0)
            return true;
    }
    else{
        diff = (Date.now() / 1000 - itemtime) / 60;
        min = parseInt(diff);
        if (min >= 30)
            return true;
    }
  }

app.timer('timerTrigger1', {
    schedule: '0 0 */1 * * *',
    handler: (myTimer, context) => {
        async function main(){
            context.log('Timer function processed request.');
            const { CosmosClient } = require("@azure/cosmos");
            const client = new CosmosClient({endpoint: process.env.FUNCTION_URL, key: process.env.FUNCTION_KEY});
            database = client.database('users')
            container = database.container('uploads')

            const querySpec = {
                query: 'SELECT * FROM C'
            };
            
            let response = await container.items.query(querySpec).fetchAll();
            for (let item of response.resources) {
                if (Expired(item.date,item.expiry)){
                    console.log(`Expired item DESTROYED: ${item.id}, ${item.date}, ${item.expiry / 60}`);
                    await container.item(item.id, item.id).delete();
                }
                else{
                    console.log(`Not Expired: ${item.id}, ${item.date}, ${item.expiry / 60}`);
                }
            }
        }
        main();
    }
});
