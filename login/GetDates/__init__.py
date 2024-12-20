import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
        logging.info('Python HTTP trigger function processed a request.')

        userid = req.route_params.get('userid')

        url = os.environ['FUNCTION_URL']
        key = os.environ['FUNCTION_KEY']


        client = CosmosClient(url, credential=key)
        DATABASE_NAME = 'users'
        database = client.get_database_client(DATABASE_NAME)
        CONTAINER_NAME = 'uploads'
        container = database.get_container_client(CONTAINER_NAME)

        if not userid:
                try:
                        req_body = req.get_json()
                except ValueError:
                        pass
                else:
                        userid = req_body.get('userid')

        if userid:
                results = container.query_items(
                query='SELECT C.date FROM C WHERE C.userid = @userid',
                parameters=[
                        dict(name='@userid', value=userid)
                ],
                enable_cross_partition_query=True)
                item_list = []
                for item in results:
                                item_list.append(str(item)[9:len(item) - 3])

                if not item_list:
                        return func.HttpResponse(json.dumps("No items Exist"))
                else:
                        return func.HttpResponse(json.dumps(item_list))
        else:
                return func.HttpResponse(
                "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
                status_code=200
                )