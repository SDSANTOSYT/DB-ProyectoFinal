# app/db.py
import os
import oracledb

# -------------------------------
# Configuración de conexión Oracle
# -------------------------------
# Por defecto usa el usuario que creaste en la BD del contenedor.
# Puedes sobreescribir todo con variables de entorno si quieres.

ORACLE_USER = os.getenv("ORACLE_USER", "APP_USER")        # 👈 cambia si tu usuario se llama distinto
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD", "app_password")

# Estos valores deberían coincidir con lo que usas en SQLDeveloper
ORACLE_HOST = os.getenv("ORACLE_HOST", "localhost")
ORACLE_PORT = os.getenv("ORACLE_PORT", "11521")           # puerto que mapeaste en "docker run -p 11521:1521"
ORACLE_SERVICE = os.getenv("ORACLE_SERVICE", "XEPDB1")    # o APPDB si usas ese

# DSN completo con host:puerto/servicio
ORACLE_DSN = os.getenv(
    "ORACLE_DSN",
    f"{ORACLE_HOST}:{ORACLE_PORT}/{ORACLE_SERVICE}"
)

pool = None


def _create_pool_compatible(**kwargs):
    """
    Intenta crear el pool con la firma más completa posible.
    Si la versión del driver no acepta 'encoding', lo elimina y vuelve a intentar.
    """
    try:
        return oracledb.create_pool(**kwargs)
    except TypeError as e:
        msg = str(e).lower()
        # Si falla por argumentos inesperados, intenta sin 'encoding'
        if "unexpected" in msg or "got an unexpected keyword argument" in msg:
            kwargs.pop("encoding", None)
            return oracledb.create_pool(**kwargs)
        raise


def init_db():
    """
    Inicializa el pool de conexiones global.
    Llama a esta función una sola vez al arrancar la app
    (por ejemplo en un evento startup de FastAPI).
    """
    global pool
    if pool is None:
        pool_params = {
            "user": ORACLE_USER,
            "password": ORACLE_PASSWORD,
            "dsn": ORACLE_DSN,
            "min": 1,
            "max": 4,
            "increment": 1,
            # algunos drivers aceptan 'encoding', otros no -> lo maneja _create_pool_compatible
            "encoding": "UTF-8",
        }
        try:
            pool = _create_pool_compatible(**pool_params)
            print(f"Pool Oracle creado OK. DSN={ORACLE_DSN}, USER={ORACLE_USER}")
        except Exception as ex:
            # Si no fue posible crear el pool, dejamos pool=None y se usará conexión puntual.
            print("Warning: no se pudo crear pool de conexiones Oracle.")
            print("Se intentará usar conexiones puntuales. Error:", ex)
            pool = None


def get_conn():
    """
    Retorna una conexión Oracle:
      - si hay pool, la obtiene del pool;
      - si no, crea una conexión directa (útil en desarrollo).

    IMPORTANTE: quien llame a get_conn() debe hacer siempre conn.close()
    cuando termine de usarla.
    """
    global pool
    if pool:
        return pool.acquire()

    # Fallback: conexión directa (sin pool)
    return oracledb.connect(
        user=ORACLE_USER,
        password=ORACLE_PASSWORD,
        dsn=ORACLE_DSN,
    )
