# Late Base - Gestor de Distribuidores de Café

Una aplicación web moderna para gestionar distribuidores y cafés, con sincronización en la nube mediante GitHub Gists.

## Características

- Gestión de distribuidores y cafés
- Interfaz moderna con modo claro y oscuro
- Sincronización de datos con GitHub Gists
- Diseño responsive compatible con dispositivos móviles
- Persistencia de datos local y en la nube

## Configuración

1. **Acceso a la aplicación**: 
   - La aplicación está disponible en [GitHub Pages](https://[tu-usuario].github.io/late-base) o puedes clonar el repositorio y abrir `index.html` en tu navegador.

2. **Conexión con GitHub**:
   - Para habilitar la sincronización, necesitas un token de acceso personal de GitHub.
   - Ve a [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens) y genera un nuevo token.
   - Selecciona el alcance (scope) "gist" para permitir la gestión de Gists.
   - En la aplicación, ve a la pestaña "GitHub", introduce tu token y haz clic en "Conectar".

3. **Uso**:
   - Una vez conectado, todos los cambios se guardarán automáticamente en un Gist privado de tu cuenta.
   - Puedes acceder a tus datos desde cualquier dispositivo conectando la misma cuenta de GitHub.

## Tecnologías utilizadas

- HTML5, CSS3, JavaScript (ES6+)
- GitHub API para sincronización
- LocalStorage para persistencia local
- Diseño responsive con Grid y Flexbox
- Iconos de FontAwesome y fuentes de Google Fonts

## Estructura del proyecto
