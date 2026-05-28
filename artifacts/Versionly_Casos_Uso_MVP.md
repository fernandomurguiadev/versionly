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

---

> Los casos de uso CU-17, CU-18 y CU-19 corresponden a la versión **v1.1** y no forman parte del MVP.

## CU-17 Conectar cuenta de Google Drive *(v1.1)*
**Actor:** Editor, Admin  
**Objetivo:** Vincular la cuenta de Google del usuario para permitir importaciones desde Google Drive.  
**Precondiciones:** Usuario registrado y autenticado en Versionly.  
**Flujo básico:**
1) Accede a la sección de integraciones en su perfil o desde el picker de importación.
2) Selecciona "Conectar Google Drive".
3) El sistema redirige al flujo de consentimiento OAuth2 de Google con los scopes `drive.readonly` y `drive.metadata.readonly`.
4) El usuario acepta los permisos en la pantalla de Google.
5) Google redirige de vuelta a Versionly con el código de autorización.
6) El sistema intercambia el código por un access token y refresh token, los almacena cifrados y registra la `DriveConnection`.
7) El sistema muestra confirmación: *"Cuenta de Google conectada correctamente."*

**Flujos alternativos:**
- Si el usuario rechaza el consentimiento en Google, se muestra un mensaje informativo y la conexión no se crea.
- Si ya existe una `DriveConnection` activa para el usuario, el sistema ofrece reconectar (sobrescribe los tokens anteriores).

**Resultado:** `DriveConnection` creada con tokens cifrados. El usuario puede importar archivos desde Drive.

## CU-18 Importar documento desde Google Drive *(v1.1)*
**Actor:** Editor, Admin  
**Objetivo:** Crear una nueva versión de un documento de Versionly a partir de un archivo en Google Drive.  
**Precondiciones:** Usuario autenticado con una `DriveConnection` activa. Documento de Versionly existente en una carpeta.  
**Flujo básico:**
1) Dentro de un documento, selecciona "Importar desde Google Drive".
2) Si el access token expiró, el sistema lo renueva automáticamente con el refresh token.
3) Se abre el selector de archivos (Google Picker API). El usuario puede navegar su Drive.
4) El usuario selecciona un archivo `.docx` o un Google Doc.
5) Versionly descarga el contenido: si es Google Doc, lo exporta a `.docx` via Drive API; en ambos casos convierte con mammoth.js a ProseMirror JSON.
6) El sistema muestra una previsualización con los warnings de elementos de formato omitidos.
7) El sistema propone un nombre de versión: *"Importado desde Drive — [nombre del archivo] — [fecha]"*. El Editor puede modificarlo.
8) El Editor confirma la importación.
9) Se crea la nueva `VersionDocumento` inmutable y se registra o actualiza el `DriveFileMapping` vinculando el documento de Versionly con el archivo de Drive.

**Flujos alternativos:**
- Si el archivo fue eliminado de Drive o el acceso fue revocado, se muestra error y se sugiere verificar permisos en Google.
- Si el refresh token es inválido (cuenta de Google desconectada), el sistema solicita reconectar la cuenta (flujo CU-17).
- Si hay elementos de formato no soportados, se notifica: *"X elementos no pudieron importarse y fueron omitidos."*

**Resultado:** Nueva versión creada en el historial del documento. `DriveFileMapping` registrado para ese par documento–archivo de Drive.

## CU-19 Revocar acceso a Google Drive *(v1.1)*
**Actor:** Admin, Editor (sobre su propia conexión)  
**Objetivo:** Desconectar la cuenta de Google del usuario y eliminar los tokens almacenados.  
**Precondiciones:** Existe una `DriveConnection` activa para el usuario.  
**Flujo básico:**
1) Accede a la sección de integraciones en su perfil.
2) Selecciona "Desconectar Google Drive".
3) El sistema muestra un warning: *"Se eliminará el acceso a tu Google Drive. Los documentos ya importados no se verán afectados."*
4) El usuario confirma la revocación.
5) El sistema llama al endpoint de revocación de Google OAuth2 para invalidar los tokens en el lado de Google.
6) El sistema elimina (o marca como revocados) el access token y refresh token en la `DriveConnection`.

**Flujos alternativos:**
- Si la llamada de revocación a Google falla (error de red), el sistema igual elimina los tokens locales e informa al usuario que puede revocar el acceso manualmente desde su cuenta de Google en myaccount.google.com.

**Resultado:** `DriveConnection` marcada como revocada. Los tokens son eliminados. Los `DriveFileMapping` existentes se conservan como registro histórico pero no pueden usarse para nuevas importaciones hasta reconectar.
