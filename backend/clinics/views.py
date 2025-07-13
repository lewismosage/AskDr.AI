# clinics/views.py
import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([AllowAny])
def get_nearby_clinics(request):
    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")
    radius_km = request.data.get("radius_km", 5)
    place_type = request.data.get("type", None)

    if not latitude or not longitude:
        return Response({"error": "Latitude and longitude are required."}, status=400)

    radius = float(radius_km) * 1000  # Convert to meters
    GOOGLE_API_KEY = settings.GOOGLE_MAPS_API_KEY
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

    # Build params dynamically
    params = {
        "location": f"{latitude},{longitude}",
        "radius": radius,
        "key": GOOGLE_API_KEY
    }
    if place_type:
        params["type"] = place_type

    try:
        res = requests.get(url, params=params)
        data = res.json()

        # Log the response for debugging
        print("Google API Response:", data)

        results = []
        for place in data.get("results", []):
            results.append({
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "rating": place.get("rating"),
                "location": place["geometry"]["location"],
                "place_id": place.get("place_id")
            })

        return Response({"clinics": results})
    except Exception as e:
        return Response({"error": str(e)}, status=500)