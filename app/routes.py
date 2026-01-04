from flask import Blueprint, request, jsonify, render_template
from .models import *
from . import db
from app import get_supabase
from .auth_utils import require_auth
from flask import g
from decimal import Decimal
from urllib.parse import quote
import razorpay
from flask import current_app as app
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from sqlalchemy import and_

bp = Blueprint("routes", __name__)

# ----------------------------------------------------------
# HELPERS
# ----------------------------------------------------------
def cleanup_stale_pending_orders(user_id):
    cutoff_time = datetime.utcnow() - timedelta(minutes=30)

    stale_orders = Order.query.filter(
        and_(
            Order.user_id == user_id,
            Order.status == "pending_payment",
            Order.razorpay_payment_id.is_(None),
            Order.created_at < cutoff_time
        )
    ).all()

    for order in stale_orders:
        db.session.delete(order)

    if stale_orders:
        db.session.commit()

def get_razorpay_client():
    return razorpay.Client(
        auth=(
            app.config["RAZORPAY_KEY_ID"],
            app.config["RAZORPAY_KEY_SECRET"]
        )
    )
    
def get_default_address(user_id):
    return UserAddress.query.filter_by(
        user_id=user_id, is_default=True
    ).first()

def get_user_friendly_status(status):
    mapping = {
        "pending": "Pending payment",
        "pending_payment": "Pending payment",
        "paid": "Payment successful",
        "shipping_created": "Order confirmed",
        "awb_assigned": "Picked up",
        "in_transit": "On the way",
        "delivered": "Delivered",
        "cancelled": "Cancelled"
    }
    return mapping.get(status, "Processing")



# ----------------------------------------------------------
# --PRODUCTS
# ----------------------------------------------------------


# -----------------------------
# ----GET all products
# -----------------------------
@bp.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()

    response = []
    for p in products:
        thumbnail = Product_Variant_Images.query.filter_by(
            product_id=p.id,
            role="thumbnail"
        ).order_by(Product_Variant_Images.sort_order.asc()).first()

        response.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": float(p.price),
            "category": p.category,
            "thumbnail": thumbnail.image_url if thumbnail else None
        })

    return jsonify(response)


# -----------------------------
# ----GET: Product by id
# -----------------------------
@bp.route("/product/<int:product_id>")
def product_page(product_id):
    product = Product.query.get_or_404(product_id)

    variants = Product_Variants.query.filter_by(product_id=product_id).all()

    color_map = {}

    for v in variants:
        if v.color not in color_map:
            images = Product_Variant_Images.query.filter_by(
                product_id=product_id,
                color=v.color
            ).order_by(Product_Variant_Images.sort_order.asc()).all()

            color_map[v.color] = {
                "images": [
                    {
                        "image_url": img.image_url,
                        "role": img.role
                    }
                    for img in images
                ],
                "sizes": []
            }

        color_map[v.color]["sizes"].append({
            "variant_id": v.id,
            "size": v.size,
            "stock": v.stock,
            "price_override": float(v.price_override) if v.price_override else None
        })

    colors = list(color_map.keys())
    sizes = sorted({v.size for v in variants})

    similar_products = Product.query.filter(
        Product.category == product.category,
        Product.id != product_id
    ).limit(4)
    
    similar_products_data = []
    for p in similar_products:
        thumbnail = Product_Variant_Images.query.filter_by(
            product_id=p.id,
            role="thumbnail"
        ).order_by(Product_Variant_Images.sort_order.asc()).first()

        similar_products_data.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "category": p.category,
            "thumbnail": thumbnail.image_url if thumbnail else None
        })    

    return render_template(
        "product.html",
        product=product,
        color_data=color_map,
        colors=colors,
        sizes=sizes,
        similar_products=similar_products_data
    )



# -----------------------------
# ----GET: images for a product
# -----------------------------
@bp.route("/products/<int:product_id>/images", methods=["GET"])
def get_product_images(product_id):
    color = request.args.get("color")

    query = Product_Variant_Images.query.filter_by(product_id=product_id)
    if color:
        query = query.filter_by(color=color)

    images = query.order_by(Product_Variant_Images.sort_order.asc()).all()

    return jsonify([
        {
            "id": img.id,
            "color": img.color,
            "image_url": img.image_url,
            "role": img.role,
            "sort_order": img.sort_order
        } for img in images
    ])
    

# ----------------------------------------------------------
# --END OF PRODUCTS--
# ----------------------------------------------------------



# ----------------------------------------------------------
# --PRODUCT VARIANTS
# ----------------------------------------------------------

# -----------------------------
# ----GET: all product variants
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
            "price_override": v.price_override
        } for v in variants
    ]

    return jsonify(result)


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
        
        if res.user is None:
            error_message = "Registration failed"

            # Supabase sometimes gives helpful messages
            if hasattr(res, "error") and res.error:
                if "already" in res.error.message.lower():
                    error_message = "Email already exists"
                else:
                    error_message = res.error.message

            return jsonify({"error": error_message}), 409

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
    try:
        supabase = get_supabase()
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if res.session:
            return jsonify({
                "message": "Login successful",
                "access_token": res.session.access_token,
                "next": "home"
            })
    except Exception as e:
        return jsonify({"error": "Invalid Credentials"}), 401
    
@bp.route("/login/<string:target>", methods=["POST"])
def login_user_target(target):
    data = request.json
    email = data.get("email")
    password = data.get("password")
    try:
        supabase = get_supabase()
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if res.session:
            return jsonify({
                "message": "Login successful",
                "access_token": res.session.access_token,
                "next": target
            })
    except Exception as e:
        return jsonify({"error": "Invalid Credentials"}), 401
        
# -----------------------------
# ----GET: Verified or not
# -----------------------------
@bp.route("/check-verification", methods=["GET"])
def check_verification():
    supabase = get_supabase()

    try:
        user = supabase.auth.get_user()
        if user and user.user and user.user.email_confirmed_at:
            return jsonify({"verified": True})
        return jsonify({"verified": False})
    except:
        return jsonify({"verified": False})

# -----------------------------
# ----POST: Forgot Password
# -----------------------------
@bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email required"}), 400

    try:
        supabase = get_supabase()
        supabase.auth.reset_password_email(email)
        return jsonify({"message": "Password reset email sent"})
    except Exception:
        return jsonify({"error": "Failed to send reset email"}), 500

# -----------------------------
# ----OAUTH Login
# -----------------------------  
# @bp.route("/auth/oauth/<provider>")
# def oauth_login(provider):
#     supabase = get_supabase()

#     try:
#         res = supabase.auth.sign_in_with_oauth({
#             "provider": provider,
#             "options": {
#                 "redirect_to": "http://localhost:5000/auth/callback"
#             }
#         })
#         return jsonify({"url": res.url})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

# -----------------------------
# ----POST: OAuth Login (Google)
# -----------------------------
@bp.route("/auth/oauth-login", methods=["POST"])
def oauth_login_backend():
    data = request.json
    supabase_access_token = data.get("access_token")

    if not supabase_access_token:
        return jsonify({"error": "Missing OAuth token"}), 400

    supabase = get_supabase()

    try:
        # 1️⃣ Get user info from Supabase using access token
        user_res = supabase.auth.get_user(supabase_access_token)

        if not user_res or not user_res.user:
            return jsonify({"error": "Invalid OAuth session"}), 401

        supa_user = user_res.user
        email = supa_user.email
        name = supa_user.user_metadata.get("full_name") or supa_user.user_metadata.get("name") or email.split("@")[0]

        # 2️⃣ Check if user exists in our DB
        user = Users.query.filter_by(id=supa_user.id).first()

        # 3️⃣ If not, create user
        if not user:
            user = Users(
                id=supa_user.id,          # Supabase UUID
                email=email,
                name=name,
                created_at=supa_user.created_at,
                updated_at=supa_user.updated_at
            )
            db.session.add(user)
            db.session.commit()

        # 4️⃣ Return access token (reuse Supabase token)
        return jsonify({
            "message": "OAuth login successful",
            "access_token": supabase_access_token
        })

    except Exception as e:
        print("OAuth backend error:", e)
        return jsonify({"error": "OAuth login failed"}), 500


@bp.route("/auth/callback")
def oauth_callback():
    return render_template("oauth_callback.html")

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
        "created_at": user.created_at,
        "phone": user.phone,
        "whatsapp_opt_in": user.whatsapp_opt_in
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
    user.phone = data.get("phone", user.phone)
    user.whatsapp_opt_in = data.get("whatsapp_opt_in", user.whatsapp_opt_in)
    db.session.commit()
    return jsonify({"message": "Profile updated successfully"})


# -----------------------------
# ----GET: Addresses of User
# -----------------------------
@bp.route("/addresses", methods=["GET"])
@require_auth
def get_addresses():
    addresses = UserAddress.query.filter_by(user_id=g.user.id).order_by(
        UserAddress.is_default.desc(),
        UserAddress.created_at.asc()
    ).all()

    return jsonify({
        "addresses": [{
            "id": a.id,
            "label": a.label,
            "full_name": a.full_name,
            "phone": a.phone,
            "address_line_1": a.address_line_1,
            "address_line_2": a.address_line_2,
            "city": a.city,
            "state": a.state,
            "pincode": a.pincode,
            "is_default": a.is_default
        } for a in addresses]
    })
    

@bp.route("/user/first-order")
@require_auth
def is_first_order():
    from .models import Order
    count = Order.query.filter_by(user_id=g.user.id).count()
    return jsonify({ "is_first_order": count == 0 })

    
# -----------------------------
# ----POST: User Add Address
# -----------------------------
@bp.route("/addresses", methods=["POST"])
@require_auth
def add_address():
    data = request.json

    required = ["full_name", "phone", "address_line_1", "city", "state", "pincode"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "All required fields must be filled"}), 400

    has_default = UserAddress.query.filter_by(
        user_id=g.user.id, is_default=True
    ).first()

    address = UserAddress(
        user_id=g.user.id,
        label=data.get("label"),
        full_name=data["full_name"],
        phone=data["phone"],
        address_line_1=data["address_line_1"],
        address_line_2=data.get("address_line_2"),
        city=data["city"],
        state=data["state"],
        pincode=data["pincode"],
        is_default=False if has_default else True
    )

    db.session.add(address)
    db.session.commit()

    return jsonify({"message": "Address added successfully"})


# -----------------------------
# ----PUT: Set Default Address
# -----------------------------
@bp.route("/addresses/<int:address_id>/default", methods=["PUT"])
@require_auth
def set_default_address(address_id):
    address = UserAddress.query.filter_by(
        id=address_id, user_id=g.user.id
    ).first_or_404()

    UserAddress.query.filter_by(
        user_id=g.user.id, is_default=True
    ).update({"is_default": False})

    address.is_default = True
    db.session.commit()

    return jsonify({"message": "Default address updated"})


# -----------------------------
# ----DELETE: User Address
# -----------------------------
@bp.route("/addresses/<int:address_id>", methods=["DELETE"])
@require_auth
def delete_address(address_id):
    address = UserAddress.query.filter_by(
        id=address_id, user_id=g.user.id
    ).first_or_404()

    if address.is_default:
        other = UserAddress.query.filter(
            UserAddress.user_id == g.user.id,
            UserAddress.id != address.id
        ).first()
        if other:
            other.is_default = True

    db.session.delete(address)
    db.session.commit()

    return jsonify({"message": "Address deleted"})


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
            "variant_color": item.variant.color if item.variant else None,
            "variant_size": item.variant.size if item.variant else None,
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
    product_id = data.get("product_id")
    variant_id = data.get("variant_id")
    quantity = data.get("quantity", 1)
    
    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400
    
    if quantity < 1:
        return jsonify({"error": "Quantity must be at least 1"}), 400

    user_id = g.user.id
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Validate variant if provided
    variant = None
    if variant_id:
        variant = Product_Variants.query.get(variant_id)
        if not variant:
            return jsonify({"error": "Variant not found"}), 404
        if variant.product_id != product.id:
            return jsonify({"error": "Variant does not belong to this product"}), 400
        # Check variant stock
        if variant.stock < quantity:
            return jsonify({"error": f"Insufficient stock for {product.name} - {variant.color} {variant.size}"}), 400
        price = variant.price_override or product.price
    else:
        price = product.price

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
    orders = (
        Order.query
        .filter_by(user_id=g.user.id)
        .order_by(Order.created_at.desc())
        .all()
    )

    data = []

    for order in orders:
        data.append({
            "id": order.id,
            "status": order.status,
            "total": str(order.total_amount),
            "created_at": order.created_at.isoformat(),
            "items": [
                {
                    "product": item.product.name,
                    "variant_color": item.variant.color if item.variant else None,
                    "variant_size": item.variant.size if item.variant else None,
                    "quantity": item.quantity,
                    "subtotal": str(item.subtotal)
                }
                for item in order.items   # ✅ FIXED HERE
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

        # Calculate total and check stock
        total = Decimal("0.00")
        for item in cart.items:
            total += Decimal(item.quantity) * Decimal(item.price_at_time)
            
            # Check stock availability
            if item.variant:
                if item.variant.stock < item.quantity:
                    return jsonify({"error": f"Insufficient stock for {item.product.name} - {item.variant.color} {item.variant.size}"}), 400

        # Create the order
        new_order = Order(
            user_id=g.user.id,
            total_amount=total,
            payment_method=request.json.get("payment_method", "razorpay"),
            status="pending"
        )
        db.session.add(new_order)
        db.session.flush()  # To get the new order ID

        # Create order items and reduce stock
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
            
            # Reduce stock for variants
            if item.variant:
                item.variant.stock -= item.quantity

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

# -----------------------------
# ----GET: Render order-success.html
# -----------------------------
@bp.route("/order-success/<int:order_id>")
def order_success(order_id):
    order = Order.query.get_or_404(order_id)
    return render_template("order_success.html", order=order)

# -----------------------------
# ----GET: Order Details
# -----------------------------
@bp.route("/orders/<int:order_id>", methods=["GET"])
@require_auth
def get_order_detail(order_id):
    user = g.user

    order = Order.query.filter_by(id=order_id, user_id=user.id).first()
    if not order:
        return jsonify({"error": "Order not found"}), 404

    items = []
    for item in order.items:
        items.append({
            "product": item.product.name,
            "variant_color": item.variant.color if item.variant else None,
            "variant_size": item.variant.size if item.variant else None,
            "quantity": item.quantity,
            "price": float(item.price_at_time),
            "subtotal": float(item.subtotal)
        })

    return jsonify({
        "id": order.id,
        "created_at": order.created_at.isoformat(),
        "status": order.status,
        "status_label": get_user_friendly_status(order.status),

        "shipping": {
            "awb": order.awb_code,
            "courier": order.courier_name,
        },

        "address": {
            "name": order.shipping_name,
            "phone": order.shipping_phone,
            "line1": order.shipping_address_line_1,
            "line2": order.shipping_address_line_2,
            "city": order.shipping_city,
            "state": order.shipping_state,
            "pincode": order.shipping_pincode,
        },

        "items": items,
        "total": float(order.total_amount)
    })



@bp.route("/checkout/whatsapp/buy-now", methods=["POST"])
@require_auth
def whatsapp_buy_now():
    data = request.json

    product_id = data.get("product_id")
    variant_id = data.get("variant_id")
    quantity = int(data.get("quantity", 1))

    if not product_id or not variant_id:
        return jsonify({"error": "Product and variant required"}), 400

    if quantity < 1:
        return jsonify({"error": "Invalid quantity"}), 400

    product = Product.query.get_or_404(product_id)
    variant = Product_Variants.query.get_or_404(variant_id)

    if variant.stock < quantity:
        return jsonify({"error": "Insufficient stock"}), 400

    price = Decimal(variant.price_override or product.price)
    subtotal = price * quantity

    address = get_default_address(g.user.id)
    if not address:
        return jsonify({"error": "Please add a shipping address first"}), 400

    # ✅ Create order
    order = Order(
        user_id=g.user.id,
        total_amount=subtotal,
        payment_method="WHATSAPP",
        status="pending_whatsapp"
    )
    db.session.add(order)
    db.session.flush()

    order_item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        variant_id=variant.id,
        quantity=quantity,
        price_at_time=price,
        subtotal=subtotal,
        shipping_name=address.full_name,
        shipping_phone=address.phone,
        shipping_address_line_1=address.address_line_1,
        shipping_address_line_2=address.address_line_2,
        shipping_city=address.city,
        shipping_state=address.state,
        shipping_pincode=address.pincode
    )
    db.session.add(order_item)
    db.session.commit()

    # WhatsApp message
    message = (
        f"Hi SNIIPE \n\n"
        f"I want to place an order.\n\n"
        f"Order ID: SN-{order.id}\n\n"
        f"Product: {product.name}\n"
        f"Color: {variant.color}\n"
        f"Size: {variant.size}\n"
        f"Quantity: {quantity}\n"
        f"Price: ₹{price}\n\n"
        f"Total: ₹{subtotal}\n\n"
        f"Please share payment details.\nThank you!"
    )

    business_number = "+917207701175"  # <-- replace
    whatsapp_link = f"https://wa.me/{business_number}?text={quote(message)}"

    return jsonify({
        "order_id": f"SN-{order.id}",
        "whatsapp_link": whatsapp_link
    }), 201


@bp.route("/checkout/whatsapp/cart", methods=["POST"])
@require_auth
def whatsapp_cart_checkout():
    cart = Cart.query.filter_by(user_id=g.user.id).first()
    if not cart or not cart.items:
        return jsonify({"error": "Your cart is empty"}), 400

    total = Decimal("0.00")
    lines = []

    # Validate stock & calculate total
    for item in cart.items:
        if item.variant and item.variant.stock < item.quantity:
            return jsonify({
                "error": f"Insufficient stock for {item.product.name} ({item.variant.color} {item.variant.size})"
            }), 400

        subtotal = Decimal(item.price_at_time) * item.quantity
        total += subtotal

        lines.append(
            f"- {item.product.name}\n"
            f"  Color: {item.variant.color}\n"
            f"  Size: {item.variant.size}\n"
            f"  Qty: {item.quantity}\n"
            f"  Price: ₹{item.price_at_time}"
        )
        
    address = get_default_address(g.user.id)
    if not address:
        return jsonify({"error": "Please add a shipping address first"}), 400


    # Create order
    order = Order(
        user_id=g.user.id,
        total_amount=total,
        payment_method="WHATSAPP",
        status="pending_whatsapp",
        shipping_name=address.full_name,
        shipping_phone=address.phone,
        shipping_address_line_1=address.address_line_1,
        shipping_address_line_2=address.address_line_2,
        shipping_city=address.city,
        shipping_state=address.state,
        shipping_pincode=address.pincode
    )
    db.session.add(order)
    db.session.flush()

    for item in cart.items:
        db.session.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            price_at_time=item.price_at_time,
            subtotal=item.quantity * item.price_at_time
        ))

    # ❗ DO NOT reduce stock yet
    # ❗ DO NOT clear cart yet (optional — you may clear)

    db.session.commit()

    message = (
        f"Hi SNIIPE \n\n"
        f"I want to place an order.\n\n"
        f"Order ID: SN-{order.id}\n\n"
        + "\n\n".join(lines) +
        f"\n\nTotal: ₹{total}\n\n"
        f"Please share payment details.\nThank you!"
    )

    business_number = "+917207701175"
    whatsapp_link = f"https://wa.me/{business_number}?text={quote(message)}"

    return jsonify({
        "order_id": f"SN-{order.id}",
        "whatsapp_link": whatsapp_link
    }), 201


# ----------------------------------------------------------
# --END OF ORDERS SYSTEM
# ----------------------------------------------------------


# ----------------------------------------------------------
# --RAZORPAY PAYMENT
# ----------------------------------------------------------
# -----------------------------
# ----POST: Create order - RZP
# -----------------------------
@bp.route("/payments/razorpay/create-order", methods=["POST"])
@require_auth
def create_razorpay_order():
    data = request.json
    order_id = data.get("order_id")

    order = Order.query.filter_by(
        id=order_id,
        user_id=g.user.id
    ).first_or_404()
    
    if not g.user.phone:
        return jsonify({
            "error": "PHONE_REQUIRED",
            "message": "Please add your WhatsApp number before checkout"
        }), 400


    if order.status != "pending_payment":
        return jsonify({"error": "Invalid order state"}), 400

    client = get_razorpay_client()

    amount_paise = int(order.total_amount * 100)

    rzp_order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"SN-{order.id}",
        "payment_capture": 1
    })

    order.razorpay_order_id = rzp_order["id"]
    db.session.commit()

    return jsonify({
        "key": app.config["RAZORPAY_KEY_ID"],
        "amount": amount_paise,
        "currency": "INR",
        "razorpay_order_id": rzp_order["id"],
        "name": "SNIIPE",
        "description": f"Order SN-{order.id}"
    })


# -----------------------------
# ----POST: Verify payment - RZP
# -----------------------------
@bp.route("/payments/razorpay/verify", methods=["POST"])
@require_auth
def verify_razorpay_payment():
    data = request.json

    client = get_razorpay_client()

    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": data["razorpay_order_id"],
            "razorpay_payment_id": data["razorpay_payment_id"],
            "razorpay_signature": data["razorpay_signature"]
        })
    except razorpay.errors.SignatureVerificationError:
        return jsonify({"error": "Payment verification failed"}), 400

    order = Order.query.filter_by(
        razorpay_order_id=data["razorpay_order_id"],
        user_id=g.user.id
    ).first_or_404()

    # Reduce stock AFTER payment
    for item in order.items:
        item.variant.stock -= item.quantity

    # Mark payment successful
    order.status = "paid"
    order.payment_method = "RAZORPAY"
    order.razorpay_payment_id = data["razorpay_payment_id"]
    
    db.session.commit()  # commit payment first (important)
    
    # 🔔 Notify admin via email (NON-BLOCKING)
    from app.email_utils import send_admin_order_email
    send_admin_order_email(order)


    # 🔁 AUTO CREATE SHIPMENT
    try:
        sr_response = create_shiprocket_shipment(order)

        if sr_response and "order_id" in sr_response:
            order.shipping_provider = "shiprocket"
            order.shipping_order_id = str(sr_response["order_id"])
            order.status = "shipping_created"
            db.session.commit()

    except Exception as e:
        # VERY IMPORTANT:
        # Do NOT fail payment if shipment fails
        print("Shiprocket shipment creation failed:", str(e))

    return jsonify({"message": "Payment successful"})


# -----------------------------
# ----POST: Prepare buy-now order
# -----------------------------
@bp.route("/checkout/razorpay/buy-now", methods=["POST"])
@require_auth
def razorpay_buy_now():
    data = request.json
    product_id = data.get("product_id")
    variant_id = data.get("variant_id")
    quantity = int(data.get("quantity", 1))
    
    address_id = data.get("address_id")
    if not address_id:
        return jsonify({"error": "ADDRESS_REQUIRED"}), 400

    # 1. Fetch product & variant
    product = Product.query.get_or_404(product_id)
    variant = Product_Variants.query.get_or_404(variant_id)

    if variant.stock < quantity:
        return jsonify({"error": "Insufficient stock"}), 400

    # 2. Get default address (MANDATORY)
    address = UserAddress.query.filter_by(
        id=address_id,
        user_id=g.user.id
    ).first()

    if not address:
        return jsonify({"error": "INVALID_ADDRESS"}), 400
    
    # address = get_default_address(g.user.id)
    # if not address:
    #     return jsonify({
    #         "error": "NO_ADDRESS",
    #         "message": "Please add a shipping address"
    #     }), 400

    # 3. Calculate price
    price = variant.price_override or product.price
    subtotal = price * quantity
    
    cleanup_stale_pending_orders(g.user.id)

    # 4. Create ORDER (NO stock reduction)
    order = Order(
        user_id=g.user.id,
        total_amount=subtotal,
        status="pending_payment",
        payment_method="RAZORPAY",

        shipping_name=address.full_name,
        shipping_phone=address.phone,
        shipping_address_line_1=address.address_line_1,
        shipping_address_line_2=address.address_line_2,
        shipping_city=address.city,
        shipping_state=address.state,
        shipping_pincode=address.pincode
    )

    db.session.add(order)
    db.session.flush()  # IMPORTANT (gets order.id)

    # 5. Create order item
    order_item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        variant_id=variant.id,
        quantity=quantity,
        price_at_time=price,
        subtotal=price * quantity
    )

    db.session.add(order_item)
    db.session.commit()

    return jsonify({
        "order_id": order.id,
        "amount": subtotal
    })
    
    
# -----------------------------
# ----POST: Prepare cart order
# -----------------------------
@bp.route("/checkout/razorpay/cart", methods=["POST"])
@require_auth
def razorpay_cart_checkout():
    data = request.json
    cart = Cart.query.filter_by(user_id=g.user.id).first()
    cart_items = CartItem.query.filter_by(cart_id=cart.id).all()
    if not cart_items:
        return jsonify({"error": "Cart is empty"}), 400
    
    address_id = data.get("address_id")
    if not address_id:
        return jsonify({"error": "ADDRESS_REQUIRED"}), 400

    address = UserAddress.query.filter_by(
        id=address_id,
        user_id=g.user.id
    ).first()

    if not address:
        return jsonify({"error": "INVALID_ADDRESS"}), 400

    total = 0

    # Validate stock
    for item in cart_items:
        if item.variant.stock < item.quantity:
            return jsonify({
                "error": f"Insufficient stock for {item.product.name}"
            }), 400
        price = item.variant.price_override or item.product.price
        total += price * item.quantity

    cleanup_stale_pending_orders(g.user.id)

    # Create order
    order = Order(
        user_id=g.user.id,
        total_amount=total,
        status="pending_payment",
        payment_method="RAZORPAY",

        shipping_name=address.full_name,
        shipping_phone=address.phone,
        shipping_address_line_1=address.address_line_1,
        shipping_address_line_2=address.address_line_2,
        shipping_city=address.city,
        shipping_state=address.state,
        shipping_pincode=address.pincode
    )

    db.session.add(order)
    db.session.flush()

    # Create order items
    for item in cart_items:
        price = item.variant.price_override or item.product.price
        db.session.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            price_at_time=price,
            subtotal=price * item.quantity
        ))

    db.session.commit()

    return jsonify({
        "order_id": order.id,
        "amount": total
    })


# -----------------------------
# ----HELPER: Shipment Creation
# -----------------------------
def create_shiprocket_shipment(order):
    """
    Creates a shipment in Shiprocket.
    Safe to call only once per order.
    """

    # Safety: prevent duplicate shipment
    if order.shipping_order_id:
        return None

    token = get_shiprocket_token()

    url = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc"

    items = []
    for item in order.items:
        items.append({
            "name": item.product.name,
            "sku": str(item.variant_id or item.product_id),
            "units": item.quantity,
            "selling_price": float(item.price_at_time),
            "discount": 0,
            "tax": 0,
            "hsn": ""
        })

    payload = {
        "order_id": str(order.id),
        "order_date": order.created_at.strftime("%Y-%m-%d"),
        "pickup_location": "Home",  # MUST match Shiprocket pickup name
        "billing_customer_name": order.shipping_name,
        "billing_phone": order.shipping_phone,
        "billing_address": order.shipping_address_line_1,
        "billing_address_2": order.shipping_address_line_2,
        "billing_city": order.shipping_city,
        "billing_state": order.shipping_state,
        "billing_pincode": order.shipping_pincode,
        "billing_country": "India",
        "shipping_is_billing": True,
        "order_items": items,
        "payment_method": "Prepaid",
        "sub_total": float(order.total_amount),
        "length": 25,
        "breadth": 20,
        "height": 3,
        "weight": 0.5
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    res = requests.post(url, json=payload, headers=headers)
    res.raise_for_status()

    return res.json()


# ----------------------------------------------------------
# --END OF RAZORPAY PAYMENT
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
@bp.route("/verify-email")
def verify_email_page():
    return render_template("verify_email.html")

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
# ORDER PAGE RENDERING
# -----------------------------
@bp.route("/order/<int:order_id>")
def order_detail_page(order_id):
    return render_template("order_detail.html", order_id=order_id)

# -----------------------------
# CART PAGE RENDERING
# -----------------------------
@bp.route("/cart-page")
def cart_page():
    return render_template("cart.html")

# -----------------------------
# LOGIN PAGE RENDERING
# -----------------------------
@bp.route('/login-page')
def login_page():
    return render_template('login.html')

@bp.route('/login-page/<string:targetLocation>')
def login_page_target(targetLocation):
    return render_template('login.html', targetLocation=targetLocation)

# -----------------------------
# REGISTER PAGE RENDERING
# -----------------------------
@bp.route("/register-page")
def register_page():
    return render_template("register.html")

# -----------------------------
# CONTACT PAGE RENDERING
# -----------------------------
@bp.route("/contact")
def contact_page():
    return render_template("contact.html")

# -----------------------------
# SUPPORT PAGE RENDERING
# -----------------------------
@bp.route("/support")
def support_page():
    return render_template("support.html")

# -----------------------------
# FAQs PAGE RENDERING
# -----------------------------
@bp.route("/faq")
def faq_page():
    return render_template("faq.html")

# -----------------------------
# FAQs PAGE RENDERING
# -----------------------------
@bp.route("/forgot-password-page")
def forgot_page():
    return render_template("forgot_password.html")

# -----------------------------
# POLICIES
# -----------------------------
@bp.route("/terms")
def terms():
    return render_template("policies/terms.html")

@bp.route("/privacy")
def privacy():
    return render_template("policies/privacy.html")

@bp.route("/refund")
def refund():
    return render_template("policies/refund.html")

@bp.route("/shipping")
def shipping():
    return render_template("policies/shipping.html")

@bp.route("/cancellations")
def cancellations():
    return render_template("policies/cancellations.html")
