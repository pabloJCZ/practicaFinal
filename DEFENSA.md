# EXAMEN.md

## Reto
F8 — Blindar el multi-tenant en actualizaciones de proyecto.

## Tarea técnica
Se ha añadido validación de ownership en `updateProject` antes de ejecutar el update.
Si `req.body.client` está presente, se verifica que ese cliente pertenece a `companyId`
extraído del token JWT. Si no pertenece, se devuelve 404.

## Respuestas socráticas

**1.** Sin el check, Mongoose ejecuta el update y asigna `client: "id_ajeno"` directamente.
El filtro `company: companyId` en `findOneAndUpdate` solo protege el proyecto (que solo
se actualiza si pertenece a la compañía), pero no valida las referencias internas del body
como `client`. Mongoose no cruza ese dato con ninguna compañía.

**2.** En `createProject` (líneas 14-15) se hace `Client.findOne({ _id, company: companyId })`
antes de crear, verificando que el cliente pertenece a la compañía. En `updateProject` esa
validación no existía, asumiendo incorrectamente que el body era de confianza.

**3.** La lógica de ownership entre entidades debe vivir en el **controlador**. El modelo
solo valida tipos y formato (responsabilidad de Mongoose/Zod). El middleware es para
validaciones genéricas reutilizables. La lógica de negocio cross-tenant es específica
del contexto y pertenece al controlador.

**4.** Con el código original, el atacante puede hacer `PUT /api/project/:id` con
`client: "id_cliente_competidor"` y Mongoose lo asigna sin protestar. Todos los albaranes
futuros de ese proyecto quedarían vinculados al cliente ajeno, filtrando datos sensibles
al atacante cuando consulte sus albaranes.

**5.** `runValidators: true` valida que el campo `client` sea un ObjectId válido (tipo correcto),
pero no ejecuta ninguna consulta a la base de datos para comprobar a qué compañía pertenece.
La validación de tipo y la validación de ownership son capas completamente distintas:
una es sintáctica, la otra es lógica de negocio.

## Proceso
1. Identificado el bug: `updateProject` no validaba ownership del cliente en el body.
2. Añadida validación `Client.findOne({ _id: req.body.client, company: companyId })` antes del update.
3. Añadido test cross-tenant en `tests/project.test.js` que espera 404.
4. Migrado a Express 5, Node 22 y `--env-file` eliminando dependencia de dotenv.
5. Verificado que todos los tests siguen pasando (29/29).