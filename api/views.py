from django.shortcuts import render
from rest_framework import generics, status # give access to http status codes
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response  # for custom response
from django.http import JsonResponse

# Create your views here.

class RoomView(generics.ListAPIView): # a view that is already set up to return to us all of the different rooms
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        # first check if the user has an active session, if not create one
        if not self.request.session.exists(self.request.session.session_key): # the user is determined by the unique session key
            self.request.session.create()
        
        # print(self.request.session.session_key)

        # For a get request we can use request.GET, but for a post request we can use request.data
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                self.request.session['room_code'] = code # it stores the code so the user doesnt have to type everytime the code when he/she close the tab and comes back again
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)
            return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'Bad Request': 'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg) # gives the data from the url that matches with the param

        if code != None:
            room = Room.objects.filter(code=code) # bcs code is unique, it will always give back only onr value
            if len(room) > 0:
                data = RoomSerializer(room[0]).data # converts into a python format and gives back the data 
                data['is_host'] = self.request.session.session_key == data['host'] # checks if the host is the session host
                return  Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_404_NOT_FOUND)


class CreateRoomView(APIView): # APIView give access to diff http request methods and let us to override them
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key): # the user is determined by the unique session key
            self.request.session.create()
            
        # print(self.request.session.session_key)

        serializer = self.serializer_class(data=request.data) # take all data from post request, serialize it and return a python format obj  
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key

            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code # line 28
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code # line 28
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView): 
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key): # the user is determined by the unique session key
            self.request.session.create()
    
        # print(self.request.session.session_key)

        data = {
            'code': self.request.session.get('room_code')
        }

        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def put(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code') # removing the room code from the session

            host_id = self.request.session.session_key
            room_request = Room.objects.filter(host = host_id)
            if len(room_request) > 0: # if the user that leaves the room is the host, then delete the room
                room = room_request[0]
                room.delete()
        
        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key): # the user is determined by the unique session key
                self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            queryset = Room.objects.filter(code=code) 
            if not queryset.exists(): # checks if there is any room with the room code that was passed by the user
                return Response({'msg': 'Room not found'}, status = status.HTTP_404_NOT_FOUND)

            room = queryset[0]
            user_id = self.request.session.session_key
            if user_id != room.host: # checks if the user is the host in case the frontend was hacked
                return Response({'msg': 'You are not the host of this room'}, status = status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])

            return Response(UpdateRoomSerializer(room).data, status = status.HTTP_200_OK)

        
        return Response({'Bad Request': 'Invalid Data..'}, status = status.HTTP_400_BAD_REQUEST)

        
