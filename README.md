# Late Base - Gestor de Distribuidores de Café

Una aplicación web para gestionar distribuidores y variedades de café, con integración con GitHub para backup de datos.

## Características

- Gestión completa de distribuidores de café (CRUD)
- Gestión de variedades de café con detalles específicos
- Sistema de búsqueda integrado
- Integración con GitHub para backup automático
- Interfaz responsive y moderna
- Diseño inspirado en jardines zen japoneses

## Estructura de datos

### Distribuidores
- id, nombre, país, región, contacto, descripción

### Cafés
- id, distributorId, nombre, origen, altitud, variedad, proceso, nivel de tostión, puntuación SCA, notas de cata, precios (250g, 500g, 1kg)

## Configuración de GitHub

Para utilizar la sincronización con GitHub:

1. Crear un token de acceso personal en GitHub con permisos de repositorio
2. Configurar los datos de conexión en la pestaña "Configuración GitHub"
   - Usuario: keyarturo10-rgb (preconfigurado)
   - Repositorio: latebase-project (preconfigurado)
   - Rama: main (preconfigurado)
   - Token: [tu token personal]
3. Probar la conexión con el botón "Probar conexión"
4. Activar la sincronización automática si se desea

## Instalación

1. Clonar el repositorio
2. Abrir el archivo index.html en un navegador web

## Tecnologías utilizadas

- HTML5 semántico
- CSS3 con variables CSS
- JavaScript ES6+
- LocalStorage para persistencia
- GitHub API para sincronización

## Estructura de archivos
