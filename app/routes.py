from flask import Blueprint, request, jsonify, render_template
from .models import *
from . import db
from app import get_supabase
from .auth_utils import require_auth
from flask import g
from decimal import Decimal
from urllib.parse import quote


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
            payment_method=request.json.get("payment_method", "COD"),
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
        subtotal=subtotal
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

    # Create order
    order = Order(
        user_id=g.user.id,
        total_amount=total,
        payment_method="WHATSAPP",
        status="pending_whatsapp"
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

