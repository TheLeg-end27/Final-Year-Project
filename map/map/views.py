"""
Views for map project.

The functions that take and returns HTTP requests and responses. 
"""
import json
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
import boto3
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from map import dynamodb
from geohash2 import encode
from django.contrib.auth.decorators import login_required
import uuid

db = boto3.resource('dynamodb', region_name ='eu-west-2')
"""Stores message into dynamoaDB messages table."""
@csrf_exempt
@require_http_methods(["POST"])
def store_message(request):
    data = json.loads(request.body)
    lat = data.get('lat')
    lng = data.get('lng') 
    message = data.get('message')
    if dynamodb.contains_moderation_keywords(message):
        return JsonResponse({'Status' : 'Inappropiate message'}, status=422)
    item  = {
        'id' : str(encode(lat, lng, precision=12)),
        'latitude' : str(lat),
        'longitude' : str(lng),
        'message' : message
    }
    table = db.Table('messages')
    table.put_item(Item = item)
    return JsonResponse({'Status' : 'message stored successfully'})

"""Retrieves messages from the database."""
@require_http_methods(['GET'])
def get_messages(request):
    table = db.Table('messages')
    response = table.scan()
    return JsonResponse(response['Items'], safe=False)

"""Retrieves reports from the database."""
@require_http_methods(['GET'])
def get_reports(request):
    table = db.Table('reports')
    response = table.scan()
    return JsonResponse(response['Items'], safe=False)

"""Removes a message from the database."""
@require_http_methods(['POST'])
def remove_message(request):
    data = json.loads(request.body)
    report_id = data.get('reportId')
    if not report_id:
        return JsonResponse({'error': 'Missing report ID'}, status=400)
    report_table = db.Table('reports')
    message_table = db.Table('messages')
    report_response = report_table.get_item(Key={'report-id': report_id})
    if not report_response:
        return JsonResponse({'error': 'Report not found'}, status=404)
    message_id = report_response['Item']['message-id']
    report_table.delete_item(Key={'report-id': report_id})
    message_table.delete_item(Key={'id': message_id})
    return JsonResponse({'Status' : 'message/report succesfully removed', "success" : True})

"""Sends a report to the database."""
@require_http_methods(['POST'])
def send_report(request):
    table = db.Table('reports')
    data = json.loads(request.body)
    lat = data.get('lat')
    lng = data.get('lng') 
    message = data.get('message')
    reason = data.get('reason')
    item  = {
        'report-id' : str(uuid.uuid4()),
        'message-id' : str(encode(float(lat), float(lng), precision=12)),
        'message' : message,
        'reason' : reason
    }
    table.put_item(Item = item)
    return JsonResponse({'Status' : 'report succesfully sent'})

"""Renders the hello world page."""
def hello_world(request):
    return render(request, 'hello-world.html')

"""Renders the to-do list page."""
def to_do_list(request): 
    return render(request, 'to-do-list.html')

"""Renders the canvas page."""
def canvas(request):
    return render(request, 'canvas.html')

"""Renders the OSM raw data page."""
def raw_data_view(request):
    return render(request, 'raw-data-view.html')

"""Renders the map page."""
def map(request):
    return render(request, 'map.html')

"""Renders the moderator page."""
@login_required
def moderation(request):
    return render(request, 'moderation.html')