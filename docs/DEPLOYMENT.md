# Despliegue y operación — AgroOrbit Nexus

> **Estado:** procedimiento propuesto. No se dispone en este paquete de código fuente compilado, instalación verificada ni sitio desplegado.

## 1. Entorno propuesto

- Aplicación Next.js / React / TypeScript.
- Dependencias concretas y versiones: **por establecer al iniciar el repositorio de código**.
- Hosting tentativo: Vercel u otro proveedor compatible con rutas de servidor y mapas.
- Datos NASA POWER consultados con políticas de caché y validación.
- HLS / Dynamic World: integrar solo tras verificar autenticación, cuotas y licencia.

## 2. Preparación antes de publicar

1. Crear/confirmar el proyecto de código y el `package.json` real.
2. Validar en el entorno de desarrollo: compilación, tipado, pruebas y recorrido completo.
3. Configurar variables de entorno solo si las APIs/proveedores reales las necesitan.
4. No guardar tokens ni claves en el repo; usar gestor de secretos del proveedor.
5. Comprobar límites, tiempos de respuesta y fallos de NASA POWER.
6. Comprobar atribución de mapas y recursos satelitales.
7. Publicar versión y verificar el enlace externo sin iniciar sesión.
8. Actualizar [`STATUS.md`](STATUS.md) con URL probada, fecha, comandos y evidencias.

## 3. Variables de entorno

**Pendientes de definir.** No crear variables ficticias ni introducir credenciales de producción en documentación. La API NASA POWER de consulta pública podría no requerir un token para su uso básico, pero verificar la política vigente y el endpoint implementado.

## 4. Comandos de despliegue

**No indicados todavía:** dependerán del código, scripts y entorno realmente creados. Sustituir esta sección después de inspeccionar `package.json` y ejecutar instalación, verificación y compilación. No afirmar que un comando pasó sin ejecutarlo.

## 5. Pruebas posteriores a la publicación

- [ ] Acceso a página inicial sin cuenta.
- [ ] Mapa y formulario operativos.
- [ ] Endpoint del clima responde con datos reales y procedencia.
- [ ] Consulta errónea muestra mensaje claro.
- [ ] Tres estrategias se comparan correctamente.
- [ ] Informe muestra fuentes y supuestos.
- [ ] Móvil y escritorio probados.
- [ ] Enlaces de GitHub y demo accesibles a jurados externos.
- [ ] Licencias/atribuciones completas.

## 6. Fallos conocidos y degradación segura

- **POWER no disponible:** mostrar indisponibilidad; no sustituir por datos fingidos.
- **NDVI no disponible:** ocultar o marcar P1 como no disponible; el núcleo P0 debe seguir funcionando.
- **Datos locales incompletos:** emitir «evaluación incompleta» cuando corresponda.
- **Capa agrícola sin probabilidad suficiente:** no mostrar superficie como certeza.

## 7. Información real de despliegue

```text
Proveedor: PENDIENTE
URL: PENDIENTE
Commit/versión: PENDIENTE
Fecha de publicación: PENDIENTE
Pruebas ejecutadas: NINGUNA REGISTRADA
Responsable: PENDIENTE
```
