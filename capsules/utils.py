import requests
from .models import Capsule

def sync_spacex_capsules():
    url = "https://api.spacexdata.com/v4/capsules"
    try:
        response = requests.get(url, timeout=5)
    except:
        return False
    
    if response.status_code == 200:
        spacex_data = response.json()
        
        for data in spacex_data:
            s_id = data.get('id')
            launches = data.get('launches', [])

            capsule = Capsule.objects.filter(spacex_id=s_id).first()
            
            if capsule:
                if not capsule.is_locally_deleted:
                    capsule.missions_data = launches  
                    if capsule.missions_count == 0:
                        capsule.missions_count = len(launches)
                    
                    capsule.save()
            else:
                Capsule.objects.create(
                    spacex_id=s_id,
                    serial=data.get('serial'),
                    status=data.get('status'),
                    type=data.get('type'),
                    last_update=data.get('last_update'),
                    missions_data=launches,
                    missions_count=len(launches) 
                )
        return True
    return False