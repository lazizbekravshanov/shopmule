import json
from django.conf import settings
from openai import OpenAI


class OpenAIService:
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError('OPENAI_API_KEY is not configured')
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def cleanup_notes(self, text: str) -> dict:
        prompt = (
            "You are a service writer assistant. Return JSON with keys: complaint, cause, correction, "
            "recommended_services (array), customer_summary, suggested_parts (array of objects with sku_or_part_number, description, qty)."
        )
        response = self.client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {'role': 'system', 'content': prompt},
                {'role': 'user', 'content': text},
            ],
            response_format={'type': 'json_object'},
        )
        content = response.choices[0].message.content
        return json.loads(content)

    def draft_estimate_lines(self, text: str) -> dict:
        prompt = (
            "Return JSON with keys: labor_lines (array of objects: description, hours, rate), "
            "part_lines (array of objects: sku_or_part_number, description, qty, unit_cost, unit_price)."
        )
        response = self.client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {'role': 'system', 'content': prompt},
                {'role': 'user', 'content': text},
            ],
            response_format={'type': 'json_object'},
        )
        content = response.choices[0].message.content
        return json.loads(content)
