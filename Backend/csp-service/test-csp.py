import json
import requests

payload = {
    "period_id": "test",
    "timeout_seconds": 10,
    "courses": [
        {
            "id": "c1",
            "name": "Calculo I",
            "credits": 4,
            "teacher_ids": ["t1"],
            "classroom_ids": ["cr1"],
            "available_slots": [
                {"day": 1, "start_minute": 1140, "end_minute": 1230}
            ]
        }
    ],
    "teacher_availabilities": {
        "t1": [
            {"day": 1, "start_minute": 420, "end_minute": 510}
        ]
    }
}

response = requests.post("http://localhost:8002/solve", json=payload)
print(response.status_code)
print(json.dumps(response.json(), indent=2))
