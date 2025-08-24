/*
 Navicat Premium Dump Script

 Source Server         : Mongo_Local
 Source Server Type    : MongoDB
 Source Server Version : 60025 (6.0.25)
 Source Host           : localhost:27017
 Source Schema         : ChatDB

 Target Server Type    : MongoDB
 Target Server Version : 60025 (6.0.25)
 File Encoding         : 65001

 Date: 24/08/2025 01:56:55
*/


// ----------------------------
// Collection structure for messages
// ----------------------------
db.getCollection("messages").drop();
db.createCollection("messages");
db.getCollection("messages").createIndex({
    sender: Int32("1"),
    receiver: Int32("1"),
    timestamp: Int32("1")
}, {
    name: "sender_1_receiver_1_timestamp_1",
    background: true
});
db.getCollection("messages").createIndex({
    is_group: Int32("1")
}, {
    name: "is_group_1",
    background: true
});
db.getCollection("messages").createIndex({
    content_type: Int32("1")
}, {
    name: "content_type_1",
    background: true
});

// ----------------------------
// Collection structure for notifications
// ----------------------------
db.getCollection("notifications").drop();
db.createCollection("notifications");
