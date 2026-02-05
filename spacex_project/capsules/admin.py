from django.contrib import admin
from .models import Capsule

@admin.register(Capsule)
class CapsuleAdmin(admin.ModelAdmin):
    # Liste des colonnes à afficher dans l'admin
    list_display = ('serial', 'type', 'status', 'is_locally_deleted')
    # Permet de filtrer par statut ou par suppression
    list_filter = ('status', 'is_locally_deleted')