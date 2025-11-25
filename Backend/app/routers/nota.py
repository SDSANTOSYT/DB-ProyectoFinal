# app/routers/nota.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from app.db import get_conn
from app.schemas import NotaCreate, NotaResponse, NotaUpdate
from typing import List

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notas", tags=["Notas"])


@router.get("/", response_model=List[NotaResponse])
def listar_notas():
    """
    Lista todas las notas del sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info("Listando todas las notas")
        
        cur.execute("""
            SELECT ID_NOTA, ID_ESTUDIANTE, ID_COMPONENTE, CALIFICACION
            FROM NOTA 
            ORDER BY ID_NOTA
        """)
        
        res = [dict(zip([x[0].lower() for x in cur.description], r)) 
               for r in cur.fetchall()]
        
        return res
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al listar notas: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la base de datos"
        )
        
    except Exception as e:
        logger.error(f"Error inesperado al listar notas: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.post("/", response_model=NotaResponse)
def crear_nota(nota: NotaCreate):
    """
    Crea una nueva nota en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando nota para estudiante {nota.id_estudiante}")
        
        cur.execute("""
            INSERT INTO NOTA (ID_ESTUDIANTE, ID_COMPONENTE, CALIFICACION)
            VALUES (:1, :2, :3) 
            RETURNING ID_NOTA INTO :4
        """, [nota.id_estudiante, nota.id_componente, nota.calificacion,
              conn.cursor().var(int)])
        
        new_id = cur.getimplicitresults()[0][0]
        
        conn.commit()
        
        logger.info(f"Nota {new_id} creada exitosamente")
        
        return {"id_nota": new_id, **nota.dict()}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear nota: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que el estudiante y el componente existen."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear nota: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear nota: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.put("/{id_nota}", response_model=NotaResponse)
def actualizar_nota(id_nota: int, nota: NotaUpdate):
    """
    Actualiza una nota existente.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Actualizando nota {id_nota}")
        
        cur.execute("""
            UPDATE NOTA 
            SET ID_ESTUDIANTE = :1, ID_COMPONENTE = :2, CALIFICACION = :3
            WHERE ID_NOTA = :4
        """, [nota.id_estudiante, nota.id_componente, nota.calificacion, id_nota])
        
        if cur.rowcount == 0:
            logger.warning(f"Nota {id_nota} no encontrada")
            raise HTTPException(404, "Nota no encontrada")
        
        conn.commit()
        
        logger.info(f"Nota {id_nota} actualizada exitosamente")
        
        return {"id_nota": id_nota, **nota.dict()}
        
    except HTTPException:
        if conn:
            conn.rollback()
        raise
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al actualizar nota: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos"
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al actualizar nota: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al actualizar nota: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()