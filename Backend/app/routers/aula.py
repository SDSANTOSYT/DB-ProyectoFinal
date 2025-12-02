# app/routers/aula.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from app.db import get_conn
from app.schemas import AsignarTutorRequest, AulaCreate, AulaResponse, AulaUpdate
from typing import List, Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/aulas", tags=["Aulas"])


@router.get("/", response_model=List[AulaResponse])
def listar_aulas(limit: int = 500):
    """
    Lista todas las aulas del sistema.
    """
    conn = None
    cur = None

    try:
        conn = get_conn()
        cur = conn.cursor()

        logger.info("Listando todas las aulas")

        cur.execute("""
            SELECT ID_AULA, NOMBRE_AULA, GRADO, s.ID_SEDE, s.NOMBRE_SEDE, i.ID_INSTITUCION, i.NOMBRE , ID_PROGRAMA, ID_TUTOR
            FROM AULA a
            JOIN SEDE s 
                ON a.ID_SEDE = s.ID_SEDE
                AND a.ID_INSTITUCION = s.ID_INSTITUCION
            JOIN INSTITUCION i
                ON i.ID_INSTITUCION = a.ID_INSTITUCION
            ORDER BY a.ID_AULA
            FETCH FIRST :1 ROWS ONLY
        """, (limit,))

        rows = cur.fetchall()
        
        return [
            {
                "id_aula": r[0],
                "nombre_aula": r[1],
                "grado": r[2],
                "id_sede": r[3],
                "nombre_sede": r[4],
                "id_institucion": r[5],
                "nombre_institucion": r[6],
                "id_programa": r[7],
                "id_tutor": r[8],
            } 
            for r in rows
        ]

    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al listar aulas: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la base de datos"
        )

    except Exception as e:
        logger.error(f"Error inesperado al listar aulas: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.post("/", response_model=AulaResponse, status_code=201)
def crear_aula(aula: AulaCreate):
    """
    Crea una nueva aula en el sistema.
    Ahora requiere id_sede e id_institucion (clave compuesta de SEDE).
    """
    conn = None
    cur = None

    try:
        conn = get_conn()
        cur = conn.cursor()

        logger.info(f"Creando aula: {aula.nombre_aula}")

        # preparar variable para RETURNING
        new_id_var = cur.var(int)

        cur.execute("""
            INSERT INTO AULA (NOMBRE_AULA, GRADO, ID_SEDE, ID_INSTITUCION, ID_TUTOR, ID_PROGRAMA)
            VALUES (:1, :2, :3, :4, :5, :6)
            RETURNING ID_AULA INTO :7
        """, (aula.nombre_aula, aula.grado, aula.id_sede, aula.id_institucion, aula.id_tutor, aula.id_programa, new_id_var))

        # obtener nuevo id
        new_id = None
        try:
            val = new_id_var.getvalue()
            if isinstance(val, (list, tuple)):
                new_id = val[0]
            else:
                new_id = val
        except Exception:
            new_id = None

        conn.commit()

        logger.info(f"Aula {new_id} creada exitosamente")
        
        cur2 = conn.cursor()
        cur2.execute("""
                    SELECT ID_AULA, NOMBRE_AULA, GRADO, s.ID_SEDE, s.NOMBRE_SEDE, i.ID_INSTITUCION, i.NOMBRE, ID_PROGRAMA, ID_TUTOR
                    FROM AULA a
                    JOIN sede s ON a.id_sede = s.id_sede
                    JOIN institucion i ON i.id_institucion = a.id_institucion
                    WHERE a.ID_AULA = :1 AND s.ID_SEDE = :2 AND i.ID_INSTITUCION = :3
                     """, (new_id, aula.id_sede, aula.id_institucion))
        r = cur2.fetchone()
        
        if not r:
            logger.error(f"No se pudo recuperar el aula recién creada")
            raise HTTPException(
                status_code=500, 
                detail="Error al recuperar el estudiante creado"
            )

        return { 
            "id_aula": r[0],
            "nombre_aula": r[1] ,
            "grado": r[2],
            "id_sede": r[3],
            "nombre_sede": r[4],
            "id_institucion": r[5],
            "nombre_institucion": r[6],
            "id_programa": r[7],
            "id_tutor": r[8]
        }

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear aula: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que la sede/institución existe y que el código de aula es único."
        )

    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear aula: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear aula: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.put("/{id_aula}", response_model=AulaResponse)
def actualizar_aula(id_aula: int, aula: AulaUpdate):
    """
    Actualiza una aula existente.
    Permite también moverla a otra sede indicando id_sede + id_institucion.
    """
    conn = None
    cur = None

    try:
        conn = get_conn()
        cur = conn.cursor()

        logger.info(f"Actualizando aula {id_aula}")

        # Build update set only for provided fields
        set_clauses = []
        binds = {}
        idx = 1

        if aula.codigo_aula is not None:
            set_clauses.append(f"CODIGO_AULA = :{idx}")
            binds[str(idx)] = aula.codigo_aula
            idx += 1
        if aula.grado is not None:
            set_clauses.append(f"GRADO = :{idx}")
            binds[str(idx)] = aula.grado
            idx += 1
        if aula.capacidad is not None:
            set_clauses.append(f"CAPACIDAD = :{idx}")
            binds[str(idx)] = aula.capacidad
            idx += 1
        if aula.ubicacion is not None:
            set_clauses.append(f"UBICACION = :{idx}")
            binds[str(idx)] = aula.ubicacion
            idx += 1
        # If both id_sede and id_institucion provided, update both; if only one, raise
        if aula.id_sede is not None or aula.id_institucion is not None:
            if aula.id_sede is None or aula.id_institucion is None:
                raise HTTPException(status_code=400, detail="Para cambiar sede, envía id_sede e id_institucion juntos.")
            set_clauses.append(f"ID_SEDE = :{idx}")
            binds[str(idx)] = aula.id_sede
            idx += 1
            set_clauses.append(f"ID_INSTITUCION = :{idx}")
            binds[str(idx)] = aula.id_institucion
            idx += 1

        if not set_clauses:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar.")

        set_sql = ", ".join(set_clauses)
        binds[str(idx)] = id_aula  # where bind
        sql = f"UPDATE AULA SET {set_sql} WHERE ID_AULA = :{idx}"

        cur.execute(sql, binds)

        if cur.rowcount == 0:
            logger.warning(f"Aula {id_aula} no encontrada")
            raise HTTPException(404, "Aula no encontrada")

        conn.commit()

        logger.info(f"Aula {id_aula} actualizada exitosamente")

        # Recuperar el estado actual para devolverlo
        cur2 = conn.cursor()
        cur2.execute("""
            SELECT ID_AULA, CODIGO_AULA, GRADO, CAPACIDAD, UBICACION, ID_SEDE, ID_INSTITUCION
            FROM AULA
            WHERE ID_AULA = :1
        """, (id_aula,))
        row = cur2.fetchone()
        if not row:
            raise HTTPException(status_code=500, detail="Error al recuperar aula actualizada")
        cols = [c[0].lower() for c in cur2.description]
        data = dict(zip(cols, row))
        return data

    except HTTPException:
        if conn:
            conn.rollback()
        raise

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al actualizar aula: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos"
        )

    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al actualizar aula: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al actualizar aula: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.delete("/{id_aula}")
def borrar_aula(id_aula: int):
    """
    Elimina una aula del sistema.
    """
    conn = None
    cur = None

    try:
        conn = get_conn()
        cur = conn.cursor()

        logger.info(f"Eliminando aula {id_aula}")

        cur.execute("DELETE FROM AULA WHERE ID_AULA = :1", (id_aula,))

        if cur.rowcount == 0:
            logger.warning(f"Aula {id_aula} no encontrada")
            raise HTTPException(404, "Aula no encontrada")

        conn.commit()

        logger.info(f"Aula {id_aula} eliminada exitosamente")

        return {"msg": "Aula eliminada correctamente"}

    except HTTPException:
        if conn:
            conn.rollback()
        raise

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al eliminar aula: {str(e)}")
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar el aula porque tiene registros relacionados"
        )

    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al eliminar aula: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al eliminar aula: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@router.put("/asignar-tutor", response_model=AulaResponse)
def asignar_tutor_a_aula(payload: AsignarTutorRequest):
    """
    Asigna o desasigna un tutor a un aula.
    Requiere la clave compuesta completa del aula (id_aula, id_sede, id_institucion).
    - Si id_tutor tiene un valor: asigna ese tutor al aula
    - Si id_tutor es null: desasigna cualquier tutor del aula
    """
    conn = None
    cur = None

    try:
        conn = get_conn()
        cur = conn.cursor()

        logger.info(f"Procesando asignación de tutor para aula {payload.id_aula}")

        # Verificar que el aula existe con la clave compuesta completa
        cur.execute("""
            SELECT ID_AULA, ID_SEDE, ID_INSTITUCION 
            FROM AULA 
            WHERE ID_AULA = :1 
            AND ID_SEDE = :2 
            AND ID_INSTITUCION = :3
        """, (payload.id_aula, payload.id_sede, payload.id_institucion))
        
        aula = cur.fetchone()
        if not aula:
            logger.warning(f"Aula {payload.id_aula} en sede {payload.id_sede} e institución {payload.id_institucion} no encontrada")
            raise HTTPException(
                status_code=404, 
                detail="Aula no encontrada con la combinación de id_aula, id_sede e id_institucion proporcionada"
            )

        # Si se proporciona un id_tutor, verificar que existe
        if payload.id_tutor is not None:
            logger.info(f"Asignando tutor {payload.id_tutor} al aula {payload.id_aula}")
            
            cur.execute("""
                SELECT ID_TUTOR 
                FROM TUTOR 
                WHERE ID_TUTOR = :1
            """, (payload.id_tutor,))
            
            if not cur.fetchone():
                logger.warning(f"Tutor {payload.id_tutor} no encontrado")
                raise HTTPException(status_code=404, detail="Tutor no encontrado")
        else:
            logger.info(f"Desasignando tutor del aula {payload.id_aula}")

        # Actualizar el aula usando la clave compuesta
        cur.execute("""
            UPDATE AULA 
            SET ID_TUTOR = :1 
            WHERE ID_AULA = :2 
            AND ID_SEDE = :3 
            AND ID_INSTITUCION = :4
        """, (payload.id_tutor, payload.id_aula, payload.id_sede, payload.id_institucion))

        if cur.rowcount == 0:
            raise HTTPException(
                status_code=500,
                detail="No se pudo actualizar el aula"
            )

        conn.commit()

        mensaje = f"Tutor asignado exitosamente" if payload.id_tutor else "Tutor desasignado exitosamente"
        logger.info(mensaje)

        # Devolver el aula actualizada
        cur.execute("""
            SELECT ID_AULA, NOMBRE_AULA, GRADO, s.ID_SEDE, s.NOMBRE_SEDE, 
                   i.ID_INSTITUCION, i.NOMBRE, ID_PROGRAMA, ID_TUTOR
            FROM AULA a
            JOIN SEDE s ON a.id_sede = s.id_sede AND a.id_institucion = s.id_institucion
            JOIN INSTITUCION i ON i.id_institucion = a.id_institucion
            WHERE a.ID_AULA = :1 
            AND a.ID_SEDE = :2 
            AND a.ID_INSTITUCION = :3
        """, (payload.id_aula, payload.id_sede, payload.id_institucion))
        
        r = cur.fetchone()
        
        if not r:
            raise HTTPException(
                status_code=500,
                detail="Error al recuperar el aula actualizada"
            )
        
        return {
            "id_aula": r[0],
            "nombre_aula": r[1],
            "grado": r[2],
            "id_sede": r[3],
            "nombre_sede": r[4],
            "id_institucion": r[5],
            "nombre_institucion": r[6],
            "id_programa": r[7],
            "id_tutor": r[8]
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al asignar/desasignar tutor: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que la combinación de aula, sede e institución existe."
        )

    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()