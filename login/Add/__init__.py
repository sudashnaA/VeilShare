import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import datetime
import uuid

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
        logging.info('Python HTTP trigger function processed a request.')

        id = uuid.uuid4()
        userid = req.route_params.get('userid')
        img = req.route_params.get('img')
        sas = req.route_params.get('sas')
        date = datetime.datetime.now().timestamp()

        link = "https://imageblobstoragesa.blob.core.windows.net/images/" + img + "?" + sas

        url = os.environ['FUNCTION_URL']
        key = os.environ['FUNCTION_KEY']


        client = CosmosClient(url, credential=key)
        DATABASE_NAME = 'users'
        database = client.get_database_client(DATABASE_NAME)
        CONTAINER_NAME = 'uploads'
        container = database.get_container_client(CONTAINER_NAME)

        if not userid and sas:
                try:
                        req_body = req.get_json()
                except ValueError:
                        pass
                else:
                        userid = req_body.get('userid')
                        sas = req_body.get('sas')

        if userid and sas:
                container.upsert_item({
                'id': str(id),
                'userid': userid,
                'key': link,
                'date': date
                })
                return func.HttpResponse(f"Successfully created entry with {userid}, {link}, {date}")
        else:
                return func.HttpResponse(
                "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
                status_code=200
                )