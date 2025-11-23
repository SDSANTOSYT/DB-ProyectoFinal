-- seed_data.sql
-- Inserta institución, sede, programa, personas, tutores, estudiantes, aulas

INSERT INTO institucion (nombre) VALUES ('Instituto Demo');
INSERT INTO sede (id_institucion, nombre, direccion, es_principal)
VALUES (1, 'Sede Central', 'Calle Falsa 123', 1);

INSERT INTO programa (tipo) VALUES ('PRESENCIAL');

-- Crear aulas
INSERT INTO aula (id_sede, id_programa, grado, nombre) VALUES (1, 1, '10', 'Aula 10A');
INSERT INTO aula (id_sede, id_programa, grado, nombre) VALUES (1, 1, '11', 'Aula 11A');

-- Personas (id_persona autogenerado)
INSERT INTO persona (nombre, tipo_documento, numero_documento, correo)
VALUES ('Juan Perez', 'CC', '101010', 'juan@example.com');

INSERT INTO persona (nombre, tipo_documento, numero_documento, correo)
VALUES ('María Gómez', 'CC', '202020', 'maria@example.com');

INSERT INTO persona (nombre, tipo_documento, numero_documento, correo)
VALUES ('Carlos Ruiz', 'CC', '303030', 'carlos@example.com');

-- Crear tutor a partir de persona (ejemplo)
INSERT INTO tutor (id_persona, fecha_contrato) VALUES (1, SYSDATE);

-- Crear estudiantes (vinculando a aulas)
INSERT INTO estudiante (id_persona, id_aula, grado, score_inicial)
VALUES (2, 1, '10', 85);

INSERT INTO estudiante (id_persona, id_aula, grado, score_inicial)
VALUES (3, 1, '10', 78);

-- Si tu BD no asigna id_persona = 1/2/3, revisa con SELECT a persona para ver los ids reales.
COMMIT;
