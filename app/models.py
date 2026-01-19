from . import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

# -----------------------------
# Product SYSTEM
# -----------------------------
class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(50), nullable=True)

class Product_Variants(db.Model):
    __tablename__ = 'product_variants'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    color = db.Column(db.String(50), nullable=False)
    size = db.Column(db.String(20), nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    price_override = db.Column(db.Float, nullable=True)

    product = db.relationship('Product', backref='variants')
 
    def __repr__(self):
        return f"<Variant {self.color}-{self.size} (Product ID: {self.product_id})>"

class Product_Variant_Images(db.Model):
    __tablename__ = 'product_variant_images'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    color = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)

    role = db.Column(db.String(20), nullable=False)
    sort_order = db.Column(db.Integer, default=0)

    product = db.relationship('Product', backref='variant_images')


# -----------------------------
# User SYSTEM
# -----------------------------
class Users(db.Model):
    __tablename__ = 'users'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    
    phone = db.Column(db.String(20), unique=True, nullable=True)
    whatsapp_opt_in = db.Column(db.Boolean, default=True)
    
    
# -----------------------------
# User Address SYSTEM
# -----------------------------
class UserAddress(db.Model):
    __tablename__ = 'user_addresses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)

    label = db.Column(db.String(50), nullable=True)  # Home / Office
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    address_line_1 = db.Column(db.String(255), nullable=False)
    address_line_2 = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(20), nullable=False)

    is_default = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    user = db.relationship('Users', backref=db.backref('addresses', cascade='all, delete-orphan'))


# -----------------------------
# CART SYSTEM
# -----------------------------
class Cart(db.Model):
    __tablename__ = 'carts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    user = db.relationship('Users', backref=db.backref('cart', uselist=False))


class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey('product_variants.id'), nullable=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price_at_time = db.Column(db.Numeric(10, 2), nullable=False)

    cart = db.relationship('Cart', backref=db.backref('items', cascade='all, delete-orphan'))
    product = db.relationship('Product', backref='cart_items')
    variant = db.relationship('Product_Variants', backref='cart_items')


# -----------------------------
# ORDER SYSTEM
# -----------------------------
class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending') 
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    
    razorpay_order_id = db.Column(db.String(100), nullable=True, unique=True)  # payment
    razorpay_payment_id = db.Column(db.String(100), nullable=True)
    
    shipping_name = db.Column(db.String(120), nullable=False)  # shipping details
    shipping_phone = db.Column(db.String(20), nullable=False)
    shipping_address_line_1 = db.Column(db.String(255), nullable=False)
    shipping_address_line_2 = db.Column(db.String(255), nullable=True)
    shipping_city = db.Column(db.String(100), nullable=False)
    shipping_state = db.Column(db.String(100), nullable=False)
    shipping_pincode = db.Column(db.String(20), nullable=False)
    
    shipping_provider = db.Column(db.String(50), nullable=True)  # shiprocket part
    shipping_order_id = db.Column(db.String(100), nullable=True)
    shipment_status = db.Column(db.String(50), nullable=True)
    awb_code = db.Column(db.String(100), nullable=True)
    courier_name = db.Column(db.String(100), nullable=True)
    
    coupon_code = db.Column(db.String(50), nullable=True)  # coupon part
    discount_amount = db.Column(db.Numeric(10, 2), default=0)
    final_amount = db.Column(db.Numeric(10, 2), nullable=True)



    user = db.relationship('Users', backref='orders')


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey('product_variants.id'), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_time = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    order = db.relationship('Order', backref=db.backref('items', cascade='all, delete-orphan'))
    product = db.relationship('Product', backref='order_items')
    variant = db.relationship('Product_Variants', backref='order_items')
    
# -----------------------------
# COUPONS SYSTEM
# -----------------------------
class Coupons(db.Model):
    __tablename__ = "coupons"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    type = db.Column(db.String(20), nullable=False)     # 'percentage' or 'flat'
    value = db.Column(db.Numeric(10, 2), nullable=False)
    min_order_amount = db.Column(db.Numeric(10, 2), nullable=True)
    max_discount = db.Column(db.Numeric(10, 2), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def __repr__(self):
        return f"<Coupon {self.code} ({self.type}:{self.value})>"


class CouponUsage(db.Model):
    __tablename__ = "coupon_usages"

    id = db.Column(db.Integer, primary_key=True)
    coupon_id = db.Column(db.Integer, db.ForeignKey("coupons.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    used_at = db.Column(db.DateTime, default=db.func.now())

    # One-time usage enforcement
    __table_args__ = (
        db.UniqueConstraint("coupon_id", "user_id", name="uq_coupon_user"),
    )

    coupon = db.relationship("Coupon", backref="usages")
    user = db.relationship("Users", backref="coupon_usages")

    def __repr__(self):
        return f"<CouponUsage coupon={self.coupon_id} user={self.user_id}>"