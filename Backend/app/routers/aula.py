# app/routers/aula.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from app.db import get_conn
from app.schemas import AulaCreate, AulaResponse, AulaUpdate
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
            SELECT ID_AULA, NOMBRE_AULA, GRADO, s.ID_SEDE, s.NOMBRE_SEDE, i.ID_INSTITUCION, i.NOMBRE, ID_PROGRAMA, ID_TUTOR
            FROM AULA a
            JOIN sede s ON a.id_sede = s.id_sede
            JOIN institucion i ON i.id_institucion = a.id_institucion
            WHERE ROWNUM <= :1
            ORDER BY ID_AULA
        """, (limit,))

        rows = cur.fetchall()
        
        return [
            {
                "id_aula": r[0],
                "nombre": r[1],
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

        logger.info(f"Creando aula: {aula.codigo_aula}")

        # preparar variable para RETURNING
        new_id_var = cur.var(int)

        cur.execute("""
            INSERT INTO AULA (CODIGO_AULA, GRADO, CAPACIDAD, UBICACION, ID_SEDE, ID_INSTITUCION)
            VALUES (:1, :2, :3, :4, :5, :6)
            RETURNING ID_AULA INTO :id_out
        """, {
            "1": aula.codigo_aula,
            "2": aula.grado,
            "3": aula.capacidad,
            "4": aula.ubicacion,
            "5": aula.id_sede,
            "6": aula.id_institucion,
            "id_out": new_id_var
        })

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

        return {
            "id_aula": int(new_id) if new_id is not None else None,
            "codigo_aula": aula.codigo_aula,
            "grado": aula.grado,
            "capacidad": aula.capacidad,
            "ubicacion": aula.ubicacion,
            "id_sede": aula.id_sede,
            "id_institucion": aula.id_institucion
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
