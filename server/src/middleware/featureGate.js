function requireRole(allowedRoles = []) {
  const roleSet = new Set(allowedRoles);
  return (req, res, next) => {
    const role = req.user?.role || 'user';
    if (!roleSet.has(role)) {
      return res.status(403).json({ success: false, message: 'Insufficient role access' });
    }
    return next();
  };
}

function requirePlan(requiredPlan = 'premium') {
  return (req, res, next) => {
    const plan = req.user?.plan || 'free';
    if (requiredPlan === 'free' || plan === requiredPlan || req.user?.role === 'admin') {
      return next();
    }

    return res.status(402).json({
      success: false,
      message: 'Premium plan required',
      requiredPlan,
      currentPlan: plan
    });
  };
}

module.exports = {
  requireRole,
  requirePlan
};