require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const studyGroupReminderJob = require("./jobs/studyGroupReminder.job");
const classReminderJob = require("./jobs/classReminder.job");
const eventReminderJob = require("./jobs/eventReminder.job");

const app = require("./app");
const connectDB = require("./config/db");
const chatSocket = require("./socket/chat.socket");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Expose io to REST controllers (req.app.get("io")) so the REST send endpoint
// can fan out in real time. Undefined on serverless, where io never starts.
app.set("io", io);

chatSocket(io);

async function startServer() {
  try {
    await connectDB();
    studyGroupReminderJob();
    classReminderJob();
    eventReminderJob();
    server.listen(process.env.PORT || 5001, () => {
      console.log(`Server running at http://localhost:${process.env.PORT || 5001}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

startServer();
