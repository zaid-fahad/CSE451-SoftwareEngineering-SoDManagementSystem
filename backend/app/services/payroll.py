import io
import csv
from typing import List
from app.model.billing import BillingClaim

def generate_payroll_csv(claims: List[BillingClaim]) -> io.StringIO:
    """
    Generates a CSV payroll report stream from a list of BillingClaim objects.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Claim ID", "Student Name", "Department ID", "Email", 
        "Month", "Hours Logged", "Hourly Rate", "Total Amount (BDT/USD)", 
        "Status", "Submission Date"
    ])

    for claim in claims:
        writer.writerow([
            claim.id,
            claim.student.name if claim.student else "Unknown",
            claim.student.department_id if claim.student else "N/A",
            claim.student.email if claim.student else "N/A",
            claim.month,
            claim.hours_logged,
            claim.hourly_rate,
            claim.amount,
            claim.status,
            claim.created_at
        ])

    output.seek(0)
    return output
