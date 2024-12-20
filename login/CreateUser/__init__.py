import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import uuid
import hashlib

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
        logging.info('Python HTTP trigger function processed a request.')

        username = req.route_params.get('username')
        password = req.route_params.get('password')

        url = os.environ['FUNCTION_URL']
        key = os.environ['FUNCTION_KEY']


        client = CosmosClient(url, credential=key)
        DATABASE_NAME = 'users'
        database = client.get_database_client(DATABASE_NAME)
        CONTAINER_NAME = 'users'
        container = database.get_container_client(CONTAINER_NAME)

        id = uuid.uuid4()

        if not username and password:
                try:
                        req_body = req.get_json()
                except ValueError:
                        pass
                else:
                        username = req_body.get('username')
                        password = req_body.get('password')

        if username and password:
                # Create a SHA-256 hash object
                hash_object = hashlib.sha256()
                # Convert the password to bytes and hash it
                hash_object.update(password.encode())
                # Get the hex digest of the hash
                hash_password = hash_object.hexdigest()
               
                results = container.query_items(
                query='SELECT C.username FROM C WHERE C.username = @username',
                parameters=[
                        dict(name='@username', value=username)
                ],
                enable_cross_partition_query=True)
                item_list = []
                for item in results:
                                item_list.append(item)
                if not item_list:
                        container.upsert_item({
                        'id': str(id),
                        'username': username,
                        'password': hash_password
                        })
                        return func.HttpResponse(f"{str(id)}? Successfully created user with username, {username}")
                else:
                        # cleanName = str(item_list[0])[14:len(item_list[0]) - 3]
                        # if username == cleanName:
                        return func.HttpResponse(f"User, {username} already exists")
        else:
                return func.HttpResponse(
                "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
                status_code=200
                )