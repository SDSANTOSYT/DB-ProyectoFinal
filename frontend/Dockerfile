# Dockerfile.frontend (modo desarrollo)

FROM node:20

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código del frontend
COPY . .

# Puerto donde corre Vite (o el dev server que uses)
EXPOSE 5173

# Comando por defecto: levantar el dev server
# el --host 0.0.0.0 es CLAVE para poder acceder desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
