from django.urls import path
from .views import index
from django.views.generic import RedirectView
from django.conf.urls import url

app_name = 'frontend'

urlpatterns = [
    path('', index, name=''), # when the program redirects to a diff app, it needs to know the formal name of the path(this comes after the colon)
    path('join', index),
    path('create', index),
    path('room/<str:roomCode>', index)
]