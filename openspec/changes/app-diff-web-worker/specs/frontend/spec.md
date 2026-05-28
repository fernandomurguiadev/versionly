# Delta: frontend — app-diff-web-worker

## ADDED Requirements

### Requirement: Cómputo de diff en Web Worker
El sistema SHALL calcular el diff en un Web Worker dedicado para no bloquear el hilo principal.

#### Scenario: Carga de diff grande
- GIVEN un documento con 5.000 líneas
- WHEN el usuario abre la vista de comparación
- THEN el hilo principal NO se bloquea durante el cómputo
- AND se muestra un skeleton animado mientras se calcula
- AND el diff renderizado aparece cuando el worker completa

#### Scenario: Cleanup del worker
- GIVEN un worker activo calculando un diff
- WHEN el usuario navega fuera de la vista de comparación
- THEN el worker se termina correctamente sin memory leaks

## MODIFIED Requirements

### Requirement: Estado de carga en la vista de comparación
La vista SHALL mostrar un skeleton de 20 filas mientras el diff se computa, en lugar de una pantalla en blanco.
(Previously: no había estado de carga — el diff bloqueaba el render inicial)
