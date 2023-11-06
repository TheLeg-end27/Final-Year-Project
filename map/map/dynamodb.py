import boto3
from django.conf import settings

dynamodb = boto3.resource(
    'dynamodb',
    region_name=settings.AWS_REGION_NAME,
)

table = dynamodb.Table(settings.DYNAMODB_TABLE_NAME)
