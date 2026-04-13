from flask import Flask, request, jsonify
from flask_cors import CORS
from homeharvest import scrape_property
from homeharvest.exceptions import InvalidListingType

app = Flask(__name__)
CORS(app)


def map_listing_type(listing_type):
    if listing_type is None:
        return "For Sale"
    lt = str(listing_type).lower()
    if "sold" in lt:
        return "Sold"
    if "pending" in lt:
        return "Pending"
    if "contingent" in lt:
        return "Contingent"
    return "For Sale"


def safe_str(value):
    if value is None:
        return ""
    return str(value)


def build_location(row):
    parts = []
    for field in ["full_street_line", "city", "state", "zip_code"]:
        val = row.get(field)
        if val and str(val).strip() and str(val).strip().lower() not in ("none", "nan"):
            parts.append(str(val).strip())
    return ", ".join(parts)


def build_name(row):
    parts = []
    for field in ["street", "city"]:
        val = row.get(field)
        if val and str(val).strip() and str(val).strip().lower() not in ("none", "nan"):
            parts.append(str(val).strip())
    return ", ".join(parts) if parts else safe_str(row.get("full_street_line", ""))


def safe_num(value):
    try:
        if value is None:
            return None
        v = float(value)
        if v != v:  # NaN check
            return None
        return v
    except (ValueError, TypeError):
        return None


@app.route("/scrape", methods=["POST"])
def scrape():
    try:
        body = request.get_json(force=True)
        mls_id = body.get("mls_id", "").strip()

        if not mls_id:
            return jsonify({"success": False, "error": "mls_id is required"}), 400

        results = scrape_property(
            site_name=["realtor.com", "zillow"],
            listing_type="for_sale",
            mls_id=mls_id,
        )

        if results is None or len(results) == 0:
            return jsonify({"success": False, "error": "Property not found"}), 404

        row = results.iloc[0].to_dict()

        garage = safe_num(row.get("garage"))
        parking = "Yes" if (garage is not None and garage > 0) else "No"

        beds = safe_num(row.get("beds"))
        full_baths = safe_num(row.get("full_baths"))
        sqft = safe_num(row.get("sqft"))
        stories = safe_num(row.get("stories"))
        year_built = safe_num(row.get("year_built"))
        list_price = safe_num(row.get("list_price"))

        listing_type = row.get("style") or row.get("listing_type")

        description = row.get("description") or row.get("text") or ""
        if description and str(description).lower() == "nan":
            description = ""

        data = {
            "name": build_name(row),
            "lrNo": mls_id,
            "status": map_listing_type(listing_type),
            "yearBuilt": int(year_built) if year_built is not None else None,
            "propertyDescription": safe_str(description),
            "location": build_location(row),
            "flooringType": "",
            "parking": parking,
            "Floor": int(stories) if stories is not None else None,
            "price": int(list_price) if list_price is not None else None,
            "beds": int(beds) if beds is not None else None,
            "baths": int(full_baths) if full_baths is not None else None,
            "sqft": int(sqft) if sqft is not None else None,
        }

        return jsonify({"success": True, "data": data}), 200

    except InvalidListingType as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)
