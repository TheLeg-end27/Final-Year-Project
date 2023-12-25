import json
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
import boto3
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import uuid

dynamodb = boto3.resource('dynamodb', region_name ='eu-west-2')
table = dynamodb.Table('messages')

@csrf_exempt
@require_http_methods(["POST"])
def store_message(request):
    data = json.loads(request.body)
    lat = data.get('lat')
    lng = data.get('lng') 
    message = data.get('message')
    item  = {
        'id' : str(uuid.uuid1()),
        'latitude' : str(lat),
        'longitude' : str(lng),
        'message' : message
    }
    table.put_item(Item = item)
    return JsonResponse({'Status' : 'message stored successfully'})

@require_http_methods(['GET'])
def get_messages(request):
    response = table.scan()
    return JsonResponse(response['Items'], safe=False)

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