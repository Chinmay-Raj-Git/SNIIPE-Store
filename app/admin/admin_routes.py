from flask import render_template, request, jsonify, redirect, session, g
from . import admin_bp
from app.models import *
from app import db
from .admin_utils import require_admin
from app import get_supabase


# ───────────────────────────────────────────────
# ADMIN LOGIN PAGE
# ───────────────────────────────────────────────
@admin_bp.route("/login")
def admin_login_page():
    # If already authenticated, redirect to dashboard
    return render_template("admin/admin_login.html")


# ───────────────────────────────────────────────
# ADMIN AUTHENTICATION (Login)
# ───────────────────────────────────────────────
@admin_bp.route("/auth", methods=["POST"])
def admin_auth():
    """Admin login using Supabase - checks if user is admin"""
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    supabase = get_supabase()
    
    try:
        # Authenticate with Supabase
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        
        if not res.session:
            return jsonify({"error": "Invalid credentials"}), 401

        # Check if user is admin
        user_info = res.user
        from .admin_utils import ADMIN_EMAILS
        
        if user_info.email not in ADMIN_EMAILS:
            return jsonify({"error": "Admin access only. This account is not authorized."}), 403

        # Ensure user exists locally
        user = Users.query.get(user_info.id)
        if not user:
            user = Users(
                id=user_info.id,
                email=user_info.email,
                name=None,
                created_at=user_info.created_at
            )
            db.session.add(user)
            db.session.commit()

        return jsonify({
            "message": "Login successful",
            "access_token": res.session.access_token,
            "email": user_info.email
        })
    except Exception as e:
        return jsonify({"error": f"Authentication failed: {str(e)}"}), 401


# ───────────────────────────────────────────────
# DASHBOARD HOME
# ───────────────────────────────────────────────
@admin_bp.route("/")
def admin_dashboard():
    # Check auth via token in request
    return render_template("admin/admin_dashboard.html")


# ───────────────────────────────────────────────
# DASHBOARD STATS API
# ───────────────────────────────────────────────
@admin_bp.route("/api/stats", methods=["GET"])
@require_admin
def admin_stats():
    try:
        return jsonify({
            "products": Product.query.count(),
            "orders": Order.query.count(),
            "users": Users.query.count(),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────────────────────────────────────
# PRODUCTS API
# ───────────────────────────────────────────────
@admin_bp.route("/api/products", methods=["GET"])
@require_admin
def admin_get_products():
    try:
        products = Product.query.all()
        result = []

        for p in products:
            thumbnail = Product_Variant_Images.query.filter_by(
                product_id=p.id,
                role="thumbnail"
            ).order_by(Product_Variant_Images.sort_order.asc()).first()

            result.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": float(p.price),
                "category": p.category,
                "thumbnail": thumbnail.image_url if thumbnail else None
            })

        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@admin_bp.route("/api/products/<int:id>", methods=["GET"])
@require_admin
def admin_get_product(id):
    try:
        product = Product.query.get_or_404(id)

        variants = Product_Variants.query.filter_by(product_id=id).all()
        images = Product_Variant_Images.query.filter_by(
            product_id=id
        ).order_by(Product_Variant_Images.sort_order.asc()).all()

        return jsonify({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": float(product.price),
            "category": product.category,
            "variants": [{
                "id": v.id,
                "color": v.color,
                "size": v.size,
                "stock": v.stock,
                "price_override": float(v.price_override) if v.price_override else None
            } for v in variants],
            "images": [{
                "id": img.id,
                "color": img.color,
                "image_url": img.image_url,
                "role": img.role,
                "sort_order": img.sort_order
            } for img in images]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/api/products", methods=["POST"])
@require_admin
def admin_create_product():
    try:
        data = request.json

        if not data.get("name") or not data.get("price"):
            return jsonify({"error": "Name and price are required"}), 400

        product = Product(
            name=data.get("name"),
            description=data.get("description"),
            price=data.get("price"),
            category=data.get("category")
        )

        db.session.add(product)
        db.session.commit()

        return jsonify({"message": "Product created", "id": product.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/api/products/<int:id>/duplicate", methods=["POST"])
@require_admin
def admin_duplicate_product(id):
    try:
        # Product Duplication
        product = Product.query.get_or_404(id)
        
        new_product = Product(
            name=f"{product.name} (Copy)",
            description=product.description,
            price=product.price,
            category=product.category
        )
        db.session.add(new_product)
        db.session.flush()  # Get new product ID

        # Variant Duplication
        variants = Product_Variants.query.filter_by(product_id=product.id).all()
        for v in variants:
            new_variant = Product_Variants(
                product_id=new_product.id,
                color=v.color,
                size=v.size,
                stock=v.stock,
                price_override=v.price_override
            )
            db.session.add(new_variant)

        # Images Duplication
        images = Product_Variant_Images.query.filter_by(product_id=product.id).all()
        for img in images:
            new_img = Product_Variant_Images(
                product_id=new_product.id,
                color=img.color,
                image_url=img.image_url,
                role=img.role,
                sort_order=img.sort_order
            )
            db.session.add(new_img)

        db.session.commit()

        return jsonify({
            "message": "Product duplicated successfully",
            "new_product_id": new_product.id
        })
        
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/api/products/<int:id>", methods=["PUT"])
@require_admin
def admin_update_product(id):
    try:
        product = Product.query.get_or_404(id)
        data = request.json

        if data.get("name"):
            product.name = data.get("name")
        if data.get("description") is not None:
            product.description = data.get("description")
        if data.get("price") is not None:
            product.price = data.get("price")
        if data.get("category") is not None:
            product.category = data.get("category")

        db.session.commit()
        return jsonify({"message": "Product updated"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/api/products/<int:id>", methods=["DELETE"])
@require_admin
def admin_delete_product(id):
    try:
        product = Product.query.get_or_404(id)
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



# ───────────────────────────────────────────────
# VARIANTS API
# ───────────────────────────────────────────────
@admin_bp.route("/api/products/<int:id>/variants", methods=["GET"])
@require_admin
def admin_get_variants(id):
    variants = Product_Variants.query.filter_by(product_id=id).all()

    return jsonify([
        {
            "id": v.id,
            "color": v.color,
            "size": v.size,
            "stock": v.stock,
            "price_override": float(v.price_override) if v.price_override else None
        }
        for v in variants
    ])
    

@admin_bp.route("/api/products/<int:id>/variants", methods=["POST"])
@require_admin
def admin_add_variant(id):
    data = request.json

    variant = Product_Variants(
        product_id=id,
        color=data.get("color"),
        size=data.get("size"),
        stock=data.get("stock", 0),
        price_override=data.get("price_override")
    )

    db.session.add(variant)
    db.session.commit()

    return jsonify({"message": "Variant added", "id": variant.id}), 201



@admin_bp.route("/api/variants/<int:vid>", methods=["PUT"])
@require_admin
def admin_update_variant(vid):
    data = request.json
    variant = Product_Variants.query.get_or_404(vid)

    if data.get("color") is not None:
        variant.color = data["color"]
    if data.get("size") is not None:
        variant.size = data["size"]
    if data.get("stock") is not None:
        variant.stock = data["stock"]
    if data.get("price_override") is not None:
        variant.price_override = data["price_override"]

    db.session.commit()
    return jsonify({"message": "Variant updated"})



@admin_bp.route("/api/variants/<int:vid>", methods=["DELETE"])
@require_admin
def admin_delete_variant(vid):
    try:
        variant = Product_Variants.query.get(vid)
        if not variant:
            return jsonify({"error": "Variant not found"}), 404
        db.session.delete(variant)
        db.session.commit()
        return jsonify({"message": "Variant deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



# ───────────────────────────────────────────────
# IMAGES API
# ───────────────────────────────────────────────
@admin_bp.route("/api/products/<int:product_id>/images", methods=["POST"])
@require_admin
def admin_add_product_image(product_id):
    data = request.json

    image = Product_Variant_Images(
        product_id=product_id,
        color=data.get("color"),
        image_url=data.get("image_url"),
        role=data.get("role", "gallery"),
        sort_order=data.get("sort_order", 0)
    )

    db.session.add(image)
    db.session.commit()

    return jsonify({"message": "Image added successfully"})

@admin_bp.route("/api/images/<int:image_id>", methods=["PUT"])
@require_admin
def admin_update_image(image_id):
    try:
        image = Product_Variant_Images.query.get_or_404(image_id)
        data = request.json or {}

        # Basic validation
        if "image_url" in data and not data["image_url"]:
            return jsonify({"error": "Image URL cannot be empty"}), 400

        # Update fields if provided
        if data.get("color") is not None:
            image.color = data["color"]

        if data.get("image_url") is not None:
            image.image_url = data["image_url"]

        if data.get("sort_order") is not None:
            image.sort_order = data["sort_order"]

        # Role handling (only if sent)
        if data.get("role") is not None:
            new_role = data["role"]

            # Enforce single primary / thumbnail per product
            if new_role in ("primary", "thumbnail"):
                Product_Variant_Images.query.filter(
                    Product_Variant_Images.product_id == image.product_id,
                    Product_Variant_Images.role == new_role,
                    Product_Variant_Images.id != image.id
                ).update({"role": "gallery"})

            image.role = new_role

        db.session.commit()

        return jsonify({
            "message": "Image updated successfully",
            "id": image.id
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/api/images/<int:image_id>", methods=["DELETE"])
@require_admin
def admin_delete_image(image_id):
    image = Product_Variant_Images.query.get_or_404(image_id)
    db.session.delete(image)
    db.session.commit()
    return jsonify({"message": "Image deleted"})



# ───────────────────────────────────────────────
# ORDERS API
# ───────────────────────────────────────────────
@admin_bp.route("/api/orders", methods=["GET"])
@require_admin
def admin_orders():
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify([
            {
                "id": o.id,
                "user": o.user.email if o.user else "Unknown",
                "total": str(o.total_amount),
                "status": o.status,
                "created": o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else "N/A"
            } for o in orders
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ---USERS API---
@admin_bp.route("/api/users", methods=["GET"])
@require_admin
def admin_users():
    try:
        users = Users.query.all()
        return jsonify([{
            "id": str(u.id),
            "email": u.email,
            "name": u.name,
            "created": u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else "N/A"
        } for u in users])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────────────────────────────────────
# ADMIN PAGES (Render Templates)
# ───────────────────────────────────────────────
@admin_bp.route("/products")
def admin_products_page():
    """Render products management page"""
    return render_template("admin/admin_products.html")


@admin_bp.route("/products/<int:id>")
def admin_product_detail_page(id):
    """Render single product detail page"""
    return render_template("admin/admin_product_detail.html", product_id=id)


@admin_bp.route("/orders")
def admin_orders_page():
    """Render orders management page"""
    return render_template("admin/admin_orders.html")


@admin_bp.route("/users")
def admin_users_page():
    """Render users management page"""
    return render_template("admin/admin_users.html")
