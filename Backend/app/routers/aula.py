# app/routers/aula.py
from fastapi import APIRouter, HTTPException, Depends
import oracledb
import logging
from app.db import get_conn
from app.schemas import AulaCreate, AulaResponse, AulaUpdate
from typing import List

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/aulas", tags=["Aulas"])


@router.get("/", response_model=List[AulaResponse])
def listar_aulas():
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
            SELECT ID_AULA, CODIGO_AULA, CAPACIDAD, UBICACION, ID_SEDE
            FROM AULA 
            ORDER BY ID_AULA
        """)
        
        res = [dict(zip([col[0].lower() for col in cur.description], row)) 
               for row in cur.fetchall()]
        
        return res
        
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


@router.post("/", response_model=AulaResponse)
def crear_aula(aula: AulaCreate):
    """
    Crea una nueva aula en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando aula: {aula.codigo_aula}")
        
        cur.execute("""
            INSERT INTO AULA (CODIGO_AULA, CAPACIDAD, UBICACION, ID_SEDE)
            VALUES (:1, :2, :3, :4)
            RETURNING ID_AULA INTO :5
        """, [aula.codigo_aula, aula.capacidad, aula.ubicacion, aula.id_sede, 
              conn.cursor().var(int)])
        
        new_id = cur.getimplicitresults()[0][0]
        
        conn.commit()
        
        logger.info(f"Aula {new_id} creada exitosamente")
        
        return {**aula.dict(), "id_aula": new_id}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear aula: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que la sede existe."
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
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Actualizando aula {id_aula}")
        
        cur.execute("""
            UPDATE AULA 
            SET CODIGO_AULA = :1, CAPACIDAD = :2, UBICACION = :3, ID_SEDE = :4
            WHERE ID_AULA = :5
        """, [aula.codigo_aula, aula.capacidad, aula.ubicacion, aula.id_sede, id_aula])
        
        if cur.rowcount == 0:
            logger.warning(f"Aula {id_aula} no encontrada")
            raise HTTPException(404, "Aula no encontrada")
        
        conn.commit()
        
        logger.info(f"Aula {id_aula} actualizada exitosamente")
        
        return {"id_aula": id_aula, **aula.dict()}
        
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
        
        cur.execute("DELETE FROM AULA WHERE ID_AULA = :1", [id_aula])
        
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