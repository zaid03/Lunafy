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
            actorType: 'admin',
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
            await db.query('UPDATE admin_users SET last_seen = NOW() WHERE id = ?', [req.session.adminId]);
            await logActivity({
                action: 'admin_view_dashboard',
                actorType: 'admin',
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
        return res.status(500).json({ message: 'server error' });
    }
}