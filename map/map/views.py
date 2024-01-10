import json
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
import boto3
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from map import dynamoDB
from geohash2 import encode
from django.contrib.auth.decorators import login_required
import uuid

db = boto3.resource('dynamodb', region_name ='eu-west-2')
table = db.Table('messages')

@csrf_exempt
@require_http_methods(["POST"])
def store_message(request):
    data = json.loads(request.body)
    lat = data.get('lat')
    lng = data.get('lng') 
    message = data.get('message')
    if dynamoDB.contains_moderation_keywords(message):
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

@require_http_methods(['GET'])
def get_messages(request):
    table = db.Table('messages')
    response = table.scan()
    return JsonResponse(response['Items'], safe=False)

@require_http_methods(['POST'])
def send_report(request):
    table = db.Table('reports')
    data = json.loads(request.body)
    lat = data.get('lat')
    lng = data.get('lng') 
    message = data.get('message')
    reason = data.get('reason')
    item  = {
        'report-id' : uuid.uuid4(),
        'message-id' : str(encode(lat, lng, precision=12)),
        'message' : message,
        'reason' : reason
    }
    table.put_item(Item = item)
    return JsonResponse({'Status' : 'report succesfully sent'})

def hello_world(request):
    return render(request, 'hello-world.html')

def to_do_list(request): 
    return render(request, 'to-do-list.html')

def canvas(request):
    return render(request, 'canvas.html')

def raw_data_view(request):
    return render(request, 'raw-data-view.html')

def map(request):
    return render(request, 'map.html')

@login_required
def moderation(request):
    return render(request, 'moderation.html')