
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import oracledb
import logging
from ..db import get_conn
from ..schemas import EstudianteCreate, EstudianteInfoRead, EstudianteRead
from ..utils import get_current_user

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/estudiantes", tags=["estudiantes"])


@router.post("/", response_model=EstudianteRead)
def create_estudiante(payload: EstudianteCreate):
    """
    Crea un nuevo estudiante en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando estudiante con documento {payload.id_estudiante}")
        
        # Insertar el estudiante 
        cur.execute("""
            INSERT INTO estudiante (id_estudiante, tipo_documento, nombre, grado, score_inicial, id_aula, id_sede, id_institucion)
            VALUES (:1, :2, :3, :4, :5, :6, :7, :8)
        """, (payload.id_estudiante, payload.tipo_documento, payload.nombre, payload.grado, payload.score_inicial, payload.id_aula, payload.id_sede, payload.id_institucion))
        
        conn.commit()
        
        #TIPO_DOCUMENTO, NOMBRE, GRADO, SCORE_INICIAL, ID_AULA, ID_SEDE, ID_INSTITUCION

        # Obtener el ID generado 
        cur2 = conn.cursor()
        cur2.execute("""
            SELECT id_estudiante, score_final
            FROM estudiante 
            WHERE id_estudiante = :1 
            ORDER BY id_estudiante DESC 
            FETCH FIRST 1 ROW ONLY
        """, (payload.id_estudiante,))
        
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
            "tipo_documento": payload.tipo_documento, 
            "nombre": payload.nombre,
            "grado": payload.grado, 
            "score_inicial": payload.score_inicial,
            "score_final": r[1],
            "id_aula": payload.id_aula, 
            "id_sede": payload.id_sede,
            "id_institucion": payload.id_institucion
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
def get_estudiante(id_estudiante: int):
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
            SELECT id_estudiante, tipo_documento, nombre, grado, score_inicial, score_final, id_aula, id_sede, id_institucion
            FROM estudiante 
            WHERE id_estudiante = :1
        """, (id_estudiante,))
        
        r = cur.fetchone()
        
        if not r:
            logger.warning(f"Estudiante {id_estudiante} no encontrado")
            raise HTTPException(404, "Estudiante no encontrado")
        
        return {
                "id_estudiante": r[0],
                "tipo_documento": r[1],
                "nombre": r[2],
                "grado": r[3],
                "score_inicial": r[4],
                "score_final": r[5],
                "id_aula": r[6],
                "id_sede": r[7],
                "id_institucion": r[8]
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


@router.get("/", response_model=List[EstudianteInfoRead])
def list_estudiantes(limit: int = 100):
    """
    Lista estudiantes (mantiene la misma firma del original).
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Listando estudiantes con límite {limit}")
        
        # TIPO_DOCUMENTO, NOMBRE, GRADO, SCORE_INICIAL, ID_AULA, ID_SEDE

        cur.execute("""
            SELECT id_estudiante, tipo_documento, e.nombre, e.grado, e.score_inicial, 
                e.score_final, a.id_aula, a.nombre_aula, s.id_sede, s.nombre_sede, 
                i.id_institucion, i.nombre
            FROM estudiante e 
            JOIN institucion i ON e.id_institucion = i.id_institucion 
            JOIN sede s ON e.id_sede = s.id_sede
            JOIN aula a ON a.id_aula = e.id_aula
            FETCH FIRST :1 ROWS ONLY
        """, (limit,))
        
        rows = cur.fetchall()
        
        return [
            {
                "id_estudiante": r[0],
                "tipo_documento": r[1],
                "nombre": r[2],
                "grado": r[3],
                "score_inicial": r[4],
                "score_final": r[5],
                "id_aula": r[6],
                "nombre_aula": r[7],
                "id_sede": r[8],
                "nombre_sede": r[9],
                "id_institucion": r[10],
                "nombre_institucion": r[11]
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