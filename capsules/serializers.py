from rest_framework import serializers
from .models import Capsule
from rest_framework import viewsets

class CapsuleViewSet(viewsets.ModelViewSet):
    queryset = Capsule.objects.all()
    

class CapsuleSerializer(serializers.ModelSerializer):
    missions_count = serializers.SerializerMethodField()
    flight_types_count = serializers.SerializerMethodField()
    
    

    class Meta:
        model = Capsule
        fields = [
            'id', 'spacex_id', 'serial', 'status', 'type', 
            'missions_count', 'flight_types_count', 
            'last_update', 'is_locally_deleted'
        ]


    def get_missions_count(self, obj):
        """Répond à l'exigence : Calcul du nombre total de missions """
        return len(obj.missions_data) if obj.missions_data else 0

    def get_flight_types_count(self, obj):
        """Répond à l'exigence : Calcul du nombre de types de vols """
        return 1 if obj.type and len(obj.missions_data) > 0 else 0