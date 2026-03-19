# 🍣 Shako Sushi — Guía de despliegue

## Paso 1 — Crear la base de datos en Supabase (5 min)

1. Entrá a **https://supabase.com** y creá una cuenta gratuita
2. Hacé click en **"New project"** y completá:
   - Name: `shako-sushi`
   - Database Password: elegí una contraseña segura
   - Region: `South America (São Paulo)`
3. Esperá ~2 minutos a que se cree el proyecto
4. En el menú izquierdo, hacé click en **"SQL Editor"**
5. Pegá y ejecutá el siguiente SQL:

```sql
-- Tabla de pedidos
create table orders (
  id          text primary key,
  nombre      text,
  telefono    text,
  notas       text,
  tipo        text,
  calle       text,
  numero      text,
  piso        text,
  barrio      text,
  pago        text,
  total       numeric,
  status      text default 'nuevo',
  items       jsonb,
  created_at  bigint
);

alter table orders enable row level security;
create policy "Acceso público" on orders for all using (true) with check (true);

-- Tabla de configuración del menú
create table menu_config (
  id    integer primary key default 1,
  data  jsonb
);

alter table menu_config enable row level security;
create policy "Acceso público" on menu_config for all using (true) with check (true);

-- Habilitar real-time para pedidos
alter publication supabase_realtime add table orders;
```

6. Andá a **Settings → API** y copiá:
   - **Project URL** → `https://XXXXXX.supabase.co`
   - **anon public key** → `eyXXXXXXX...`

---

## Paso 2 — Subir el código a GitHub (5 min)

1. Instalá **Git** si no lo tenés: https://git-scm.com
2. Creá una cuenta en **https://github.com**
3. Creá un repositorio nuevo llamado `shako-sushi` (privado o público)
4. Abrí una terminal en la carpeta del proyecto y ejecutá:

```bash
# Copiá el archivo de variables de entorno
cp .env.example .env
```

5. Editá el archivo `.env` con tus datos de Supabase:
```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyTU-CLAVE-AQUI
```

6. Subí el código a GitHub:
```bash
git init
git add .
git commit -m "Shako Sushi - primer deploy"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/shako-sushi.git
git push -u origin main
```

---

## Paso 3 — Publicar en Vercel (3 min)

1. Entrá a **https://vercel.com** y creá una cuenta (podés entrar con GitHub)
2. Hacé click en **"Add New Project"**
3. Elegí el repositorio `shako-sushi`
4. Antes de hacer Deploy, hacé click en **"Environment Variables"** y agregá:
   - `VITE_SUPABASE_URL` → tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` → tu clave anon de Supabase
5. Hacé click en **"Deploy"**

En 2 minutos tu app va a estar en una URL tipo:
```
https://shako-sushi.vercel.app
```

---

## ✅ Listo — ¿Cómo funciona?

| Vista | Acceso | Descripción |
|-------|--------|-------------|
| **Menú cliente** | URL pública | Los clientes hacen pedidos |
| **Panel admin** | Tocá el logo 3 veces → PIN `1234` | Cocina ve los pedidos en tiempo real |
| **Caja** | Tab 💰 del panel admin | Estadísticas del día |
| **Editor de menú** | Tab ✏️ del panel admin | Modificar precios y productos |

### Cambiar el PIN de admin
En `src/App.jsx`, línea 1, cambiá:
```js
adminPin: "1234",
```

### Dominio propio (opcional)
En Vercel → tu proyecto → Settings → Domains → agregá `shakosushi.com.ar`

---

## 🔧 Desarrollo local

```bash
npm install
cp .env.example .env   # completar con datos de Supabase
npm run dev            # abre en http://localhost:5173
```
