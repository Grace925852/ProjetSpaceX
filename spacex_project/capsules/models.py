from django.db import models
from django.utils import timezone

class Capsule(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('retired', 'Retired'),
        ('destroyed', 'Destroyed'),
        ('unknown', 'Unknown'),
    ]

    spacex_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    serial = models.CharField(max_length=50)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='unknown')
    type = models.CharField(max_length=50)
    missions_count = models.IntegerField(default=0) 
    missions_data = models.JSONField(default=list)    
    is_locally_deleted = models.BooleanField(default=False)
    last_update = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.serial

    def save(self, *args, **kwargs):
        if self.missions_data and self.missions_count == 0:
            self.missions_count = len(self.missions_data)
        
        if not self.spacex_id:
            self.spacex_id = f"local-{self.serial}-{timezone.now().timestamp()}"
            
        super().save(*args, **kwargs)

    @property
    def flight_types_count(self):
        """Calcul dynamique (non stocké) pour les stats"""
        if not self.missions_data:
            return 0
        return len({m.get('flight') for m in self.missions_data if m.get('flight')})