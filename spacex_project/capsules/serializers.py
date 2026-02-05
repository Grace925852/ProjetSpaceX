from rest_framework import serializers
from .models import Capsule

class CapsuleSerializer(serializers.ModelSerializer):
    mission_count = serializers.SerializerMethodField()
    flight_types_count = serializers.SerializerMethodField()

    class Meta:
        model = Capsule
        fields = ['id', 'spacex_id', 'serial', 'status', 'type', 'mission_count', 'flight_types_count', 'last_update', 'is_locally_deleted']

    def get_mission_count(self, obj):
        return len(obj.missions_data)

    def get_flight_types_count(self, obj):
        return 1 if obj.type else 0