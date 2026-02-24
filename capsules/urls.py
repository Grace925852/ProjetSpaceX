from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CapsuleViewSet, CapsuleStatsView,
    CapsuleListView, CapsuleDetailView, CapsuleCreateView, 
    CapsuleUpdateView, CapsuleDeleteView
)

router = DefaultRouter()
router.register(r'list', CapsuleViewSet, basename='capsule')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', CapsuleStatsView.as_view(), name='capsule-stats'),

    
path('web/', CapsuleListView.as_view(), name='capsule_list'),
    path('web/add/', CapsuleCreateView.as_view(), name='capsule-add-web'),
    path('web/detail/<int:pk>/', CapsuleDetailView.as_view(), name='capsule-detail-web'),
    path('web/edit/<int:pk>/', CapsuleUpdateView.as_view(), name='capsule-edit-web'), 
    path('web/delete/<int:pk>/', CapsuleDeleteView.as_view(), name='capsule-delete-web'),
]