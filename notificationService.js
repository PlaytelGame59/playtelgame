// notificationService.js
const axios = require('axios');

const sendNotification = async (to, notification, data) => {
  const fcmServerKey = 'AAAA9kfVw84:APA91bEq1RFFybcpPlxiayI45RhtMMm0-VGqlNQpCJQI9bILcQ_2MjFq-HpU19aHX2VDrHZEoIqrKzo77AMXGKNkGUAUApz3Wd1Mjeu0u_wSrTspyk-LedjBvtqmn_ez6cTmpj_8fwkc'; // Replace with your FCM Server Key

  const notificationData = {
    to: to,
    notification: notification,
    data
  };

  try {
    const response = await axios.post('https://fcm.googleapis.com/fcm/send', notificationData, {
      headers: {
        Authorization: `key=${fcmServerKey}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('Notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = { sendNotification };
