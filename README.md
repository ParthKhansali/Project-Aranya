# ARANYA — Wildlife & Human-Conflict Intelligence Platform

> **Geospatial intelligence and decision-support platform for understanding wildlife activity, habitat pressure, and human-wildlife conflict zones in India.**
> Primary pilot geography: **Uttarakhand (Rajaji National Park & Jim Corbett National Park landscapes)**.

---

## 🌿 Overview

**ARANYA** is a specialized spatial decision-support platform built on 3D planetary GIS (CesiumJS). It bridges real-time wildlife monitoring, corridor connectivity analysis, and human-wildlife conflict mitigation:

- **Launch Geography**: Automatically centers on **India** and descends into the **Uttarakhand pilot landscape** (never USA or generic Earth).
- **Explainable Risk Engine**: Analyzes continuous 0–100 risk cells with transparent factor breakdowns (*Recent Sightings, Conflict History, Livestock Density, Forest Edge Proximity, Habitat Fragmentation, Behavioral Anomaly*).
- **Ground Verification & Dispatch**: Dispatches Quick Response Units (Team Alpha, Team Bravo, Patrol Unit 04) to defuse potential encounters before escalation occurs.
- **Interactive Event Simulator**: Runs realistic operational scenarios with sensor triggers, live telemetry trails, dynamic risk spikes, and alert generation.

---

## 🗺️ Key Spatial Layers

1. **🐾 Wildlife Detections & Camera Traps (`aranya-wildlife`)**: Automated optical/infrared camera trap stations (`CAM-017`, `CAM-018`, `CAM-022`, etc.) and species-classified sightings.
2. **🧭 Movement Corridors (`aranya-movement`)**: GPS collar telemetry and migratory paths (e.g. Chilla-Motichur #07, Kansro-Barkote).
3. **⚠️ Conflict Risk Landscape (`aranya-risk`)**: Semi-transparent risk polygons categorized by severity (Low, Moderate, High, Critical) with click-to-explain inspectability.
4. **🌲 Protected Reserves & Pinch Points (`aranya-reserves`)**: Core boundaries of Rajaji, Corbett, and Sonanadi reserves with pinch point bottlenecks.
5. **🏘️ Fringe Settlements & Linear Barriers (`aranya-human-interface`)**: Forest-edge villages (Raiwala, Shyampur, Chilla, Motichur) and linear transport infrastructure (railway cuts and highways).
6. **🛡️ Field Response Units (`aranya-field-teams`)**: Real-time deployment status of patrol teams and quick response vehicles.
7. **🍃 Canopy Health (`vegetation-health`)**: NASA GIBS MODIS NDVI 8-day composite indicating canopy density and habitat degradation.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20+ or v24+
- **NPM**: v10+

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run ARANYA domain test suite
npm run test:aranya

# Build production bundle
npm run build
```

---

## ⚡ Demonstration Scenarios

ARANYA includes an embedded **Event Simulator** with 4 pre-scripted scenarios:

1. **Scenario 1: Leopard Early Warning (Raiwala Sector)**  
   Nocturnal carnivore approach towards open cattle sheds. Triggers consecutive camera traps, escalates Sector 4 risk to 87 (CRITICAL), and generates a dispatch alert for Team Alpha (QRU).
2. **Scenario 2: Corridor Pinch-Point (Chilla-Motichur #07)**  
   Breeding elephant herd crossing the Ganges floodplain towards the railway cut. Initiates railway caution deceleration orders.
3. **Scenario 3: Habitat Pressure & Resort Fringe (Ramnagar / Kosi River)**  
   Tiger transit across the encroached riparian buffer into the Dhikuli tourist perimeter. Prompts pedestrian curfew protocols.
4. **Scenario 4: Perimeter Disturbance & Snare Threat (Shyampur)**  
   Thermal sensor detection of unauthorized off-trail nocturnal activity near forest boundaries. Dispatches foot patrol for anti-poaching sweep.

---

## 🏗️ Architecture

- **`src/data/aranya/`**: Clean provider abstractions for wildlife observations, movement telemetry, continuous risk modeling, protected reserves, and ground field verification.
- **`src/data/aranyaLayers.js`**: High-performance Cesium vector entity generation and interaction handlers.
- **`src/camera.js`**: Geographic presets (`india`, `uttarakhand`, `rajaji`, `corbett`, `raiwala`, `global`) and smooth flight animations.
- **`src/ui/aranya/`**: Top Intelligence HUD, Left Navigation Sidebar, Right Context Intelligence Rail, and Event Simulator modal.
