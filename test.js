const fs=require('fs'),assert=require('assert'),path=require('path');
const server=fs.readFileSync(path.join(__dirname,'server.js'),'utf8');
for(const table of ['inventory_items','inventory_movements','production_jobs','deliveries','staff_assignments','business_settings','password_reset_tokens','suppliers','inventory_purchases','staff_profiles','staff_attendance'])assert(server.includes('CREATE TABLE IF NOT EXISTS '+table),'Missing table '+table);
for(const route of ['/api/admin/services','/api/admin/gallery','/api/admin/reviews','/api/admin/tickets','/api/admin/customers','/api/admin/users','/api/admin/settings','/api/admin/activity-logs','/api/admin/login-attempts'])assert(server.includes(route),'Missing route '+route);
for(const marker of ['@libsql/client','@vercel/blob','AsyncLocalStorage','imageSignatureOk','validateUploadedFiles','assertOrderTransition','change-password','forgot-password','reset-password','module.exports=app'])assert(server.includes(marker),'Missing Vercel/security feature '+marker);
assert(!server.includes("require('better-sqlite3')"),'better-sqlite3 should not be used in V12');
assert(fs.existsSync(path.join(__dirname,'.env.example')),'Missing .env.example');
assert(fs.existsSync(path.join(__dirname,'README.md')),'Missing README.md');
console.log('Rudra Arts V12 Vercel static smoke tests passed.');
