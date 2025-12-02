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
        
        logger.info(f"Creando persona: {payload.nombre} (ID: {payload.id_persona})")
        
        # Validar que el ID no esté duplicado
        cur.execute("SELECT 1 FROM PERSONA WHERE ID_PERSONA = :1", (payload.id_persona,))
        if cur.fetchone():
            logger.warning(f"Intento de crear persona con ID duplicado: {payload.id_persona}")
            raise HTTPException(
                status_code=409,
                detail=f"Ya existe una persona con ID {payload.id_persona}"
            )
        
        # Validar que el correo no esté duplicado
        cur.execute("SELECT 1 FROM PERSONA WHERE CORREO = :1", (payload.correo,))
        if cur.fetchone():
            logger.warning(f"Intento de crear persona con correo duplicado: {payload.correo}")
            raise HTTPException(
                status_code=409,
                detail=f"El correo {payload.correo} ya está registrado"
            )
        
        # Insertar persona (ahora incluye ID_PERSONA explícitamente)
        cur.execute("""
            INSERT INTO PERSONA (ID_PERSONA, NOMBRE, ROL, CORREO) 
            VALUES (:1, :2, :3, :4)
        """, (payload.id_persona, payload.nombre, payload.rol, payload.correo))
        
        conn.commit()
        
        logger.info(f"Persona {payload.id_persona} creada exitosamente")
        
        return {
            "id_persona": payload.id_persona,
            "nombre": payload.nombre,
            "rol": payload.rol,
            "correo": payload.correo
        }
        
    except HTTPException:
        if conn:
            conn.rollback()
        raise
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear persona: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad. Verifique que el ID y el correo sean únicos."
        )
        
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
    """
    Lista personas con límite.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Listando personas con límite {limit}")
        
        cur.execute("""
            SELECT ID_PERSONA, NOMBRE, ROL, CORREO 
            FROM PERSONA 
            WHERE ROWNUM <= :1 
            ORDER BY ID_PERSONA DESC
        """, (limit,))
        
        rows = cur.fetchall()
        
        return [
            {
                "id_persona": r[0], 
                "nombre": r[1], 
                "rol": r[2], 
                "correo": r[3]
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


@router.get("/{id_persona}", response_model=PersonaRead)
def get_persona(id_persona: int):
    """
    Obtiene una persona por su ID.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Consultando persona {id_persona}")
        
        cur.execute("""
            SELECT ID_PERSONA, NOMBRE, ROL, CORREO
            FROM PERSONA 
            WHERE ID_PERSONA = :1
        """, (id_persona,))
        
        r = cur.fetchone()
        
        if not r:
            logger.warning(f"Persona {id_persona} no encontrada")
            raise HTTPException(404, "Persona no encontrada")
        
        return {
            "id_persona": r[0],
            "nombre": r[1],
            "rol": r[2],
            "correo": r[3]
        }
        
    except HTTPException:
        raise
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al consultar persona: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la base de datos"
        )
        
    except Exception as e:
        logger.error(f"Error inesperado al consultar persona: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()