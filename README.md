# 🏠 Ghar Ka Sathi API Backend Service (`Userappapibackend`)

यह **घर का साथी** (Ghar Ka Sathi) इकोसिस्टम के लिए एक कम्प्लीट और फंक्शनल **Node.js Express API Backend Server** है। यह सर्वर **MongoDB Database** (Mongoose ORM) का उपयोग करता है। आप इसे अपने लोकल MongoDB सर्वर या **MongoDB Atlas (फ्री क्लाउड डेटाबेस)** से जोड़ सकते हैं।

---

## 📖 1. API क्या है? (What is an API? - In Simple Words)

अगर आप API (Application Programming Interface) के बारे में नहीं जानते हैं, तो इसे इस तरह समझें:
* **कस्टमर (Flutter App)** एक रेस्टोरेंट में बैठा ग्राहक है।
* **डेटाबेस (MongoDB Database)** किचन (Kitchen) है जहाँ सारा खाना (डेटा) रखा है।
* **API Backend** वेटर (Waiter) है।

जब आप ऐप में "बुक सर्विस" दबाते हैं, तो ऐप (ग्राहक) वेटर (API) को आर्डर देता है। API किचन (डेटाबेस) में जाकर बुकिंग सेव करता है, बिल कैलकुलेट करता है, और वापस आकर ऐप को रसीद (Response) दे देता है। 

इस सर्वर में बने सभी राउट्स इसी तरह मोबाइल ऐप्स और एडमिन पैनल को आपस में जोड़ते हैं।

---

## 🛠️ 2. सर्वर सेटअप और रन गाइड (Setup & Run Guide)

### 📋 Prerequisites (आवश्यकताएँ)
* आपके कंप्यूटर पर **Node.js** (Version 18 या उससे अधिक) इंस्टॉल होना चाहिए।
* आपके पास एक **MongoDB** कनेक्शन लिंक (लोकल या Atlas Cloud) होना चाहिए।

### 🚀 Step-by-Step Installation

1. **Terminal/Command Prompt खोलें** और `Userappapibackend` फ़ोल्डर के अंदर जाएँ:
   ```bash
   cd Userappapibackend
   ```

2. **Dependencies इंस्टॉल करें:**
   ```bash
   npm install
   ```
   यह कमांड `package.json` में मौजूद सभी लाइब्रेरीज़ (Express, Mongoose, CORS, JSONWebToken, Dotenv) को डाउनलोड कर देगी।

3. **अपनी `.env` फ़ाइल कॉन्फ़िगर करें:**
   प्रोजेक्ट की `.env` फ़ाइल खोलें और अपना MongoDB कनेक्शन लिंक डालें:
   ```env
   PORT=8080
   JWT_SECRET=gharkasathisecrettokendesignedbyantigravity2026
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.ryc0rgu.mongodb.net/gharkasathi?retryWrites=true&w=majority
   ```

4. **सर्वर को डेवलपमेंट मोड में चलाएं:**
   ```bash
   npm run dev
   ```
   यह `nodemon` की मदद से सर्वर शुरू करेगा।

5. **सर्वर चेक करें:**
   ब्राउज़र में यह लिंक खोलें: [http://localhost:8080/health](http://localhost:8080/health)
   अगर आपको `{ "status": "success", "message": "Ghar Ka Sathi API service is healthy..." }` दिखे, तो सर्वर सही से चल रहा है!

---

## 🔌 3. API Endpoints Documentation (सभी API की सूची)

सभी APIs का Base URL है: `http://localhost:8080`

### 🔑 Authentication APIs (लॉग-इन और प्रोफाइल)

#### 1. OTP भेजें (Simulated SMS)
* **Method:** `POST`
* **URL:** `/api/auth/otp/send`
* **Body:**
  ```json
  { "phone": "9876543210" }
  ```
* **Response:** `{ "status": "success", "message": "OTP sent successfully", "otp": "123456" }`

#### 2. OTP वेरीफाई करें (JWT टोकन जनरेट करें)
* **Method:** `POST`
* **URL:** `/api/auth/otp/verify`
* **Body:**
  ```json
  {
    "phone": "9876543210",
    "code": "123456",
    "role": "user" 
  }
  ```
  *(नोट: `role` में ग्राहक के लिए `"user"` और एक्सपर्ट के लिए `"provider"` भेजें। राजेश कुमार एक्सपर्ट का नंबर पहले से सेव है: `9876543210`)*
* **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "token": "JWT_TOKEN_HERE",
      "userId": "usr_543210",
      "role": "user",
      "isProfileCompleted": true,
      "profile": { ... }
    }
  }
  ```

#### 3. प्रोफाइल पूरा करें (Complete Profile)
* **Method:** `POST` (Requires Header: `Authorization: Bearer <JWT_TOKEN>`)
* **URL:** `/api/auth/profile/complete`
* **Body:**
  ```json
  {
    "name": "Amit Patel",
    "email": "amit@example.com",
    "gender": "Male",
    "dob": "1994-11-23",
    "address": "B-302, Green Avenue, Sector 56",
    "city": "Noida",
    "state": "Uttar Pradesh",
    "pincode": "201301",
    "profilePicture": "https://example.com/pic.jpg"
  }
  ```

---

### 🗂️ Service Catalog APIs

#### 1. कैटलॉग और सब-सर्विसेज लिस्ट
* **Method:** `GET`
* **URL:** `/api/categories`
* **Description:** प्लंबर, इलेक्ट्रीशियन, पेंटर आदि सभी श्रेणियां और उनके बेस रेट्स की लिस्ट लाता है।

---

### 📅 Booking Workflow APIs (28-Step Journey)

#### 1. नई बुकिंग बनाएं (Create Booking)
* **Method:** `POST` (Protected)
* **URL:** `/api/bookings/create`
* **Body:**
  ```json
  {
    "categoryId": "cat_plumber",
    "subServiceId": "sub_pl_leak",
    "dateTime": "2026-07-20T10:00:00Z",
    "timeSlot": "10:00 AM - 12:00 PM",
    "address": "B-302, Green Avenue, Noida",
    "problemDescription": "Kitchen pipe leaking",
    "hasVoiceNote": false,
    "paymentMethod": "UPI"
  }
  ```
* **Response:** बुकिंग क्रिएट होते ही सिस्टम ऑटोमैटिकली एक उपलब्ध एक्सपर्ट अलॉट कर देता है और 4-डिजिट का सिक्योरिटी OTP जेनरेट करता है।

#### 2. ग्राहक की बुकिंग्स हिस्ट्री
* **Method:** `GET` (Protected)
* **URL:** `/api/bookings/user`

#### 3. एक्सपर्ट की जॉब्स हिस्ट्री
* **Method:** `GET` (Protected)
* **URL:** `/api/bookings/provider`

#### 4. सिक्योरिटी OTP से काम शुरू करें (Expert Reached & Verify OTP)
* **Method:** `POST` (Protected - Partner Only)
* **URL:** `/api/bookings/:id/start`
* **Body:** `{ "otp": "4892" }`
* **Description:** जब एक्सपर्ट घर पहुँचता है, तो ग्राहक से 4-डिजिट OTP लेकर काम शुरू करने के लिए यहाँ डालता है।

#### 5. एक्स्ट्रा काम के पैसे जोड़ना (Request Extra Work - Expert)
* **Method:** `POST` (Protected - Partner Only)
* **URL:** `/api/bookings/:id/extra-work`
* **Body:** `{ "cost": 250, "reason": "Water valve filter replacement" }`

#### 6. एक्स्ट्रा काम एप्रूव करें (Approve Extra Work - User)
* **Method:** `POST` (Protected - User Only)
* **URL:** `/api/bookings/:id/extra-work/approve`
* **Body:** `{ "approve": true }`

#### 7. पेमेंट और इनवॉइस सेटलमेंट (Settle Payment)
* **Method:** `POST` (Protected)
* **URL:** `/api/bookings/:id/pay`
* **Description:** बिल का पेमेंट कलेक्ट करता है, वॉलेट में पैसे ट्रांसफर करता है और 15% एडमिन कमीशन काटता है।

#### 8. रेटिंग और फीडबैक (Review Service)
* **Method:** `POST` (Protected)
* **URL:** `/api/bookings/:id/review`
* **Body:** `{ "rating": 5, "comment": "Excellent service!" }`

---

## 📱 4. Flutter Integration Guide (फ़्लटर ऐप से कैसे जोड़ें)

फ़्लटर ऐप में API को जोड़ने के लिए आप `dio` या `http` पैकेज का इस्तेमाल कर सकते हैं।

### Step 1: Base API Client Setup (`lib/core/network/api_client.dart`)
```dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://10.0.2.2:8080', // Android Emulator के लिए लोकलहोस्ट IP
    connectTimeout: const Duration(seconds: 10),
  ));

  ApiClient() {
    // Request interceptor: हर रिक्वेस्ट में JWT टोकन अपने आप जोड़ें
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('gs_jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }

  Future<Response> get(String path) => _dio.get(path);
  Future<Response> post(String path, dynamic data) => _dio.post(path, data: data);
  Future<Response> put(String path, dynamic data) => _dio.put(path, data: data);
}
```

### Step 2: Auth Flow Integration (`lib/features/auth/auth_service.dart`)
```dart
class AuthService {
  final ApiClient _api = ApiClient();

  // 1. Send OTP
  Future<bool> sendOtp(String phone) async {
    try {
      final res = await _api.post('/api/auth/otp/send', {'phone': phone});
      return res.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // 2. Verify OTP
  Future<Map<String, dynamic>?> verifyOtp(String phone, String otp) async {
    try {
      final res = await _api.post('/api/auth/otp/verify', {
        'phone': phone,
        'code': otp,
        'role': 'user'
      });
      if (res.statusCode == 200) {
        final data = res.data['data'];
        final token = data['token'];
        
        // टोकन लोकल स्टोरेज में सेव करें
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('gs_jwt_token', token);
        
        return data;
      }
    } catch (e) {
      print('Auth error: $e');
    }
    return null;
  }
}
```
