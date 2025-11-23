# app/db.py
import oracledb
import os

ORACLE_USER = os.getenv("ORACLE_USER", "system")
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD", "oracle")
ORACLE_DSN = os.getenv("ORACLE_DSN", "localhost/XEPDB1")

pool = None

def init_db():
    global pool
    if pool is None:
        pool = oracledb.create_pool(
            user=ORACLE_USER,
            password=ORACLE_PASSWORD,
            dsn=ORACLE_DSN,
            min=1, max=4, increment=1,
            encoding="UTF-8"
        )

def get_conn():
    if pool is None:
        init_db()
    return pool.acquire()
