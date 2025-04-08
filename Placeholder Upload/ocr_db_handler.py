import re
import psycopg2
from uuid import uuid4
from datetime import datetime

# ----------------- TEXT PARSER --------------------

def parse_transaction_data(text):
    merchant_pattern = r"(?:From|Merchant|Store|Paid to|To)\s*[:\-]?\s*([A-Za-z0-9 &.\-]+)"
    amount_pattern = r"(?:Total|Amount|Sum)\s*[:\-]?\s*(-?\d+[.,]?\d*)"
    date_pattern = r"\b(20\d{2}[.\-/]\d{2}[.\-/]\d{2})\b"

    merchant = re.search(merchant_pattern, text, re.IGNORECASE)
    amount = re.search(amount_pattern, text, re.IGNORECASE)
    date = re.search(date_pattern, text)

    return {
        "merchant": merchant.group(1).strip() if merchant else None,
        "amount": float(amount.group(1).replace(",", ".")) if amount else None,
        "date": date.group(1).replace(".", "-").replace("/", "-") if date else None
    }

# ----------------- POSTGRESQL INSERT --------------------

def insert_to_postgres(data, user_id="U1"):
    try:
        conn = psycopg2.connect(
            dbname="ocrdb", user="postgres", password="postgres", host="localhost", port="5432"
        )
        cursor = conn.cursor()

        merchant_name = data["merchant"]
        amount = data["amount"]
        date_str = data["date"]

        if not all([merchant_name, amount, date_str]):
            print("Missing fields in transaction:", data)
            return False

        # Check or insert merchant
        cursor.execute("SELECT merchant_id FROM Merchants WHERE name = %s", (merchant_name,))
        result = cursor.fetchone()

        if result:
            merchant_id = result[0]
        else:
            merchant_id = f"M{str(uuid4())[:8]}"
            cursor.execute(
                "INSERT INTO Merchants (merchant_id, name, default_category_id) VALUES (%s, %s, %s)",
                (merchant_id, merchant_name, None)
            )

        # Insert transaction
        transaction_id = f"T{str(uuid4())[:8]}"
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()

        cursor.execute(
            "INSERT INTO Transactions (transaction_id, date, amount, merchant_id, user_id) VALUES (%s, %s, %s, %s, %s)",
            (transaction_id, date_obj, amount, merchant_id, user_id)
        )

        conn.commit()
        cursor.close()
        conn.close()
        print("Inserted into DB:", transaction_id)
        return True

    except Exception as e:
        print("DB Error:", e)
        return False
