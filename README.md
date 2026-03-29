# 🚗 RentaVerse — Showroom 3D para Rent-a-Car

Plataforma inmersiva que permite a negocios de alquiler de vehículos mostrar su flota en un entorno 3D navegable, directamente en el navegador.

---

## ⚡ Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Descargar modelos 3D gratuitos (requiere internet)
node scripts/download-models.js

# 3. Iniciar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🚗 Modelos 3D de Vehículos

El script `download-models.js` descarga el modelo **ToyCar** de Khronos (CC0) como placeholder.

### Para usar modelos realistas (RECOMENDADO)

Descarga modelos GLB gratuitos de alta calidad de estas fuentes:

#### Opción A — Sketchfab (Gratis, CC-BY)
1. Ir a [sketchfab.com](https://sketchfab.com) → filtrar por "Free" y "Downloadable"
2. Buscar: `toyota camry glb free`, `porsche cayenne glb free`, etc.
3. Descargar → **Export as GLB**
4. Renombrar y mover a `/public/models/`:

| Archivo esperado       | Vehículo              | Búsqueda sugerida en Sketchfab          |
|------------------------|-----------------------|-----------------------------------------|
| `car_sedan.glb`        | Toyota GR Supra       | `toyota supra glb free`                 |
| `car_suv.glb`          | Porsche Cayenne       | `porsche cayenne free download glb`     |
| `car_sport.glb`        | BMW M4                | `bmw m4 free glb download`              |
| `car_luxury.glb`       | Mercedes-AMG GT       | `mercedes amg gt glb free`              |
| `car_electric.glb`     | Audi RS e-tron GT     | `audi e-tron gt glb free`               |

#### Opción B — Poly.pizza (CC0, sin atribución)
[https://poly.pizza/search/car](https://poly.pizza/search/car)
Modelos más simples pero completamente libres de derechos.

#### Opción C — KhronosGroup Sample Assets (CC0)
[https://github.com/KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)
Excelentes para pruebas de shaders y materiales PBR.

#### Opción D — Market Poimandres (pmnd.rs)
[https://market.pmnd.rs](https://market.pmnd.rs)
Modelos optimizados para React Three Fiber.

---

## 🏗️ Arquitectura del proyecto

```
src/
├── app/
│   ├── layout.tsx          ← Fonts (Bebas Neue + DM Sans), metadata
│   ├── globals.css         ← Design tokens CSS vars
│   └── page.tsx            ← Entry point (landing ↔ showroom)
├── components/
│   ├── landing/
│   │   └── LandingPage.tsx ← Landing page completa con Framer Motion
│   └── showroom/
│       ├── ShowroomCanvas.tsx  ← Canvas R3F: GLB models, lighting, post-fx
│       ├── ShowroomPage.tsx    ← Orquesta canvas + overlays
│       ├── ShowroomHUD.tsx     ← Top bar
│       ├── FleetStrip.tsx      ← Bottom vehicle selector
│       └── VehiclePanel.tsx    ← Detail panel lateral
├── lib/
│   └── data.ts             ← Mock vehicles & business data
├── stores/
│   └── showroomStore.ts    ← Zustand global state
└── types/
    └── vehicle.ts          ← TypeScript interfaces
```

---

## 🎮 Stack tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 14** (App Router) | Framework |
| **TypeScript** | Tipado |
| **React Three Fiber** | Canvas 3D declarativo |
| **@react-three/drei** | Helpers: OrbitControls, useGLTF, Environment, ContactShadows |
| **@react-three/postprocessing** | Bloom, Vignette, ChromaticAberration, ToneMapping |
| **Three.js** | Motor 3D base |
| **Zustand** | Estado global |
| **Framer Motion** | Animaciones UI |
| **Tailwind CSS** | Estilos utilitarios |

---

## 🎨 Características visuales

- **HDRI environment** desde Poly Haven (warehouse industrial → reflections realistas)
- **Cinematic 3-point lighting**: Key (warm) + Fill (cool blue) + Rim (purple)
- **ACESFilmic tone mapping** + exposure calibrado
- **Post-processing**: Bloom en luces LED, Vignette, Chromatic Aberration, SMAA anti-aliasing
- **Contact shadows** de alta resolución por vehículo
- **Polished epoxy floor** con reflections especulares
- **Columnas de seguridad** con franjas amarillo/negro industriales y bumper guards
- **LED ceiling fixtures** con emisión real
- **HDRI-based reflections** en pinturas metalizadas

---

## 🗺️ Basado en plano real

El layout del parking replica la distribución del plano arquitectónico:
- **Fila superior**: Slots L-19 a L-27 (vehículos posicionados)
- **Área central**: Pasillos de circulación con flechas de flujo
- **Columnas**: Distribuidas en la zona de parqueo central
- **Módulo de oficina**: Esquina derecha con ventanas translúcidas
- **Señalización APEX RENTALS** en pared posterior

---

## 🚀 Próximas fases

- **Fase 2**: First-person navigation (WASD), modo kiosk, reservas reales
- **Fase 3**: Dashboard admin, gestión de flota, analytics
- **Fase 4**: Multi-tenant, cada negocio con su slug y showroom propio

---

## 📄 Licencias de modelos

- Modelos descargados de Sketchfab: **CC-BY 4.0** (requieren atribución)
- Modelos de Poly.pizza / KhronosGroup: **CC0** (dominio público)
- Verifica siempre la licencia del modelo antes de uso comercial.
