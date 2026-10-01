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

TIME_PATTERN = re.compile(
    r"\b([SMTWRFA]+):(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\b",
    re.IGNORECASE
)

def extract_course_code(text: str) -> str:
    cleaned = text.strip()
    # 1. Course code with L followed immediately or with space by Lab/Labwork (e.g. CSE204LLabwork or CSE204L Lab)
    m_lab = re.match(r"^([A-Za-z]{2,5}\s*\d{3}L)(?=Lab\b|Labwork\b|\s|$)", cleaned, re.IGNORECASE)
    if m_lab:
        return m_lab.group(1).replace(" ", "").upper()

    # 2. Exact course code alone (e.g. CSE204 or CSE204L)
    m_exact = re.match(r"^([A-Za-z]{2,5}\s*\d{3}L?)\s*$", cleaned, re.IGNORECASE)
    if m_exact:
        return m_exact.group(1).replace(" ", "").upper()

    # 3. Course code with L followed by space
    m_l_space = re.match(r"^([A-Za-z]{2,5}\s*\d{3}L)\s+", cleaned, re.IGNORECASE)
    if m_l_space:
        return m_l_space.group(1).replace(" ", "").upper()

    # 4. Standard course code prefix before merged title (e.g. MAT203Linear -> MAT203, CSE210Electronics -> CSE210)
    m_standard = re.match(r"^([A-Za-z]{2,5}\s*\d{3})", cleaned, re.IGNORECASE)
    if m_standard:
        return m_standard.group(1).replace(" ", "").upper()

    return cleaned.upper()

def parse_iras_schedule(raw_text: str) -> List[Dict]:
    """
    Parses raw text block from IRAS portal and returns a list of parsed slots.
    Supports spreadsheet tables (separated or merged columns) and legacy single-line formatting.
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

        # 1. Attempt Table Row / Freeform Parsing with Day:Time pattern (e.g. ST:11:20-12:50)
        time_match = TIME_PATTERN.search(line_clean)
        if time_match:
            day_codes, start_time, end_time = time_match.groups()
            start_norm = normalize_time(start_time)
            end_norm = normalize_time(end_time)

            if start_norm < end_norm:
                # Find course code from the first column if tab/spaced, or from before the time match
                columns = re.split(r'\t+|\s{2,}', line_clean)
                first_col = columns[0].strip() if columns else ""
                
                # If first column contains the time itself, search the text before the time match
                if TIME_PATTERN.search(first_col):
                    pre_time_text = line_clean[:time_match.start()].strip()
                    course_code = extract_course_code(pre_time_text)
                else:
                    course_code = extract_course_code(first_col)

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
