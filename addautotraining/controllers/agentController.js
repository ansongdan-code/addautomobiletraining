const agentService = require('../services/agentService');
const logger = require('../utils/logger');

const handleError = (res, error, context) => {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    logger.error(`${context}: ${error.message}`, { stack: error.stack });
  } else {
    logger.warn(`${context}: ${error.message}`);
  }

  return res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? 'Server error' : error.message
  });
};

exports.chat = async (req, res) => {
  try {
    const { query } = req.body;
    const result = await agentService.processQuery({
      query,
      userId: req.user?.id,
      userRole: req.user?.role || 'guest'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleError(res, error, 'Error in AI Agent chat');
  }
};

exports.getContext = async (req, res) => {
  try {
    const context = await agentService.getAgentContext();
    res.json({
      success: true,
      data: context
    });
  } catch (error) {
    return handleError(res, error, 'Error fetching AI Agent context');
  }
};
