# 🔐 Update Database Password

## Quick Fix (30 seconds)

Your Supabase connection is failing because the database password needs to be updated.

### Option 1: Manual Edit (Recommended)

1. **Open the `.env` file** in your editor
2. **Find this line**:
   ```
   DATABASE_URL=postgresql://postgres:your-password@db.bvsqnmkvbbvtrcomtvnc.supabase.co:5432/postgres
   ```
3. **Replace `your-password`** with your actual Supabase database password
4. **Save the file**

### Option 2: Command Line

```bash
# Replace 'YOUR_ACTUAL_PASSWORD' with your real password
sed -i '' 's/your-password/YOUR_ACTUAL_PASSWORD/g' .env
```

### Option 3: Copy & Paste

Replace the entire DATABASE_URL line with:
```
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.bvsqnmkvbbvtrcomtvnc.supabase.co:5432/postgres
```

## Test Connection

After updating the password, test the connection:

```bash
python test-supabase-connection.py
```

## Create Tables

If the connection works, create the database tables:

```bash
python create-supabase-tables.py
```

## Restart Backend

Update the backend to use Supabase:

```bash
docker-compose restart backend
```

## Test Admin Page

Visit: http://localhost:3000/admin/llm

---

**Note**: The password is the one you set when creating the Supabase project, not your Supabase account password.


