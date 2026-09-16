# Guardian Connect

Crea una app de pipeline de Atención a los apoderados totalmente funcional. La app debe tener 6 columnas: 'Nuevo Apoderado', 'Problema Observado', 'Propuesta Enviada', 'Negociando', 'Proceso Exitoso', 'Proceso en Construcción'. Cada tarjeta debe contener: nombre del Alumno, nombre del Apoderado, número de WhatsApp (clickeable — abre el enlace wa.me), email, origen del proceso (Inasistencia / Atrasos / Calificaciones / Conducta / Otro), Periodo de trabajo (en minutos), insignia de avance (Sin Proceso = rojo, En Proceso = amarillo, Proceso Exitoso = azul), fecha del próximo seguimiento y una vista previa de notas (primera línea de la nota más reciente). Funcionalidades requeridas: arrastrar y soltar tarjetas entre columnas, botón de agregar nuevo apoderado en el encabezado de cada columna, hacer clic en la tarjeta para abrir un modal de detalle con toda la información del alumno, campos editables, un registro cronológico del historial del apoderado (el usuario agrega notas con marca de tiempo) y una opción de eliminar. Las tarjetas con seguimiento vencido (la fecha del próximo seguimiento es anterior a hoy) deben resaltarse automáticamente con un borde rojo. Barra de filtros para filtrar por avance u origen del proceso. Botón de WhatsApp en cada tarjeta que abre wa.me/[número] directamente. Diseño: tema oscuro, acentos en teal (#0F766E), animación de arrastre fluida, responsivo para móvil. Conéctala, Despliégala y proporciona la URL pública.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6c382c8d-4419-4673-a7fd-948fc0488b8a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
