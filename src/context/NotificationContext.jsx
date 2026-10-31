import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

import notificationService from "../services/notificationService";
import { AuthContext } from "./AuthContext";

export const NotificationContext =
  createContext();

const NotificationProvider = ({
  children,
}) => {

  const { user } =
    useContext(AuthContext);

  const [notifications,
    setNotifications] =
    useState([]);

  const [unreadCount,
    setUnreadCount] =
    useState(0);

  // Fetch Notifications
  const fetchNotifications =
    async () => {

      if (!user) return;

      try {
        const data = await notificationService.getNotifications(user.id);
        setNotifications(data);

        const unread = data.filter(
          (notification) => !notification.read
        ).length;

        setUnreadCount(unread);
      } catch (error) {
        console.error("Notification Error:", error);
      }
    };

  // Load notifications when user logs in
  useEffect(() => {

    if (!user) return;

    fetchNotifications();

  }, [user]);

  // Auto Refresh Every 15 Seconds
  useEffect(() => {

    if (!user) return;

    const interval =
      setInterval(() => {

        fetchNotifications();

      }, 15000);

    return () =>
      clearInterval(interval);

  }, [user]);

  // Mark All Notifications as Read
  const markAllAsRead =
    async () => {

      if (!user) return;

      try {
        await notificationService.markAllAsRead(user.id);

        const updatedNotifications =
          notifications.map(
            (notification) => ({
              ...notification,
              read: true,
            })
          );

        setNotifications(
          updatedNotifications
        );

        setUnreadCount(0);
      } catch (error) {
        console.error("Mark Read Error:", error);
      }
    };

  // Refresh Notifications Manually
  const refreshNotifications =
    () => {

      fetchNotifications();

    };

  return (

    <NotificationContext.Provider
      value={{

        notifications,

        unreadCount,

        fetchNotifications,

        refreshNotifications,

        markAllAsRead,

      }}
    >

      {children}

    </NotificationContext.Provider>

  );

};

export default NotificationProvider;