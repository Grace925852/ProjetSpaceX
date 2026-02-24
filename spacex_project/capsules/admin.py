from django.contrib import admin
from .models import Capsule

@admin.register(Capsule)
class CapsuleAdmin(admin.ModelAdmin):
    list_display = ('serial', 'type', 'status', 'is_locally_deleted')
    list_filter = ('status', 'is_locally_deleted')