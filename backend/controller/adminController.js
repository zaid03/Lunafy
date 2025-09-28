const { db } = require('../config/db');
const adminModel = require('../models/adminModel');
const bcrypt = require('bcrypt');
const { logActivity } = require('../utils/activityLogger');

//login route finding admin by name
exports.checkAdmin = async (req, res) => {
    const { name, password } = req.body;

    try {
        const admin = await adminModel.findAdminByName(name);
        if (!admin) return res.status(401).json({ message: 'invalid credentials '});

        const match = await bcrypt.compare(password, admin.password);
        if (!match) return res.status(401).json({ message: 'invalid credentials '});

        await db.query('UPDATE admin_users SET last_login = NOW(), last_seen = NOW() WHERE id = ?', [admin.id]);

        await logActivity({
            action: 'admin_login',
            actorType: `${admin.name}`,
            actorId: admin.id,
            message: `Admin ${admin.name} logged in`
        });

        req.session.adminId = admin.id;

        res.json({ message: 'Login successful' });

    } catch (e) {
        res.status(500).json({ message: 'server error maybe' });
    }
}

//dashboard routes 
exports.getDashboardInfo = async(req, res) => {

    try{

        const [userCount, activeCount, onlineCount, topErrorCount, activityCount] = await Promise.all([
            adminModel.getCount(),
            adminModel.getActive(),
            adminModel.getOnline(),
            adminModel.getError(),
            adminModel.getActivity()
        ])

        if (req.session?.adminId) {
            const [rows] = await db.query('SELECT name FROM admin_users WHERE id = ?', [req.session.adminId]);
            const adminName = rows[0]?.name || 'admin';
            await db.query('UPDATE admin_users SET last_seen = NOW() WHERE id = ?', [req.session.adminId]);
            await logActivity({
                action: 'admin_view_dashboard',
                actorType: adminName,
                actorId: req.session?.adminId,
                message: `Admin ${req.session.adminId} viewed dashboard`
            });
        }

        res.json({
            users: {
                total: userCount?.total_users ?? 0,
                active24h: activeCount?.active_24h ?? 0,
                onlineNow: onlineCount?.online_now ?? 0
            },
            errors24hTop: topErrorCount ? { status: topErrorCount.status_code, count: topErrorCount.cnt } : null,
            activity: activityCount || []
        })
    } catch(e) {
        console.error('Dashboard error:', e);
        return res.status(500).json({ message: 'server error' });
    }
}

//users routes
exports.getUsers = async(req, res) => {
    try{
        const users = await adminModel.getUsers();
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        if (req.session?.adminId) {
            const [rows] = await db.query('SELECT name FROM admin_users WHERE id = ?', [req.session.adminId]);
            const adminName = rows[0]?.name || 'admin';
            await db.query('UPDATE admin_users SET last_seen = NOW() WHERE id = ?', [req.session.adminId]);
            await logActivity({
                action: 'admin_view_users',
                actorType: adminName,
                actorId: req.session?.adminId,
                message: `Admin ${req.session.adminId} viewed users`
            });
        }
        res.json({
            users: users
        });
    } catch (e) {
        console.error('Error fetching users:', e);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
}

exports.getUserLog = async(req, res) => {
    const name = req.query.name;
    try {
        const log = await adminModel.getUserLog(name);
        if (!log || log.length === 0 ) {
            return res.status(404).json({ message: 'No logs were found' });
        }

        const userId = log[0]?.actor_type;

        if (req.session?.adminId) {
            const [rows] = await db.query('SELECT name FROM admin_users WHERE id = ?', [req.session.adminId]);
            const adminName = rows[0]?.name || 'admin';
            await db.query('UPDATE admin_users SET last_seen = NOW() WHERE id = ?', [req.session.adminId]);
            await logActivity({
                action: 'admin_view_users',
                actorType: adminName,
                actorId: req.session?.adminId,
                message: `Admin ${req.session.adminId} fetched ${userId}'s logs`
            });
        }

        res.json({ logs: log });

    } catch (e) {
        console.error("Error fetching user's log:", e);
        res.status(500).json({ message: "Server error while fetching user's log" });
    }
}

exports.getUserActivation = async(req, res) => {
    const name = req.query.name;

    try {
        const deletion = await adminModel.getUserActivation(name);
        if (!deletion) {
            return res.status(404).json({ message: 'Deletion data was not found' });
        }

        if (req.session?.adminId) {
            const [rows] = await db.query('SELECT name FROM admin_users WHERE id = ?', [req.session.adminId]);
            const adminName = rows[0]?.name || 'admin';
            await db.query('UPDATE admin_users SET last_seen = NOW() WHERE id = ?', [req.session.adminId]);
            await logActivity({
                action: 'admin_view_users',
                actorType: adminName,
                actorId: req.session?.adminId,
                message: `Admin ${req.session.adminId} viewed ${req.query.name}'s details`
            });
        }

        res.json({ deletion: deletion })
    } catch (e) {
        console.error("Error fetching user's details:", e);
        res.status(500).json({ message: "Server error while fetching user's details" });
    }
}

exports.userAccountActivationControl = async(req, res) => {
    const { deletion, id } = req.body;
    try { 
        await adminModel.userAccountActivationControl(deletion, id);

        if (req.session?.adminId) {
            const [rows] = await db.query('SELECT name FROM admin_users WHERE id = ?', [req.session.adminId]);
            const adminName = rows[0]?.name || 'admin';
            await db.query('UPDATE admin_users SET last_seen = NOW() WHERE id = ?', [req.session.adminId]);
            await logActivity({
                action: deletion === 1 ? 'user_activated' : 'user_deactivated',
                actorType: adminName,
                actorId: req.session?.adminId,
                message: `Admin ${req.session.adminId} set user ${id} deletion to ${deletion}`
            });
        }

        res.json({ success: true });
    } catch (e) {
        console.error("Error updating user's activation:", e);
        res.status(500).json({ message: "Server error while updating user's activation" });
    }
}

//admin routes
exports.getAdminList = async(req, res) => {
    try{
        const admins = await adminModel.getAdminList();
        if(!admins || admins.length ===0 ) {
            return res.status(404).json({ message: 'No admins were found' });
        }

        if (req.session?.adminId) {
            const [rows] = await db.query('SELECT name FROM admin_users WHERE id = ?', [req.session.adminId]);
            const adminName = rows[0]?.name || 'admin';
            await db.query('UPDATE admin_users SET last_seen = NOW() WHERE id = ?', [req.session.adminId]);
            await logActivity({
                action: 'admin_list_viewed',
                actorType: adminName,
                actorId: req.session?.adminId,
                message: `Admin ${req.session.adminId} fetched admin list`
            });
        }

        res.json({ admins : admins })

    } catch (e) {
        console.error("Error fetching admins:", e);
        res.status(500).json({ message: "Server error while fetching admins list" });
    }
}

exports.getAdminLogs = async(req, res) => {
    const { id, name} = req.query;

    try{
        const logs = await adminModel.getAdminLogs(id, name);
        if(!logs || logs.length ===0 ) {
            return res.status(404).json({ message: 'No logs were found' });
        }

        if (req.session?.adminId) {
            const [rows] = await db.query('SELECT name FROM admin_users WHERE id = ?', [req.session.adminId]);
            const adminName = rows[0]?.name || 'admin';
            await db.query('UPDATE admin_users SET last_seen = NOW() WHERE id = ?', [req.session.adminId]);
            await logActivity({
                action: 'admin_logs_viewed',
                actorType: adminName,
                actorId: req.session?.adminId,
                message: `Admin ${req.session.adminId} fetched ${req.query.name} logs`
            });
        }

        res.json({ logs: logs})
    } catch (e) {
        console.error("Error fetching admin's log:", e);
        res.status(500).json({ message: "Server error while fetching admin's log" });
    }
}

exports.deleteAdmin = async(req ,res) => {
    const id  = req.query.id;
    if (!id) {
        return res.status(400).json({ message: 'No admin id provided' });
    }
    
    try {
        await adminModel.deleteAdmin(id);

        if (req.session?.adminId) {
            const [rows] = await db.query('SELECT name FROM admin_users WHERE id = ?', [req.session.adminId]);
            const adminName = rows[0]?.name || 'admin';
            await db.query('UPDATE admin_users SET last_seen = NOW() WHERE id = ?', [req.session.adminId]);
            await logActivity({
                action: `admin deleted`,
                actorType: adminName,
                actorId: req.session?.adminId,
                message: `Admin ${req.session.adminId} deleted an admin = ${req.query.id}`
            });
        }

        res.json({ success: true})

    } catch (e) {
        console.error("Error deleting admin:", e);
        res.status(500).json({ message: "Server error while deleting admin" });
    }
}

exports.addAdmin = async(req, res) => {
    const { name, email, password } = req.body;
    if (!password || !email || !name) {
        return res.status(400).json({ message: 'body is required' });
    }

    try {
        const encrypted_password = await bcrypt.hash(password, 10);
        await adminModel.addAdmin(name, email, encrypted_password);

        if (req.session?.adminId) {
            const [rows] = await db.query('SELECT name FROM admin_users WHERE id = ?', [req.session.adminId]);
            const adminName = rows[0]?.name || 'admin';
            await db.query('UPDATE admin_users SET last_seen = NOW() WHERE id = ?', [req.session.adminId]);
            await logActivity({
                action: `admin added`,
                actorType: adminName,
                actorId: req.session?.adminId,
                message: `Admin ${req.session.adminId} added an admin = ${req.body.name}`
            });
        }

        res.json({ success: true })
    } catch (e) {
        console.error("Error adding admin:", e);
        res.status(500).json({ message: "Server error while adding admin" });
    }
}