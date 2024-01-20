"""
URL configuration for map project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include("django.contrib.auth.urls")),
    path('moderation/', views.moderation, name= 'moderation'),
    path('', views.to_do_list, name= 'to_do_list'),
    path('hello-world/', views.hello_world, name = "hello_world"),
    path('canvas/', views.canvas, name = "canvas"),
    path('raw-data-view/', views.raw_data_view, name = 'raw_data_view'),
    path('map/', views.map, name = 'map'),
    path('store-message', views.store_message, name='store_message'),
    path('get-messages/', views.get_messages, name='get_messages'),
    path('get-reports/', views.get_reports, name='get_reports'),
    path('send-report', views.send_report, name='send_report'),
    path('favicon.ico', RedirectView.as_view(url=staticfiles_storage.url('favicon/favicon.ico')))
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
