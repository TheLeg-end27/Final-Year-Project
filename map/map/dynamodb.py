"""
dynamoDB functionality for map project.

The functions that interact with dynamoDB. 
"""
import boto3
from django.conf import settings
from django.core.cache import cache

dynamodb = boto3.resource(
    'dynamodb',
    region_name=settings.AWS_REGION_NAME,
)

table = dynamodb.Table('keyword-list')

"""Fetch keywords from the dynamoDB keyword table."""
def fetch_keywords_from_dynamodb():
    response = table.scan(AttributesToGet=['keyword'])  #keyword list taken from Shutterstock
    keywords = set()
    for item in response['Items']:
        if 'keyword' in item:
            keywords.add(item['keyword'])
    return keywords

"""Load keywords to cache."""
def load_keywords_to_cache():
    keywords = fetch_keywords_from_dynamodb()
    cache.set('moderation_keywords', keywords, timeout=None) 

"""Checks if a comment contains a keyword."""
def contains_moderation_keywords(text):
    keywords = cache.get('moderation_keywords')
    if not keywords:
        load_keywords_to_cache()
        keywords = cache.get('moderation_keywords')
    text_words = text.lower().split()
    return any(word in keywords for word in text_words)
