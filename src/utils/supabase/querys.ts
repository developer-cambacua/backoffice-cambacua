export const reservasSelect = `*,
departamento:departamentos!reservas_departamento_id_fkey(id, nombre, direccion),
huesped:huespedes(nombre, apellido, telefono, email, nacionalidad, tipo_identificacion, numero_identificacion), 
responsable_check_in(id, nombre, apellido), responsable_check_out(id, nombre, apellido),
responsables_limpieza(*, empleado:empleado_id(id, nombre, apellido))`;