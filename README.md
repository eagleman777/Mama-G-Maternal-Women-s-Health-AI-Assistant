# Mama-G: Offline-First AI Maternal Health Co-Pilot

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Platform: Android / ONNX](https://img.shields.io/badge/Platform-Android%20%7C%20ONNX%20Runtime-brightgreen.svg)]()
[![Blockchain: Algorand](https://img.shields.io/badge/Blockchain-Algorand-000000.svg)]()

Mama-G is an open-source, offline-first clinical triage and guidance assistant engineered for resource-constrained primary healthcare settings. Powered by a quantized edge AI runtime and Algorand zero-knowledge proofs, Mama-G enables Community Health Workers (CHWs) and expectant mothers to evaluate maternal symptoms, detect danger signs, and generate anonymous clinic referral proofs without active internet connectivity.

---

## Key Features

- **100% Offline AI Execution:** Runs quantized open-source models (such as Gemma/Llama) locally on entry-level Android devices using ONNX Runtime (sub-1.8s inference speed).
- **Maternal Emergency Triage:** Built-in clinical prompt guardrails detect high-risk symptoms (pre-eclampsia, severe anemia, post-partum hemorrhage) and issue high-priority alerts.
- **Privacy-Preserving Referrals:** Generates anonymous, zero-knowledge cryptographic hashes on the Algorand blockchain to issue patient-controlled care vouchers and facility transfers without exposing PII.
- **Geospatial Grounding:** Dynamically maps emergency referrals to operational healthcare facilities using Google Maps API when online connectivity is restored.

---

## System Architecture## System Architecture

┌────────────────────────────────────────────────────────┐
│                   Mama-G Mobile App                    │
│                                                        │
│  ┌──────────────────────┐    ┌──────────────────────┐  │
│  │ Local User/CHW Input │    │ Clinical Rules Engine│  │
│  └──────────┬───────────┘    └──────────┬───────────┘  │
│             │                           │              │
│             ▼                           ▼              │
│  ┌──────────────────────────────────────────────────┐  │
│  │   ONNX Runtime Engine (Quantized Edge Model)     │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                              │
│                         ▼                              │
│           [Offline Clinical Guidance]                  │
└─────────────────────────┬──────────────────────────────┘
│ (If Emergency/Referral)
▼
┌────────────────────────────────────────────────────────┐
│               Privacy & Trust Layer                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Algorand ZK-Proof Hash Generation              │  │
│  │   (Anonymous Patient Referral Credential)        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘


---

## 🏥 Clinical Triage & Decision Logic Flow

Mama-G enforces strict clinical decision logic designed to detect high-risk maternal symptoms offline:

| Clinical Indicator | Severity Level | System Action / Triage Output |
| :--- | :--- | :--- |
| Severe headache, blurred vision, elevated blood pressure | **CRITICAL (High Risk)** | Flags pre-eclampsia alert; triggers immediate referral protocol; generates Algorand ZK-referral voucher. |
| Heavy vaginal bleeding, acute severe abdominal pain | **EMERGENCY** | Displays high-priority hemorrhage warning; advises emergency transport to nearest EmOC unit. |
| Mild fatigue, routine antenatal tracking | **ROUTINE** | Provides standard nutritional, iron/folate supplementation, and care guidance. |

---

## 🛡️ Technical Risk Matrix & Mitigation

| Identified Risk | Risk Level | Mitigation Strategy |
| :--- | :--- | :--- |
| **Model Hallucination in Clinical Guidance** | High | System prompt strictly constrains LLM output to standard WHO/MOH clinical triage trees; forces referral flags for ambiguous inputs. |
| **Device Hardware Constraints** | Medium | INT8 model quantization via ONNX Runtime to guarantee sub-2s execution on 2GB RAM devices. |
| **Patient Privacy Leakage** | High | Zero local storage of PII; all referral credentials use zero-knowledge cryptographic hashes. |

---

## 📑 Open Source & Digital Public Good (DPG) Compliance

Mama-G is designed and developed in strict alignment with the **UNICEF Innovation Fund Standards** and the **Digital Public Goods Standard** set by the Digital Public Goods Alliance (DPGA).

### 1. Open Source Licensing
- **Codebase License:** Fully open-source under the **Apache License 2.0**. All repository assets, edge scripts, and mobile application source code are freely accessible for reuse, adaptation, and global distribution.
- **Documentation & Content:** Licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.

### 2. Digital Public Goods (DPG) Alignment
- **Open Standards & Interoperability:** Implements standardized ONNX model runtimes compatible with low-cost hardware and open health data exchange guidelines.
- **Do No Harm & Data Privacy:**
  - **Zero PII Collection:** The offline edge model processes symptoms locally on the user's device without storing or transmitting Personally Identifiable Information (PII).
  - **Cryptographic Protection:** Referral credentials utilize zero-knowledge cryptographic hashes on the Algorand blockchain to issue verifiable care vouchers anonymously.
- **Accessibility & Inclusivity:** Built specifically for low-resource, disconnected settings with plain-language clinical guidance tailored for Community Health Workers (CHWs) and rural maternal care.

## 💻 1-Click Installation on Laptops & Desktops (Windows, Mac, Chromebook, Linux)

Mama-G installs as an independent, distraction-free desktop application on any laptop or workstation without requiring `.exe` downloads or administrator privileges:

### 🪟 Windows / Chromebook / Linux (Chrome, Edge, Brave)
1. Open Mama-G in **Chrome**, **Microsoft Edge**, or **Brave**.
2. Look at the right side of the **address bar (URL bar)** and click the **Install icon** (🖥️ or ⬇️).
3. Alternatively, click the top-right menu **(⋮ or ⋯)** → **"Install Mama-G"** or **"Save and share" → "Install page as app"**.
4. Click **"Install"**. Mama-G opens in its own window and creates a shortcut on your **Desktop**, **Windows Taskbar**, or **Chromebook shelf**!

### 🍎 Apple Mac (Safari on macOS Sonoma 14+ or Chrome/Edge)
1. Open Mama-G in **Safari**.
2. In the top macOS menu bar, click **File** → select **"Add to Dock..."**.
3. Click **"Add"**. Mama-G is now an independent Mac app in your **Dock** and **Applications** folder!

---

## 📲 1-Tap Installation on Any Phone (Android & iOS)

Mama-G is engineered as an offline-first **Progressive Web App (PWA)** that installs directly to any smartphone home screen in seconds without requiring Google Play Store or Apple App Store accounts:

### 🤖 For Android (Chrome, Samsung Internet, Edge, Opera, Firefox)
1. Open Mama-G in **Chrome** or your default mobile browser.
2. Tap the prominent **"📲 Install on Phone"** button in the top navigation or welcome banner.
3. Tap **"Install"** or **"Add to Home screen"**.
4. The 🌺 Mama-G app icon will appear directly on your home screen and launcher, running 100% offline!

### 🍎 For iPhone / iPad (Apple Safari)
1. Open Mama-G in **Safari** on your iOS device.
2. Tap the **Share button** (`⎋` box with an upward arrow) in the bottom toolbar.
3. Scroll down the menu and tap **"Add to Home Screen" ➕**.
4. Tap **"Add"** at the top right corner.

### 🌟 Benefits of Phone Installation:
- **Zero Data & Airtime Needed**: Evaluates maternal red flags and calculates gestational weeks even with zero internet connectivity.
- **Under 5MB Footprint**: Optimized for low-cost, budget Android devices (Tecno, Infinix, itel, Samsung Galaxy A).
- **Instant Full-Screen Access**: Launches immediately with a single tap, free of browser bars or search distraction.
- **Private & Safe**: Zero PII collected; personal health journals and Algorand vouchers never leave the user's phone.

---

## Quick Start (Developer Setup)

### Prerequisites
- Android Studio Jellyfish or newer
- Android SDK API Level 26 (Android 8.0) or higher
- Python 3.10+ (for model quantization scripts)
- ONNX Runtime Android Dependency

### 1. Repository Setup
```bash
git clone [https://github.com/PalmFarm-AI/Mama-G.git](https://github.com/PalmFarm-AI/Mama-G.git)
cd Mama-G
python scripts/quantize_model.py --model_name gemma-2b --output_path app/src/main/assets/models/mama_g_v1.onnx
2. Model Preparation & Quantization
Export and quantize the open-source model into .onnx format:

Bash
python scripts/quantize_model.py --model_name gemma-2b --output_path app/src/main/assets/models/mama_g_v1.onnx
3. Build & Run
Open the repository in Android Studio and build the project:

Bash
./gradlew assembleDebug
Contributing & License
We welcome contributions from clinicians, software developers, and public health researchers.

Mama-G is open-source software licensed under the MIT License Developed by PalmFarm.AI Technologies Limited.
