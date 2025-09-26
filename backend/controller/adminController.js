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