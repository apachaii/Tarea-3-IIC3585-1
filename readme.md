Para utilizar emscripten el proceso es:
  Descargar y ejecutar emscripten (https://emscripten.org/docs/getting_started/downloads.html)
  luego crear el código en un archivo con extinción "c", es importante que la función a exportar utilice arriba EMSCRIPTEN_KEEPALIVE e importar #include <emscripten.h>
  por ejemplo:
      ` #include <emscripten.h> `
     `  EMSCRIPTEN_KEEPALIVE `
       `float add(float x, float y) {
       return x + y;
     }
      `
      
**Importante**  
Sacar el "main" del código para evitar errores.
      
  Luego se debe ejecutar el comando **emcc nombre_archivo.c -s WASM=1 -o nombre_archivo.html** en la carpeta donde esta el archivo c
  
  El código que tiene esta rama consta de 2 archivos, en el caso de hola.js su función es cargar y ejecutar el archivo .wasm,
  es importante que en la instrucción `let response = await fetch('functions.wasm');` se coloque el nombre del archivo wasm que se construyo con el comando anterior.
  
  En hola.html se llama la función que se exportó con la instrucción `  EMSCRIPTEN_KEEPALIVE `, solo las que tengan esto pueden ser llamadas. El archivo html tiene un setTimeout de 1 minuto, esto es porque es requiere de ese segundo para compilar el wasm.