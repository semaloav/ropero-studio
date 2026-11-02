# Instrucciones para Codex — Rediseño integral de Ropero Studio V1

## Orden principal

Trabaja sobre el repositorio `semaloav/ropero-studio`.

**No te limites a agregar o corregir una tabla de despiece. La aplicación actual debe rediseñarse de manera integral porque la experiencia visual, la organización del formulario y los parámetros técnicos todavía no son suficientes.**

El resultado debe ser una aplicación coherente de principio a fin:

**configuración técnica básica → propuesta visual clara para el cliente → confirmación → despiece preliminar derivado de la misma configuración**.

No conserves una decisión visual o técnica únicamente porque ya existe. Reutiliza solo lo que realmente ayude a construir una aplicación clara, profesional y mantenible.

## 1. Objetivo de esta intervención

Entregar una V1 funcional que permita a un melaminero:

1. Registrar al cliente y el proyecto.
2. Definir las medidas generales y los parámetros constructivos básicos.
3. Armar una distribución interior mediante módulos simples.
4. Presentar al cliente una vista exterior, una vista interior y una perspectiva 3D referencial coherentes entre sí.
5. Confirmar la propuesta.
6. Generar un despiece preliminar calculado desde el mismo modelo configurado.
7. Imprimir o guardar una ficha en PDF.

El despiece seguirá siendo preliminar y deberá revisarse antes de cortar material.

## 2. Diagnóstico que debes corregir

La aplicación actual presenta estos problemas:

- El formulario se siente como una lista de campos sin un flujo de trabajo claro.
- La distribución interior depende demasiado del número de puertas.
- No existe una configuración real de módulos interiores.
- Faltan espesores, holguras y parámetros que afectan directamente al despiece.
- Las vistas exterior, interior y 3D no nacen de un modelo técnico suficientemente definido.
- La perspectiva 3D es principalmente decorativa y no comunica bien la profundidad ni la estructura.
- El diseño visual no alcanza todavía el nivel de una herramienta que pueda mostrarse profesionalmente frente al cliente.
- El despiece puede quedar desconectado de lo que aparece en la vista previa.
- La arquitectura actual dispersa el estado entre campos y elementos del documento, lo que dificulta mantener fórmulas consistentes.
- Los estilos están divididos en archivos acumulativos y uno de ellos está excesivamente comprimido, dificultando futuras modificaciones.

Debes resolver estos problemas como un conjunto. No hagas parches aislados.

## 3. Alcance obligatorio de la nueva V1

### 3.1 Flujo de la aplicación

Organiza la interfaz en cinco etapas visibles:

1. **Proyecto**
2. **Medidas y construcción**
3. **Distribución interior**
4. **Presentación**
5. **Despiece preliminar**

En escritorio puede mostrarse como un panel lateral con pasos y un área principal de trabajo. En celular debe convertirse en una navegación sencilla por etapas, sin obligar al usuario a desplazarse por un formulario interminable.

El usuario debe saber siempre:

- En qué etapa se encuentra.
- Qué datos faltan.
- Si la configuración es válida.
- Cuándo la propuesta está lista para presentarse.
- Si el despiece está actualizado o quedó pendiente por un cambio.

### 3.2 Datos del proyecto

Incluye:

- Nombre del proyecto.
- Nombre del cliente.
- Fecha.
- Observaciones para el cliente.
- Acabado exterior.
- Acabado interior.

### 3.3 Medidas y parámetros constructivos

Usa milímetros como unidad técnica interna y preferentemente también en los campos. Si se permite ingresar centímetros, convierte de manera explícita y sin pérdida.

Parámetros obligatorios:

- Ancho exterior.
- Alto exterior.
- Fondo exterior.
- Espesor de melamina, con 18 mm como valor inicial.
- Espesor del fondo, con 3 mm como valor inicial.
- Altura del zócalo.
- Retiro de repisas respecto del frente.
- Holgura entre puertas.
- Holgura superior e inferior de puertas.
- Tipo de fondo fijo en V1: sobrepuesto.
- Tipo de puerta fijo en V1: batiente sobrepuesta.

Muestra al usuario los supuestos constructivos de la V1:

- Laterales completos.
- Tapa y base entre laterales.
- Divisiones entre tapa y base.
- Fondo sobrepuesto.
- Repisas entre laterales o divisiones.

### 3.4 Distribución interior mediante módulos

La distribución no puede seguir generándose únicamente a partir del número de puertas.

Implementa entre uno y cuatro módulos configurables. Cada módulo debe contener:

- Nombre o número de módulo.
- Ancho en milímetros.
- Tipo:
  - Colgador largo.
  - Colgador corto con repisa.
  - Torre de repisas.
  - Cajonera con repisas.
  - Mixto.
- Número de repisas.
- Número de cajones visibles.

Comportamiento requerido:

- Al crear módulos, reparte inicialmente el ancho útil en partes iguales.
- Permite editar el ancho de cada módulo.
- Muestra en tiempo real la suma utilizada y el ancho disponible.
- No permite confirmar si la suma de los módulos no coincide con el ancho interior disponible.
- Calcula las divisiones verticales a partir de los módulos, no de las puertas.
- Permite definir la cantidad de puertas independientemente de la cantidad de módulos.

No implementes todavía arrastrar y soltar. Usa controles simples, rápidos y confiables.

### 3.5 Presentación visual

La presentación debe ser el centro del producto, no un elemento secundario.

#### Vista exterior

- Debe respetar la relación ancho/alto configurada.
- Debe mostrar la cantidad real de puertas.
- Debe mostrar frentes de cajones solo cuando sean exteriores.
- Debe reflejar los acabados seleccionados.
- Debe incluir cotas generales legibles.

#### Vista interior

- Debe representar cada módulo con su ancho proporcional.
- Debe mostrar divisiones, repisas, colgadores y cajoneras según la configuración.
- Debe incluir anchos de módulos y alturas principales.
- No debe mostrar una distribución genérica diferente del despiece.

#### Vista 3D referencial

- Debe usar la misma estructura de la vista frontal.
- Debe mostrar profundidad, costado, tapa, base y puertas de manera coherente.
- Puede seguir siendo una representación web simplificada; no necesita convertirse en CAD.
- No debe limitarse a inclinar un rectángulo plano sin comunicar la estructura del mueble.
- Debe funcionar sin errores en celular.

#### Calidad visual

- Rediseña la interfaz con jerarquía clara, espacios consistentes y controles legibles.
- Usa una paleta sobria relacionada con carpintería y diseño interior.
- Evita textos diminutos y zonas demasiado comprimidas.
- La vista previa debe ocupar el espacio principal en escritorio.
- Los controles técnicos deben agruparse y poder contraerse cuando se presenta el diseño al cliente.
- Incluye un modo **Presentar al cliente** que oculte controles técnicos y muestre solo proyecto, vistas, medidas, acabado y observaciones.
- Mantén un diseño profesional en anchos de 360 px, tableta y escritorio.

## 4. Modelo de datos único

Crea un único objeto de estado para todo el proyecto. No uses el documento HTML como fuente principal de los datos.

El modelo debe contener como mínimo:

```js
{
  project: {
    name: "",
    client: "",
    date: "",
    notes: ""
  },
  dimensions: {
    width: 2400,
    height: 2200,
    depth: 600
  },
  construction: {
    boardThickness: 18,
    backThickness: 3,
    plinthHeight: 80,
    shelfSetback: 20,
    doorGap: 2,
    doorTopGap: 2,
    doorBottomGap: 2,
    backType: "overlay",
    doorType: "overlay-hinged"
  },
  finishes: {
    exterior: "roble-natural",
    interior: "blanco"
  },
  doors: {
    count: 3
  },
  modules: [
    {
      id: "module-1",
      width: 780,
      type: "shelves",
      shelves: 4,
      drawers: 0
    }
  ],
  status: "draft"
}
```

Todas las vistas, resúmenes, validaciones y piezas deben calcularse a partir de este estado.

## 5. Motor de cálculo del despiece preliminar

Separa las funciones de cálculo de las funciones que dibujan la interfaz.

El motor debe producir una lista normalizada de piezas:

```js
{
  code: "LAT-01",
  name: "Lateral",
  quantity: 2,
  length: 2200,
  width: 600,
  thickness: 18,
  material: "Melamina roble natural",
  grain: "vertical",
  edging: ["front"],
  moduleId: null,
  note: "Lateral completo"
}
```

### Piezas mínimas

- Dos laterales.
- Tapa.
- Base.
- Zócalo frontal.
- Divisiones verticales según los módulos.
- Repisas por módulo.
- Fondo sobrepuesto.
- Puertas.
- Frentes visibles de cajones.

### Reglas mínimas

- Laterales: `alto × fondo`.
- Tapa y base: `(ancho exterior - 2 × espesor) × fondo`.
- Divisiones: altura útil entre tapa, base y zócalo.
- Ancho útil interior: ancho exterior menos laterales y divisiones.
- Repisas: ancho real del módulo por fondo menos retiro frontal.
- Fondo: ancho exterior por alto exterior.
- Puertas: calculadas con las holguras configuradas.
- Frentes de cajón: calculados desde el módulo correspondiente y la cantidad de cajones.

Aclara en código y pantalla cada supuesto. No inventes reglas ocultas.

### Tabla de despiece

Incluye:

- Código.
- Pieza.
- Módulo.
- Cantidad.
- Largo.
- Ancho.
- Espesor.
- Material/acabado.
- Orientación de veta.
- Canteado estimado.
- Observación.

Permite:

- Agrupar por módulo.
- Copiar la tabla.
- Imprimirla.
- Incluirla en el PDF de la propuesta.

Muestra siempre:

> Despiece preliminar. Verifique medidas, holguras, orientación de veta, canteado, herrajes y sistema de armado antes de cortar material.

## 6. Validaciones obligatorias

- Medidas generales positivas y dentro de rangos razonables.
- Fondo suficiente para el tipo de módulo seleccionado.
- Espesores menores que las dimensiones del mueble.
- Altura de zócalo menor que el alto disponible.
- Anchos de módulos positivos.
- Suma de módulos igual al ancho interior útil.
- Ninguna pieza con largo o ancho menor o igual a cero.
- Ninguna repisa más ancha que su módulo.
- Cantidad de puertas compatible con el ancho exterior.
- Mensajes de error concretos junto al campo correspondiente.
- Bloqueo de confirmación y generación final cuando existan errores.

## 7. Estados y coherencia

Usa tres estados de proyecto:

- `draft`: configuración en curso.
- `confirmed`: propuesta confirmada con el cliente.
- `cutlist-draft`: despiece preliminar generado.

Si se cambia cualquier medida o módulo después de confirmar, vuelve a `draft` y marca el despiece como desactualizado.

## 8. Arquitectura y calidad de implementación

- Puedes mantener una aplicación estática sin servidor para esta V1.
- Refactoriza los archivos si la estructura actual dificulta el trabajo.
- Elimina estilos duplicados y no sigas acumulando archivos de corrección.
- Usa CSS organizado y legible, no una única línea comprimida.
- Divide JavaScript por responsabilidades si resulta útil:
  - estado y persistencia;
  - cálculos y validaciones;
  - renderizado de vistas;
  - despiece;
  - eventos de interfaz.
- Mantén persistencia local, pero versiona el formato guardado y migra o descarta de forma segura los datos antiguos incompatibles.
- No agregues dependencias pesadas sin necesidad.
- Mantén accesibilidad por teclado, etiquetas correctas y contraste legible.
- Evita funciones gigantes, constantes mágicas y fórmulas repetidas.

## 9. Entrega y pruebas obligatorias

No declares la tarea terminada solo porque el código compile.

Debes verificar como mínimo:

1. Proyecto de 2400 × 2200 × 600 mm, melamina de 18 mm.
2. Tres módulos con anchos válidos y distribuciones diferentes.
3. Cambio de medidas y actualización inmediata de las tres vistas.
4. Cambio de módulos y actualización del despiece.
5. Error visible cuando la suma de módulos es incorrecta.
6. Ausencia de piezas con medidas negativas o cero.
7. Confirmación de la propuesta y posterior invalidación al cambiar una medida.
8. Modo de presentación al cliente.
9. Impresión/PDF con propuesta y despiece preliminar.
10. Funcionamiento en un ancho móvil de 360 px y en escritorio.
11. Ausencia de errores en la consola.
12. Publicación correcta en GitHub Pages.

Entrega un breve informe con:

- Qué se rediseñó.
- Qué parámetros se incorporaron.
- Qué reglas usa el despiece.
- Qué pruebas se realizaron.
- Qué limitaciones continúan pendientes.

## 10. Definición de terminado

La nueva V1 está terminada únicamente si:

- Se percibe como una sola aplicación coherente, no como funciones añadidas una encima de otra.
- El melaminero puede configurar módulos sin conocimientos técnicos de programación.
- La vista interior coincide con los módulos configurados.
- La vista 3D representa la misma propuesta.
- El despiece se deriva exactamente de esa configuración.
- Los errores técnicos impiden confirmar una propuesta inválida.
- El modo cliente oculta la complejidad del taller.
- La experiencia es profesional tanto en celular como en escritorio.
- El despiece está claramente marcado como preliminar.
- No existe ningún cálculo de costos.

## 11. Fuera del alcance de esta intervención

No implementes:

- Costos ni precios.
- Cotizaciones.
- Mano de obra.
- Optimización de corte de tableros.
- Planos de corte.
- Inventario.
- Compras.
- Producción.
- Herrajes detallados.
- Perforaciones o mecanizados.
- Puertas corredizas.
- Fondos embutidos o ranurados.
- Cajas técnicas completas de cajones.
- Edición CAD.

Estas capacidades corresponden a una versión posterior.

## 12. Instrucción final para Codex

Antes de modificar archivos, revisa el repositorio completo y presenta un plan breve. Luego ejecuta el rediseño completo sin detenerte después de agregar el despiece. Conserva el alcance de la V1, pero eleva sustancialmente la calidad visual y la utilidad técnica.

La prioridad es:

**coherencia del producto → parámetros correctos → claridad visual → despiece preliminar confiable → publicación validada**.
