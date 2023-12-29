import boto3
from django.conf import settings
from django.core.cache import cache

dynamodb = boto3.resource(
    'dynamodb',
    region_name=settings.AWS_REGION_NAME,
)

table = dynamodb.Table('keyword-list')

def fetch_keywords_from_dynamodb():
    response = table.scan(AttributesToGet=['keyword'])  #keyword list taken from Shutterstock
    keywords = set()
    for item in response['Items']:
        if 'keyword' in item:
           keywords.add(item['keyword'])
    return keywords

def load_keywords_to_cache():
    keywords = fetch_keywords_from_dynamodb()
    cache.set('moderation_keywords', keywords, timeout=None) 

def contains_moderation_keywords(text):
    keywords = cache.get('moderation_keywords')
    if not keywords:
        load_keywords_to_cache()
        keywords = cache.get('moderation_keywords')
    text_words = text.lower().split()
    return any(word in keywords for word in text_words)
