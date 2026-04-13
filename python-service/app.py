from flask import Flask, request, jsonify
from flask_cors import CORS
from homeharvest import scrape_property

app = Flask(__name__)
CORS(app)


def map_status(status):
    if status is None:
        return "For Sale"
    s = str(status).lower()
    if "sold" in s:
        return "Sold"
    if "pending" in s:
        return "Pending"
    if "contingent" in s:
        return "Contingent"
    return "For Sale"


def safe_str(value):
    v = str(value) if value is not None else ""
    return "" if v.lower() in ("none", "nan") else v


def safe_num(value):
    try:
        if value is None:
            return None
        v = float(value)
        return None if v != v else v  # NaN check
    except (ValueError, TypeError):
        return None


def build_location(row):
    parts = [safe_str(row.get(f)) for f in ["full_street_line", "city", "state", "zip_code"]]
    return ", ".join(p for p in parts if p)


def build_name(row):
    street = safe_str(row.get("full_street_line")) or safe_str(row.get("street"))
    city = safe_str(row.get("city"))
    return f"{street}, {city}".strip(", ") if street else city


@app.route("/scrape", methods=["POST"])
def scrape():
    try:
        body = request.get_json(force=True)
        location = body.get("location", "").strip()

        if not location:
            return jsonify({"success": False, "error": "location is required"}), 400

        results = scrape_property(
            location=location,
            listing_type=["for_sale", "sold", "pending"],
            limit=1,
        )

        if results is None or len(results) == 0:
            return jsonify({"success": False, "error": "Property not found"}), 404

        row = results.iloc[0].to_dict()

        garage = safe_num(row.get("garage"))
        parking = "Yes" if (garage is not None and garage > 0) else "No"

        data = {
            "name": build_name(row),
            "lrNo": safe_str(row.get("mls_id")) or safe_str(row.get("listing_id")),
            "status": map_status(row.get("status")),
            "yearBuilt": int(safe_num(row.get("year_built"))) if safe_num(row.get("year_built")) else None,
            "propertyDescription": safe_str(row.get("text") or row.get("description")),
            "location": build_location(row),
            "flooringType": "",
            "parking": parking,
            "Floor": int(safe_num(row.get("stories"))) if safe_num(row.get("stories")) else None,
            "price": int(safe_num(row.get("list_price"))) if safe_num(row.get("list_price")) else None,
            "beds": int(safe_num(row.get("beds"))) if safe_num(row.get("beds")) else None,
            "baths": int(safe_num(row.get("full_baths"))) if safe_num(row.get("full_baths")) else None,
            "sqft": int(safe_num(row.get("sqft"))) if safe_num(row.get("sqft")) else None,
        }

        return jsonify({"success": True, "data": data}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)
