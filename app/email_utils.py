import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app


def send_admin_order_email(order):
    """
    Sends an email to admin when a new order is paid.
    MUST NEVER raise exception to break checkout.
    """
    try:
        smtp_host = current_app.config.get("SMTP_HOST")
        smtp_port = current_app.config.get("SMTP_PORT")
        smtp_user = current_app.config.get("SMTP_USERNAME")
        smtp_pass = current_app.config.get("SMTP_PASSWORD")
        admin_email = current_app.config.get("ADMIN_NOTIFICATION_EMAIL")

        if not all([smtp_host, smtp_port, smtp_user, smtp_pass, admin_email]):
            print("⚠️ Email config missing. Skipping email.")
            return

        subject = f"🛒 New Order Paid | SN-{order.id}"

        body = f"""
New order received and payment successful.
Admin Process to complete:
1. Visit sniipe.in/admin/orders and click on 'Create Shipment' for this order.
2. Then go to: 
    https://app.shiprocket.in/seller/orders/new?sku=&order_ids=&order_status=&channel_id=&payment_method=&pickup_address_id=&delivery_country=&quantity=&is_order_verified=&ship_weight=&previously_cancelled=&from=2025-Dec-06&to=2026-Jan-04
    and then assign a courier.

Order ID: SN-{order.id}
Total Amount: ₹{order.total_amount}

Customer:
Email: {order.user.email}
Phone: {order.shipping_phone}

Shipping Address:
{order.shipping_name}
{order.shipping_address_line_1}
{order.shipping_address_line_2 or ""}
{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}

Items:
"""        

        for item in order.items:
            body += f"""
- {item.product.name}
  Color: {item.variant.color if item.variant else "-"}
  Size: {item.variant.size if item.variant else "-"}
  Qty: {item.quantity}
  Price: ₹{item.price_at_time}
"""

        body += "\nLogin to admin panel for details."

        msg = MIMEMultipart()
        msg["From"] = smtp_user
        msg["To"] = admin_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()

        print(f"📧 Admin notified for order {order.id}")

    except Exception as e:
        # ❗ NEVER fail checkout
        print("❌ Failed to send admin email:", str(e))
