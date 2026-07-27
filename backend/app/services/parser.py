import re
from typing import List, Dict

# Regex to capture: Course Code, Day, Start Time, End Time
# Example: PHY101 - MON - 09:00-11:00
IRAS_PATTERN = re.compile(
    r"^\s*([A-Za-z0-9]+)\s*-\s*([A-Za-z]+)\s*-\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})",
    re.IGNORECASE
)

DAY_MAP = {
    "MON": "Monday", "MONDAY": "Monday",
    "TUE": "Tuesday", "TUESDAY": "Tuesday",
    "WED": "Wednesday", "WEDNESDAY": "Wednesday",
    "THU": "Thursday", "THURSDAY": "Thursday",
    "FRI": "Friday", "FRIDAY": "Friday",
    "SAT": "Saturday", "SATURDAY": "Saturday",
    "SUN": "Sunday", "SUNDAY": "Sunday"
}

def parse_iras_schedule(raw_text: str) -> List[Dict]:
    """
    Parses raw text block from IRAS portal and returns a list of parsed slots.
    Raises ValueError if format is not recognized.
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("Format not recognized. Please copy the raw text from the IRAS Schedule page.")

    slots = []
    lines = raw_text.splitlines()

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        match = IRAS_PATTERN.match(line_clean)
        if not match:
            continue

        course_code, day_abbr, start_time, end_time = match.groups()

        # Normalize day
        day_normalized = DAY_MAP.get(day_abbr.upper())
        if not day_normalized:
            continue

        # Normalize times (ensure HH:MM format with leading zero if single digit hour)
        def normalize_time(t: str) -> str:
            parts = t.split(":")
            hour = parts[0].zfill(2)
            minute = parts[1]
            return f"{hour}:{minute}"

        start_norm = normalize_time(start_time)
        end_norm = normalize_time(end_time)

        # Basic time validation: start before end
        if start_norm >= end_norm:
            continue

        slots.append({
            "course_code": course_code.upper(),
            "day_of_week": day_normalized,
            "start_time": start_norm,
            "end_time": end_norm,
            "is_override": False
        })

    # If no slots were successfully parsed, the format is invalid
    if not slots:
        raise ValueError("Format not recognized. Please copy the raw text from the IRAS Schedule page.")

    # Remove duplicates within the parsed operation
    seen = set()
    unique_slots = []
    for s in slots:
        key = (s["day_of_week"], s["start_time"], s["end_time"], s["course_code"])
        if key not in seen:
            seen.add(key)
            unique_slots.append(s)

    return unique_slots
