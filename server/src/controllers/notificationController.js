import {
  getStudentUnreadAnnouncementCount,
  markStudentAnnouncementRead,
} from "../services/notificationService.js";

export const getStudentUnreadCount = async (req, res) => {
  try {
    const unreadCount = await getStudentUnreadAnnouncementCount(req.user);

    res.status(200).json({
      unreadCount,
    });
  } catch (error) {
    console.error("Get student unread notifications error:", error);
    res.status(500).json({
      message: "Failed to retrieve unread notifications.",
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const wasMarked = await markStudentAnnouncementRead(id, req.user);

    if (!wasMarked) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    res.status(200).json({
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      message: "Failed to mark notification as read.",
    });
  }
};
