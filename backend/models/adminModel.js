const { db } = require('../config/db');

//login route finding admin by name
exports.findAdminByName = async (name) => {
    const [rows] = await db.query(`
        SELECT id, name, password, email FROM admin_users WHERE name = ? AND email <> '' AND email IS NOT NULL LIMIT 1
        `, [name]);
    return rows[0];
};

//dashboard routes
exports.getCount = async() => {
    const [count] = await db.query(`
        SELECT count(*) 
        AS total_users
        From users
        `, []);
    return count[0];    
}

exports.getActive = async() => {
    const [active] = await db.query(`
        SELECT count(*) 
        AS active_24h
        FROM users 
        WHERE last_seen >= NOW() - INTERVAL 24 HOUR
        `, []);
    return active[0];
}

exports.getOnline = async() => {
    const [online] = await db.query(`
        SELECT COUNT(*) 
        AS online_now
        FROM users
        WHERE last_seen >= NOW() - INTERVAL 5 MINUTE;
        `, []);
    return online[0];
}

exports.getError = async() => {
    const [error] = await db.query(`
        SELECT status_code, COUNT(*) AS cnt
        FROM error_logs
        WHERE created_at >= NOW() - INTERVAL 24 HOUR
        GROUP BY status_code
        ORDER BY cnt DESC
        LIMIT 1;
        `, []);
    return error[0] || null;
}

exports.getActivity = async() => {
    const [activity] = await db.query(`
        SELECT message, created_at 
        FROM activity_logs
        ORDER BY created_at DESC
        LIMIT 10
        `, []);
    return activity;
}

//user routes
exports.getUsers = async() => {
    const [users] = await db.query(`
        SELECT id, name, email, profile_image, verified, last_seen, joined
        FROM users
        `, []);
    return users;
}

exports.getUserLog = async(name) => {
    const [logs] = await db.query(`
        SELECT action, actor_type, actor_id, message, created_at
        FROM activity_logs 
        WHERE actor_type = ?
        `, [name]);
    return logs;
}