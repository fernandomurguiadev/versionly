# Versionly — Casos de Uso MVP
**Versión 1.2 · Febrero 2026**

El Admin puede ejecutar todos los casos de uso listados.

---

## CU-01 Crear workspace
**Actor:** Admin, Usuario  
**Objetivo:** Crear un workspace inicial y quedar como Admin.  
**Precondiciones:** Usuario registrado y autenticado.  
**Flujo básico:**
1) Accede al onboarding o pantalla de creación.
2) Ingresa nombre del workspace.
3) Confirma creación.
**Resultado:** Workspace creado, usuario asignado como Admin.

## CU-02 Crear proyecto
**Actor:** Admin  
**Objetivo:** Crear un proyecto dentro del workspace.  
**Precondiciones:** Workspace activo.  
**Flujo básico:**
1) Selecciona workspace.
2) Abre vista de proyectos.
3) Ingresa nombre del proyecto y confirma.
**Resultado:** Proyecto creado en el workspace.

## CU-03 Crear carpeta
**Actor:** Admin, Editor  
**Objetivo:** Crear carpeta para organizar documentos.  
**Precondiciones:** Proyecto existente.  
**Flujo básico:**
1) Abre proyecto.
2) Selecciona “Nueva carpeta”.
3) Ingresa nombre y confirma.
**Resultado:** Carpeta creada dentro del proyecto.

## CU-04 Crear documento
**Actor:** Admin, Editor  
**Objetivo:** Crear un documento con borrador activo.  
**Precondiciones:** Carpeta existente.  
**Flujo básico:**
1) Abre carpeta.
2) Selecciona “Nuevo documento”.
3) Ingresa título y confirma.
**Resultado:** Documento creado con borrador activo.

## CU-05 Guardar versión
**Actor:** Admin, Editor  
**Objetivo:** Crear una versión nombrada.  
**Precondiciones:** Documento con borrador activo y cambios.  
**Flujo básico:**
1) Selecciona “Guardar versión”.
2) Ingresa nombre y comentario opcional.
3) Confirma guardado.
**Resultado:** Versión inmutable creada.

## CU-06 Marcar Versión Actual
**Actor:** Admin, Editor  
**Objetivo:** Publicar la versión canónica.  
**Precondiciones:** Existe al menos una versión guardada.  
**Flujo básico:**
1) Abre historial de versiones.
2) Selecciona versión.
3) Marca como Versión Actual.
**Resultado:** Versión seleccionada queda como canónica y notifica.

## CU-07 Comparar versiones
**Actor:** Admin, Editor, Viewer  
**Objetivo:** Ver diferencias entre dos versiones.  
**Precondiciones:** Acceso al historial.  
**Flujo básico:**
1) Abre comparador.
2) Selecciona versión A y B.
3) Navega resumen de cambios.
**Resultado:** Diff visual con resumen y navegación.

## CU-08 Compartir link fijo
**Actor:** Admin, Editor  
**Objetivo:** Compartir una versión específica.  
**Precondiciones:** Versión existente.  
**Flujo básico:**
1) Abre panel de compartir.
2) Selecciona modo fijo.
3) Copia link.
**Resultado:** Link fijo generado para esa versión.

## CU-09 Compartir link dinámico
**Actor:** Admin, Editor  
**Objetivo:** Compartir la versión vigente.  
**Precondiciones:** Documento con Versión Actual.  
**Flujo básico:**
1) Abre panel de compartir.
2) Selecciona modo dinámico.
3) Copia link.
**Resultado:** Link dinámico apunta a la Versión Actual.

## CU-10 Importar documento
**Actor:** Admin, Editor  
**Objetivo:** Crear documento a partir de `.docx`.  
**Precondiciones:** Carpeta existente.  
**Flujo básico:**
1) Selecciona “Importar documento”.
2) Sube archivo `.docx`.
3) Revisa warnings de importación.
**Resultado:** Documento creado y versión inicial importada.

## CU-11 Invitar usuario al workspace
**Actor:** Admin  
**Objetivo:** Incorporar usuario con rol.  
**Precondiciones:** Workspace activo.  
**Flujo básico:**
1) Abre gestión de miembros.
2) Ingresa email y rol.
3) Confirma invitación.
**Resultado:** Usuario invitado con rol asignado.

## CU-12 Asignar Editor a documento
**Actor:** Admin  
**Objetivo:** Asignar edición sobre documento.  
**Precondiciones:** Usuario miembro del workspace.  
**Flujo básico:**
1) Abre permisos del documento.
2) Selecciona usuario.
3) Asigna rol Editor.
**Resultado:** Usuario queda como Editor del documento.

## CU-13 Dar acceso Viewer a documento
**Actor:** Admin, Editor del documento  
**Objetivo:** Dar acceso de lectura.  
**Precondiciones:** Documento existente.  
**Flujo básico:**
1) Abre permisos del documento.
2) Ingresa email o selecciona usuario.
3) Asigna rol Viewer.
**Resultado:** Usuario con acceso de solo lectura.

## CU-14 Revocar link compartido
**Actor:** Admin, Editor  
**Objetivo:** Invalidar un link público.  
**Precondiciones:** Link existente.  
**Flujo básico:**
1) Abre gestión de links.
2) Selecciona link.
3) Revoca link.
**Resultado:** Link inválido y muestra página de estado.

## CU-15 Eliminar Versión Actual
**Actor:** Admin  
**Objetivo:** Eliminar versión canónica.  
**Precondiciones:** Versión Actual definida.  
**Flujo básico:**
1) Abre historial.
2) Selecciona Versión Actual.
3) Confirma eliminación con warning.
**Resultado:** Versión Actual eliminada.

## CU-16 Eliminar documento completo
**Actor:** Admin  
**Objetivo:** Eliminar documento y versiones.  
**Precondiciones:** Documento existente.  
**Flujo básico:**
1) Abre opciones del documento.
2) Selecciona eliminar.
3) Confirma con warning.
**Resultado:** Documento eliminado con su historial.
