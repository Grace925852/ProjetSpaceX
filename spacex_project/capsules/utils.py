import requests
from .models import Capsule

def sync_spacex_capsules():
    url = "https://api.spacexdata.com/v4/capsules"
    response = requests.get(url)
    
    if response.status_code == 200:
        spacex_data = response.json()
        
        for data in spacex_data:
            s_id = data.get('id')
            

            capsule_exists = Capsule.objects.filter(spacex_id=s_id).first()
            
            if capsule_exists:
                if not capsule_exists.is_locally_deleted:
                    capsule_exists.serial = data.get('serial')
                    capsule_exists.status = data.get('status')
                    capsule_exists.type = data.get('type')
                    capsule_exists.last_update = data.get('last_update')
                    capsule_exists.missions_data = data.get('launches', [])
                    capsule_exists.save()
            else:
                Capsule.objects.create(
                    spacex_id=s_id,
                    serial=data.get('serial'),
                    status=data.get('status'),
                    type=data.get('type'),
                    last_update=data.get('last_update'),
                    missions_data=data.get('launches', [])
                )
        return True
    return False