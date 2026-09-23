const admin = require("firebase-admin");
require("dotenv").config();

const fireabaseAdminSdkKey = JSON.parse(
  Buffer.from(process.env.FIREBASE_ADMIN_SDK_KEY, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(fireabaseAdminSdkKey),
});

const sendPushNotification = async (message) => {
  try {
    await admin.messaging().send(message);
    console.log("Successfully sent message");
  } catch (error) {
    console.log("Error sending message:", error);
  }
};

const broadcastAnnouncement = async (announcement) => {
  const message = {
    notification: {
      title: `${announcement.title}`,
      body: announcement.desc,
    },
    topic: "announcements",
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent notification:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = {
  sendPushNotification,
  broadcastAnnouncement,
};
