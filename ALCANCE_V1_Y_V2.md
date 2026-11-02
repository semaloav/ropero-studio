# Ropero Studio — Alcance de la primera y segunda versión

## 1. Objetivo del producto

Ropero Studio debe permitir que un melaminero configure rápidamente un ropero frente al cliente, muestre una representación comprensible del resultado y obtenga un **despiece preliminar** que sirva como punto de partida para la revisión técnica.

La primera versión debe ser pequeña y funcional. No pretende reemplazar un programa CAD ni entregar un despiece listo para producción sin revisión.

## 2. Alcance de la versión 1 — Entrega de hoy

### Resultado esperado

En una sola sesión, el usuario debe poder:

1. Registrar el nombre del proyecto y del cliente.
2. Ingresar las medidas exteriores del ropero.
3. Elegir una distribución interior básica.
4. Seleccionar cantidad de puertas, cajones y acabado.
5. Mostrar al cliente las vistas exterior, interior y 3D referencial.
6. Obtener una ficha imprimible o exportable a PDF.
7. Generar un despiece preliminar vinculado con la configuración.

### 2.1 Presentación ante el cliente

Se mantiene y completa la pantalla actual con:

- Nombre del proyecto y cliente.
- Ancho, alto y fondo exterior en centímetros.
- Cantidad de puertas.
- Cantidad de cajones.
- Organización interior básica:
  - Mixta: repisas y colgador.
  - Colgador amplio.
  - Mayormente repisas.
- Acabado o color referencial.
- Observaciones para el cliente.
- Vistas exterior, interior y 3D referencial.
- Resumen de medidas, distribución y acabado.
- Impresión o guardado en PDF.
- Guardado local en el dispositivo.

La representación visual debe indicar que es referencial y que no sustituye un plano de fabricación.

### 2.2 Datos técnicos mínimos para el despiece

Para evitar demasiada complejidad en la entrega de hoy, la V1 añadirá solamente:

- Espesor de melamina: valor inicial de 18 mm, editable.
- Espesor del fondo: valor inicial de 3 mm, editable.
- Tipo de fondo fijo para esta versión: sobrepuesto.
- Altura de zócalo: valor inicial configurable.
- Número de divisiones verticales, calculado inicialmente a partir de la cantidad de puertas.
- Número de repisas, calculado a partir de la organización interior elegida.

### 2.3 Regla constructiva fija de la V1

La primera versión utilizará una sola forma de armado para producir resultados consistentes:

- Laterales completos desde el piso hasta la tapa.
- Tapa y base colocadas entre los laterales.
- Divisiones verticales colocadas entre tapa y base.
- Repisas colocadas entre divisiones o laterales.
- Fondo sobrepuesto.
- Puertas batientes sobrepuestas.
- Despiece de cajones simplificado; no incluye todavía las piezas internas de la caja del cajón.

Estas reglas deben aparecer junto al despiece para que el melaminero sepa bajo qué supuestos fue calculado.

### 2.4 Despiece preliminar

La aplicación generará una tabla con las siguientes columnas:

| Campo | Descripción |
|---|---|
| Código | Identificador de la pieza |
| Pieza | Nombre de la pieza |
| Cantidad | Número de piezas iguales |
| Largo | Medida mayor en milímetros |
| Ancho | Medida menor en milímetros |
| Espesor | Espesor del material |
| Canteado | Cantos visibles estimados |
| Observación | Supuesto o ubicación de la pieza |

Piezas mínimas que debe calcular:

- Lateral izquierdo y derecho.
- Tapa.
- Base.
- Divisiones verticales.
- Repisas.
- Fondo sobrepuesto.
- Puertas.
- Frentes de cajón, cuando existan.
- Zócalo frontal.

### 2.5 Fórmulas preliminares de la V1

Variables:

- `W`: ancho exterior.
- `H`: alto exterior.
- `D`: fondo exterior.
- `T`: espesor de melamina.
- `B`: espesor del fondo.
- `Z`: altura del zócalo.
- `N`: cantidad de espacios o módulos.

Reglas iniciales:

- Laterales: `H × D`.
- Tapa y base: `(W - 2T) × D`.
- Divisiones: `(H - 2T - Z) × D`.
- Ancho útil interior: `W - 2T - (cantidad de divisiones × T)`.
- Ancho preliminar por módulo: `ancho útil interior ÷ N`.
- Repisas: `ancho del módulo × (D - 20 mm)`.
- Fondo: `W × H`, con espesor `B`.
- Puertas: ancho y alto calculados con una holgura fija visible en la interfaz.
- Frentes de cajón: ancho del módulo menos una holgura fija; altura distribuida entre la cantidad de cajones.

Todas las fórmulas deben trabajar internamente en milímetros. La interfaz puede continuar recibiendo medidas generales en centímetros.

### 2.6 Advertencia obligatoria del despiece

El documento y la pantalla deben incluir este mensaje:

> Despiece preliminar. Verifique medidas, holguras, orientación de veta, canteado, herrajes y sistema de armado antes de cortar material.

### 2.7 Acciones disponibles en la V1

- Mostrar u ocultar el despiece.
- Actualizarlo automáticamente al cambiar medidas o distribución.
- Imprimirlo junto con la propuesta.
- Guardarlo como PDF mediante la impresión del navegador.
- Copiar la tabla para utilizarla en una hoja de cálculo.

No se incluirá exportación directa a Excel en la entrega de hoy.

## 3. Fuera del alcance de la versión 1

Para proteger la entrega de hoy, se excluye:

- Editor libre de módulos mediante arrastrar y soltar.
- Configuración individual de cada repisa.
- Diferentes sistemas de armado.
- Fondos embutidos o ranurados.
- Puertas corredizas.
- Diseño técnico completo de cajones.
- Selección de correderas y bisagras.
- Perforaciones, taladros o mecanizados.
- Optimización sobre tableros.
- Planos de corte.
- Inventario.
- Cálculo de materiales comprados.
- Costos, precios, cotizaciones o mano de obra.
- Sincronización en la nube de los proyectos.
- Despiece autorizado automáticamente para producción.

## 4. Criterios de aceptación de la versión 1

La V1 estará lista cuando se cumpla lo siguiente:

- La aplicación abre desde computadora y celular.
- Los datos del formulario actualizan las vistas y el resumen.
- Las vistas exterior, interior y 3D funcionan.
- El usuario puede introducir el espesor de melamina, fondo y zócalo.
- El despiece preliminar se actualiza al cambiar ancho, alto, fondo, puertas, cajones u organización.
- El despiece nunca muestra medidas negativas o vacías.
- Las medidas del despiece aparecen en milímetros.
- La tabla identifica claramente que no está aprobada para corte.
- La propuesta y el despiece pueden imprimirse o guardarse como PDF.
- La interfaz sigue siendo utilizable en un celular.
- No se incluyen costos.

## 5. Flujo de trabajo de la versión 1

```text
Datos del cliente
        ↓
Medidas y configuración básica
        ↓
Vistas exterior, interior y 3D
        ↓
Revisión rápida con el cliente
        ↓
Despiece preliminar automático
        ↓
Impresión o PDF para revisión técnica
```

## 6. Alcance de la versión 2 — Mejoras pendientes

La V2 convertirá el despiece preliminar en una herramienta técnica más flexible y cercana al trabajo real del taller.

### 6.1 Constructor de módulos

- Crear módulos independientes.
- Definir el ancho de cada módulo.
- Reordenar módulos.
- Duplicar módulos.
- Validar que la suma coincida con el espacio disponible.
- Configurar colgadores, repisas, cajoneras y zapateras por módulo.

### 6.2 Reglas constructivas configurables

- Tapa y base interiores o sobrepuestas.
- Divisiones completas o apoyadas sobre base.
- Techo completo o travesaños.
- Fondo sobrepuesto, embutido o ranurado.
- Holguras configurables.
- Laterales decorativos adicionales.
- Plantillas de fabricación guardadas por taller.

### 6.3 Puertas y frentes

- Puertas batientes interiores o sobrepuestas.
- Apertura izquierda o derecha.
- Puertas corredizas.
- Traslapes y descuentos de rieles.
- Holguras editables.
- Continuidad de veta.
- Validación de puertas demasiado grandes.

### 6.4 Cajones técnicos

- Tipo de corredera.
- Holgura lateral según corredera.
- Profundidad de caja.
- Laterales, frente interior, posterior y fondo.
- Frentes visibles independientes.
- Distribución personalizada de alturas.

### 6.5 Canteado y veta

- Selección gráfica de cantos por pieza.
- Canto frontal, posterior, izquierdo y derecho.
- Orientación vertical u horizontal de la veta.
- Continuidad de veta entre puertas y frentes.
- Resaltado de la pieza seleccionada en el modelo.

### 6.6 Revisión técnica

- Estados: propuesta, diseño confirmado y despiece revisado.
- Versionado de cambios.
- Aviso cuando un cambio invalide un despiece revisado.
- Validaciones de repisas, puertas, cajones y profundidades.
- Firma o identificación del responsable de la revisión.

### 6.7 Exportación

- Exportación directa a CSV o Excel.
- Agrupación por módulo, material o espesor.
- Ficha técnica por pieza.
- PDF técnico con vistas y despiece.

## 7. Límites permanentes de este proyecto

Hasta que se defina expresamente una nueva fase, el producto se detiene en el despiece. No incluye:

- Costos.
- Precios de venta.
- Mano de obra.
- Márgenes.
- Cotizaciones.
- Optimización de corte.
- Gestión de compras o producción.

## 8. Decisión de producto

La entrega de hoy debe priorizar un recorrido corto y confiable:

**propuesta visual → confirmación con el cliente → despiece preliminar → revisión manual del melaminero**.

La V1 no debe crecer más allá de este recorrido. Las configuraciones avanzadas se implementarán en la V2 sin comprometer la claridad ni la velocidad de la primera versión.
