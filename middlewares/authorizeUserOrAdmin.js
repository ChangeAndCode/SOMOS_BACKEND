// middlewares/authorize.js
export function requireAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Acceso denegado: solo admin" });
    }
    next();
}

export function authorizeUserOrAdmin(req, res, next) {
    const isOwner = req.user?.userId === req.params.id;
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
}
