const {createClient}=require('@libsql/client');
const bcrypt=require('bcryptjs');
const readline=require('readline');
const path=require('path');
const isVercel=!!process.env.VERCEL;
const url=process.env.TURSO_DATABASE_URL || (isVercel ? '' : `file:${path.join(__dirname,'rudra-arts.db')}`);
const authToken=process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DATABASE_AUTH_TOKEN || undefined;
if(!url)throw new Error('Set TURSO_DATABASE_URL before running the seed script.');
const db=createClient({url,authToken});
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
const ask=q=>new Promise(r=>rl.question(q,r));
(async()=>{
 try{
  await db.execute(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL,active INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  const existing=await db.execute("SELECT COUNT(*) c FROM users WHERE role='SUPER_ADMIN'");
  if(Number(existing.rows[0]?.c||0)){console.log('A Super Admin already exists.');return;}
  const name=await ask('Super Admin name: '),email=(await ask('Super Admin email: ')).trim().toLowerCase(),password=await ask('Super Admin password: ');
  if(!name||!email||!password){console.log('All fields required.');return;}
  await db.execute({sql:"INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'SUPER_ADMIN')",args:[name,email,bcrypt.hashSync(password,12)]});
  console.log('Super Admin created.');
 }finally{rl.close();db.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
