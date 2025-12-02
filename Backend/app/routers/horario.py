# app/routers/horario.py
from fastapi import APIRouter, HTTPException, Depends
import oracledb
import logging
from typing import List, Optional
from datetime import datetime, time
from ..db import get_conn
from ..schemas import (
    HorarioCreate, 
    HorarioRead, 
    HorarioUpdate,
    HorarioAsignacionCreate
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/horarios", tags=["Horarios"])


def validar_horario_negocio(
    grado: str,
    dia: str,
    hora_inicio: str,
    hora_fin: str,
    duracion_minutos: int,
    id_aula: int,
    conn,
    exclude_horario_id: Optional[int] = None
):
    """
    Valida las reglas de negocio para horarios según el documento.
    
    Reglas:
    - Horarios entre 06:00 y 18:00
    - 4° y 5°: Lunes-Viernes, máx 2 horas semanales (INSIDECLASSROOM)
    - 9° y 10°: Lunes-Sábado, máx 3 horas semanales (OUTSIDECLASSROOM)
    - Duraciones válidas: 40, 45, 50, 55, 60 minutos (todas = 1 hora para reportes)
    """
    
    # Validar grado
    grado_int = int(grado)
    if grado_int not in [4, 5, 9, 10]:
        raise HTTPException(400, "Grado debe ser 4, 5, 9 o 10")
    
    # Validar duración
    if duracion_minutos not in [40, 45, 50, 55, 60]:
        raise HTTPException(
            400, 
            "Duración debe ser 40, 45, 50, 55 o 60 minutos"
        )
    
    # Validar día según grado
    dias_validos_primaria = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    dias_validos_secundaria = dias_validos_primaria + ["Sábado"]
    
    if grado_int in [4, 5]:
        if dia not in dias_validos_primaria:
            raise HTTPException(
                400, 
                f"Grados 4° y 5° solo pueden tener clases de Lunes a Viernes"
            )
    else:
        if dia not in dias_validos_secundaria:
            raise HTTPException(
                400, 
                f"Día inválido. Debe ser Lunes a Sábado"
            )
    
    # Validar rango horario 06:00 - 18:00
    try:
        h_inicio = datetime.strptime(hora_inicio, "%H:%M").time()
        h_fin = datetime.strptime(hora_fin, "%H:%M").time()
        limite_inicio = time(6, 0)
        limite_fin = time(18, 0)
        
        if h_inicio < limite_inicio or h_fin > limite_fin:
            raise HTTPException(
                400,
                "El horario debe estar entre 06:00 y 18:00"
            )
        
        if h_inicio >= h_fin:
            raise HTTPException(
                400,
                "La hora de fin debe ser posterior a la hora de inicio"
            )
            
    except ValueError:
        raise HTTPException(400, "Formato de hora inválido. Use HH:MM")
    
    # Calcular horas totales del aula (excluyendo el horario actual si es update)
    cur = conn.cursor()
    
    if exclude_horario_id:
        cur.execute("""
            SELECT COUNT(*) 
            FROM HORARIO 
            WHERE ID_AULA = :1 
            AND ID_HORARIO != :2
        """, (id_aula, exclude_horario_id))
    else:
        cur.execute("""
            SELECT COUNT(*) 
            FROM HORARIO 
            WHERE ID_AULA = :1
        """, (id_aula,))
    
    horas_existentes = cur.fetchone()[0]
    cur.close()
    
    # Cada sesión cuenta como 1 hora (según documento)
    horas_totales = horas_existentes + 1
    
    # Validar límite de horas semanales
    max_horas = 2 if grado_int in [4, 5] else 3
    
    if horas_totales > max_horas:
        raise HTTPException(
            400,
            f"Grado {grado}° permite máximo {max_horas} horas semanales. "
            f"Ya tiene {horas_existentes} hora(s) asignada(s)."
        )


@router.get("/", response_model=List[HorarioRead])
def listar_horarios(
    id_aula: Optional[int] = None,
    id_tutor: Optional[int] = None,
    limit: int = 500
):
    """
    Lista horarios del sistema.
    Permite filtrar por aula o tutor.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        if id_tutor:
            # Obtener horarios del tutor a través de sus aulas
            logger.info(f"Listando horarios del tutor {id_tutor}")
            cur.execute("""
                SELECT DISTINCT h.ID_HORARIO, h.DIA, h.HORA_INICIO, h.HORA_FIN,
                       h.ID_AULA, h.ID_SEDE, h.ID_INSTITUCION,
                       a.GRADO, a.NOMBRE_AULA
                FROM HORARIO h
                INNER JOIN AULA a ON h.ID_AULA = a.ID_AULA 
                    AND h.ID_SEDE = a.ID_SEDE 
                    AND h.ID_INSTITUCION = a.ID_INSTITUCION
                WHERE a.ID_TUTOR = :1
                AND ROWNUM <= :2
                ORDER BY 
                    CASE h.DIA
                        WHEN 'Lunes' THEN 1
                        WHEN 'Martes' THEN 2
                        WHEN 'Miércoles' THEN 3
                        WHEN 'Jueves' THEN 4
                        WHEN 'Viernes' THEN 5
                        WHEN 'Sábado' THEN 6
                    END,
                    h.HORA_INICIO
            """, (id_tutor, limit))
            
        elif id_aula:
            logger.info(f"Listando horarios del aula {id_aula}")
            cur.execute("""
                SELECT h.ID_HORARIO, h.DIA, h.HORA_INICIO, h.HORA_FIN,
                       h.ID_AULA, h.ID_SEDE, h.ID_INSTITUCION,
                       a.GRADO, a.NOMBRE_AULA
                FROM HORARIO h
                INNER JOIN AULA a ON h.ID_AULA = a.ID_AULA 
                    AND h.ID_SEDE = a.ID_SEDE 
                    AND h.ID_INSTITUCION = a.ID_INSTITUCION
                WHERE h.ID_AULA = :1
                ORDER BY 
                    CASE h.DIA
                        WHEN 'Lunes' THEN 1
                        WHEN 'Martes' THEN 2
                        WHEN 'Miércoles' THEN 3
                        WHEN 'Jueves' THEN 4
                        WHEN 'Viernes' THEN 5
                        WHEN 'Sábado' THEN 6
                    END,
                    h.HORA_INICIO
            """, (id_aula,))
            
        else:
            logger.info("Listando todos los horarios")
            cur.execute("""
                SELECT h.ID_HORARIO, h.DIA, h.HORA_INICIO, h.HORA_FIN,
                       h.ID_AULA, h.ID_SEDE, h.ID_INSTITUCION,
                       a.GRADO, a.NOMBRE_AULA
                FROM HORARIO h
                INNER JOIN AULA a ON h.ID_AULA = a.ID_AULA 
                    AND h.ID_SEDE = a.ID_SEDE 
                    AND h.ID_INSTITUCION = a.ID_INSTITUCION
                WHERE ROWNUM <= :1
                ORDER BY h.ID_HORARIO
            """, (limit,))
        
        rows = cur.fetchall()
        cols = [col[0].lower() for col in cur.description]
        return [dict(zip(cols, row)) for row in rows]
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error al listar horarios: {str(e)}")
        raise HTTPException(500, "Error al consultar la base de datos")
        
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}", exc_info=True)
        raise HTTPException(500, "Error interno del servidor")
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.get("/{id_horario}", response_model=HorarioRead)
def obtener_horario(id_horario: int):
    """
    Obtiene un horario específico por ID.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Obteniendo horario {id_horario}")
        
        cur.execute("""
            SELECT h.ID_HORARIO, h.DIA, h.HORA_INICIO, h.HORA_FIN,
                   h.ID_AULA, h.ID_SEDE, h.ID_INSTITUCION,
                   a.GRADO, a.NOMBRE_AULA
            FROM HORARIO h
            INNER JOIN AULA a ON h.ID_AULA = a.ID_AULA 
                AND h.ID_SEDE = a.ID_SEDE 
                AND h.ID_INSTITUCION = a.ID_INSTITUCION
            WHERE h.ID_HORARIO = :1
        """, (id_horario,))
        
        row = cur.fetchone()
        
        if not row:
            raise HTTPException(404, "Horario no encontrado")
        
        cols = [col[0].lower() for col in cur.description]
        return dict(zip(cols, row))
        
    except HTTPException:
        raise
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error al obtener horario: {str(e)}")
        raise HTTPException(500, "Error en la base de datos")
        
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}", exc_info=True)
        raise HTTPException(500, "Error interno del servidor")
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.post("/", status_code=201)
def crear_horario(payload: HorarioCreate):
    """
    Crea un nuevo horario y lo asigna a un aula.
    Solo accesible para roles ADMINISTRATIVO y ADMINISTRADOR.
    
    Validaciones:
    - Horario entre 06:00 y 18:00
    - Grados 4° y 5°: Lunes-Viernes, máx 2 horas semanales
    - Grados 9° y 10°: Lunes-Sábado, máx 3 horas semanales
    - Duraciones: 40, 45, 50, 55, 60 minutos (todas = 1 hora)
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando horario para aula {payload.id_aula}")
        
        # Obtener información del aula para validaciones
        cur.execute("""
            SELECT GRADO, ID_SEDE, ID_INSTITUCION 
            FROM AULA 
            WHERE ID_AULA = :1
        """, (payload.id_aula,))
        
        aula_row = cur.fetchone()
        
        if not aula_row:
            raise HTTPException(404, f"Aula {payload.id_aula} no encontrada")
        
        grado, id_sede, id_institucion = aula_row
        
        # Validar reglas de negocio
        validar_horario_negocio(
            grado=grado,
            dia=payload.dia,
            hora_inicio=payload.hora_inicio,
            hora_fin=payload.hora_fin,
            duracion_minutos=payload.duracion_minutos,
            id_aula=payload.id_aula,
            conn=conn
        )
        
        # Crear el horario
        new_id_var = cur.var(int)
        
        cur.execute("""
            INSERT INTO HORARIO (
                DIA, HORA_INICIO, HORA_FIN, 
                ID_AULA, ID_SEDE, ID_INSTITUCION
            ) 
            VALUES (:1, :2, :3, :4, :5, :6)
            RETURNING ID_HORARIO INTO :id_out
        """, {
            "1": payload.dia,
            "2": payload.hora_inicio,
            "3": payload.hora_fin,
            "4": payload.id_aula,
            "5": id_sede,
            "6": id_institucion,
            "id_out": new_id_var
        })
        
        new_id = new_id_var.getvalue()
        if isinstance(new_id, (list, tuple)):
            new_id = new_id[0]
        
        conn.commit()
        
        logger.info(f"Horario {new_id} creado exitosamente")
        
        return {
            "id_horario": int(new_id),
            "dia": payload.dia,
            "hora_inicio": payload.hora_inicio,
            "hora_fin": payload.hora_fin,
            "id_aula": payload.id_aula,
            "id_sede": id_sede,
            "id_institucion": id_institucion,
            "grado": grado,
            "mensaje": "Horario creado exitosamente"
        }
        
    except HTTPException:
        if conn:
            conn.rollback()
        raise
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad: {str(e)}")
        raise HTTPException(
            400,
            "Error de integridad. Verifique que el aula existe."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos: {str(e)}")
        raise HTTPException(500, "Error en la base de datos")
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado: {str(e)}", exc_info=True)
        raise HTTPException(500, "Error interno del servidor")
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.put("/{id_horario}")
def actualizar_horario(id_horario: int, payload: HorarioUpdate):
    """
    Actualiza un horario existente.
    Solo accesible para roles ADMINISTRATIVO y ADMINISTRADOR.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Actualizando horario {id_horario}")
        
        # Obtener horario actual
        cur.execute("""
            SELECT h.ID_AULA, a.GRADO, h.ID_SEDE, h.ID_INSTITUCION
            FROM HORARIO h
            INNER JOIN AULA a ON h.ID_AULA = a.ID_AULA
            WHERE h.ID_HORARIO = :1
        """, (id_horario,))
        
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Horario no encontrado")
        
        id_aula, grado, id_sede, id_institucion = row
        
        # Preparar campos a actualizar
        set_clauses = []
        binds = {}
        idx = 1
        
        if payload.dia is not None:
            set_clauses.append(f"DIA = :{idx}")
            binds[str(idx)] = payload.dia
            idx += 1
            
        if payload.hora_inicio is not None:
            set_clauses.append(f"HORA_INICIO = :{idx}")
            binds[str(idx)] = payload.hora_inicio
            idx += 1
            
        if payload.hora_fin is not None:
            set_clauses.append(f"HORA_FIN = :{idx}")
            binds[str(idx)] = payload.hora_fin
            idx += 1
        
        if not set_clauses:
            raise HTTPException(400, "No hay campos para actualizar")
        
        # Validar con los nuevos valores
        dia_final = payload.dia if payload.dia else None
        hora_inicio_final = payload.hora_inicio if payload.hora_inicio else None
        hora_fin_final = payload.hora_fin if payload.hora_fin else None
        
        # Si se está actualizando, obtener valores actuales para validación
        if not dia_final or not hora_inicio_final or not hora_fin_final:
            cur2 = conn.cursor()
            cur2.execute("""
                SELECT DIA, HORA_INICIO, HORA_FIN
                FROM HORARIO
                WHERE ID_HORARIO = :1
            """, (id_horario,))
            dia_actual, hi_actual, hf_actual = cur2.fetchone()
            cur2.close()
            
            dia_final = dia_final or dia_actual
            hora_inicio_final = hora_inicio_final or hi_actual
            hora_fin_final = hora_fin_final or hf_actual
        
        validar_horario_negocio(
            grado=grado,
            dia=dia_final,
            hora_inicio=hora_inicio_final,
            hora_fin=hora_fin_final,
            duracion_minutos=payload.duracion_minutos or 60,
            id_aula=id_aula,
            conn=conn,
            exclude_horario_id=id_horario
        )
        
        # Actualizar
        binds[str(idx)] = id_horario
        sql = f"UPDATE HORARIO SET {', '.join(set_clauses)} WHERE ID_HORARIO = :{idx}"
        
        cur.execute(sql, binds)
        
        if cur.rowcount == 0:
            raise HTTPException(404, "Horario no encontrado")
        
        conn.commit()
        
        logger.info(f"Horario {id_horario} actualizado exitosamente")
        
        return {"mensaje": "Horario actualizado exitosamente"}
        
    except HTTPException:
        if conn:
            conn.rollback()
        raise
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos: {str(e)}")
        raise HTTPException(500, "Error en la base de datos")
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado: {str(e)}", exc_info=True)
        raise HTTPException(500, "Error interno del servidor")
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.delete("/{id_horario}")
def eliminar_horario(id_horario: int):
    """
    Elimina un horario del sistema.
    Solo accesible para roles ADMINISTRATIVO y ADMINISTRADOR.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Eliminando horario {id_horario}")
        
        cur.execute("DELETE FROM HORARIO WHERE ID_HORARIO = :1", (id_horario,))
        
        if cur.rowcount == 0:
            raise HTTPException(404, "Horario no encontrado")
        
        conn.commit()
        
        logger.info(f"Horario {id_horario} eliminado exitosamente")
        
        return {"mensaje": "Horario eliminado correctamente"}
        
    except HTTPException:
        if conn:
            conn.rollback()
        raise
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad: {str(e)}")
        raise HTTPException(
            409,
            "No se puede eliminar el horario porque tiene registros relacionados"
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos: {str(e)}")
        raise HTTPException(500, "Error en la base de datos")
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado: {str(e)}", exc_info=True)
        raise HTTPException(500, "Error interno del servidor")
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()