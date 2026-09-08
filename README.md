# traCo2

**Every Watt. Every Mile. Where Data Meets Sustainability.**

DVerDex is an organization-focused carbon footprint tracking platform that combines IoT-based emissions monitoring, automated carbon calculation, AI-driven reduction recommendations, and a public Green Badge certification system — helping organizations measure, understand, and reduce their carbon footprint with real, verifiable data.

---

## Overview

Organizations today lack an accessible, automated way to track and act on their carbon emissions. Existing tools are either entirely manual (spreadsheets, self-reported estimates), locked behind expensive enterprise ESG software, or simply don't exist as dedicated, India-first solutions. DVerDex closes that gap by pairing low-cost IoT hardware with an automated calculation and reporting pipeline, so organizations get accurate emissions data without manual effort — and a public leaderboard and certification system that turns sustainability performance into a visible, competitive incentive.

## Problem Statement

Individuals and organizations lack comprehensive tools to accurately measure, understand, and reduce their carbon emissions. DVerDex addresses this specifically for organizations by providing:

- Real-time emissions data collection from electricity meters and company vehicles
- Automated carbon footprint calculation and category-level breakdowns
- AI-generated, ranked recommendations for reduction
- ESG-ready reporting for compliance and CSR use cases
- A public leaderboard and Green Badge certification to incentivize measurable improvement

## Key Features

- **IoT Integration** — electricity meter and vehicle monitoring via ESP32-based sensor nodes, streamed in real time
- **Manual Data Fallback** — fuel type, emission factors, and other inputs the sensors can't capture
- **Carbon Calculation Engine** — converts raw activity data into standardized CO₂e using recognized emission factors
- **Carbon Intelligence Engine** — analytics, AI recommendations, and ESG report generation from the same underlying data
- **Green Badge Certification** — organizations under a defined emissions threshold, reviewed and approved by a verified environmental partner, earn a public Green Badge
- **Public Leaderboard** — organizations ranked by emissions intensity, with certified organizations visually distinguished
- **Public Organization Profiles** — shareable, verifiable sustainability profiles for certified organizations

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Mobile app | Flutter (built via FlutterFlow) | Cross-platform, native rendering for custom UI (gauges, dynamic status indicators) |
| Backend / database | Firebase (Firestore) | Primary data store — organizations, devices, emissions records, badge status |
| Auth | Firebase Authentication | Email/password + Google login |
| Notifications | Firebase Cloud Messaging | Milestone, alert, and status-change notifications |
| Business logic | Firebase Cloud Functions | Carbon calculation, badge eligibility evaluation, report generation |
| IoT communication | MQTT (Mosquitto broker) | ESP32 sensor nodes publish readings |
| IoT-to-backend bridge | Node.js bridge service | Subscribes to MQTT, writes readings into Firestore (app never connects to MQTT directly) |
| Hardware | ESP32 + PZEM-004T | Electricity monitoring; GPS module for vehicle tracking |

## System Architecture

```
ESP32 + PZEM-004T  →  MQTT Broker (Mosquitto)  →  Bridge Service  →  Firestore
                                                                          │
                                                                          ▼
                                                        Flutter App (FlutterFlow)
                                                     reads/writes via native Firebase
                                                        integration, no MQTT client
                                                              needed on-device
```

Routing IoT data through a bridge service rather than connecting the mobile app directly to MQTT keeps the app's data layer entirely within Firestore — simpler to build in FlutterFlow, and avoids the battery/background-connection issues of holding a persistent MQTT session on a mobile device.

## Hardware

- **ESP32 DevKit (WROOM-32)** — main controller, WiFi-connected, publishes sensor data via MQTT
- **PZEM-004T v3.0** — non-invasive AC energy monitor (CT clamp), ±0.5% factory-calibrated accuracy, no calibration required
- **GPS module (NEO-6M)** — vehicle trip tracking for fleet emissions

See `/hardware` for wiring notes and the ESP32 sketch.

## App Navigation

Single organization-only track, five-tab bottom navigation after registration and verification:

1. **Dashboard** — total footprint, category breakdown, budget status, badge summary
2. **Devices** — register and monitor electricity meters and vehicles; live and manual data entry
3. **Insights** — analytics, AI recommendations, ESG report export, Carbon Performance Score
4. **Leaderboard** — organizations ranked by emissions intensity; certified organizations flagged
5. **Profile** — org settings, badge status and certification flow, public profile, team management

Registration includes an admin verification gate (approve/resubmit) before the main app unlocks.

## Green Badge Certification Flow

1. Organization's Carbon Performance Score is evaluated against the eligibility threshold
2. Below threshold → improvement suggestions shown, re-evaluated on next scoring cycle
3. Above threshold → submitted for Environmental Partner Review
4. Review rejected → re-evaluation cycle
5. Review approved → Green Badge awarded, reflected on the public profile and leaderboard

Full flowchart: `/docs/process-flowchart.svg`

## Getting Started

### Prerequisites
- Firebase project (Firestore, Auth, Cloud Functions, FCM enabled)
- FlutterFlow account, connected to the Firebase project
- Node.js (for the MQTT bridge service)
- Mosquitto broker (self-hosted or managed)
- ESP32 + PZEM-004T hardware for live testing (optional — bridge can run against simulated data)

### Firebase Setup
1. Create a Firebase project and enable Firestore, Authentication (Email + Google), Cloud Functions, and Cloud Messaging
2. Import the Firestore security rules and initial collections from `/backend/firestore`
3. Deploy Cloud Functions from `/backend/functions`

### MQTT Bridge Setup
1. `cd bridge && npm install`
2. Configure `.env` with your MQTT broker address and Firebase service account credentials
3. `npm start` — subscribes to the sensor topic and writes readings to Firestore

### FlutterFlow Setup
1. Connect your FlutterFlow project to the Firebase project above
2. Import the page structure from `/docs/navigation-outline.md`
3. Bind each page's data widgets to the corresponding Firestore collections

## Project Structure

```
/app            FlutterFlow-exported Flutter project
/backend
  /firestore    Security rules, collection schemas
  /functions    Cloud Functions (calculation engine, badge evaluation, reports)
/bridge         MQTT-to-Firestore bridge service (Node.js)
/hardware       ESP32 sketch, wiring notes, bill of materials
/docs           SRS, architecture diagram, process flowchart, navigation outline
/design         Logo assets, dashboard mockups
```

## Roadmap

- Verified carbon-offset marketplace
- Blockchain-based tradable carbon credits for enterprise use cases
- Direct utility smart-meter API integration (as India's national smart meter rollout matures)
- Advanced ML-based emissions forecasting
- Government/city sustainability program partnerships

## Contributing

This project is under active development. Issues and pull requests are welcome — please open an issue to discuss significant changes before submitting a PR.

## License

*To be determined.*

## Acknowledgements

Emission factor reference data based on publicly available EPA/DEFRA datasets. Built with Flutter, Firebase, and the FlutterFlow platform.
