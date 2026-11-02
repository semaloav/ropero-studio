# Ropero Studio

Aplicación web estática para configurar, presentar y revisar propuestas preliminares de roperos.

## Recorrido V1

1. Registra proyecto, cliente y acabados.
2. Define medidas y parámetros constructivos en milímetros.
3. Configura entre uno y cuatro módulos interiores con anchos editables.
4. Revisa las vistas exterior, interior y 3D, todas derivadas del mismo modelo.
5. Confirma la propuesta y genera el despiece preliminar.

El modo **Presentar al cliente** oculta los parámetros del taller. La impresión técnica incluye la propuesta, los parámetros constructivos, la tabla de piezas y la advertencia de revisión.

## Ejecución local

La aplicación no requiere compilación ni dependencias de producción. Los módulos de JavaScript necesitan un servidor HTTP local:

```powershell
python -m http.server 8000
```

Abre `http://localhost:8000`. Los datos se guardan únicamente en el navegador del dispositivo.

## Pruebas

Requiere Node.js 18 o posterior:

```powershell
npm test
```

Las pruebas cubren el caso técnico de referencia, reparto de módulos, validaciones, fórmulas de puertas, piezas y estados.

## Arquitectura

- `index.html`: flujo accesible de cinco etapas.
- `styles.css`: interfaz, vistas, adaptación móvil e impresión.
- `model.js`: estado, validaciones y fórmulas centralizadas del despiece.
- `app.js`: eventos y renderizado de formulario, vistas y tabla.
- `model.test.js`: pruebas automáticas del modelo técnico.

## Publicación

GitHub Pages publica el contenido de la rama `main` desde la raíz. No existe proceso de compilación.

> Despiece preliminar. Verifique medidas, holguras, orientación de veta, canteado, herrajes y sistema de armado antes de cortar material.

