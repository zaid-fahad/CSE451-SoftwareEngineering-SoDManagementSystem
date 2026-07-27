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

DAY_CHAR_MAP = {
    "S": "Sunday",
    "M": "Monday",
    "T": "Tuesday",
    "W": "Wednesday",
    "R": "Thursday",
    "F": "Friday",
    "A": "Saturday"
}

def parse_iras_schedule(raw_text: str) -> List[Dict]:
    """
    Parses raw text block from IRAS portal and returns a list of parsed slots.
    Supports both legacy single-line formatting and full spreadsheet tables.
    Raises ValueError if format is not recognized.
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("Format not recognized. Please copy the raw text from the IRAS Schedule page.")

    slots = []
    lines = raw_text.splitlines()

    def normalize_time(t: str) -> str:
        parts = t.split(":")
        hour = parts[0].zfill(2)
        minute = parts[1]
        return f"{hour}:{minute}"

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        # Skip headers
        if "Code" in line_clean and "Time" in line_clean:
            continue

        # 1. Attempt Tab/Multi-space Table Row Parsing
        columns = re.split(r'\t+|\s{2,}', line_clean)
        if len(columns) >= 5:
            course_code = columns[0].strip().upper()
            time_col = columns[4].strip()
            
            # Match day prefix with start and end times, e.g. ST:11:20-12:50 or MW:13:00-14:30
            table_match = re.match(r"^([S|M|T|W|R|F|A]+):(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$", time_col, re.IGNORECASE)
            if table_match:
                day_codes, start_time, end_time = table_match.groups()
                start_norm = normalize_time(start_time)
                end_norm = normalize_time(end_time)
                
                if start_norm < end_norm:
                    for char in day_codes.upper():
                        day_name = DAY_CHAR_MAP.get(char)
                        if day_name:
                            slots.append({
                                "course_code": course_code,
                                "day_of_week": day_name,
                                "start_time": start_norm,
                                "end_time": end_norm,
                                "is_override": False
                            })
                    continue

        # 2. Attempt Legacy Single-Line Format (For backward compatibility & existing tests)
        legacy_match = IRAS_PATTERN.match(line_clean)
        if legacy_match:
            course_code, day_abbr, start_time, end_time = legacy_match.groups()
            day_normalized = DAY_MAP.get(day_abbr.upper())
            if day_normalized:
                start_norm = normalize_time(start_time)
                end_norm = normalize_time(end_time)
                if start_norm < end_norm:
                    slots.append({
                        "course_code": course_code.upper(),
                        "day_of_week": day_normalized,
                        "start_time": start_norm,
                        "end_time": end_norm,
                        "is_override": False
                    })
                    continue

    if not slots:
        raise ValueError("Format not recognized. Please copy the raw text from the IRAS Schedule page.")

    # Remove duplicates
    seen = set()
    unique_slots = []
    for s in slots:
        key = (s["day_of_week"], s["start_time"], s["end_time"], s["course_code"])
        if key not in seen:
            seen.add(key)
            unique_slots.append(s)

    return unique_slots
