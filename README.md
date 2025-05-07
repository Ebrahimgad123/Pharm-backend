
# 💊 Pharmacy API Server

This is a robust, modular backend API built with **Express** and **TypeScript** to support a multi-role pharmacy system, including **Patients**, **Pharmacists**, and **Administrators**. The API provides authentication, order management, cart handling, chat features, and secure payment integration.

## 📦 Project Structure

```
📁 server
├── 📂 controllers         # Handle business logic for each feature
├── 📂 middleware          # Token verification, role authorization, error handling
├── 📂 models              # Mongoose models for MongoDB
├── 📂 routes              # Route definitions by entity
├── 📂 services            # Email service, token generation, etc.
├── 📂 utils               # Utilities and helper functions
├── 📄 index.ts            # App entry point
```

---

## 🚀 Features

- 🔐 JWT Authentication & Role-Based Access Control
- 🧑‍⚕️ Multi-role support: Patients, Pharmacists, Admins
- 🛒 Cart & Order Management
- 💬 Real-time Chat (Patients & Pharmacists)
- 💳 Payment Gateway Integration (Stripe or similar)
- 📧 Email Notifications
- 🧪 Robust error handling and clean architecture

---

## 🔧 Installation

```bash
git clone https://github.com/ebrahimgad123/pharm-backend.git
cd pharm-backend/server
npm install
```

---

## ▶️ Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `server` folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
STRIPE_SECRET_KEY=your_stripe_secret_key
```

---

## 📲 API Clients

- **Patient App** – Mobile/web client used by patients to place orders and chat
- **Pharmacist App** – Interface for pharmacists to manage orders, prescriptions, and communication
- **Admin Dashboard** – For system-wide analytics and user management

---

## 📚 API Modules

| Feature         | Routes                  | Controllers            |
|----------------|--------------------------|------------------------|
| Auth           | `/api/auth`             | `authController.ts`   |
| Patients       | `/api/patient`          | `patientController.ts`|
| Pharmacists    | `/api/pharmacists`      | `pharmacistController.ts` |
| Admins         | `/api/admin`            | `administratorController.ts` |
| Cart           | `/api/cart`             | `cartController.ts`    |
| Orders         | `/api/orders`           | `orderController.ts`   |
| Medicines      | `/api/medicines`        | `medicineController.ts`|
| Chat           | `/api/chat`             | `chatController.ts`    |
| Messages       | `/api/messages`         | `messageControllers.ts`|
| Payments       | `/api/payments`         | `paymentController.ts` |

---

## 🔐 Security

- JWT tokens used for authentication
- Middleware: `verifyTokens`, `userRole`, `errorHandling`
- Sensitive routes protected by role-based access

---

## 📦 Database Models

- `User`
- `Patient`
- `Pharmacist`
- `Administrator`
- `Cart`
- `Order`
- `Medicine`
- `Prescription`
- `Chat`
- `Message`

---

## 📤 External Services

- 💳 **Payment Gateway** (e.g., Stripe)
- 📧 **SMTP Email Service** (e.g., Nodemailer)

---

## 📈 Future Improvements

- Admin analytics dashboard
- Notification system (WebSockets or Firebase)
- Detailed logging (e.g., Winston or Morgan)
- Unit & Integration tests (Jest)

---

## 👨‍💻 Author

**Ibrahim Gad**  
📧 [ibrahim.abo.khalil05@gmail.com](mailto:ibrahimgad123@gmail.com)  
🔗 [GitHub Profile](https://github.com/Ebrahimgad123)

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
![diagram](https://github.com/user-attachments/assets/f5837930-f818-4f75-927a-4f708c8a10f5)


