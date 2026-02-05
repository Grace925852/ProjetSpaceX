from django.db.models import Count
from django.shortcuts import HttpResponseRedirect
from django.views.generic import ListView, DetailView, UpdateView, DeleteView, CreateView
from django.urls import reverse_lazy
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Capsule
from .serializers import CapsuleSerializer
from .utils import sync_spacex_capsules


class CapsuleViewSet(viewsets.ModelViewSet):

    queryset = Capsule.objects.filter(is_locally_deleted=False)
    serializer_class = CapsuleSerializer

    def list(self, request, *args, **kwargs):
        try:
            sync_spacex_capsules()
        except Exception as e:
            print(f"Erreur de synchronisation SpaceX : {e}")
        return super().list(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_locally_deleted = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CapsuleStatsView(APIView):
    def get(self, request):
        stats = Capsule.objects.filter(is_locally_deleted=False).values('type').annotate(total=Count('id'))
        return Response(stats)


class CapsuleListView(ListView):
    model = Capsule
    template_name = 'capsules/capsule_list.html'
    context_object_name = 'capsules'
    
    def get_queryset(self):
        try:
            sync_spacex_capsules()
        except Exception as e:
            print(f"Erreur de synchronisation (Web) : {e}")
        return Capsule.objects.filter(is_locally_deleted=False)

class CapsuleDetailView(DetailView):
    model = Capsule
    template_name = 'capsules/capsule_detail.html'

class CapsuleCreateView(CreateView):
    model = Capsule
    fields = ['status', 'serial', 'type', 'last_update'] 
    template_name = 'capsules/capsule_form.html'
    success_url = reverse_lazy('capsule_list') 

class CapsuleUpdateView(UpdateView):
    model = Capsule
    fields = ['status', 'serial', 'type', 'last_update'] 
    template_name = 'capsules/capsule_form.html'
    success_url = reverse_lazy('capsule_list')

class CapsuleDeleteView(DeleteView):
    model = Capsule
    template_name = 'capsules/capsule_confirm_delete.html'
    success_url = reverse_lazy('capsule_list')

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.is_locally_deleted = True
        self.object.save()
        return HttpResponseRedirect(self.get_success_url())