# Un detalle para ti

Prototipo web para diseñar una tarjeta con foto y abrir una dedicatoria al escanear su QR.

## Abrir en VS Code

1. Abre esta carpeta en VS Code.
2. Abre `index.html` en el navegador. Para servirlo desde la terminal integrada de VS Code también puedes ejecutar:

   ```powershell
   py -m http.server 8000
   ```

3. En la computadora, visita `http://localhost:8000`.

El generador del QR usa una librería cargada desde cdnjs, así que necesita conexión a internet. El contenido del mensaje se codifica localmente en el fragmento de la URL y no se envía al servicio de QR.

## Qué incluye

- Campos para el nombre de quien recibe y quien regala.
- Enlace opcional a una canción o video en la nota digital.
- Vista previa de una tarjeta estilo Polaroid.
- Foto inicial incluida; puedes cambiarla desde el selector de archivos.
- Código QR que abre una página con la dedicatoria.
- Estilos para celular e impresión.

La foto elegida solo aparece en la vista previa y en la impresión; no se agrega a la página digital que abre el QR.

## Para compartir el QR

Antes de imprimir una tarjeta para otra persona, publica estos archivos en un hosting estático y abre la dirección pública. El QR se genera con esa dirección. Si lo generas desde `localhost` o desde un archivo local, el celular de otra persona no podrá abrirlo.

El mensaje queda legible dentro de la URL del QR para quien lo escanee. No incluyas datos que quieras mantener privados.





