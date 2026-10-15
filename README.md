# CV web — Laureano Ignacio Muñoz

Sitio estático de una página. Sin dependencias ni paso de compilación.

## Estructura

```
cv-laureano/
├── index.html        Contenido y estructura
├── css/styles.css    Estilos (colores y tipografías en variables, al inicio)
├── js/main.js        Efectos: menú móvil, aparición al scrollear, contadores y visor de fotos
└── img/              Foto de perfil y fotos de platos
```

Si `js/main.js` no carga, el sitio se ve completo igual, solo que sin animaciones ni visor.

## Ver en local

En VS Code, instalar la extensión **Live Server**, clic derecho sobre `index.html` y elegir "Open with Live Server".
También funciona abrir `index.html` directamente en el navegador.

## Cambios frecuentes

- **Colores:** variables en `:root`, al inicio de `css/styles.css` (`--green` es el acento).
- **Contacto:** sección `#contacto` en `index.html`. El correo es provisorio (marcado con `TODO`); al cambiarlo, actualizar también el `href="mailto:..."`.
- **Fotos:** reemplazar los archivos de `img/` conservando el nombre, o cambiar el `src` en `index.html`.
