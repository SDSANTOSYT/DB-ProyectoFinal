import oracledb
import os

user = os.getenv("ORACLE_USER")
pwd = os.getenv("ORACLE_PASSWORD")
dsn = os.getenv("ORACLE_DSN")

try:
    conn = oracledb.connect(user=user, password=pwd, dsn=dsn)
    print("Conexión exitosa!")
    conn.close()
except Exception as e:
    print("Error de conexión:", e)
