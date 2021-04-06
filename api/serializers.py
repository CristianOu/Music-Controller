from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        # take a room object and serialize it into sth can it can be returned back as a response
        fields = ('id', 'code', 'host', 'guest_can_pause',
                 'votes_to_skip', 'created_at') 
                 
class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        # serialize a request which takes the data from the request, make sure its valid and return as a python complex format that we can work with
        fields = ('guest_can_pause', 'votes_to_skip')

class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[]) # we need the code to find the room, but we have to reset the field just so it doesnt break the constraint in models.py where unique=True

    class Meta:
        model = Room
        # serialize a request which takes the data from the request, make sure its valid and return as a python complex format that we can work with
        fields = ('guest_can_pause', 'votes_to_skip', 'code')