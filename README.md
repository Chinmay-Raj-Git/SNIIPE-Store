# SNIIPE™ Store – Production E-Commerce Platform

SNIIPE™ Store is a **production-ready full-stack e-commerce platform** built for a clothing startup brand.  
The platform powers the live store at **https://sniipe.in**, handling real users, daily orders, online payments, and automated shipping.

It provides a complete end-to-end workflow from **product discovery → cart → payment → order processing → shipping fulfillment**.

This project was developed as a **freelance full-stack production system**.

---

# Live Website

https://sniipe.in

---

# Overview

SNIIPE-Store is a modern e-commerce platform designed to support a growing clothing brand called **SNIIPE™** and real customer traffic.

The system allows customers to browse clothing products, securely pay online, and place orders that are automatically processed through the backend infrastructure.

Key goals of the platform:

- Provide a **smooth and responsive shopping experience**
- Support **real production users and daily orders**
- Enable **secure online payments**
- Automate **order processing and shipping**
- Maintain a **clean and scalable full-stack architecture**

The store is currently running in production and serving **real customers with shipped orders daily**.

---

# Core Features

## Customer Experience

- Product catalog browsing
- Product detail pages
- Add to cart functionality
- Responsive mobile-friendly interface
- Secure checkout flow
- Online payments through Razorpay
- Order confirmation and processing

---

## Payments

- Integrated **Razorpay payment gateway**
- Secure payment processing
- Order creation only after successful payment
- Payment verification handled by backend
- Smooth checkout experience for customers

---

## Order & Shipping

- Order creation and storage in database
- Automated shipment generation using **Shiprocket API**
- Order fulfillment workflow
- Shipment creation directly from backend system
- Real-world logistics integration

---

## Backend Infrastructure

- RESTful backend API built with Flask
- PostgreSQL database for persistent storage
- Third-party service integrations
- Production deployment serving live traffic

---

# Tech Stack

## Frontend
- React
- JavaScript
- Tailwind CSS
- HTML5

## Backend
- Python
- Flask
- Supabase for Authentication and OAuth

## Database
- PostgreSQL (Supabase)

## Payments
- Razorpay Payment Gateway

## Shipping
- Shiprocket API

## Deployment
- Deployed through **Railway**
- Production deployment powering https://sniipe.in

---

# System Architecture

The application follows a **modern full-stack architecture** with clear separation between frontend UI, backend services, and external integrations.
<br>
Client (Browser)
<br>
↓
<br>
React Frontend
<br>
↓
<br>
Flask REST API
<br>
↓
<br>
PostgreSQL Database (Supabase)
<br>
↓
<br>
External Services
<br>
• Razorpay (Payments)
<br>
• Shiprocket (Shipping)
<br>


### Component Responsibilities

**Frontend (React)**  
Handles UI rendering, product browsing, cart management, and checkout interactions.

**Backend (Flask)**  
Implements business logic including order processing, payment verification, shipping integration, and database operations.

**Database (PostgreSQL)**  
Stores product catalog data, order records, and operational data required for the store.

**Razorpay Integration**  
Handles secure payment processing and transaction verification before confirming orders.

**Shiprocket Integration**  
Automatically generates shipments for completed orders and manages logistics.

---

# User Flow

A typical purchase journey on the platform:

1. User visits the homepage
2. Browses clothing products
3. Opens a product detail page
4. Adds item to cart
5. Proceeds to checkout
6. Completes payment using Razorpay
7. Backend verifies the payment
8. Order is stored in PostgreSQL database
9. Backend triggers shipment creation via Shiprocket
10. Order is processed and shipped to the customer

---

# Key Engineering Highlights

- Built as a **real production system** serving active users
- Handles **live orders and real payment transactions**
- Integrated **Razorpay payment gateway**
- Automated **shipping workflow through Shiprocket**
- Designed with **clean separation between frontend and backend**
- Production deployment supporting an active e-commerce business

---

# Project Status

The platform is currently **running in production** and supporting ongoing business operations.

Potential future improvements include:

- Admin dashboard for product management
- Inventory management system
- Order analytics and reporting
- Enhanced order tracking for customers
- Marketing and promotion tools

---

# Author

Developed as a **freelance full-stack project** for the SNIIPE™ clothing brand.

Live project: https://sniipe.in
