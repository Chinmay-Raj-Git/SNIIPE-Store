from flask import Blueprint, request, jsonify, render_template
from .models import *
from . import db
from app import get_supabase
from .auth_utils import require_auth
from flask import g
from decimal import Decimal


bp = Blueprint("routes", __name__)

# ----------------------------------------------------------
# --PRODUCTS
# ----------------------------------------------------------


# -----------------------------
# ----GET all products
# -----------------------------
@bp.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": float(p.price),
            "stock": p.stock,
            "category": p.category,
            "image_url": p.image_url
        }
        for p in products
    ])


# -----------------------------
# ----GET: Single product by ID
# -----------------------------
# @bp.route("/product/<int:product_id>")
# def product_page(product_id):
#     product = Product.query.get_or_404(product_id)
#     variants = Product_Variants.query.filter_by(product_id=product_id).all()
#     similar = Product.query.filter(
#         Product.category == product.category,
#         Product.id != product.id
#     ).limit(6).all()

#     return render_template(
#         "product.html",
#         product=product,
#         variants=variants,
#         similar=similar
#     )
@bp.route("/product/<int:product_id>")
def product_page(product_id):
    product = Product.query.get_or_404(product_id)

    variants = Product_Variants.query.filter_by(product_id=product_id).all()
    colors = list({v.color for v in variants})
    sizes = list({v.size for v in variants})

    similar = Product.query.filter(Product.category == product.category, Product.id != product_id).limit(4)

    return render_template("product.html",
                           product=product,
                           colors=colors,
                           sizes=sizes,
                           variants=[{
                               "id": v.id,
                               "color": v.color,
                               "size": v.size,
                               "image_url": v.image_url,
                               "stock": v.stock,
                               "price_override": v.price_override
                           } for v in variants],
                           similar=similar)




# -----------------------------
# ----POST: Add a new product
# -----------------------------
@bp.route("/products", methods=["POST"])
def add_product():
    data = request.json
    product = Product(
        name=data.get("name"),
        description=data.get("description"),
        price=data.get("price"),
        stock=data.get("stock", 0),
        category=data.get("category"),
        image_url=data.get("image_url")
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({"message": "Product added successfully", "id": product.id}), 201


# -----------------------------
# ----PUT: Update product
# -----------------------------
@bp.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.json

    product.name = data.get("name", product.name)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)
    product.stock = data.get("stock", product.stock)
    product.category = data.get("category", product.category)
    product.image_url = data.get("image_url", product.image_url)

    db.session.commit()
    return jsonify({"message": "Product updated successfully"})


# -----------------------------
# ----DELETE: Remove product
# -----------------------------
@bp.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully"})

# ----------------------------------------------------------
# --END OF PRODUCTS--
# ----------------------------------------------------------



# ----------------------------------------------------------
# --PRODUCT VARIANTS
# ----------------------------------------------------------

# -----------------------------
# ----GET all product variants
# -----------------------------
@bp.route('/products/<int:product_id>/variants', methods=['GET'])
def get_variants_by_id(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    variants = Product_Variants.query.filter_by(product_id=product_id).all()
    result = [
        {
            "id": v.id,
            "product_id": v.product_id,
            "color": v.color,
            "size": v.size,
            "stock": v.stock,
            "price_override": v.price_override,
            "image_url": v.image_url
        } for v in variants
    ]

    return jsonify(result)

@bp.route('/products/<string:product_name>/variants', methods=['GET'])
def get_variants_by_name(product_name):
    product = Product.query.filter_by(name=product_name).first()
    if not product:
        return jsonify({"error": "Product not found"}), 404

    product_id = product.id
    variants = Product_Variants.query.filter_by(product_id=product_id).all()
    result = [
        {
            "id": v.id,
            "product_id": v.product_id,
            "color": v.color,
            "size": v.size,
            "stock": v.stock,
            "price_override": v.price_override,
            "image_url": v.image_url
        } for v in variants
    ]

    return jsonify(result)

# -----------------------------
# ----POST: Add a new product variant
# -----------------------------
@bp.route('/products/<int:product_id>/variants', methods=['POST'])
def add_variant(product_id):
    data = request.get_json()

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    variant = Product_Variants(
        product_id=product_id,
        color=data.get('color'),
        size=data.get('size'),
        stock=data.get('stock', 0),
        price_override=data.get('price_override'),
        image_url=data.get('image_url')
    )
    db.session.add(variant)
    db.session.commit()

    return jsonify({"message": "Variant added successfully", "variant_id": variant.id}), 201

@bp.route('/products/<string:product_name>/variants', methods=['POST'])
def add_variant_by_name(product_name):
    data = request.get_json()

    product = Product.query.filter_by(name=product_name).first()
    if not product:
        return jsonify({"error": "Product not found"}), 404

    product_id = product.id
    variant = Product_Variants(
        product_id=product_id,
        color=data.get('color'),
        size=data.get('size'),
        stock=data.get('stock', 0),
        price_override=data.get('price_override'),
        image_url=data.get('image_url')
    )
    db.session.add(variant)
    db.session.commit()

    return jsonify({"message": "Variant added successfully", "variant_id": variant.id}), 201

# -----------------------------
# ----PUT: Update a product variant
# -----------------------------
@bp.route('/variants/<int:variant_id>', methods=['PUT'])
def update_variant(variant_id):
    data = request.get_json()
    variant = Product_Variants.query.get(variant_id)

    if not variant:
        return jsonify({"error": "Variant not found"}), 404

    variant.color = data.get('color', variant.color)
    variant.size = data.get('size', variant.size)
    variant.stock = data.get('stock', variant.stock)
    variant.price_override = data.get('price_override', variant.price_override)
    variant.image_url = data.get('image_url', variant.image_url)

    db.session.commit()
    return jsonify({"message": "Variant updated successfully"})

# -----------------------------
# ----DELETE: Delete a product variant
# -----------------------------
@bp.route('/variants/<int:variant_id>', methods=['DELETE'])
def delete_variant(variant_id):
    variant = Product_Variants.query.get(variant_id)

    if not variant:
        return jsonify({"error": "Variant not found"}), 404

    db.session.delete(variant)
    db.session.commit()
    return jsonify({"message": "Variant deleted successfully"})

# ----------------------------------------------------------
# --END OF PRODUCT VARIANTS-
# ----------------------------------------------------------



# ----------------------------------------------------------
# --USER AUTH
# ----------------------------------------------------------

# -----------------------------
# ----POST: User Registration
# -----------------------------
@bp.route("/register", methods=["POST"])
def register_user():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    supabase = get_supabase()

    try:
        res = supabase.auth.sign_up({"email": email, "password": password})

        if res.user:
            user_data = res.user
            new_user = Users(
                            id=user_data.id, # Refers to supabase UUID
                            email=email,
                            name=name,
                            created_at=user_data.created_at,
                            updated_at=user_data.updated_at
                        )
            db.session.add(new_user)
            db.session.commit()

            return jsonify({
                "message": "User registered", 
                "user": res.user.email,
                "supabase_id": str(user_data.id)
                }), 201

        return jsonify({"error": "Unknown registration issue"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# ----POST: User Login
# -----------------------------
@bp.route("/login", methods=["POST"])
def login_user():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    supabase = get_supabase()
    res = supabase.auth.sign_in_with_password({"email": email, "password": password})
    if res.session:
        return jsonify({
            "message": "Login successful",
            "access_token": res.session.access_token
        })
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# ----------------------------------------------------------
# --END OF USER AUTH-
# ----------------------------------------------------------



# ----------------------------------------------------------
# --USER PROFILE
# ----------------------------------------------------------

# -----------------------------
# ----GET: User Profile
# -----------------------------
@bp.route("/profile/me", methods=["GET"])
@require_auth
def get_profile():
    user = g.user
    return jsonify({
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "created_at": user.created_at
    }), 200

# -----------------------------
# ----PUT: Update User Profile
# -----------------------------
@bp.route("/profile/me", methods=["PUT"])
@require_auth
def update_profile():
    user = g.user
    data = request.json
    user.name = data.get("name", user.name)
    db.session.commit()
    return jsonify({"message": "Profile updated successfully"})


# ----------------------------------------------------------
# --END OF USER PROFILE-
# ----------------------------------------------------------



# ----------------------------------------------------------
# --CART SYSTEM
# ----------------------------------------------------------


# -----------------------------
# ----GET: View Cart Items
# -----------------------------
@bp.route("/cart", methods=["GET"])
@require_auth
def get_cart():
    user_id = g.user.id
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({"cart": [], "total": 0})

    cart_items = []
    total = 0
    for item in cart.items:
        product_info = {
            "id": item.id,
            "product_name": item.product.name,
            "variant_color": item.variant.color,
            "variant_size": item.variant.size,
            "quantity": item.quantity,
            "price": item.price_at_time,
            "subtotal": item.quantity * item.price_at_time
        }
        total += product_info["subtotal"]
        cart_items.append(product_info)

    return jsonify({"cart": cart_items, "total": total})

# -----------------------------
# ----POST: Add to Cart
# -----------------------------
@bp.route("/cart/add", methods=["POST"])
@require_auth
def add_to_cart():
    data = request.json
    product_name = data.get("product_name")
    product_id = Product.query.filter_by(name=product_name).first().id
    variant_id = data.get("variant_id")
    quantity = data.get("quantity", 1)

    user_id = g.user.id
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    price = product.price
    if variant_id:
        variant = Product_Variants.query.get(variant_id)
        if not variant:
            return jsonify({"error": "Variant not found"}), 404
        price = variant.price_override or product.price

    # Check if already in cart
    existing_item = CartItem.query.filter_by(
        cart_id=cart.id, product_id=product_id, variant_id=variant_id
    ).first()

    if existing_item:
        existing_item.quantity += quantity
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            variant_id=variant_id,
            quantity=quantity,
            price_at_time=price,
        )
        db.session.add(new_item)

    db.session.commit()
    return jsonify({"message": "Item added to cart successfully"})

# -----------------------------
# ----PUT: Update Cart
# -----------------------------
@bp.route("/cart/update/<int:item_id>", methods=["PUT"])
@require_auth
def update_cart_item(item_id):
    data = request.json
    new_quantity = data.get("quantity")

    if new_quantity is None or new_quantity < 1:
        return jsonify({"error": "Invalid quantity"}), 400

    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    # Ensure user owns this cart
    if item.cart.user_id != g.user.id:
        return jsonify({"error": "Unauthorized"}), 403

    item.quantity = new_quantity
    db.session.commit()
    return jsonify({"message": "Quantity updated"})

# -----------------------------
# ----DELETE: Remove from Cart
# -----------------------------
@bp.route("/cart/remove/<int:item_id>", methods=["DELETE"])
@require_auth
def remove_cart_item(item_id):
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    if item.cart.user_id != g.user.id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item removed"})

# -----------------------------
# ----DELETE: Delete Cart
# -----------------------------
@bp.route("/cart/clear", methods=["DELETE"])
@require_auth
def clear_cart():
    user_id = g.user.id
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({"message": "Cart is already empty"})

    CartItem.query.filter_by(cart_id=cart.id).delete()
    db.session.commit()
    return jsonify({"message": "Cart cleared"})


# ----------------------------------------------------------
# --END OF CART SYSTEM-
# ----------------------------------------------------------



# ----------------------------------------------------------
# --ORDERS SYSTEM-
# ----------------------------------------------------------


# -----------------------------
# ----GET: View orders
# -----------------------------
@bp.route("/orders", methods=["GET"])
@require_auth
def list_orders():
    orders = Order.query.filter_by(user_id=g.user.id).order_by(Order.created_at.desc()).all()
    data = []
    for order in orders:
        data.append({
            "id": order.id,
            "status": order.status,
            "total": str(order.total_amount),
            "created_at": order.created_at.strftime("%Y-%m-%d %H:%M"),
            "items": [
                {
                    "product": item.product.name,
                    "variant_color": item.variant.color if item.variant else None,
                    "variant_size": item.variant.size,
                    "quantity": item.quantity,
                    "subtotal": str(item.subtotal)
                } for item in order.items
            ]
        })
    return jsonify({"orders": data})

# -----------------------------
# ----POST: Create order
# -----------------------------
@bp.route("/orders/create", methods=["POST"])
@require_auth
def create_order():
    try:
        # Get user's cart
        cart = Cart.query.filter_by(user_id=g.user.id).first()
        if not cart or not cart.items:
            return jsonify({"error": "Your cart is empty."}), 400

        # Calculate total
        total = Decimal("0.00")
        for item in cart.items:
            total += Decimal(item.quantity) * Decimal(item.price_at_time)

        # (Optional) Reduce stock for the variant or product
        if item.variant:
            if item.variant.stock >= item.quantity:
                item.variant.stock -= item.quantity
            else:
                # db.session.rollback()
                return jsonify({"error": f"Insufficient stock for {item.variant.id}"}), 400

        # Create the order
        new_order = Order(
            user_id=g.user.id,
            total_amount=total,
            payment_method=request.json.get("payment_method", "COD"),
            status="pending"
        )
        db.session.add(new_order)
        db.session.flush()  # To get the new order ID

        # Create order items
        for item in cart.items:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item.product_id,
                variant_id=item.variant_id,
                quantity=item.quantity,
                price_at_time=item.price_at_time,
                subtotal=item.quantity * item.price_at_time
            )
            db.session.add(order_item)

        # Clear the cart
        CartItem.query.filter_by(cart_id=cart.id).delete()

        db.session.commit()

        return jsonify({
            "message": "✅ Order created successfully",
            "order_id": new_order.id,
            "total": str(total)
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create order: {str(e)}"}), 500


# ----------------------------------------------------------
# --END OF ORDERS SYSTEM
# ----------------------------------------------------------



# Admin routes have been moved to app/admin/admin_routes.py


# -----------------------------
# INDEX RENDERING
# -----------------------------
@bp.route("/")
def index():
    return render_template("landing.html")

# -----------------------------
# USER AUTH PAGE RENDERING
# -----------------------------
@bp.route("/auth-test")
def auth_test_page():
    return render_template("auth_test.html")

# -----------------------------
# VERIFICATION PAGE RENDERING
# -----------------------------
@bp.route("/email-verified")
def email_verified_page():
    return render_template("email_verified.html")

# -----------------------------
# HOME PAGE RENDERING
# -----------------------------
@bp.route("/home")
def home():
    return render_template("home.html")

# -----------------------------
# PROFILE PAGE RENDERING
# -----------------------------
@bp.route("/profile")
def profile():
    return render_template("profile.html")

# -----------------------------
# CART PAGE RENDERING
# -----------------------------
@bp.route("/cart-page")
def cart_page():
    return render_template("cart.html")

# # -----------------------------
# # ADMIN PAGE RENDERING
# # -----------------------------
# @bp.route('/admin')
# def admin():
#     return render_template('../admin/templates/admin_dashboard.html')

# -----------------------------
# LOGIN PAGE RENDERING
# -----------------------------
@bp.route('/login-page')
def admin_ops():
    return render_template('login.html')

# -----------------------------
# REGISTER PAGE RENDERING
# -----------------------------
@bp.route("/register-page")
def register_page():
    return render_template("register.html")

