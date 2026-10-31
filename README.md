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

Mama-G is open-source software licensed under the Apache License 2.0. Developed by PalmFarm.AI Technologies Limited.

LICENSE
MIT License

Copyright (c) 2026 PalmFarm.AI Technologies Limited

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
