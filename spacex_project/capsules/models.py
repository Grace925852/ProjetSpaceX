from django.db import models

class Capsule(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('retired', 'Retired'),
        ('destroyed', 'Destroyed'),
        ('unknown', 'Unknown'),
    ]

    UPDATE_CHOICES = [
        ('updated', 'Mis à jour'),
        ('pending', 'En attente'),
        ('verified', 'Vérifié'),
    ]

    spacex_id = models.CharField(max_length=255, unique=True)
    serial = models.CharField(max_length=50)

    status = models.CharField(
        max_length=50, 
        choices=STATUS_CHOICES, 
        default='unknown'
    )
    last_update = models.CharField(
        max_length=255, 
        choices=UPDATE_CHOICES, 
        default='pending',
        blank=True, 
        null=True
    )
    
    type = models.CharField(max_length=50)
    missions_data = models.JSONField(default=list)
    is_locally_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.serial