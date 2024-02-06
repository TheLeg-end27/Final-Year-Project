import boto3
from moto import mock_aws
from django.test import TestCase, override_settings
from unittest.mock import patch
from map.dynamodb import fetch_keywords_from_dynamodb, load_keywords_to_cache, contains_moderation_keywords
from django.core.cache import cache

@mock_aws
class KeywordTests(TestCase):

    def setUp(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='eu-west-2')
        self.table = self.dynamodb.create_table(
            TableName='keyword-list',
            KeySchema=[{'AttributeName': 'keyword-id', 'KeyType': 'HASH'}],
            AttributeDefinitions=[{'AttributeName': 'keyword-id', 'AttributeType': 'S'}],
            ProvisionedThroughput={'ReadCapacityUnits': 1, 'WriteCapacityUnits': 1}
        )
        self.table.put_item(Item={'keyword-id': '1', 'keyword': 'test'})
        self.table.put_item(Item={'keyword-id': '2', 'keyword': 'example'})

    @override_settings(CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
    def test_fetch_keywords_from_dynamodb(self):
        keywords = fetch_keywords_from_dynamodb()
        self.assertTrue('test' in keywords)
        self.assertTrue('example' in keywords)

    @override_settings(CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
    def test_load_keywords_to_cache(self):
        load_keywords_to_cache()
        keywords = cache.get('moderation_keywords')
        self.assertTrue('test' in keywords)
        self.assertTrue('example' in keywords)

    @override_settings(CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
    def test_contains_moderation_keywords(self):
        load_keywords_to_cache()
        self.assertTrue(contains_moderation_keywords("This is a test"))
        self.assertFalse(contains_moderation_keywords("This is a sample text without keywords"))
