---
title: "Adaptador USB 12-Bit para Pedalera Logitech"
description: "Interfaz USB de 12 bits (4096 pasos) y 1000 Hz para conectar y usar pedaleras Logitech (G25, G27, G29, G920, G923) de forma 100% independiente en PC. Auto-calibración y cable USB-C incluido."
image: "/images/logitech-pedal-adapter.jpg"
gallery: ["/images/logitech-pedal-adapter.jpg"]
featured: true
isAccessory: true
customizable: true
category: "Accesorios Logitech"
tags: ["Logitech", "SimRacing", "12-Bit (4096 Pasos)", "RP2040", "USB-C"]
mercadolibreUrl: "https://www.mercadolibre.com.ar/interfaz-adaptador-usb-pedalera-12bit-logitech-g29-g920-g923/up/MLAU5074340123?pdp_filters=item_id:MLA2061052485"
firmwareUrl: "/downloads/DXTweak2.zip"
videoGuideUrl: "https://www.youtube.com/watch?v=qVXqMrxvKwE&t=207s"
price: 50000
stock: "En Stock"
instructionSteps:
  - text: "⚠️ PASO 1 (FUNDAMENTAL): Conectá primero la ficha DB9 de tu pedalera Logitech (G25, G27, G29, G920 o G923) al puerto hembra del adaptador Antartech ANTES de conectar el cable USB."
  - text: "⚠️ PASO 2: Recién después conectá el cable USB Tipo C a tu PC con los pedales en reposo. NO lo hagas al revés (no conectes el cable USB a la PC antes que la pedalera), ya que el chip al encenderse calibra las lecturas de los potenciómetros y de lo contrario tomará cualquier valor erróneo."
  - text: "Pisá a fondo cada pedal (acelerador, freno y embrague) una sola vez para que el microcontrolador memorice automáticamente el recorrido máximo y mínimo."
  - text: "Verificación en Windows (joy.cpl): Presioná Win + R, escribí joy.cpl y dale Enter. Seleccioná 'Antartech Adapter 12-Bit' y hacé clic en Propiedades para comprobar el recorrido en vivo."
  - text: "Ajuste Fino con DXTweak2: Podés descargar el programa DXTweak2 directamente desde la página para calibrar zonas muertas (deadzones) y curvas de frenado precisas a tu gusto (mirá el video tutorial al pie de página)."
---

### Interfaz USB Independiente de Alto Rendimiento para Pedales Logitech

El **Antartech Adapter 12-Bit** desbloquea el 100% del potencial de tus pedales Logitech. Diseñado específicamente para pilotos que desean usar su pedalera Logitech de forma autónoma conectada directamente a la PC por USB, o que han actualizado su volante a una base **Direct Drive (Fanatec, Moza, Simagic, Thrustmaster, Cammus)** y quieren conservar su pedalera con una respuesta muy superior a la de fábrica.

Multiplica por 16 la resolución original de los pedales y ofrece una respuesta inmediata de 1 ms sin latencia.

#### ⚠️ Secuencia Obligatoria de Conexión

Para que la auto-calibración por hardware funcione de manera óptima y precisa, es **fundamental** respetar el siguiente orden:

1. **Paso 1**: Conectá primero la ficha DB9 de la pedalera Logitech al conector hembra del adaptador Antartech.
2. **Paso 2**: Luego conectá el cable USB Tipo C a la PC (manteniendo los pedales en reposo).

> **¡MUY IMPORTANTE! No conectar al revés:**  
> Si conectás primero el cable USB a la PC y después enchufás la pedalera, el microcontrolador se iniciará con los pines analógicos al aire (flotantes) y **tomará cualquier valor erróneo o lecturas descalibradas**. Si te sucede esto por descuido, simplemente desconectá el cable USB Tipo C de la PC y volvé a conectarlo con la pedalera ya enchufada.

#### Ventajas y Especificaciones Técnicas

- **16 Veces Más Precisión (12 Bits / 4096 Pasos)**: La conexión original a la base de fábrica lee los potenciómetros con apenas 256 pasos (8 bits). El adaptador Antartech procesa la señal con **4096 niveles reales**, permitiendo un control milimétrico al dosificar el acelerador a la salida de curva y modular el freno justo al límite del bloqueo.
- **Tasa de Refresco a 1000 Hz (1 ms Polling Rate)**: Equipado con un potente microcontrolador **RP2040** de arquitectura Dual-Core ARM Cortex M0+. Cero latencia entre el pie y la respuesta física del vehículo en el simulador.
- **Señal Estable con Sobremuestreo y Filtrado EMA**: Incorpora sobremuestreo múltiple por hardware y un algoritmo de filtrado adaptativo que elimina temblores, jitter y falsos toques en reposo.
- **100% Plug & Play con Auto-Calibración Inteligente**: No requiere drivers especiales ni aplicaciones pesadas abiertas en segundo plano. Memoriza dinámicamente el recorrido de los pedales y autodetecta la polaridad, funcionando a la perfección con pedales estándar o modificados (resortes progresivos, gomas o sensores Hall).
- **Conectividad Moderna USB Tipo C**: Dispone de puerto Tipo C robusto e incluye cable USB desmontable mallado de 2 metros de largo.
- **Chasis Compacto con Textura de Fibra de Carbono**: Gabinete de alta densidad con tapa de fibra de carbono texturada y tornillería reforzada, preparado para soportar el uso intensivo en cualquier puesto de conducción.

#### Compatibilidad de Pedaleras

- **Logitech G29**
- **Logitech G920**
- **Logitech G923**
- **Logitech G27**
- **Logitech G25**
*(Compatible tanto con pedales estándar de fábrica como con modificaciones de resortes, gomas de freno o sensores Hall)*.

#### Compatibilidad de Simuladores en PC

iRacing, Assetto Corsa, Assetto Corsa Competizione, Automobilista 2, rFactor 2, EA Sports WRC, Dirt Rally 2.0, F1 23/24, BeamNG.drive, Forza Horizon / Motorsport, Live for Speed, Richard Burns Rally, entre otros.

#### Calibración y Ajuste Fino (joy.cpl y DXTweak2)

Una vez conectado en el orden correcto, pisá a fondo una sola vez cada pedal (acelerador, freno y embrague) para que el adaptador registre y guarde el recorrido completo en su memoria interna. Luego podés verificar y optimizar la calibración:

- **Panel de Dispositivos de Juego de Windows (`joy.cpl`)**:  
  Presioná las teclas `Windows + R`, escribí `joy.cpl` y presioná *Enter*. Seleccioná *Antartech Adapter 12-Bit* y hacé clic en *Propiedades* para visualizar las barras de respuesta en tiempo real y comprobar que cada pedal responda de 0% a 100% con total fluidez.
- **Herramienta Avanzada DXTweak2**:  
  Podés descargar la utilidad portable **DXTweak2** con el botón de descarga en esta página:
  - **Zonas Muertas (Deadzone) Inicial y Final**: Permite dejar un margen en reposo para apoyar el pie sin accionar el pedal, y asegurar el 100% de fuerza sin fatigar el resorte o potenciómetro.
  - **Curvas de Sensibilidad y Progresividad**: Modulá la linealidad de la frenada para evitar bloqueos y mejorar tus tiempos por vuelta.
  - **Video Tutorial Paso a Paso**: Más abajo encontrarás el video guía (que inicia directamente en el minuto 3:27) donde se explica con detalle la calibración con DXTweak2.

