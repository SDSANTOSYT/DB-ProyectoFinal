# app/db.py
import os
import oracledb

ORACLE_USER = os.getenv("ORACLE_USER", "system")
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD", "oracle")
ORACLE_DSN = os.getenv("ORACLE_DSN", "localhost/XEPDB1")  # ajusta si tu dsn es distinto

pool = None

def _create_pool_compatible(**kwargs):
    """
    Intenta crear el pool con la firma más completa posible.
    Si la versión del driver no acepta 'encoding' lo elimina y vuelve a intentar.
    """
    try:
        return oracledb.create_pool(**kwargs)
    except TypeError as e:
        # Si falla por argumentos inesperados, intenta sin 'encoding'
        msg = str(e).lower()
        if "unexpected" in msg or "got an unexpected keyword argument" in msg:
            kwargs.pop("encoding", None)
            return oracledb.create_pool(**kwargs)
        raise

def init_db():
    global pool
    if pool is None:
        # Parámetros del pool
        pool_params = {
            "user": ORACLE_USER,
            "password": ORACLE_PASSWORD,
            "dsn": ORACLE_DSN,
            "min": 1,
            "max": 4,
            "increment": 1,
            # algunos driver antiguos/modernos aceptan o no 'encoding'
            "encoding": "UTF-8"
        }
        try:
            pool = _create_pool_compatible(**pool_params)
        except Exception as ex:
            # Si no fue posible crear el pool, intentamos crear una conexión puntual.
            # Esto permite que la app levante en entornos de desarrollo.
            print("Warning: no se pudo crear pool de conexiones. Se intentará conexión puntual. Error:", ex)
            pool = None

def get_conn():
    """
    Retorna una conexión: si se creó pool, la usa; si no, crea una conexión puntual.
    IMPORTANTE: quien llame a get_conn() debe cerrar conn.close()
    """
    global pool
    if pool:
        return pool.acquire()
    # fallback: conexión directa (útil para desarrollo)
    return oracledb.connect(user=ORACLE_USER, password=ORACLE_PASSWORD, dsn=ORACLE_DSN)
