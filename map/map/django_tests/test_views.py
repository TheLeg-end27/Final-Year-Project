import boto3
from django.test import TestCase
from django.urls import reverse
from moto import mock_aws
import json
from unittest.mock import patch
from geohash2 import encode
import uuid 

@mock_aws
class MessageTests(TestCase):

    def setUp(self):
        db = boto3.resource('dynamodb', region_name ='eu-west-2')
        self.message_table = db.create_table(
            TableName='messages',
            KeySchema=[{'AttributeName': 'id', 'KeyType': 'HASH'}],
            AttributeDefinitions=[{'AttributeName': 'id', 'AttributeType': 'S'}],
            ProvisionedThroughput={'ReadCapacityUnits': 1, 'WriteCapacityUnits': 1}
        )
        self.report_table = db.create_table(
            TableName='reports',
            KeySchema=[{'AttributeName': 'report-id', 'KeyType': 'HASH'}],
            AttributeDefinitions=[{'AttributeName': 'report-id', 'AttributeType': 'S'}],
            ProvisionedThroughput={'ReadCapacityUnits': 1, 'WriteCapacityUnits': 1}
        )

    def test_store_message(self):
        with patch('map.dynamodb.contains_moderation_keywords', return_value=False):
            url = reverse('store_message') 
            data = {'lat': 1.234, 'lng': 2.345, 'message': 'Hello World'}
            response = self.client.post(url, json.dumps(data), content_type='application/json')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(json.loads(response.content), {'Status': 'message stored successfully'})

            response = self.message_table.get_item(Key={'id':  str(encode(1.234, 2.345, precision=12))})  
            self.assertTrue('Item' in response)

    def test_get_messages(self):
        self.message_table.put_item(Item={'id': 'test_id','lat': str(1.234),'lng': str(2.234), 'message': 'Test Message'})
        url = reverse('get_messages') 
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        items = json.loads(response.content)
        self.assertIn('Test Message', [item['message'] for item in items])

    def test_get_reports(self):
        self.report_table.put_item(Item={'report-id': '1', 'message-id': str(encode(1.432, 2.543, precision=12)),'message': 'mean message', 'reason': 'Inappropriate content'})
        url = reverse('get_reports')  
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        reports = json.loads(response.content)
        self.assertTrue(any(report['reason'] == 'Inappropriate content' for report in reports))
        
    def test_send_report(self):
        url = reverse('send_report')  
        data = {
            'lat': 1.234,
            'lng': 5.678,
            'message': 'Test message',
            'reason': 'Spam'
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        scan_response = self.report_table.scan()
        self.assertTrue(any(item['message'] == 'Test message' for item in scan_response['Items']))
