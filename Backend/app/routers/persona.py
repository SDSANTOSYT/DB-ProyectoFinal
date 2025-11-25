# app/routers/persona.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import PersonaCreate, PersonaRead

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/personas", tags=["personas"])

@router.post("/", response_model=PersonaRead)
def create_persona(payload: PersonaCreate):
    """
    Crea una nueva persona en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando persona: {payload.nombre}")
        
        cur.execute("""
            INSERT INTO PERSONA (NOMBRE, ROL) 
            VALUES (:1, :2)
        """, (payload.nombre, payload.rol))
        
        conn.commit()
        
        # Obtener el registro recién creado
        cur2 = conn.cursor()
        cur2.execute("""
            SELECT ID_PERSONA, NOMBRE, ROL 
            FROM PERSONA 
            WHERE NOMBRE = :1 
            ORDER BY ID_PERSONA DESC 
            FETCH FIRST 1 ROW ONLY
        """, (payload.nombre,))
        
        r = cur2.fetchone()
        
        if not r:
            logger.error("No se pudo recuperar la persona recién creada")
            raise HTTPException(
                status_code=500,
                detail="Error al recuperar la persona creada"
            )
        
        logger.info(f"Persona {r[0]} creada exitosamente")
        
        return {
            "id_persona": r[0],
            "nombre": r[1],
            "rol": r[2]
        }
        
    except HTTPException:
        if conn:
            conn.rollback()
        raise
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear persona: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear persona: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.get("/", response_model=list[PersonaRead])
def list_personas(limit: int = 100):
  
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Listando personas {limit}")
        
        cur.execute("""
            SELECT ID_PERSONA, NOMBRE, ROL 
            FROM PERSONA 
            WHERE ROWNUM <= :1
        """, (limit,))
        
        rows = cur.fetchall()
        
        return [
            {
                "id_persona": r[0],
                "nombre": r[1],
                "rol": r[2]
            }
            for r in rows
        ]
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al listar personas: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la base de datos"
        )
        
    except Exception as e:
        logger.error(f"Error inesperado al listar personas: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()