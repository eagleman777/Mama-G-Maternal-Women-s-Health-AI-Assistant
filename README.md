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

## System Architecture
