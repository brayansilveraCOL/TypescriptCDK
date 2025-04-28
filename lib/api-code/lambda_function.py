import json
import boto3
import os
import uuid
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')

TABLE_NAME = os.environ.get('TABLE_NAME', 'default')

table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    try:
        body = json.loads(event['body']) if 'body' in event else event

        pk_value = str(uuid.uuid4())

        item = {
            'pk': pk_value,
            'id': body['id'],
            'nombre': body['nombre'],
            'email': body['email']
        }

        table.put_item(Item=item)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Item insertado exitosamente!', 'item': item})
        }

    except ClientError as e:
        print(f"Error de DynamoDB: {e.response['Error']['Message']}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Error al insertar el item en DynamoDB'})
        }

    except Exception as e:
        print(f"Error general: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Error inesperado en la función Lambda'})
        }