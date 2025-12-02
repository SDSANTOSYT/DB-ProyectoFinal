--------------------------------------------------------------
-- SEED COMPLETO Y COMPATIBLE CON EL MODELO ACTUAL
--------------------------------------------------------------

-- INSTITUCIONES
INSERT INTO INSTITUCION (NOMBRE, DURACIONHORA, JORNADA)
VALUES ('Institución Educativa Central', 60, 'MAÑANA');

INSERT INTO INSTITUCION (NOMBRE, DURACIONHORA, JORNADA)
VALUES ('Institución Educativa Norte', 60, 'TARDE');

--------------------------------------------------------------
-- SEDES  (PK compuesta: ID_SEDE + ID_INSTITUCION)
--------------------------------------------------------------

INSERT INTO SEDE (ID_SEDE, ID_INSTITUCION, NOMBRE_SEDE, DIRECCION, TELEFONO)
VALUES (1, 1, 'Sede Principal', 'Cra 45 #20-10', '6053332211');

INSERT INTO SEDE (ID_SEDE, ID_INSTITUCION, NOMBRE_SEDE, DIRECCION, TELEFONO)
VALUES (1, 2, 'Sede Norte', 'Av Libertad #30-50', '6058887771');

INSERT INTO SEDE (ID_SEDE, ID_INSTITUCION, NOMBRE_SEDE, DIRECCION, TELEFONO)
VALUES (2, 1, 'Sede Alterna', 'Calle 13 #5-22', '6059994444');

--------------------------------------------------------------
-- PROGRAMAS
--------------------------------------------------------------

INSERT INTO PROGRAMA (TIPO) VALUES ('INSIDECLASSROOM');
INSERT INTO PROGRAMA (TIPO) VALUES ('OUTSIDECLASSROOM');

--------------------------------------------------------------
-- PERSONAS (rol + correo agregado)
--------------------------------------------------------------

INSERT INTO PERSONA (ID_PERSONA, NOMBRE, ROL, CORREO)
VALUES (1, 'Sergio Tutor', 'TUTOR', 'sergio.tutor@demo.com');

INSERT INTO PERSONA (ID_PERSONA, NOMBRE, ROL, CORREO)
VALUES (2, 'Sebastián Admin', 'ADMINISTRADOR', 'sebastian.admin@demo.com');

INSERT INTO PERSONA (ID_PERSONA, NOMBRE, ROL, CORREO)
VALUES (3, 'Carlos Tutor', 'TUTOR', 'carlos.tutor@demo.com');

INSERT INTO PERSONA (ID_PERSONA, NOMBRE, ROL, CORREO)
VALUES (4, 'Andrea Secretaria', 'ADMINISTRATIVO', 'andrea.secretaria@demo.com');

--------------------------------------------------------------
-- USUARIO
--------------------------------------------------------------

INSERT INTO USUARIO (CONTRASENA, ID_PERSONA) VALUES ('123', 1);
INSERT INTO USUARIO (CONTRASENA, ID_PERSONA) VALUES ('456', 2);
INSERT INTO USUARIO (CONTRASENA, ID_PERSONA) VALUES ('789', 3);
INSERT INTO USUARIO (CONTRASENA, ID_PERSONA) VALUES ('000', 4);

--------------------------------------------------------------
-- TUTORES
--------------------------------------------------------------

INSERT INTO TUTOR (ID_PERSONA) VALUES (1);
INSERT INTO TUTOR (ID_PERSONA) VALUES (3);

--------------------------------------------------------------
-- AULAS  (programa + grado coherentes)
--------------------------------------------------------------

-- INSIDECLASSROOM → 4 y 5
INSERT INTO AULA (ID_AULA, NOMBRE_AULA, GRADO, ID_SEDE, ID_INSTITUCION, ID_TUTOR, ID_PROGRAMA)
VALUES (101, 'A-4A', '4', 1, 1, 1, 1);

INSERT INTO AULA (ID_AULA, NOMBRE_AULA, GRADO, ID_SEDE, ID_INSTITUCION, ID_TUTOR, ID_PROGRAMA)
VALUES (102, 'A-5B', '5', 2, 1, 1, 1);

-- OUTSIDECLASSROOM → 9 y 10
INSERT INTO AULA (ID_AULA, NOMBRE_AULA, GRADO, ID_SEDE, ID_INSTITUCION, ID_TUTOR, ID_PROGRAMA)
VALUES (201, 'B-9A', '9', 1, 2, 2, 2);

INSERT INTO AULA (ID_AULA, NOMBRE_AULA, GRADO, ID_SEDE, ID_INSTITUCION, ID_TUTOR, ID_PROGRAMA)
VALUES (202, 'B-10B', '10', 1, 2, 2, 2);

--------------------------------------------------------------
-- ESTUDIANTES (coherentes con su AULA)
--------------------------------------------------------------

-- Aula 101 (grado 4 – inside)
INSERT INTO ESTUDIANTE (TIPO_DOCUMENTO, NOMBRE, GRADO, SCORE_INICIAL,
                        ID_AULA, ID_SEDE, ID_INSTITUCION)
VALUES ('TI', 'Laura Niño', '4', 80, 101, 1, 1);

INSERT INTO ESTUDIANTE (TIPO_DOCUMENTO, NOMBRE, GRADO, SCORE_INICIAL,
                        ID_AULA, ID_SEDE, ID_INSTITUCION)
VALUES ('CC', 'Mateo Torres', '4', 75, 101, 1, 1);

-- Aula 102 (grado 5 – inside)
INSERT INTO ESTUDIANTE (TIPO_DOCUMENTO, NOMBRE, GRADO, SCORE_INICIAL,
                        ID_AULA, ID_SEDE, ID_INSTITUCION)
VALUES ('TI', 'Daniela Ruiz', '5', 88, 102, 2, 1);

-- Aula 201 (grado 9 – outside)
INSERT INTO ESTUDIANTE (TIPO_DOCUMENTO, NOMBRE, GRADO, SCORE_INICIAL,
                        ID_AULA, ID_SEDE, ID_INSTITUCION)
VALUES ('CC', 'Juan Rojas', '9', 92, 201, 1, 2);

-- Aula 202 (grado 10 – outside)
INSERT INTO ESTUDIANTE (TIPO_DOCUMENTO, NOMBRE, GRADO, SCORE_INICIAL,
                        ID_AULA, ID_SEDE, ID_INSTITUCION)
VALUES ('CC', 'Mariana Pérez', '10', 85, 202, 1, 2);

--------------------------------------------------------------
-- PERIODOS
--------------------------------------------------------------

INSERT INTO PERIODO (FECHA_INICIO, FECHA_FIN, ID_PROGRAMA)
VALUES (TO_DATE('2025-01-01','YYYY-MM-DD'),
        TO_DATE('2025-06-30','YYYY-MM-DD'), 1);

INSERT INTO PERIODO (FECHA_INICIO, FECHA_FIN, ID_PROGRAMA)
VALUES (TO_DATE('2025-01-01','YYYY-MM-DD'),
        TO_DATE('2025-06-30','YYYY-MM-DD'), 2);

--------------------------------------------------------------
-- COMPONENTES
--------------------------------------------------------------

INSERT INTO COMPONENTE (NOMBRE, PORCENTAJE, ID_PROGRAMA)
VALUES ('Parcial 1', 30, 1);

INSERT INTO COMPONENTE (NOMBRE, PORCENTAJE, ID_PROGRAMA)
VALUES ('Proyecto Final', 40, 2);

--------------------------------------------------------------
-- NOTAS
--------------------------------------------------------------

INSERT INTO NOTA (VALOR, ID_ESTUDIANTE, ID_PERIODO, ID_COMPONENTE, ID_TUTOR)
VALUES (85, 1, 1, 1, 1);

INSERT INTO NOTA (VALOR, ID_ESTUDIANTE, ID_PERIODO, ID_COMPONENTE, ID_TUTOR)
VALUES (90, 4, 2, 2, 2);

--------------------------------------------------------------
-- MOTIVOS
--------------------------------------------------------------

INSERT INTO MOTIVO (DESCRIPCION) VALUES ('Inasistencia justificada');
INSERT INTO MOTIVO (DESCRIPCION) VALUES ('Enfermedad');
INSERT INTO MOTIVO (DESCRIPCION) VALUES ('Actividad institucional');

--------------------------------------------------------------
-- ASISTENCIA TUTORES
--------------------------------------------------------------

INSERT INTO ASISTENCIA_AULA_TUTOR
(ID_TUTOR, ID_AULA, ID_SEDE, ID_INSTITUCION, FECHA, HORA_ENTRADA, HORA_SALIDA, SE_DIO)
VALUES (1, 101, 1, 1, SYSDATE, '07:00', '09:00', 1);

INSERT INTO ASISTENCIA_AULA_TUTOR
(ID_TUTOR, ID_AULA, ID_SEDE, ID_INSTITUCION, FECHA, HORA_ENTRADA, HORA_SALIDA, SE_DIO)
VALUES (2, 201, 1, 2, SYSDATE, '09:00', '11:00', 1);

--------------------------------------------------------------
-- ASISTENCIA ESTUDIANTES
--------------------------------------------------------------

INSERT INTO ASISTENCIA_AULA_ESTUDIANTE
(ID_ESTUDIANTE, ID_AULA, ID_SEDE, ID_INSTITUCION, FECHA, PRESENTE)
VALUES (1, 101, 1, 1, SYSDATE, 1);

INSERT INTO ASISTENCIA_AULA_ESTUDIANTE
(ID_ESTUDIANTE, ID_AULA, ID_SEDE, ID_INSTITUCION, FECHA, PRESENTE)
VALUES (4, 201, 1, 2, SYSDATE, 1);

--------------------------------------------------------------
-- FESTIVOS
--------------------------------------------------------------

INSERT INTO FESTIVO (FECHA_FESTIVO, DESCRIPCION)
VALUES (TO_DATE('2025-03-24','YYYY-MM-DD'), 'Día de San José');

INSERT INTO FESTIVO (FECHA_FESTIVO, DESCRIPCION)
VALUES (TO_DATE('2025-05-01','YYYY-MM-DD'), 'Día del Trabajo');

--------------------------------------------------------------
-- REGISTRO DE CAMBIO
--------------------------------------------------------------

INSERT INTO REGISTRO_DE_CAMBIO (FECHA, HORA, MOTIVO, ID_PERSONA, ID_TUTOR)
VALUES (SYSDATE, '10:00', 'Creación inicial del sistema', 2, NULL);

COMMIT;
