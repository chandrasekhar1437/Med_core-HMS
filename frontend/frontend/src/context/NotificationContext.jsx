import { createContext, useContext, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = (
    message,
    type = "success"
  ) => {
    setNotification({
      message,
      type,
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification }}
    >
      {children}

      {notification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            padding: "14px 20px",
            borderRadius: "8px",
            color: "#ffffff",
            backgroundColor:
              notification.type === "error"
                ? "#dc3545"
                : notification.type === "warning"
                ? "#f59e0b"
                : "#198754",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.25)",
          }}
        >
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(
    NotificationContext
  );

  if (context === null) {
    console.error(
      "useNotification must be used inside NotificationProvider"
    );

    return {
      showNotification: (
        message,
        type = "success"
      ) => {
        console.log(
          `[${type}] ${message}`
        );
      },
    };
  }

  return context;
}