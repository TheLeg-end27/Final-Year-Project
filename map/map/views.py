from django.shortcuts import render
from django.http import HttpResponse

def hello_world(request):
    return render(request, 'hello-world.html')

def to_do_list(request): 
    return render(request, "to-do-list.html")