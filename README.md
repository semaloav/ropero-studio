# Ropero Studio

Aplicación web estática para configurar y presentar propuestas referenciales de roperos.

## Uso

Abre `index.html` en un navegador. Los datos se guardan únicamente en el navegador del dispositivo. El botón **Presentar / PDF** abre la impresión del navegador para imprimir o guardar la ficha como PDF.

## Publicación en GitHub Pages

No requiere instalación ni compilación. Publica el contenido de la rama `main` desde la raíz del repositorio en **Settings → Pages**.

## Arquitectura

- `index.html`: estructura y contenido accesible.
- `styles.css` y `review.css`: diseño, adaptación móvil e impresión.
- `app.js`: estado, persistencia local y representación del modelo.

No usa dependencias externas de JavaScript. Las tipografías remotas tienen alternativas locales y la aplicación sigue funcionando sin ellas.
