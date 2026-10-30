# Mama-G: Offline-First AI Maternal Health Co-Pilot

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Platform: Android / ONNX](https://img.shields.io/badge/Platform-Android%20%7C%20ONNX%20Runtime-brightgreen.svg)]()
[![Blockchain: Algorand](https://img.shields.io/badge/Blockchain-Algorand-000000.svg)]()

Mama-G is an open-source, offline-first clinical triage and guidance assistant engineered for resource-constrained primary healthcare settings. Powered by quantized edge AI runtime and Algorand zero-knowledge proofs, Mama-G enables Community Health Workers (CHWs) and expectant mothers to evaluate maternal symptoms, detect danger signs, and generate anonymous clinic referral proofs without active internet connectivity.

---

## Key Features

- **100% Offline AI Execution:** Runs quantized open-source models (such as Gemma/Llama) locally on entry-level Android devices using ONNX Runtime (sub-1.8s inference speed).
- **Maternal Emergency Triage:** Built-in clinical prompt guardrails detect high-risk symptoms (pre-eclampsia, severe anemia, hemorrhage) and issue high-priority alerts.
- **Privacy-Preserving Referrals:** Generates anonymous, zero-knowledge cryptographic hashes on the Algorand blockchain to issue patient-controlled care vouchers and facility transfers without exposing PII.
- **Geospatial Grounding:** Dynamically maps emergency referrals to operational healthcare facilities using Google Maps API when online connectivity is restored.

---

## System Architecture
Contributing & License
We welcome contributions from clinicians, software developers, and public health researchers.

Mama-G is open-source software licensed under the Apache License 2.0. Developed by PalmFarm.AI Technologies Limited.
## 🏥 Clinical Triage & Decision Logic Flow
... (Insert Clinical Flow Table) ...

## 🛡️ Technical Risk Matrix & Mitigation
... (Insert Risk Matrix Table) ...

## 📑 UNICEF & DPG Compliance
... (Insert Open Source Compliance) ...
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
