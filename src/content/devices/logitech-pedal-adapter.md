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
  - text: "Conectá la ficha DB9 original de tu pedalera Logitech (G25, G27, G29, G920 o G923) al puerto hembra del adaptador Antartech."
  - text: "Conectá el cable USB Tipo C a tu PC con los pedales en reposo (sin pisarlos durante la conexión)."
  - text: "Pisá a fondo cada pedal (acelerador, freno y embrague) una sola vez para que el microcontrolador RP2040 memorice el recorrido máximo y mínimo en su memoria EEPROM interna."
  - text: "Windows y tus simuladores lo detectarán de inmediato como 'Antartech Adapter 12-Bit' con 4096 niveles de resolución reales y 1000 Hz de sondeo."
  - text: "(Opcional) Para ajustar zonas muertas (deadzones) iniciales/finales o curvas de respuesta, descargá DXTweak2 con el botón de la página y seguí el video tutorial incluido abajo."
---

### Interfaz USB Independiente de Alto Rendimiento para Pedales Logitech

El **Antartech Adapter 12-Bit** desbloquea el 100% del potencial de tus pedales Logitech. Diseñado específicamente para pilotos que desean usar su pedalera Logitech de forma autónoma conectada directamente a la PC por USB, o que han actualizado su volante a una base **Direct Drive (Fanatec, Moza, Simagic, Thrustmaster, Cammus)** y quieren conservar su pedalera con una respuesta muy superior a la de fábrica.

Multiplica por 16 la resolución original de los pedales y ofrece una respuesta inmediata de 1 ms sin latencia.

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

#### Calibración y Ajuste Fino con DXTweak2

Aunque el adaptador cuenta con auto-calibración por hardware (memoriza los topes al pisar los pedales a fondo), podés utilizar la herramienta portable gratuita **DXTweak2** para realizar ajustes avanzados directamente en Windows a nivel DirectInput:

- **Zonas Muertas (Deadzone) Inicial y Final**: Configurá una zona muerta al inicio para poder apoyar el pie en el freno o acelerador sin que se active accidentalmente, y una zona muerta al final para asegurar el 100% de recorrido sin tener que presionar con fuerza excesiva.
- **Curvas de Sensibilidad y Progresividad**: Ajustá la linealidad de la respuesta para lograr una frenada más modulable y evitar bloqueos en curvas difíciles.
- **Portátil y Ligero**: No requiere instalación en el sistema ni controladores residentes en memoria. Solo descargás el archivo comprimido `.zip`, ejecutás la utilidad y guardás la calibración.
- **Tutorial en Video**: Más abajo encontrás la guía en video paso a paso donde se explica cómo utilizar DXTweak2 para dejar tus pedales Logitech calibrados a la perfección para simracing.

