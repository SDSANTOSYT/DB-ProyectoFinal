
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import oracledb
import logging
from ..db import get_conn
from ..schemas import EstudianteCreate, EstudianteRead
from ..utils import get_current_user

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/estudiantes", tags=["estudiantes"])


@router.post("/", response_model=EstudianteRead)
def create_estudiante(payload: EstudianteCreate, user=Depends(get_current_user)):
    """
    Crea un nuevo estudiante en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando estudiante para persona {payload.id_persona}")
        
        # Insertar el estudiante 
        cur.execute("""
            INSERT INTO estudiante (id_persona, id_aula, grado, score_inicial)
            VALUES (:1, :2, :3, :4)
        """, (payload.id_persona, payload.id_aula, payload.grado, payload.score_inicial))
        
        conn.commit()
        
        # Obtener el ID generado 
        cur2 = conn.cursor()
        cur2.execute("""
            SELECT id_estudiante 
            FROM estudiante 
            WHERE id_persona = :1 
            ORDER BY id_estudiante DESC 
            FETCH FIRST 1 ROW ONLY
        """, (payload.id_persona,))
        
        r = cur2.fetchone()
        
        if not r:
            logger.error(f"No se pudo recuperar el estudiante recién creado")
            raise HTTPException(
                status_code=500, 
                detail="Error al recuperar el estudiante creado"
            )
        
        logger.info(f"Estudiante {r[0]} creado exitosamente")
        
        return {
            "id_estudiante": r[0], 
            "id_persona": payload.id_persona, 
            "id_aula": payload.id_aula, 
            "grado": payload.grado, 
            "score_inicial": payload.score_inicial
        }
        
    except HTTPException:
        # Re-lanzar HTTPException sin modificar
        if conn:
            conn.rollback()
        raise
        
    except oracledb.IntegrityError as e:
        # Error de integridad referencial (FK, unique constraints, etc)
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear estudiante: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique las claves foráneas y constraints."
        )
        
    except oracledb.DatabaseError as e:
        # Error general de base de datos
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear estudiante: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        # Cualquier otro error inesperado
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear estudiante: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.get("/{id_estudiante}", response_model=EstudianteRead)
def get_estudiante(id_estudiante: int, user=Depends(get_current_user)):
    """
    Obtiene un estudiante por su ID.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Consultando estudiante {id_estudiante}")
        
        cur.execute("""
            SELECT id_estudiante, id_persona, id_aula, grado, score_inicial, score_final 
            FROM estudiante 
            WHERE id_estudiante = :1
        """, (id_estudiante,))
        
        r = cur.fetchone()
        
        if not r:
            logger.warning(f"Estudiante {id_estudiante} no encontrado")
            raise HTTPException(404, "Estudiante no encontrado")
        
        return {
            "id_estudiante": r[0], 
            "id_persona": r[1], 
            "id_aula": r[2], 
            "grado": r[3], 
            "score_inicial": r[4], 
            "score_final": r[5]
        }
        
    except HTTPException:
        raise
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al consultar estudiante {id_estudiante}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la base de datos"
        )
        
    except Exception as e:
        logger.error(f"Error inesperado al consultar estudiante {id_estudiante}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.get("/", response_model=List[EstudianteRead])
def list_estudiantes(limit: int = 100, user=Depends(get_current_user)):
    """
    Lista estudiantes (mantiene la misma firma del original).
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Listando estudiantes con límite {limit}")
        
        cur.execute("""
            SELECT id_estudiante, id_persona, id_aula, grado, score_inicial, score_final 
            FROM estudiante 
            WHERE ROWNUM <= :1
        """, (limit,))
        
        rows = cur.fetchall()
        
        return [
            {
                "id_estudiante": r[0], 
                "id_persona": r[1], 
                "id_aula": r[2], 
                "grado": r[3], 
                "score_inicial": r[4], 
                "score_final": r[5]
            } 
            for r in rows
        ]
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al listar estudiantes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la base de datos"
        )
        
    except Exception as e:
        logger.error(f"Error inesperado al listar estudiantes: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()