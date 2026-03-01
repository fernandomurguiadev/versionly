# Versionly — Descripción del Proyecto
Versionly es una plataforma para equipos en general que necesitan controlar la evolución de sus documentos con rigor. Su propuesta es habilitar trabajo en borradores privados, publicación de versiones con intención explícita y consumo confiable de la versión canónica por todos los colaboradores.

El producto prioriza tres capacidades centrales: versionar con intención, comparar con precisión y compartir con confianza. A diferencia de editores colaborativos generales, Versionly reduce el foco para resolver trazabilidad y distribución segura de documentos técnicos, sin ruido de funcionalidades periféricas.

El MVP se basa en una jerarquía Workspace → Proyecto → Carpeta → Documento, con roles bien definidos en dos niveles: workspace y documento. El Editor gestiona el ciclo de vida de versiones; el Admin controla acciones destructivas y permisos; el Viewer accede en modo lectura y a links públicos cuando corresponda.

La experiencia principal combina un editor estructurado, autoguardado de borrador, guardado de versiones inmutables y un comparador visual para entender cambios. La “Versión Actual” es el punto focal para compartir links dinámicos y mantener alineados a los equipos.

En el MVP no existe edición simultánea en tiempo real ni exportación a formatos externos. El stack recomendado utiliza Angular 19 en frontend, NestJS en backend y MySQL 8.0 para versiones inmutables, con SSE para notificaciones en tiempo real.
